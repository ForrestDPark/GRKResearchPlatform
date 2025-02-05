# [NestJS] 사용자 인증 모듈 생성 및 회원 가입하기  [2단계]
>🌞 2025.1.23 

- 인증 : 사용자의 자격을 확인
- 사용자의 자격증명을 기존 정보를 기반으로 확인 후 인증 토큰을 발급함. 
- 사용자에게 부여된 인증 토큰은 특정 기간 동안만 유효 
- 쿠키기반, 토큰기반(쿠키리스) 인증법이 있음. 
- 서버에서 보내준 쿠키를 클라이언트(주로브라우저) 에 저장해 관리함. 
- 토큰은 서버에 상태를 저장할 필요가 없음. 
- 쿠키와 토큰은 서로 장단점이 있음. 
- 토큰은 OAuth 를 사용한 소셜 로긴에서 사용할 예정, 먼저 쿠키 인증을 구현 

## 10.4.1 인증 모듈 만들기 및 설정 
### (1) 인증 모듈 생성
> 📌 auth module > service > controller 순 생성 
```bash
nest g module auth --no-spec
nest g service auth --no-spec
nest g controller auth --no-spec
```

> ✅ 인증 시스템 논리 구조 
<img src="https://blog.kakaocdn.net/dn/Q7zyv/btsLWLQR4ot/VCdZxsFHKyzJRO8T5GECvK/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/Q7zyv/btsLWLQR4ot/VCdZxsFHKyzJRO8T5GECvK/img.webp" data-origin-width="1192" data-origin-height="520" data-is-animation="false" width="750" height="327" data-mce-selected="1">

### (2) UserService 를 AuthService 에서 주입 하도록 user.module.ts 에 exports 설정을 추가함. 
> 📌 user/user.module.ts
```ts
// user/user.module.ts
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
@Module({
    imports : [TypeOrmModule.forFeature([User])],
    controllers : [UserController],
    providers : [UserService],
    //UserService 를 외부로 노출해야함. 
    exports: [UserService]
})
export class UserModule {}

```


## 10.4.2. 회원 가입 메서드 생성 
### (1) UserService 클래스의 creatUser 사용 , 비밀번호 같은 정보 암호화
> bcrypt  설치 
```bash
npm install bcrypt
npm install -D @types/bcrypt 
```


### (2) 서비스 -> 컨트롤러  코드 작성 
> src/auth/auth.service.ts 
```TS

//src/auth/auth.service.ts 
// ** HTTP , DTO, service import
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
// ** 회원 정보 암호화 라이브러리 
import * as bcrypt from 'bcrypt'
// 
// import { User } from 'src/user/user.schema';
import { User } from 'src/user/user.entity';

@Injectable() // provider 
export class AuthService {
    constructor(private userService: UserService) {}

    async register(userDto : CreateUserDto) {
        // 1. 이미 가입된 유저 있는지 체크 
        const user = await this.userService.getUser(userDto.email)
        if (user) {
            // 이미 가입된 유저 있을 경우 에러 발생 
            throw new HttpException(
                '해당 유저가 이미 있습니다. ',
                HttpStatus.BAD_REQUEST
            )
        }
        // password 암호화 
        const encryptedPassword = await bcrypt.hash(userDto.password, 10)
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
}
```

### (3) 컨트롤러 생성(rough)
>//auth.controller.ts
```TS
import { Controller, Body, Get, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { AuthService } from './auth.service';
import chalk from 'chalk';

@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService) {}

    // 등록 요청을 받으면 CreateUserDto 객체 
    @Post('register')
    async register(@Body() userDto: CreateUserDto) {
        console.log(chalk.yellow(" >> register start"))
        return await this.authService.register(userDto)
    }
}
```
- **🤔 @Body() userDto: CreateUserDto** 해석
  - @Body 데코레이터는 요청 본문에서 데이터를 추출 함. 
  - 데코레이터로 추출한 것을 CreateUserDto 타입의 객체로 변환되어 userDto 변수에 할당함. 


## 10.4.3 SQLite 익스텐션으로 테이블 확인 

