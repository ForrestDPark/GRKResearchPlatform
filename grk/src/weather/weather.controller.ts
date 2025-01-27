import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// api 요청 라이브러리 
import axios from 'axios';

@Controller('weather')
export class WeatherController {
    // logger 선언 
    private readonly logger = new Logger(WeatherController.name)
    constructor(private configService: ConfigService){}

    @Get() 
    public async getWeather(): Promise<string> {
        // 환경 변수 값 가져 오기 
        const apiUrl = this.configService.get<string>('WEATHER_API_URL')
        const apiKey = this.configService.get<string>('WEATHER_API_KEY')
        console.log(apiUrl)
        console.log(`apiUrl type : ${typeof apiUrl}`)
        // 내부함수인 callWeatherAPI() 호출
        try {
            const weatherData = await this.callWeatherApi(apiUrl, apiKey)
            return weatherData
        } catch (error) {
            this.logger.error('Error fetching weather data', error.stack)
            return '날씨 정보 가져오는것 실패'
        }

    }
    private async callWeatherApi(apiUrl: string, apiKey: string): Promise<string> {
        console.log('함수 진입')
        this.logger.log('날씨 정보 가져오는중 ...')
        console.log(apiUrl)
        // this.logger.log(`API URL : ${apiUrl}${apiKey}`)
        try {
            const response = await  axios.get(apiUrl, {
                params: {
                    appid: apiKey,
                    q: 'Seoul' // 서울 날씨 
                }
            })
            
            // this.logger.debug(`API response: ${JSON.stringify(response.data)}`)
            // 응답 데이터에서 필요한 정보 추출
            const forecast = response.data.list[0];
            const description = forecast.weather[0].description;
            const temp = forecast.main.temp;
            const humidity = forecast.main.humidity;

            // 추출한 정보로 문자열 생성
            return `현재 서울의 날씨는: ${description}, 온도: ${temp}K, 습도: ${humidity}%`

        } catch (error) {
            this.logger.error('Error occurred api call',error.stack)
            throw new Error('api call fail')
        }
           
    }
}
