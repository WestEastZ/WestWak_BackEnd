import { QuerySelectorAll } from './../../node_modules/puppeteer-core/lib/cjs/puppeteer/common/QueryHandler.d';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { val } from 'cheerio/dist/commonjs/api/attributes';
import * as puppeteer from 'puppeteer';
import { timeout } from 'rxjs';

@Injectable()
export class ScrapingService {
  // 생방송 정보
  async getBroadCastInfo(url: string): Promise<{
    isLive: boolean;
    status: string;
    nickname: string;
    broadCastThumb: string;
  }> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['stylesheet', 'font'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      await Promise.all([
        page.waitForSelector('.onAir_box', { timeout: 5000 }).catch(() => {}),
        page
          .waitForSelector('.article_bj_box .bj_box .thum img', {
            timeout: 5000,
          })
          .catch(() => {}),
        page.waitForSelector('.article_bj_box .bj_box .info_box .nick h2', {
          timeout: 5000,
        }),
      ]);

      // 방송 여부
      const isLive = await page.$('.onAir_box').then((res) => !!res);

      // 방송국 썸네일
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
        isLive,
        status: isLive ? 'On Air' : 'Off Air',
        nickname,
        broadCastThumb: broadCastThumb || undefined,
      };
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

//  // table
//   const tableData = await page.$eval('#tb', (table) => {
//     const result = {};
//     // rows
//     const rows = table.QuerySelectorAll('tr');

//     // cells
//     rows.forEach((row) => {
//       const cells = row.QuerySelectorAll('td');
//       if (cells.length < 2) return;

//       const key = cells[0].innerText;
//       console.log('key :', key);
//       let lowestValue: number | null = null;

//       for (let i = 1; i < cells.length; i++) {
//         let cellText = cells[i].inneText;
//         console.log(cellText);

//         if (cellText !== '') {
//           const value = cellText;
//           if (
//             !isNaN(value) &&
//             (lowestValue === null || value < lowestValue)
//           ) {
//             lowestValue = value;
//           }
//         }
//       }

//       result[key] = lowestValue;
//     });

//     Logger.log(result);

//     return result;
//   });

//   return tableData;
