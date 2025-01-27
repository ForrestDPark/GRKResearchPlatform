# GRK Platform development Documentation

## 1. Environment  Setting



```Bash
## 1. NestJS directory generation
cd GRKResearchPlatform
cd grk

## 2. NPM install 
npm i @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata typescript
npm install  -g @nestjs/cli
nest new grk-research

cd grk-research


## 3. Configuration 
vi tsconfig.json
################################
{
    "compilerOptions": {
        "module": "CommonJS",
        "target": "ESNEXT",
        "experimentalDecorators":true,
        "emitDecoratorMetadata":true
    }
}
################################
cd grk

## 4. Cash refresh and npm dev start 

npm install
## DB 
npm install @nestjs/mongoose mongoose
## 핸들바 UI
npm i express-handlebars@6.0.3

### Config 의존성 패키지
npm i @nestjs/config

## yaml 설치 
npm i js-yaml
npm i -D @types/js-yaml

npm run start:dev

```

## 2. Directory and Minor tuning

### (1) envs folder (config.yml, dev.env,local.env, prod.env)생성 
### (2) package.json > strat 수정
```JSON
    "start": "NODE_ENV=local nest start",
    "start:dev": "NODE_ENV=dev nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "NODE_ENV=prod&& node dist/main",
```
### (3) src/configs/(config.ts, common.ts, dev.ts, local.ts, prod.ts) 생성 
### (4) app.controller.ts, app.module.ts 생성 
### (5) configs 폴더 복사 dev.ts 정리 
### (6) project, task, user 폴더 생성 각각 controller.model.repository,schema,service 생성 후 app.module 에서 필요한 import 설정 추가, provider 추가 
### (7) TypeORM 추가 (RDB 전환용 라이블러리)




# 3. Login Authentication and Sign up Documentation 

- Authentication(인증) : 누구인지 확인 
- Authorization(인가) : 인증된 사용자의 권한을 확인하는 절차
- 쿠키, 세션을 사용한 인증 기능 구현 
- NestJS 에서는 롤기반의 권한 관리 제공 
- https://docs.nestjs.com/security/authorization 

>chapter 10 부터 grk platform 으로 개발을 하도록 하자. 
향후  ch 9, 8 을 review 하면서 다시 grk 만들것. 

- AuthModule, AuthController, AuthService 클래스로 구성 
- UserService 에는 회원정보 추가,수정,삭제 등의 method 있음. 
  
## 10.1.2 User module 생성

```bash

nest new grk
cd grk 
nest g module user
nest g controller user --no-spec 
nest g service user --no-spec
npm install sqlite3 typeorm @nestjs/typeorm

# nest g module project

nest g controller project --no-spec 
nest g service project --no-spec
## 기존의 task,user,project 폴더 와 같이 파일 만든후 appmodule 에서 설정을 수정할것 


npm install @nestjs/mongoose mongoose

npm install class-validator class-transformer

## 유저 인증 
npm install bcrypt
npm install -D

```
### 10.2.1 엔티티 생성
```TS
import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id? : number

    @Column({ unique: true})
    email : string 

    @Column()
    password: string

    @Column()
    username: string

    @Column()
    role: string

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    createdDt: Date= new Date()
}
```
# 🤔TypeORM 이란

Node.js 환경에서 TypeScript 를 사용하여 데이터베이스와 상호작용하는데 사용되는 Object-Relational Mapping(ORM) 라이브러리임. 
객체와 관계형 데이터베이스의 테이블 사이의 불일치를 해결해 주는 역할을 함. 
개발자가 데이터 베이스의 복잡한 SQL 쿼리를 직접 작성하지 않고도 객체 지향적인 코드를 사용하여 데이터를 조작할수 있게 함. 
- MySQL, PostgreSQL, SQLite, Oracle 등을 지원함. 
- 데이터 테이블과 매핑 
- @Entity(), @Column(), @PrimaryGeneratedColum() 등의 데코레이터를 사용하여 클래스 속성을 데이터베이스 테이블의 컬럼과 연결함. 
- sql 쿼리문을 직접 작성하지 않고도 객체를 통해 데이터베이스를 조작가능. 
- 데이터 저장: repository.save(entity)
- 데이터 조회 : repository.find() , findOne() 사용 
- 관계설정 가능 
    @OneToOne(), @OneToMany(), @ManyToMany() 로 테이블 간 관계 정의 가능



