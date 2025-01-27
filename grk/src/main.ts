// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// 환경변수 사용을 위한 ConfigService 임포트 
import { ConfigService } from '@nestjs/config';
import * as express from 'express'

// cookie 사용을 위한 쿠키 파서 라이브러리 임포트 
import * as cookieParser from 'cookie-parser'

// 회원 로그인시 유효성 검증을 위한 ValidationPipe 임포트 
import { ValidationPipe } from '@nestjs/common'

// 로그인 인증을 위한 세션, passport 라이브러리 임포트 
import * as session from 'express-session'
import * as passport from 'passport'


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 익스프레스 json 
  app.use(express.json())

  // 전역 파이프에 validationPipe 추가(회원정보 Dto 인증 )
  app.useGlobalPipes(new ValidationPipe())

  // configService 사용 
  const configService = app.get(ConfigService)
  
  // Cookie parser 사용 
  app.use(cookieParser())

  // session 설정 
  app.use(
    session({
      secret: 'very-important-secret', // 세션 암호화 키 
      resave: false, // 세션을 항상 저장할지 여부 
      // 세션 저장되기 전 초기화 되지 않은 상태로 세션을 미리 저장 
      saveUninitialized: false, 
      cookie: {maxAge: 3600000} // 쿠키 유효시간 1시간

    })
  )
  // passport 시작, session  선언
  app.use(passport.initialize())
  app.use(passport.session())

  
  await app.listen(configService.get("SERVER_PORT"), () => {console.log("Server start!")})
}
bootstrap();

