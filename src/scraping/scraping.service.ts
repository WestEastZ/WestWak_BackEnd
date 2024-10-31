import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as Defalutpuppeteer from 'puppeteer';
import puppeteer from 'puppeteer-core';
import { Page } from 'puppeteer-core';
import Chromium from '@sparticuz/chromium';

export interface BroadcastInfo {
  id: string;
  isLive: boolean;
  status: string;
  nickname: string;
  broadCastThumb: string | null;
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
  private readonly logger = new Logger(ScrapingService.name);
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

  // Browser 생성
  private async createBrowser() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Starting browser in production mode');

      const executable = await Chromium.executablePath();

      return puppeteer.launch({
        args: Chromium.args,
        defaultViewport: Chromium.defaultViewport,
        executablePath: executable,
        headless: Chromium.headless,
      });
    } else {
      this.logger.log('Starting browser in development mode');
      return Defalutpuppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  // 스트리머 별 방송 정보 가져오기
  async scrapeMultipleStreamers(
    streamerIds: string[],
  ): Promise<BroadcastInfo[]> {
    const browser = await this.createBrowser();

    try {
      // 최대 동시 요청 수 제한
      const MAX_CONCURRENT = 3;
      const results = [];

      for (let i = 0; i < streamerIds.length; i += MAX_CONCURRENT) {
        const chunk = streamerIds.slice(i, i + MAX_CONCURRENT);

        const chunkResult = await Promise.all(
          chunk.map(async (streamerId) => {
            const page = (await browser.newPage()) as Page;

            try {
              await page.setRequestInterception(true);
              page.on('request', (req) => {
                if (
                  ['stylesheet', 'font', 'media', 'image'].includes(
                    req.resourceType(),
                  )
                ) {
                  req.abort();
                } else {
                  req.continue();
                }
              });

              const url = `https://ch.sooplive.co.kr/${streamerId}`;
              await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 30000,
              });

              await page.waitForSelector('.onAir_box', { timeout: 5000 });

              const isLive = await page
                .$('.onAir_box')
                .then((res) => !!res)
                .catch(() => false);

              return {
                id: streamerId,
                isLive,
                status: isLive ? 'On Air' : 'Off Air',
                nickname: streamerId,
                broadCastThumb: null,
              };
            } catch (error) {
              console.error(`Error scraping ${streamerId}:`, error);

              return {
                id: streamerId,
                isLive: false,
                status: 'Off Air',
                nickname: streamerId,
                broadCastThumb: null,
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
      await browser.close();
    }
  }

  // top 100 정보
  async getTop100(url: string) {
    let browser;
    try {
      browser = await Defalutpuppeteer.launch({
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
