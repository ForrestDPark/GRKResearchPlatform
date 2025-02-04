# Auth process 

# 0. directory tree
├── auth
│   ├── auth.controller.ts
│   ├── auth.guard.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.test.http
│   ├── auth.test.ts
│   ├── google.strategy.ts
│   ├── local.strategy.ts
│   └── session.serializer.ts

## 1. auth.controller.ts

```ts
// src/auth/auth.controller.ts
// API 라이브러리 
import { 
    Controller, Body, Get, Post,
    Request,Response, HttpStatus,
    UseGuards  //가드 
    } from '@nestjs/common';

// user Dto(create, update) 로 데이터 전송 
import { CreateUserDto, UpdateUserDto } from 'src/user/user.dto';

// 인증 서비스 임포트 
import { AuthService } from './auth.service';
// import chalk from 'chalk';

// 가드 사용 임포트 (local, google )
import { AuthenticatedGuard, LocalAuthGuard, LoginGuard, GoogleAuthGuard } from './auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService) {}

    // 회원가입
    @Post('register')
    async register(@Body() userDto: CreateUserDto) {
        console.log((" >> register start"))
        return await this.authService.register(userDto)
    }

    // 로그인  1(검증없음)
    @Post('login')
    async login(@Request() req, @Response() res) {
        
        console.log((" \n >>> login service "))
        // validateUser
        const userInfo = await this.authService.validateUser(
            req.body.email,
            req.body.password
        )
        console.log('user info :',userInfo)
        // 유저 정보가 있으면, 쿠키 정보를 response 저장 
        if (userInfo) {
            console.log(('쿠키를 만듭니다!!'))
            
            // login 이라는 이름의 쿠키를 만듬. (user email, password 가 있음. )
            res.cookie('login', JSON.stringify(userInfo), {
                httpOnly: false, 
                maxAge: 1000 * 60 * 60 * 24 * 1 ,//7 day 단위는 밀리초 쿠키 지속 시간 
                // https 설정 
                // secure: true,
                // sameSite: 'none'
            })
            res.status(HttpStatus.OK)
        }
        console.log(("Login success!!"))
        return res.send({ message: 'login success'})
    } 
 
    // 로그인 2. 사용자 인증 (쿠키)
    @UseGuards(LoginGuard)
    @Post('login2')
    async login2(@Request() req, @Response() res) {

        console.log((" >> login2 process start"))
        console.log('login2에서 쿠키 확인',req.cookies)
        // 쿠키정보는 없지만 request에 user 정보가 있다면 응답값에 쿠키 정보 추가 
        if (!req.cookies['login'] && req.user) {
            // 응답에 쿠키 정보 추가 
            res.cookie('login', JSON.stringify(req.user), {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 1  // test 용 
            })
        }
        return res.send({message: 'login2 success'})
    }
    // [[test guard]] -- 로그인을 한 때만 실행되는 메서드 
    @UseGuards(LoginGuard)
    @Get('test-guard')
    testGuard() {
        return '로그인 된 떄만 이 글이 보입니다. '
    }

    // Login 3. 가드, 세션, 쿠키 사용 
    @UseGuards(LocalAuthGuard) // login3 핸들러 도착전에 이미 검증을 함. 
    @Post('login3')
    login3(@Request() req ) {
        console.log((" >> 사용자 인증이 되었습니다. "))
        return req.user
    }

    @UseGuards(AuthenticatedGuard)
    @Get('test-guard2')
    testGuardWithSession(@Request() req){
        return req.user
    }

    // Google login 
    @Get('to-google')
    @UseGuards(GoogleAuthGuard)
    // 구글 로그인 창을 띄우는 메서드 
    async googleAuth(@Request() req) {
        console.log(" 구글 로그인 ")
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    // 구글 로그인 성공시 실행하는 라우터 메서드 
    async googleAuthRedirect(@Request() req , @Response() res) {
        const { user } = req
        return res.send(user)
    }

}
```

## 2. auth.guard.ts

```ts
/// src/auth/auth.guard.ts

// Guard 를 사용하기 위한 임포트 
import { CanActivate, ExecutionContext, Injectable, Request} from '@nestjs/common'

// 패스포트 사용하는 AuthGuard 임포트 
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service'

@Injectable()
// Google stratagey Guard 상속 
export class GoogleAuthGuard extends AuthGuard('google'){
  async canActivate(context: ExecutionContext):  Promise<boolean>  {
    const result = (await super.canActivate(context)) as boolean

    // context 에서 request 를 추출 함. 
    const request = context.switchToHttp().getRequest()
    
    // 세션 사용하여 인증 유지 
    await super.logIn(request)
    return result
      
  }
}

@Injectable()
// AuthGuard 상속 
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: any):   Promise<boolean>  {
    const result = (await super.canActivate(context)) as boolean
    // 로컬 스트래티지 실행 
    const request = context.switchToHttp().getRequest()
    // 세션 저장 
    await super.logIn(request)
    return result 
      
  }
}

@Injectable() 
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext):  boolean{
        const request = context.switchToHttp().getRequest()
        // 세션에서 정보를 읽어서 인증 확인 
        return request.isAuthenticated()
  }
}

// 패스포트 사용하지 않고 쿠키만 사용해서 구현된 코드 
@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService) {}
    canActivate(
        context: ExecutionContext,
    ): boolean {
        const request = context.switchToHttp().getRequest();
         console.log("LoginGuard 쿠키 확인 : ", request.cookies); // 쿠키 로그 추가
        if (!request.cookies['login']) {
            console.log("쿠키 정보 없음.")
          //  throw new UnauthorizedException('로그인 정보가 없습니다.');
          return false;
        }
        const user = JSON.parse(request.cookies['login']); // 쿠키에서 user 정보 추출 
        if (user) {
            request.user = user
            console.log("user 정보 : ", user)
            return true;
        }
        console.log("로그인 정보가 유효하지 않음.")
        return false
      }
}

```