> sqlite extension install > user-auth.sqlite  check
<img src="https://blog.kakaocdn.net/dn/bRK3iR/btsLZvS2Kzf/WGLvJafbNqodY2xGDOFZSk/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/bRK3iR/btsLZvS2Kzf/WGLvJafbNqodY2xGDOFZSk/img.webp" data-origin-width="2348" data-origin-height="604" data-is-animation="false" width="755" height="194">



# 10.5 쿠키를 사용한 인증 구현 

1. AuthController 에 login 핸들러 메서드 구현
>🤔핸들러란? : 핸들러는 특정 요청(Get,Put,Post,Delete)을 처리하는 역할을 하는 함수이다.

2. Controller > AuthService 로 email, password 파라미터를 Dto 형태로 넘겨 주면 DB 에 해당 정보 유저가 있는지 유효성 검증을 하는 로직 구현.
 
3. 유저 정보의 유효성 검증이 끝나면 응답 값에 쿠키 정보를 추가해 반환함. 
4. NestJS 에서 인증을 구현할때 보통 인증용 미들웨어인 가드를 함께 사용함. 
> ✅ 가드는 특정 상황(권한,롤,액세스컨트롤) 에서 받은 요청request 를 가드를 추가한 라우트 메서드에서 처리할지 말지를 결정하는 역할을 함. 

## 10.5.1 AuthService 에 이메일과 패스워드 검증 로직 만들기 
### (1) 유저의 이메일과 패스워드 검증 로직 
> 📌 auth/auth.service.ts
```TS
    // 회원 검증 
    async validateUser(email: string, password: string) {
        const user = await this.userService.getUser(email)
        // 이메일로 유저 정보를 받음. 
        if (!user) { // 유저가 없는 경우 -> 검증 실패 
            return null
        }
        const { password: hashedPassword, ...userInfo } =user

        if (bcrypt.compareSync(password, hashedPassword)) {
            // password 일치 
            return userInfo
        }
        return null
    }
```

### (2) validateUser() 메서드를 AuthController 에서 사용해 인증 결과를 쿠키에 추가 
> 📌 auth/auth.controller.ts
```TS
    @Post('login')
    async login(@Request() req, @Response() res) {
        // validateUser
        const userInfo = await this.authService.validateUser(
            req.body.email,
            req.body.password
        )
        // 유저 정보가 있으면, 쿠키 정보를 response 저장 
        if (userInfo) {
            res.cookie('login', JSON.stringify(userInfo), {
                httpOnly: false, 
                maxAge: 1000 * 60 * 60 * 24 * 1 //7 day 단위는 밀리초 쿠키 지속 시간 
            })
        }
        return res.send({ message: 'login success'})
    } 
```
- login()은 Request 와 Response를 모두 사용해야 하므로 @Body나 @Param 이 아닌 @Request 를 직접 사용함. Response 객체는 쿠키를 설정할때 사용함. 
- 앞서 만든 authService 의 validateUser를 호출해 패스워드를 제외한 유저 정보를 받음.  유저 정보가 있으면  res.cookie 를 사용해 쿠키를 설정함. 
- httpOnly 를 true 로 설정하여 브라우저에서 쿠키를 읽지 못하게 함. 
- 브라우저에서 쿠키를 읽을수 있으면 XSS(Cross Site Scripting) 등의 공격으로 쿠키 탈취 가 가능함. 명시적으로 false 를 줌. 원래 기본값도 false 임.
-쿠키 정보를 브라우저에서 읽지 않아도 된다면 true 설정이 보안에 더 유리 

### (3) login test 

