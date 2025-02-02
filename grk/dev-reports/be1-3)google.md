# 11. OAuth 를 사용한 구글 로그인 인증 

- OAuth(open Authorization ) 개방형 인가 표준 
- OAuth 는 인증이 아니라 인가의 관점에서 보아야함. 
- 소셜 로그인 후 팝업이 뜨면서 권한을 요청하는 화면 
- OAuth 1.0, 2.0, 2.1 중 2.0 을 가장 많이 사용 

인증: 리소스에 접근 자격이 있는지 검증하는 과정 ,OAuth 에서 리소스는 보호된 정보를 의미함. 
인가 : 자원에 접근할 권한을 부여하는 과정. 인가가 완료되면 리소스의 접근 권한 정보가 있는 엑세스 토큰을 클라이언트에게 보내줌. 
엑세스 토큰 : 리소스 서버에서 리소스 소유자의 보호된 정보를 획득 할떄 사용하는 만료기간이 있는 토큰 
리프레시 토큰 : 엑세스 토큰이 만료되었을떄 갱신하는 용도로 사용하는 토큰. 액세스 토큰보다 만료기간을 길게 가져감 
리소스 소유자 : 리소스는 사용자의 보호된 정보를 말하며 이런 정보에 접근하도록 자격을 부여하는 사람. OAuth 에서는 사용자가 리소스 소유자다 라고 생각하면 됨. 
클라이언트 : 리소스를 사용하려고 접근을 요청하는 애플리케이션 
리소스 서버  : 사용자의 보호된 자원을 가지고 있는 서버 
인가 서버 : 인증 인가를 수행 하는 서버로 클라이언트의 접근 자격을 확인하고 액세스 토큰을 발급해 권한을 부여함. 

- 인가 서버와 리소스 서버의 조합 을 OAuth2 프로바이더라고 부름. 

## 11.1.1 OAuth 프로토콜 흐름 
<img src="https://blog.kakaocdn.net/dn/cNHy3B/btsL2a99wzV/81K65QqS0Hy4pxHlAkwlP0/img.jpg" data-mce-src="https://blog.kakaocdn.net/dn/cNHy3B/btsL2a99wzV/81K65QqS0Hy4pxHlAkwlP0/img.jpg" data-origin-width="788" data-origin-height="552" data-is-animation="false" width="757" height="530">

- 인증코드(Authorization code) 사용 
- 암묵적 방법 (Implicit)
- 리소스 소유자의 암호 자격증명 (Resource Owner Password Credential)
- 클라이언트 자격증명 (Client Credentials)

## 11.1.2  액세스 토큰 재발 행 흐름. 
액세스 토큰 만료시 리프레시 토큰으로 재발헹 



# 11.2 구글 OAuth 를 사용하기 위한 준비 

## 11.2.1 구글 클라우드 프로젝트 생성

### (1) 프로젝트 생성 https://console.cloud.google.com 접속  >  프로젝트 선택 > 새프로젝트 > 프로젝트 이름 grk-research-oauth 

<img src="https://blog.kakaocdn.net/dn/IsB3s/btsL185L9pa/6Wdnbk0opn34Zo1DAfhdhk/img.webp" data-is-animation="false" data-origin-width="1708" data-origin-height="740" data-filename="Screenshot 2025-01-27 at 4.52.51 PM.webp" width="786" height="341">

## 11.2.2 Oauth 동의 화면 생성 
### (1) 생성 프로젝트 선택 > 왼쪽 탭 [api 및 서비스 ] 클릭 > [Oath 동의 화면 클릭 ]
<img src="https://blog.kakaocdn.net/dn/dqX54G/btsL3AmufAj/sST7Dgt6JmPlrKwMNlKlTK/img.webp" data-is-animation="false" data-origin-width="1698" data-origin-height="1348" data-filename="Screenshot 2025-01-27 at 5.01.18 PM.webp" width="777" height="617">

앱정보 > 앱이름 'grk-research-platform' > 사용자 지원 이메일 forre@grkcon.com > 앱로고 즉석 제작 >  앱 도메인 애플리케이션 홈페이지 http://forrestest.site > 
<img src="https://blog.kakaocdn.net/dn/bNkjEK/btsL1A9ezyy/PoSAshsW1gDywltZR9FKdK/img.webp" data-is-animation="false" data-origin-width="1666" data-origin-height="876" data-filename="Screenshot 2025-01-27 at 6.33.07 PM.webp" width="755" height="397">

-> 이설정은 나중에 grkconplatform 사이트가 정해지면 바꾸어야한다.  > 개발자 연락처 정보 입력 > 저장후 계속 버튼 클릭 > 테스트사용자 -저장후 계속 > 대시보드 돌아가기 