## 3. auth.module.ts

```ts
//auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
// import chalk from 'chalk';

// Passport, serializer , local strategy 추가 
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './local.strategy';

// Google strategy 등록 
import { GoogleStrategy } from './google.strategy';


console.log(('AuthModule Start[[[인증]]]]'))

@Module({
  imports: [
    UserModule,
    PassportModule.register({session: true}),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    GoogleStrategy

  ],
  controllers: [AuthController]
})
export class AuthModule {}

```



## 4. auth.service.ts

```ts
//src/auth/auth.service.ts 
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';

// 회원 정보 암호화 라이브러리 
import * as bcrypt from 'bcrypt'
// import { User } from 'src/user/user.schema';
import { User } from 'src/user/user.entity';
// import chalk from 'chalk';


@Injectable() // provider 
export class AuthService {
    constructor(private userService: UserService) {}

    async register(userDto : CreateUserDto) {
        // 1. 이미 가입된 유저 있는지 체크 
        const user = await this.userService.getUser(userDto.email)
        if (user) {
            console.log(("해당 유저 있음."))
            // 이미 가입된 유저 있을 경우 에러 발생 
            throw new HttpException(
                '해당 유저가 이미 있습니다. ',
                HttpStatus.BAD_REQUEST
            )
        }
        // password 암호화  10 : cost factor: 암호화 과정에서 얼마나 많은 계산을 수행할지 결정 시간 걸림. 
        // const encryptedPassword = bcrypt.hashSync(userDto.password, 10)

        const encryptedPassword = await bcrypt.hash(userDto.password,10)

        // db 저장, 저장중 error 나면 서버 에러 발생 
        try {
            const user = await this.userService.createUser({
                ...userDto,
                password: encryptedPassword
            })
            // 회원 가입 후 반환하는 값에는 password 를 주지 않음. 
            user.password =undefined
            return user

        } catch (error) {
            throw new HttpException('서버 에러 ', 500)
        }

    }

    // 회원 검증 
    async validateUser(email: string, password: string) {
        console.log((" >> auth.service.ts >> validateUser 실행"))
        const user = await this.userService.getUser(email)
        
        
        // 이메일로 유저 정보를 받음. 
        if (!user) { // 유저가 없는 경우 -> 검증 실패 
            console.log((" >> user 가 없습니다. 검증실패"))
            return null
        }
        const { password: hashedPassword, ...userInfo } = user

        if (bcrypt.compareSync(password, hashedPassword)) {
            // password 일치 
            console.log(" >> user 가 있습니다. ",userInfo)
            return userInfo
        }
        throw new HttpException('비밀번호가 일치하지 않습니다.', HttpStatus.UNAUTHORIZED);
    }

}

```



## 5. google.strategy.ts

```ts
// src/auth/google.strategy.ts

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { UserService } from "src/user/user.service";

// Google id, secret은 Config file 에 있음 
import { ConfigService } from "@nestjs/config";

//validate 에서 profile 중 email 을 가져와 db 에 저장(User필요)하는 기능 
import { User } from "src/user/user.entity";


@Injectable()
// Passport Strategy 상속 
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        private userService: UserService,
        private configService: ConfigService
    ) {
        super({
            clientID : configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret : configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL : 'http://localhost:3000/auth/google',
            scope : ['email', 'profile']

        })
    }
    // Google 용 validate
    async validate(accessToken: string, refreshToken: string, profile: Profile) {

        const {id, name, emails} =profile
        console.log(accessToken)
        console.log(refreshToken)
        const providerId = id
        const email = emails[0].value
        console.log(providerId, email, name.familyName, name.givenName)

        // db 용 User entity 포맷 <- userService 
        const user : User =await this.userService.findByEmailOrSave(
            email,
            name.familyName + name.givenName,
            providerId
        )
        return user
        //db 에 저장된 user 정보를 반환함. 세션에서 유저정보 다룰때 user Entity 사용 
    }

}
```


## 6. local.strategy.ts

```ts
//auth/local.strategy.ts

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    // 1. PassportStrategy 믹스 인 
    constructor( private authService: AuthService) {
        // 기본값이 username 이므로 email 로 변경함. 
        super({usernameField :'email'})
    }
    // 유저 정보의 유효성 검증 
    async validate(email: string, password: string) : Promise<any> {
        
        const user = await this.authService.validateUser(email,password)
        
        if (!user) {
            return null // null -> 404 에러 
        }
        return user  // user 정보 반환 

    }
}
```

## 7. session.serializer.ts

```ts
import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
// userService 주입 -> 유저정보를 검증 
import { UserService } from "src/user/user.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private userService: UserService){
        super();
    }
    // 세션에 유저의 이메일 정보 저장 
    serializeUser(user: any, done: (err:Error, user:any) => void):any {
        done(null,user.email) // 세션에 저장할 정보 
    }
    // 세션에서 정보를 꺼내옴  userService 의 getUser 필요.
    async deserializeUser(
        payload: any,
        done: (err: Error, payload: any) => void,
    ): Promise<any> {
        const user = await this.userService.getUser(payload)
        // 유저 정보가 없는경우 done()함수에 에러 전달
        if(!user) {
            done(new Error('No User'), null)
            return 
        }
        const { password, ...userInfo} = user
        done(null,userInfo)
        
    }
}
```