import { Module } from '@nestjs/common';
import chalk
 from 'chalk';
// Config 환경변수 
import { ConfigModule } from '@nestjs/config';
import { ConfController } from './conf.controller';
import config from './configs/config'
import { WeatherModule } from './weather/weather.module';
// MongoDB
import { MongooseModule } from '@nestjs/mongoose';

// Project module
import { ProjectService } from './project/project.service';
import { ProjectController } from './project/project.controller';
import { ProjectFileRepository, ProjectMongoRepository } from './project/project.repository';
import { ProjectSchema, Project } from './project/project.schema';

// User module
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
// import { UserFileRepository, UserMongoRepository } from './user/user.repository';
// import { UserSchema, User } from './user/user.schema';
import { User } from './user/user.entity'; //typeORM 용 엔터티 
// import { UserRepository } from './user/user.repository';
import { UserModule } from './user/user.module';
// Task module
import { TaskService } from './task/task.service';
import { TaskController } from './task/task.controller';
import { TaskFileRepository, TaskMongoRepository } from './task/task.repository';
import { TaskSchema, Task } from './task/task.schema';

// TypeORM Module 
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

console.log(chalk.red('[ENVIRONMENT SETTING]: '+ process.env.NODE_ENV))
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath : `${process.cwd()}/envs/${process.env.NODE_ENV}.env`,
      
      // ignoreEnvFile : false,
      // load 옵션을 사용해 커스텀 설정 파일 추가 
      load: [config],
      cache : true, // 캐시 허용 
      expandVariables: true // 확장변수 옵션 추가 
    }),
    WeatherModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'user-auth.sqlite', //데이터 베이스 파일명 
      entities : [User], // 엔티티 리스트 
      synchronize: true, // 데이터 베이스에 스키마를 동기화 
      logging : true // sql 실행 로그 확인 
    }),

    // 애플리케이션 전체에서 사용할수 잇는 몽고디비 설정 구성, 연결 초기화 (기본연결 -> blog)
    // MongooseModule.forRoot(
    //   'mongodb+srv://pulpilisory:qwe123@cluster0.kbog4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    //   {
    //     dbName: 'user'
    //   }
    // ),
    //project db connection 
    MongooseModule.forRoot(
      'mongodb+srv://pulpilisory:qwe123@cluster0.kbog4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      {
        dbName: 'project',
      }
    ),
    //Task db connection 
    MongooseModule.forRoot(
      'mongodb+srv://pulpilisory:qwe123@cluster0.kbog4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      {
        dbName: 'task',
      }
    ),
    //몽고 디비 스키마 설정 (의존성주입 서비스클래스에서 mongoose 모델을 주입할수있게 함. )
    MongooseModule.forFeature([
      {name : Project.name, schema: ProjectSchema},
      // {name : User.name, schema: UserSchema}, 
      {name : Task.name, schema: TaskSchema},
    ]),
    // UserModule 을 주입
    UserModule,
    AuthModule

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
export class AppModule {}