```bash
### USER login test
 curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
     "email":"forre@grkcon.com",
     "password":"grkcon2025!"
     }' \
     http://localhost:3000/auth/login
```
- curl 에서는 쿠키가 뜨지않고. test.http 파일에서 접근하면  연결자체가 안됨. 
- curl 명령에서 -v 설정을 추가하면 쿠키가 보임, -c cookie.txt 파일에 쿠키 저장 하고 -b cookie.txt 파일에서 쿠키읽어와서 접근하면 오류가 사라짐
- type script 로 쿠키 확인할수있는 코드 
> 📌 auth.test.ts
```ts
const data = {
    email: "test1@grkcon.com",
    password: "grkcon2025!"
  };
  
  fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
  })
  .then((response) => {
       const setCookieHeaders = [];
       const cookies = [];
       
       response.headers.forEach((value, key) => {
           if (key.toLowerCase() === "set-cookie") {
              setCookieHeaders.push(value);
               const parsedCookies = value.split(';').reduce((acc, cookie) => {
                  const [name, value] = cookie.trim().split('=');
                  if (name && value) {
                      acc[name] = value;
                  }
                  return acc;
              }, {});
              cookies.push(parsedCookies)
           }
       });
    
       console.log("Set-Cookie 헤더들:", setCookieHeaders);
       console.log("파싱 된 쿠키들:", cookies)
    return response.json();
  })
  .then((result) => console.log("응답 결과:", result))
  .catch((error) => console.error("오류 발생:", error));
```

## 10.5.2 가드를 사용해 인증됬는지 검사
- Nest.js 인증시 가드라는 미들웨어를 보편적으로 사용함. 
- 가드는 @Injectable() 데코가 붙어있고 CanActive 인터페이스를 구현한 클래스임. 
- @UseGuard 로 사용할수도 있음. 
- 클라이언트의 요청을 @Get, @Post 등이 붙어있는 핸들러 메서드에 넘기기 전에 인증에 관련된 처리를 할수 있음. 
- CanActivate 인터페이스를 구현하려면 canActivate() 메서드를 구현해야함. 
- CanActiavet 는 boolean or Promise<boolean>을 반환 true 인경우 핸들러 메서드 실행, false 이면 403 forbidden 에러를 반환 
> NestJS 가드 인증 논리구조 
<img src="https://blog.kakaocdn.net/dn/IqzdO/btsL0PyJxSx/3IFaRQsUi2JC1SLfYw61QK/img.jpg" data-mce-src="https://blog.kakaocdn.net/dn/IqzdO/btsL0PyJxSx/3IFaRQsUi2JC1SLfYw61QK/img.jpg" data-origin-width="906" data-origin-height="730" data-is-animation="false" width="756" height="609">

### (1) 서버측에서 http 헤더에 있는 쿠키를 읽는 코드 작성. 
- cookie-parser 패키지 설치 
```bash
npm install cookie-parser
```

메인 에 코드 추가 
> 📌 src/main.ts
```TS
// cookie 
import * as cookieParser from 'cookie-parser'
///( 생략 ..)
async function bootstrap() {
  // Cookie parser 사용 
  app.use(cookieParser())
}
```
- 쿠키 파서는 request 객체에서 읽어오는데 사용하는 미들웨어임 
- NestFactory.create로 만든 NestApplication 의 객체인 app에서 use() 함수를 사용해 미들웨어를 사용하도록 한줄만 추가하면 됨.


### (3) auth.guard.ts 작성 
- authService 의 validateUser 사용하여 가드 생성 
- src/auth 아래에 auth.guard.ts 파일 생성 


```TS
/// src/auth/auth.guard.ts

import { CanActivate, ExecutionContext, Injectable} from '@nestjs/common'

import { AuthService } from './auth.service'
import { Observable } from 'rxjs'

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(private authService: AuthService) {}
    // CanActivate 인터페이스의 메서드 
    async canActivate(context: any): Promise<boolean> {
        // 컨텍스트에서 리퀘스트 정보를 가져옴
        const request =  context.switchToHttp().getRequest()
        // 쿠키가 있으면 인증된 것
        if (request.cookies['login']) {
            return true
        }
        // 쿠키가 없으면 request 의 body정보 확인 
        if (!request.body.email || !request.body.password) {
            return false 
        }

        //기존의 authService.validateUser 를 사용하여 인증
        const user = await this.authService.validateUser(
            request.body.email,
            request.body.password
        )
        // 유저 정보 없을시 false
        if (!user) {
            return false 
        }
        // 유저정보가 있으면 request 에 user 정보 추가후 true 
        request.user = user
        return true 
    }
}
```
- @Injectable 이 있으므로 다른 클래스 주입가능 , CanActive 있으므로 가드 클래스임. 
- 인증시 authService 객체 주입, canActivate() 는 추상 메서드이므로 사용할 클래스에서 구현해야함. 반환 타입 은 async 이므로 Promise boolean 타입으로 사용 
- true: 인증됨, false: 인증 안됨. 