## 11.2.3 OAuth 클라이언트의 id와 비밀번호 생성 

###  (1) 사용자 인증 정보 > 사용자 인증정보 만들기 > Oauth 클라이언트 id 클릭 > 인증 정보 설정 화면 이동 
<img src="https://blog.kakaocdn.net/dn/674Kl/btsL3OZfJ5y/TzKmj6a3wRbIrKn4tyllFk/img.webp" data-is-animation="false" data-origin-width="1108" data-origin-height="1336" data-filename="Screenshot 2025-01-27 at 6.36.00 PM.webp" width="744" height="897">

### (2) 클라이언트 생성, 도메인 추가 후 클라이언트 아이디, 비밀번호 저장..매우 보안중요!
<img src="https://blog.kakaocdn.net/dn/PnRmR/btsL1HgwTyH/O10TBaD8bd7ffCCM7lkd60/img.webp" data-is-animation="false" data-origin-width="1042" data-origin-height="1082" data-filename="Screenshot 2025-01-27 at 6.36.21 PM.webp" width="742" height="770">

# 11.3 구글 OAuth 구현 순서 

- 구글 OAuth  이메일과 프로필 정보를 구글 Oauth 스트레티지 파일의 validate() 메서드에서 콜백으로 받음. 
- 이때 넘어오는 데이터는 액세스 토큰, 리프래시토큰, 프로필 정보 .
- 프로필에는 식별자로 사용되는 ID가 있으며 providerId 라고 함, name 객체 도 있음. 


# 11.4 NestJS 환경 설정 파일 추가 

```bash
npm i @nesetjs/config
```


### (2) .env 구글 oauth 용 파일 생성, 및 설정 

현재 load 옵션을 사용해 커스텀 설정 파일 추가 중이므로 .env 파일이 아니라 
dev.ts 파일에서 설정 
- .gitignore 에 dev.ts 파일 추가 

## 11.5 구글 OAuth 스트레티지 생성 
### (1) 스트레티지 지원 패키지 설치 
```bash
npm i passport-google-oauth20
npm i -D @types/passport-google-oauth20
```
### (2) google.strategy.ts 생성 

```ts
// src/auth/google.strategy.ts

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { User } from "src/user/user.entity";
import { UserService } from "src/user/user.service";

// Google id, secret은 Config file 에 있음 
import { ConfigService } from "@nestjs/config";

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
    async validate(accessToken: string, refreshToken: string, profile: Profile) {

        const {id, name, emails} =profile
        console.log(accessToken)
        console.log(refreshToken)
        const providerId = id
        const email = emails[0].value
        console.log(providerId, email, name.familyName, name.givenName)
        return profile
    }

}
```
- Strategy 클래스는 인증시 에 사용하는 로직을 추가하는 메서드 
- PassportStrategy 메서드 validate() 를 추가할 목적으로 사용 
- PassportStrategy 는 NestJS 에서 패스포트를 ㅏ용하는 방법을 일원화 하는데 사용하는 믹스 인 임. 
- 인증의 유효성 검증시 validate() 메서드를 사용할 것이라는 것을 쉽게 유추 가능. 
- 생성자에 userService 생성하지만 현재는 사용 안하마. 
- validate : 구글 OAuth 인증 후 콜백 url 을 실행하기 전에 유효성 검증함. 콜백의 매개 변수로 access_token, refresh_token, profile 을 받음. access_token 과 refresh_token 은 딱히 필요는 없음. 최초 인증시 유저데이터를데이터베이스에 저장하기 때문. 
- profile: passport-google-oauth20 의 Profile 타입 인스턴스임. id, name, emails 속성을 가짐. 
- id 는 프로바이더 ID 로 해당 프로바이더에서 유일한값, 
### (3) Strategy 는 프로바이더이므로 등록, auth.module 

> auth.moduel.ts
``` ts
// Google strategy 등록 
import { GoogleStrategy } from './google.strategy';

  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    GoogleStrategy

  ],
```

# 11.6 GoogleAuthGuard 생성 
### (1) auth.guard.ts 에 GoogleAuthGuard 클래스 추가 

> auth.guard.ts
```ts
@Injectable()
// Google stratagey Guard 상속 
export class GoogleAuthGuard extends AuthGuard('google'){
  async canActivate(context: ExecutionContext):  Promise<boolean>  {
    const result = (await super.canActivate(context)) as boolean

    // context 에서 request 를 추출 함. 
    const request = context.switchToHttp().getRequest()
    return result
  }
}
```
- passport 의 Strategy 를 쉽게 사용하기 위한 클래스로 생성자의 매개변수에 사용할 스트래티지 문자열로 넣으면 됨. 
- super.canActivate() 메서드에서 GoogleStrategy 의 validate() 를 사용함. 
- nestJS 에서는 context 에서 리퀘스트 객체를 꺼낼수 있음. 

