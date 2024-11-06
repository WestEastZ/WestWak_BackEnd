import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BroadCastService {
  constructor(private readonly httpService: HttpService) {}

  async getBroadCast(streamerIds: string[]) {
    try {
      const promise = streamerIds.map(async (streamerId: string) => {
        const { data } = await firstValueFrom(
          this.httpService.get(
            `https://chapi.sooplive.co.kr/api/${streamerId}/station`,
            {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
              },
            },
          ),
        );

        const isLive = data.broad ? true : false;
        const broadCastThumb = `https://stimg.sooplive.co.kr/LOGO/${streamerId.slice(0, 2)}/${streamerId}/m/${streamerId}.webp`;

        return {
          id: streamerId,
          isLive,
          status: isLive ? 'On Air' : 'Off Air',
          nickname: data.station.user_nick || 'undefined',
          broadCastThumb: broadCastThumb || null,
        };
      });

      const result = Promise.all(promise);

      return result;
    } catch (error) {
      throw new HttpException(
        '방송 정보를 가져오지 못했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