### (4) auth.controller 에 useGuard 를 활용한 login2 함수 작성 
> auth.controller.ts 
```TS
   // 사용자 인증 
    @UseGuards(LoginGuard)
    @Post('login2')
    async login2(@Request() req, @Response() res) {
        // 쿠키정보는 없지만 request에 user 정보가 있다면 응답값에 쿠키 정보 추가 
        if (!req.cookies['login'] && req.user) {
            // 응답에 쿠키 정보 추가 
            res.cookie('login', JSON.stringify(req.user), {
                httpOnly: true,
                maxAge: 1000 * 10 // test 용 
            })
        }
        return res.send({message: 'login2 success'})

    }
    // 로그인을 한 때만 실행되는 메서드 
    @UseGuards(LoginGuard)
    @Get('test-guard')
    testGuard() {
        return '로그인 된 떄만 이 글이 보입니다. '
    }
}
```

### (5) 쿠키 로그인 인증 test 
> ✅ 기존에 create 로 생성된 아이디들은 테스트를 할수없음 auth/register 로 생성된 아이디들만 auth guard 에 인식이 되며 쿠키가 생성됨 

> 로그인 > login2(by쿠키) Curl test
```bash
### USER login 가드 테스트 ( cookie 기록 )
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "email":"test1@grkcon.com",
    "password":"grkcon2025!"
    }' \
    -c cookies.txt \
    http://localhost:3000/auth/login

### USER login 가드 테스트 ( cookie 읽어서 login2 쿠키 확인 )
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "email":"test1@grkcon.com",
    "password":"grkcon2025!"
    }' \
    -b cookies.txt \
    http://localhost:3000/auth/login2
    
### USER login  쿠키 인증 test
curl -X GET -b cookies.txt http://localhost:3000/auth/test-guard
```
# TEST RESULT
<img src="https://blog.kakaocdn.net/dn/KYy7a/btsL3guLj2g/tcr5lb1Y9eAQ6sm2KdrZY0/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/KYy7a/btsL3guLj2g/tcr5lb1Y9eAQ6sm2KdrZY0/img.webp" data-origin-width="1978" data-origin-height="996" data-is-animation="false" width="757" height="381" data-mce-selected="1">



# 10.6 패스포트와 세션을 사용한 인증 구현 
> 2025.1.27

- 서버에서 인증을 하고 해당 정보를 서버의 특정공간에 저장.(세션 이용)
- 쿠키는 세션을 찾는 정보만 저장(세션의 아이디값) 중요 정보는 세션에 모두 넣음. 
- 세션은 서버의 자원을 사용하여 서버에 부하를 주지만 위조,변조,탈취가 불가능하여 보안적임. 
- 가드하나로 로그인과 인증 모두 사용했지만 가드 두개와 인증 처리를 하기위한 파일을 여러개 만들것. 
- 로그인에 사용할 가드. 
- 인증 로직 구현 부분은 패스포트 라는 인증 로직을 쉽게 분리해서 개발하는 라이브러리 사용 
- 패스포트 사용시 인증 로직은 스트래티지 파일을 생성해서 사용. 
- 패스포트는 인증 로직 수행을 담당하는 클래스를 의미함. 
- 다양한 인증을 위한 스트래티지 패키지를 같이 설치해 인증을 쉽게 구현가능. 
- 가드 안에 인증 로직을 두는것이 아닌 인증로직을 처리하는 별도의 스트래티지 파일 작성 
- id, password 주었을때 올바른 정보인지 판단하는로직, 쿠키에서 값을 읽어 인증을 ㅟ한 올바른 데이터가 있는지 검증하는 로직 의미 
- 세션에서 데이터를 읽어오고 저장하므로 세션에 데이터 저장하고 읽어올 세션 시리얼라이저(session serializer) 파일도 필요함. 
- 가드 패스포트 스트래티지, 세션 시리얼라이저가 서로 협력하여 사용자 신원을 확ㅇ니하고 이증 정보를 저장하고 읽어와서 다시 인증하는 작업을 함. 역할 분담이 잘되어 있어서 유지보수에 유리함. 
- 
<img src="https://blog.kakaocdn.net/dn/tcKVh/btsL2PYoHQ1/8CxqnWmk2T89kFRcdFhhyk/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/tcKVh/btsL2PYoHQ1/8CxqnWmk2T89kFRcdFhhyk/img.webp" data-origin-width="1194" data-origin-height="524" data-is-animation="false" width="748" height="328">


