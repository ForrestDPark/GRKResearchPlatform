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