| 기능             | `TypeOrmModule.forRoot()`                                                                                                 | `TypeOrmModule.forFeature()`                                                                                              |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| **역할**         | 데이터베이스 연결 설정 및 전체 애플리케이션 설정 정의                                                                        | 특정 모듈에서 사용할 엔티티 등록 및 해당 모듈에서 `Repository` 사용                                                              |
| **사용 위치**      | `AppModule` 또는 `CoreModule`과 같은 최상위 모듈에서 한 번만 사용                                                                 | `UserModule`, `ProductModule`과 같은 특정 기능 모듈에서 필요에 따라 사용                                                            |
| **기능**          | 데이터베이스 연결, 엔티티 자동 로딩, 동기화, 마이그레이션, 커넥션 풀 관리, 전체 설정 공유                                                               | 엔티티 등록, 의존성 주입 지원, 모듈 스코프                                                                                 |
| **영향 범위**    | 애플리케이션 전체                                                                                                          | 특정 모듈 내                                                                                                             |
| **사용 빈도**     | 애플리케이션에서 한 번만 사용                                                                                                | 여러 모듈에서 필요에 따라 사용                                                                                              |

### (2) 엔터티를 적용할 유저서비스 생성 (기능없음)

```TS
//src/user/user.service.ts
//User dto import
import { UserDto } from './user.model'

// mogodb 용 repository import 
import { UserFileRepository, UserMongoRepository, UserRepository} from './user.repository'

// 의존성 주입 기능 import
import { Injectable } from '@nestjs/common'

/* RDB 설정 ,typeORM */
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}
    
```
- repository 를 의존하지 않고 service 단에서 db 를 처리 한다. 

