# User directory file contents

grk
│   ├── README.md
│   ├── README2.nnb
│   ├── dev-reports
│   ├── dist
│   ├── ecosystem.config.js
│   ├── envs
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   ├── static
│   ├── test
│   ├── tsconfig.build.json
│   ├── tsconfig.json
│   ├── uploads
│   └── user-auth.sqlite

# 0. src directory tree
.
├── app.module.ts
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
├── conf.controller.ts
├── configs
│   ├── common.ts
│   ├── config.ts
│   ├── dev.ts
│   ├── local.ts
│   └── prod.ts
├── main.ts
├── multer.options.ts
├── project
│   ├── project.controller.ts
│   ├── project.gateway.spec.ts
│   ├── project.gateway.ts
│   ├── project.model.ts
│   ├── project.module.ts
│   ├── project.repository.ts
│   ├── project.schema.ts
│   └── project.service.ts
├── task
│   ├── task.controller.ts
│   ├── task.model.ts
│   ├── task.module.ts
│   ├── task.repository.ts
│   ├── task.schema.ts
│   └── task.service.ts
├── test-image.jpg
├── user
│   ├── user.controller.ts
│   ├── user.dto.ts
│   ├── user.entity.ts
│   ├── user.md
│   ├── user.model.ts
│   ├── user.module.ts
│   └── user.service.ts
└── weather
    ├── weather.controller.ts
    └── weather.module.ts

## 1. user.controller.ts

```TS
// src/blog.controller.ts
/* 1.  데코레이터 함수 임포트 */
import {  Controller, Param,Body, Delete, Get, Post, Put} from '@nestjs/common'
// 블로그 서비스 임포트 
import { UserService } from './user.service'

// TypeORM setting 
import { User } from './user.entity'
// import chalk from 'chalk'

// User DTO import 
import { CreateUserDto, UpdateUserDto } from './user.dto'

@Controller('user') 
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/create') 
  createUser(@Body() user: CreateUserDto) {
    // console.log(chalk.yellowBright(">> create 실행"))
    return this.userService.createUser(user)
  }
  @Get('/getUser/:email')
  async getUser(@Param('email') email: string) {
    const user = await this.userService.getUser(email)
    console.log(user)
    return user 
  }
  @Put('/update/:email')
  updateUser(@Param('email') email:string, @Body() user: UpdateUserDto) {
    // console.log(chalk.yellow(" update 쿼리에 들어갈 user info"))
    console.log(user)
    return this.userService.updateUser(email,user)
  }
  @Delete('/delete/:email')
  deleteUser(@Param('email') email:string) {
    return this.userService.deleteUser(email)
  }


}
```


## 2. user.dto.ts

```TS
//user.dto.ts

import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {

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


## 3. user.entity.ts

```TS
import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id? : number

    @Column({ unique: true})
    email : string 

    @Column( {nullable: true}) // google 인증시 패스워드에 빈값 허용 
    password: string

    @Column()
    username: string

    @Column({ default: 'user' })
    role: string

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    createdDt: Date= new Date()

    // provider ID : 구글 로그인이 아닌경우 빈값  
    @Column({ nullable : true})
    providerId : string
}
```

## 4. user.model.ts

```TS

export interface UserDto {
    id : string
    username : string
    email : string
    password: string
    role?: string
    createdDt: Date
}
```

## 5. user.module.ts

```TS
/**
 * User 모듈은 typeorm 의 forfeature() 함수를 사용하여 User 엔티티 등록, 관리함. 
 * UserService를 app.module 의 프로바이더로 등록
 * UserService 에서 @InjectRepository 로 Repository<User> 인스턴스를 주입받음. 
 */
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

/**
 * TypeORM.forFeature() 란?
 * 엔터티 등록 배열형태로 전달된 엔터티 클래스를 현재 모듈에 등록 
 * 등록된 엔터티는 해당 모듈 내에서 TypeORM 의 repository를 통해 사용할수잇음
 * forFeature 는 di 시스템에 등록됨. @InjectRepository() 데코를 사용하여 해당 엔터티에대한 repository인스턴스를 주입받은룻잇음. 
 * 
 * forRoot 는 앱 천체에서 사용할 설정, appModule에서 한번만 호출됨.
 */
```

## 6. user.service.ts

```TS
//src/user/user.service.ts

//User dto import
import { UserDto } from './user.model'

// mogodb 용 repository import 
// import { UserFileRepository, UserMongoRepository, UserRepository} from './user.repository'

// 의존성 주입 기능 import
import { Injectable } from '@nestjs/common'

/* RDB 설정 ,typeORM */
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { ConfigService } from '@nestjs/config'
// import chalk from 'chalk'



@Injectable()
export class UserService {
    constructor(
        // private configService: ConfigService,
        // private userMongoRepository: UserMongoRepository,
        // private userFileRepository: UserFileRepository,
        // private userSQLiteRepository: Repository<User>,
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
        // console.log(chalk.yellow(">> Select 로 해당메일의 user 찾음 "))
        const user : User = await this.getUser(email)
        // console.log(chalk.yellow(">> 수정하려는 유저 정보 "))
        console.log(_user)

        user.username = _user.username
        user.password = _user.password
        user.role=_user.role
        console.log(user)
        this.userRepository.save(user)
    }
    // user 정보 삭제 
    deleteUser(email : any) {
        return this.userRepository.delete({ email })
    }

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

/************************************************ */
    // Mongo DB Version. 
    // constructor (private userRepository : UserMongoRepository) {}
    // /* 3. 모든 프로젝트  가져오기 */
    // async getAllUsers() {
    //     return await this.userRepository.getAllUser()
    // }
    // /* 4. 프로젝트 생성 */
    // createUser(userDto : UserDto){
    //     this.userRepository.createUser(userDto)
    // }
    // /* 5. 프로젝트 하나 읽기 */
    // async getUser(id) : Promise<UserDto>{
    //     return await this.userRepository.getUser(id)
    // }
    // /* 6. 프로젝트 삭제 */
    // deleteUser(id) {
    //     this.userRepository.deleteUser(id)
    // }
    // /* 7. 프로젝트 업데이트 */
    // updateUser(id, userDto : UserDto) {
    //     this.userRepository.updateUser(id, userDto)
    // }
}
```