## 10.6.1 라이브러리 설치 및 설정 
### (1) passport 라이브러리 설치 
> passport-local : username 과 password 로 인증전략 모듈 
> 세션 저장에는 express-session 사용 
> 개발할때 유용하므로 개발 환경 패키지를 설치하는 -D 옵션을 주어 설치함. 
```bash
npm i @nestjs/passport passport passport-local express-session
npm i -D @types/passport-local @types/express-session 
```

### (2) 세션을 사용하려면 main.ts 파일에 설정 추가 

> 📌 src/main.ts
```ts
// 로그인 인증을 위한 세션, passport 라이브러리 임포트 
import * as session from 'express-session'
import * as passport from 'passport'

//(생략)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
```

## 10.6.2 로그인과 인증에 사용할 가드 구현 
로그인에 사용할 가드와 로그인후 인증에 사용할 가드를 별개로 생성하여 사용 
loginAuthGuard 는 HTTp 요청을 받은 email 과 password 정보로 유효한 user 정보가 있는지 확인해 유효할 경우 유저 정보를 세션에 저장. 
AuthenticatedGuard 는 HTTP 요청에 잇는 쿠키를 찾아 쿠키에 있는 정보로 세션을 학인해 로그인이 완료된 사용자인지 판별 
- LoginAuthGuard 와 AuthenticatedGuard 가드를 auth.guard.ts 에 추가

<img src="https://blog.kakaocdn.net/dn/bMUvMM/btsL19cgGma/NjDm7YBA6LgNpvIo2Tuty1/img.jpg" data-mce-src="https://blog.kakaocdn.net/dn/bMUvMM/btsL19cgGma/NjDm7YBA6LgNpvIo2Tuty1/img.jpg" data-origin-width="942" data-origin-height="484" data-is-animation="false" width="757" height="389">

```ts
/// src/auth/auth.guard.ts

// Guard 를 사용하기 위한 임포트 
import { CanActivate, ExecutionContext, Injectable, Request} from '@nestjs/common'

// 패스포트 사용하는 AuthGuard 임포트 
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service'

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
```
- 패스 포트 인증에 가드를 사용할수 있도록 감싸둔 AuthGuard 를 제공하는 라이브러리 
- 패스포트는 인증로직을 스트래티지 개념으로 구현. 
- 이외에 스트레티지로 passport-jwt 와 passport-google-oauth20 이 있음. 
- 가드를 사용하려면 canActivate를 구현 
- AuthGuard 상속 하여 super.canActivate() 에 서 passport-local 로직을 구현할 메서드 실행함. 
- local.startagy.ts 파일이 localStrategy 클래스 생성한후 valdiate() 메서드 구현 
- super.logIn()에서 로그인 처리, 세션저장함. 세션에서 꺼내오는 방법은 session.serializaer.ts 파일에서 작성 
- AuthenticatedGuard 가 로그인 후 인증되었는지 확인할때 사용. 
- 세션에 덷이터를 저장하고 돌려주는 응답값에 connect.sid 라는 이름의 쿠키를 만듬. 
- 이후 요청에 해당 쿠키값을 같이 전송하면 세션에 있는 값을 읽어 인증 여부를 확인 할떄 사용함. 