|메서드|설명|
|--|--|
|find|SQL 에서 select 와 같은 역할 <br> |
|findOne|findOne(id?:string |
|findAndCount|찾고 개수세기 |
|create|생성|
|update|수정|
|save|없으면 생성 있으면 수정|
|delete|엔터티 내 데이터 삭제|
|remove|엔터티 삭제 |

## 10.2.2 컨트롤러 

service 를 의존해서 요청을 처리함. 
```TS
// src/blog.controller.ts
/* 1.  데코레이터 함수 임포트 */
import {  Controller, Param,Body, Delete, Get, Post, Put} from '@nestjs/common'
// 블로그 서비스 임포트 
import { UserService } from './user.service'

// SQLite setting 
import { User } from './user.entity'

@Controller('user') 
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/create') 
  createUser(@Body() user: User) {
    return this.userService.createUser(user)
  }
  @Get('/getUser/:email')
  async getUser(@Param('email') email: string) {
    const user = await this.userService.getUser(email)
    console.log(user)
    return user 
  }
  @Put('/update/:email')
  updateUser(@Param('email') email:string, @Body() user: User) {
    console.log(user)
    return this.userService.updateUser(email,user)
  }
  @Delete('/delete/:email')
  deleteUser(@Param('email') email:string) {
    return this.userService.deleteUser(email)
  }

}

```
## 10.2.3 서비스 생성 
### (1) 서비스는 컨트롤러와 리포지토리를 이어주는 역할, 

```TS
//src/user/user.service.ts

//User dto import
import { UserDto } from './user.model'

// mogodb 용 repository import 
import { UserFileRepository, UserMongoRepository, UserRepository} from './user.repository'

// 의존성 주입 기능 import
import { Injectable } from '@nestjs/common'

/* RDB 설정 ,typeORM */
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { ConfigService } from '@nestjs/config'

// provider 선언! 컨트롤러에서 사용. 
@Injectable()
export class UserService {
    constructor(

        @InjectRepository(User) private userRepository: Repository<User>
    ) {}
    // user 생성 
    createUser(user) : Promise<User> {
        return this.userRepository.save(user)
    }
    // user 한명 정보 찾기 
    async getUser(email: string) {
        const result = await this.userRepository.findOne({
            where: { email }
        })
        return result
    }
    // user update (_user 는 수정된 user 객체임 )
    async updateUser(email, _user) {
        const user : User = await this.getUser(email)
        console.log(_user)
        user.username = _user.username
        user.password = _user.password
        console.log(user)
        this.userRepository.save(user)
    }
    // user 정보 삭제 
    deleteUser(email : any) {
        return this.userRepository.delete({ email })
    }
}
```
- 서비스에서 사용하는 리포지토리(Repository from typeORM) 은 어디에서 가져오는가? user.module 을 만들어서 가져와야함. 

### (2) user.module 에 typeOrmModule 을 import 해서 사용

```TS
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";

@Module({
    imports : [TypeOrmModule.forFeature([User])],
    controllers : [UserController],
    providers : [UserService]

})
export class UserModule {}
```
- User 라는 entity 가 모듈에 임포트 되어서 TypeORM 모듈에 등록되었다. 
- 추가로 entity가 app.module 에서도 등록이 되어야만 typeorm 에서 해당 엔티티의 메타데이터를 읽을 수있음. => app.moudle entities 에 [User] 추가 .

```TS
// import { UserSchema, User } from './user/user.schema';
import { User } from './user/user.entity'; //typeORM 용 엔터티 

//... (생략)

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'user-auth.sqlite', //데이터 베이스 파일명 
      entities : [User], // 엔티티 리스트 
      synchronize: true, // 데이터 베이스에 스키마를 동기화 
      logging : true // sql 실행 로그 확인 
    }),
```

** UserModule 을 임포트 해주고 provider 에서 UserService 부분을 주석처리한다. 이게 안되면 계속 mongoose 와 sqlite 가 충돌 
```TS
   // UserModule 을 주입
    UserModule

  ],
  controllers: [
    TaskController,
    ProjectController,
    UserController,
    ConfController],
  providers: [
    ProjectService, ProjectFileRepository, ProjectMongoRepository,
    TaskService, TaskFileRepository, TaskMongoRepository,
    //UserService,//UserFileRepository, UserMongoRepository
  ],
})
```
# test 

```Bash
### USER create test
 curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"username" :"Forre",
     "password": "grkcon2025!",
     "email":"forre@grkcon.com",
     "role":"admin"
     }' \
     http://localhost:3000/user/create
### USER (Get User) test
curl -X GET http://localhost:3000/user/getUser/forre@grkcon.com

### Update User 
curl -X PUT \
     -H "Content-Type: application/json" \
     -d '{"username" :"Forre",
     "password": "grkcon2025!",
     "role":"user"
     }' \
     http://localhost:3000/user/update/forre@grkcon.com

### Delete User
curl -X DELETE http://localhost:3000/user/delete/forre@grkcon.com
```
- update 할 때 user.role <-> _user.role 이 안되어있어서 업데이트 되지 않아서 수정함

# 10.3 파이프로 유효성 검증 
사용자에게 받은 입력값이 유효한지 검증은 필수 
사용자의 입력은 늘 예상을 벗어남. 
NestJS 에서는 파이프를 사용해 유효성 검증을함. 
다양한 파이프들이 있으며 직접 만들 수도 있음. 
가장 간단한 ValidationPipe => class-validator, class-transformer 설치 필요 

클라이언트와 데이터를 주고 받을때는 DTO 를 사용해야하므로 UserDto 객체를 만들어 유효성 검증에 필요한 조건을 추가 

- 유효성 검증으로 @UsePipes데코와 Joi 라이브러리를 사용하는 방법도 있지만 스키마를 만들어야하고 메서드마다 UsePipes를 일일히 붙여야함. 


## 10.3.1 전역 ValidationPipe 설정하기 

```bash
npm install class-validator class-transformer
```
### (1) maiin.ts 에 ValidationPipe 설정 추가 

```TS
//main.ts
// 회원 로그인시 유효성 검증을 위한 ValidationPipe 임포트 
import { ValidationPipe } from '@nestjs/common'
  // 전역 파이프에 validationPipe 추가 
  app.useGlobalPipes(new ValidationPipe())
```

## 10.3.2. UserDto 생성 

### (1) user.dto.ts 작성 
```TS
//user.dto.ts
import { IsEmail, IsString } from "class-validator";
export class CreateDto {
    @IsEmail()
    email : string 
    @IsString()
    password: string
    @IsString()
    username : string 
    @IsString() 
    role: string 
}
export class UpdateUserDto {
    @IsString()
    username: string
    @IsString()
    password: string 
}
```
### (2) Controller 에서 User 타입을 dto 로 변경 

```TS

// User DTO import 
import { CreateUserDto, UpdateUserDto } from './user.dto'

@Post('/create') 
  createUser(@Body() user: CreateUserDto) { ...

@Put('/update/:email')
  updateUser(@Param('email') email:string, @Body() user: UpdateUserDto) { ...
```

## 10.3.3 test 

```bash
### USER create test wrong input error 
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"username" :"Forrea1",
    "password": "grkcon2025!",
    "email":"forres1temail.com",
    "role":"admin"
    }' \
    http://localhost:3000/user/create
```
> {"message":["email must be an email"],"error":"Bad Request","statusCode":400}



# 참고 
1. [이메일 인증 참고 1](https://velog.io/@kwontae1313/NestJS-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EB%B3%B4%EB%82%B4%EA%B8%B0)
2. [이메일 인증 참고2](https://suyeonme.tistory.com/108)
3. [이메일 인증 참고 3](https://yoonchan1121.tistory.com/140)
