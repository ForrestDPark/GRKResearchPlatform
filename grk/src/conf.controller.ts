import { Controller, Get } from '@nestjs/common';
// Configure 
import { ConfigService } from '@nestjs/config';

@Controller()
export class ConfController {
  // ConfigService 주입 
  constructor(private configService: ConfigService){}

  // constructor(private readonly appService: AppService) {}

  @Get('message')
  getHello(): string {
    // configService.get() 호출 
    const message = this.configService.get("MESSAGE")
    return message
  }
  @Get('service-url')
  getServiceUrl() :string {
    console.log( this.configService.get('SERVER_URL'))

    return  this.configService.get('SERVER_URL')
  }
  @Get('db-info')
  getTest() : string {
    console.log(this.configService.get('logLevel'))
    console.log(this.configService.get('apiVersion'))
    return this.configService.get('dbInfo')
  }

  // 핸들러 함수 테스트 
  @Get('redis-info')
  getRedisInfo() : string {
    return `${this.configService.get('redis.host')}:${this.configService.get('redis.port')}`
  }


}