## 10.6.3 세션에 정보를 저장하고 읽는 세션 시리얼라이저 구현 
### (1) request.isAuthenticated() 함수가 세션에서 정보를 읽어옴. 

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
    // 세션에서 정보를 꺼내올떄 사용 
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
1. SessionSerializer :  로그인 성공후 사용자정보를 세션에 저장. 이메일(최소한의 정보)만 추출하여 세션에 저장. 이후 요청에서 세션정보를 이용하여 사용자 정보를 복원함. 
serializeUser 함수가 이메일을 세션에 저장하는 작업 완료후 그결과를 Passport 에 알림. 
user 정보는 LocalAuthGuard 의 canActive() 메서드 의 super.logIn(request)를 호출 할때 내부적으로 request에 있는 user 정보를 꺼내서 전달하면서 serializeUser 실행

2. done(err:Error, user :any): Passport.js 에서 비동기 작업의 결과를 처리하기 위해 사용하는 콜백 , err 는 Error 타입의 객체임. 결과 void 이므로 done 은 어떤 값도 반환 하지 않음. 
   
3. (user: any ..)
    : user 는 매개변수 이름. 로그인전략( local,google,facebook) 성공시 전달해주는 사용자 정보를 의미함!! LocalAuthGuard 사용시 valildateUser 메소드에서 반환된 유저정보가 serializeUser 함수의 user인자로 전달됨. 

5. getPassportInstance() : 패스포트 인스턴스를 가져옴, 패스포트 인스턴스의 데이터가 필요한 경우 사용 

6. deserializeUser() : 인증되었는지 세션에 있는 정보로 검증할때 
 payload(세션에서 꺼내온값.전달되는 데이터의 핵심 부분 ) :  deserializeUser 함수에서 세션에 저장된 사용자 식별 정보(이메일)를 전달 받아 해당 사용자의 정보를 조회하고 복원하는데 사용하는 값. 

<img src="https://blog.kakaocdn.net/dn/bChuC6/btsL2cs27U8/c8ErD5kTROSImCv9xBdDQ0/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/bChuC6/btsL2cs27U8/c8ErD5kTROSImCv9xBdDQ0/img.webp" data-origin-width="744" data-origin-height="468" data-is-animation="false" width="742" height="467">


## 10.6.4 email,password 인증 로직이 있는 LocalStrategy 파일 작성 

- 인증 방법이 다양함. 패스포트에서 strategy(인증전략) 이라는 별개의 패키지로 분리해 담음. 
- id, password 로 인증하는 기능은 passport-local 패키지에서 제공함. 

|인증방법|패키지|설명|
|--|--|--|
|Local|passport-local|유저명, 패스워드를 사용|
|OAuth|passport-oauth|구글,페이스북 등 외부 서비스에서 인증|
|SAML|passport-saml|SAML 신원제공사에서 인증, OneLogin, Okta|
|JWT|passport-jwt|JSON web token 인증|
|AWS Cognito|passport-cognito|AWS Cognito user pool 인증|
|LDAP|passport-ldapauth|LDAP 디렉터리 사용 |


### (1) email, password 인증 로직이 있는 localStrategy 파일 작성 

>//auth/local.strategy.ts
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
- PassportStrategy(Strategy) : 믹스인 
- 컴포는트를 재사용할 때 상속을 많이 사용하지만 해당 클래스의 모든것을 재사용해야하는 불편함. 클래스의 일부만 확장하고 싶을 때는 믹스인 을 사용 
>🤔 믹스인(mixin) / 트레잇(trait)
>클래스에 새로운 기능을 추가하기 위해, 필요한 메서드를 가지고 있는 작은 클래스들을 결합해 기능을 추가하는 방법 

- local-strategy 에는 인증시 사용하는 필드명이 username, password 로 정해져있으므로 usernameField 이름을 email 로 바꾸어줌. 
- validate() 메서드에서는 전달한 email과 password 가 올바른지 검증함.(이미 있는 authSErvice 의 validateUser() 사용 )