<img src="https://blog.kakaocdn.net/dn/o9eZT/btsL1hWoEjp/4e8iVDN2cUrYNaHvVDnsgK/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/o9eZT/btsL1hWoEjp/4e8iVDN2cUrYNaHvVDnsgK/img.webp" data-origin-width="1122" data-origin-height="652" data-is-animation="false" width="757" height="440">

# 11.7 컨트롤러에 핸들러 메서드 추가 
### (1) 스트레티지. 가드 생성 후 -> 유저 요청 받을 컨틀롤러 안에 핸들러 매서드 작성 
> auth.controller.ts
```ts
    // Google login 
    @Get('to-google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Request() req) {}

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req , @Response() res) {
        const { user } = req
        return res.send(user)
    }
```
- GoogleAuthGuard 임포트 googleAuth() , googleAuthRedirect() 에서 사용 
  

## 11.7.1 테스트 
http://localhost:3000/auth/to-google > 됨..


# 11.8 User 엔티티 파일 수정 
### (1) user.entity 에서 password 가 없을때에도 데이터가 저장하는 기능과 구글 인증시 식별자인 providerID 추가 

> user.entity.ts
```ts
    @Column( {nullable: true}) // google 인증시 패스워드에 빈값 허용 
    password: string

   // provider ID : 구글 로그인이 아닌경우 빈값  
    @Column({ nullable : true})
    providerId : string
}
```

# 11.9 UserService 에 구글 유저 검색 및 저장 메서드 추가. 
- 구글 인증 정보를 기반으로 회원 가입을 시켜주는 매서드 추가 
- 이미 회원 정보가 잇다면 회원정보를 반환하는 메서드 필요 
- 구글은 providerId 로 찾지만 우리는 이메일이 회원을 구분하는 단위 임. 
- 이메일로 기존 가입 여부를 확인해 가입되어있으면 유저정보 반환, 아니면 회원정보를 유저 테이블에 저장하는 코드 작성 

> user.service.ts
```ts
    // Google 접속 시 유저 검색 및 회원 가입 
    async findByEmailOrSave(email, username, providerId): Promise<User> {
        const foundUser = await this.getUser(email)
        if (foundUser) {
            return foundUser
        }
        // 기존 회원이 아닌경우 db 저장 
        const newUser = await this.userRepository.save({
            email,
            username,
            providerId
        })
        return newUser
    }
```

# 11.10 GoogleStrategy 에 구글 유저 저장하는 메서드 적용 
### (1) GoogleStrategy 의 validate() 메서드에서 구글 유저 정보가 있다면 정보를 데이터베이스에서 가져오고 없다면 저장 필요 findByEmailOrSave 메서드를 GoogleStrategy에 적용 , validate() 메서드에서 profile 정보의 id, name, email 을 db 에 저장하도록 User 엔터티에 맞춰 넘겨줌 . 

> google.strategy.ts
```ts
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
    }
```

# 11.11 GoogleAuthGuard에서 세션 사용하도록 변경 
### (1) HTTP 요청시마다 구글 OAuth 통해인증하는게 아니라 쿠키, 세션 사용하여 저장된 데이터로 인증하도록 코드 변경 

```ts
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
```

http://localhost:3000/auth/to-google

<img src="https://blog.kakaocdn.net/dn/cQdOfW/btsL2dMtoBO/niSDurrAfckKSaOYskKygK/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/cQdOfW/btsL2dMtoBO/niSDurrAfckKSaOYskKygK/img.webp" data-origin-width="1198" data-origin-height="912" data-is-animation="false" width="754" height="574">

<img src="https://blog.kakaocdn.net/dn/dQFV1J/btsL1qszdPj/PkX2Bz4tJ1Xf2E9pGy7kuk/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/dQFV1J/btsL1qszdPj/PkX2Bz4tJ1Xf2E9pGy7kuk/img.webp" data-origin-width="948" data-origin-height="566" data-is-animation="false" width="759" height="453">

<img src="https://blog.kakaocdn.net/dn/zkMr2/btsL2l42B4i/FgMZ7eAw2eLkirUY9LUAkK/img.gif" data-is-animation="true" data-origin-width="852" data-origin-height="828" data-filename="grklogin-google.gif" width="746" height="725">

