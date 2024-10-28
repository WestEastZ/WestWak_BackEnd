import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

export interface BroadcastInfo {
  id: string;
  isLive: boolean;
  status: string;
  nickname: string;
  broadCastThumb: string;
}

@Injectable()
export class ScrapingService {
  private cache = new Map<
    string,
    {
      data: BroadcastInfo[];
      timestamp: number;
    }
  >();

  private readonly CACHE_DURATION = 3600000;

  // 생방송 정보
  async getBroadCastInfo(streamerIds: string[]): Promise<BroadcastInfo[]> {
    const cacheKey = streamerIds.join(',');
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await this.scrapeMultipleStreamers(streamerIds);

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  // 스트리머 별 방송 정보 가져오기
  async scrapeMultipleStreamers(
    streamerIds: string[],
  ): Promise<BroadcastInfo[]> {
    const brower = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // 최대 동시 요청 수 제한
      const MAX_CONCURRENT = 3;
      const results = [];

      for (let i = 0; i < streamerIds.length; i += MAX_CONCURRENT) {
        const chunk = streamerIds.slice(i, i + MAX_CONCURRENT);

        const chunkResult = await Promise.all(
          chunk.map(async (streamerId) => {
            const page = await brower.newPage();

            try {
              await page.setRequestInterception(true);
              page.on('request', (req) => {
                if (['stylesheet', 'font'].includes(req.resourceType())) {
                  req.abort();
                } else {
                  req.continue();
                }
              });

              const url = `https://ch.sooplive.co.kr/${streamerId}`;
              await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 30000,
              });

              await Promise.all([
                page
                  .waitForSelector('.onAir_box', { timeout: 5000 })
                  .catch(() => {}),
                page
                  .waitForSelector('.article_bj_box .bj_box .thum img', {
                    timeout: 5000,
                  })
                  .catch(() => {}),
                page.waitForSelector(
                  '.article_bj_box .bj_box .info_box .nick h2',
                  {
                    timeout: 5000,
                  },
                ),
              ]);

              const isLive = await page.$('.onAir_box').then((res) => !!res);

              const broadCastThumb = await page
                .$eval('.article_bj_box .bj_box .thum img', (img) => img.src)
                .catch(() => null);

              const nickname = await page
                .$eval(
                  '.article_bj_box .bj_box .info_box .nick h2',
                  (h2) => h2.innerText || '',
                )
                .catch(() => null);

              return {
                id: streamerId,
                isLive,
                status: isLive ? 'On Air' : 'Off Air',
                nickname,
                broadCastThumb: broadCastThumb || 'undefined',
              };
            } catch (error) {
              console.error(`Error scraping ${streamerId}:`, error);
              // 에러 발생 시 기본값 반환
              return {
                id: streamerId,
                isLive: false,
                status: 'Off Air',
                nickname: 'undefined',
                broadCastThumb: 'undefined',
              };
            } finally {
              await page.close();
            }
          }),
        );
        results.push(...chunkResult);
      }

      return results;
    } catch (error) {
      throw new HttpException(
        `스크래핑 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await brower.close();
    }
  }

  // top 100 정보
  async getTop100(url: string) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.waitForSelector('#tb', { timeout: 5000 }).catch(() => {});

      const data = await page.$$eval(
        'table tbody tr',
        (trs: HTMLTableRowElement[]) =>
          trs.map((tr) => {
            const tds = Array.from(tr.querySelectorAll('td'));
            if (tds.length === 0) return null;
            const xCoordinate = tds[0].innerText;
            let lowest: number | null = null;

            tds.forEach((td, index) => {
              if (index > 0) {
                const value = parseInt(td.innerText);
                if (!isNaN(value) && (lowest === null || lowest > value)) {
                  lowest = value;
                }
              }
            });

            return {
              x: xCoordinate,
              y: lowest !== null ? lowest : 'N/A',
            };
          }),
      );

      return data;
    } catch (error) {
      throw new HttpException(
        `스크래핑 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