## 10.6.5 auth.module.ts 에 설정 추가 
### 만들어둔 LocalStrategy, SessionSerializer 를 다른 클래스에서 사용하도록 프로바이더 등록, passportModule에 세션을 추가 등록 
> // auth.module.ts
```ts
// Passport, serializer , local strategy 추가 
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './local.strategy';

console.log(chalk.red('AuthModule Start[[[인증]]]]'))
@Module({
  imports: [
    UserModule,
    PassportModule.register({session: true}),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer
  ],
  controllers: [AuthController]
})
```
- PassportModule 의 기본설정은 세션 설정이 false 로 되어있어서 true 로 설정. 
- LocalStrategy ,SessionSerializer 프로바이더 등록 필요 다른데서 주입하지 않아도 프로바이더 등록안하면 클래스를 찾지 못해 에러남. 


## 10.6.6. 테스트 
>  // auth.controller.ts 
```ts
// 가드 사용 임포트 
import { AuthenticatedGuard, LocalAuthGuard, LoginGuard } from './auth.guard';

    // Login 3. 가드, 세션, 쿠키 사용 
    @UseGuards()
    @Post('login3')
    login3(@Request() req ) {
        return req.user
    }

    @UseGuards(AuthenticatedGuard)
    @Get('test-guard2')
    testGuardWithSession(@Request() req){
        return req.user
    }
}
```

```bash
### USER login 가드 테스트 ( cookie 기록 )
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "email":"test1@grkcon.com",
    "password":"grkcon2025!"
    }' \
    -c cookies.txt \
    http://localhost:3000/auth/login3
```
- 틀린 패스워드로 하면 401 에러가 난다. (auth.service validateUser() 동작 )
- 인증이 성공하면 유저정보가 나온다. 
- 서버 재시작 하면 세션은 초기화 됨. 

## 10.6.7 로그인과 세션 저장까지 순서 

<img src="https://blog.kakaocdn.net/dn/dTvf5x/btsL2AHflrI/SdIAQKyzihnS2cv1dreRsk/img.jpg" data-mce-src="https://blog.kakaocdn.net/dn/dTvf5x/btsL2AHflrI/SdIAQKyzihnS2cv1dreRsk/img.jpg" data-origin-width="958" data-origin-height="556" data-is-animation="false" width="763" height="443">


## TEST CURLs

```Bash

### USER login  쿠키 인증 test
curl -X GET -b cookies.txt http://localhost:3000/auth/test-guard2

### USER login 가드 테스트 ( cookie 기록 )
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "email":"test1@grkcon.com",
    "password":"grkcon20225!"
    }' \
    -c cookies.txt \
    http://localhost:3000/auth/login3


### USER login 가드 테스트 ( cookie 기록 )
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "email":"test1@grkcon.com",
    "password":"grkcon2025!"
    }' \
    -c cookies.txt \
    http://localhost:3000/auth/login


### USER login 가드 테스트 ( cookie 읽어서 login2 쿠키 확인 )
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "email":"test1@grkcon.com",
    "password":"grkcon2025!"
    }' \
    -b cookies.txt \
    http://localhost:3000/auth/login2

### USER login  쿠키 인증 test
curl -X GET -b cookies.txt http://localhost:3000/auth/test-guard


## AuthControll check 
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"username" :"test1",
    "password": "grkcon2025!",
    "email":"test1@grkcon.com",
    "role":"admin"
    }' \
    http://localhost:3000/auth/register


### USER login test
 curl -v -X POST \
     -H "Content-Type: application/json" \
     -d '{
     "email":"forre2@grkcon.com",
     "password":"grkcon2025!"
     }' \
     -b cookies.txt \
     http://localhost:3000/auth/login


### USER create test
 curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"username" :"Forre2",
     "password": "grkcon2025!",
     "email":"forre2@grkcon.com",
     "role":"admin"
     }' \
     http://localhost:3000/user/create

### User get test
curl -X GET http://localhost:3000/user/getUser/forre@grkcon.com

### Update User 
curl -X PUT \
     -H "Content-Type: application/json" \
     -d '{"username" :"Forre",
     "password": "grkcon2025!",
     "role":"user"
     }' \
     http://localhost:3000/user/update/forre@grkcon.com


### USER create test wrong input error 
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"username" :"test",
    "password": "grkcon2025!",
    "email":"test@email.com",
    "role":"admin"
    }' \
    http://localhost:3000/user/create

```