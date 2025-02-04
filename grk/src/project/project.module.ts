// src/project/project.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project } from './project.schema';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectMongoRepository } from './project.repository';
import { ProjectSchema } from './project.schema';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

// 웹소켓 체팅을 한임포트 
import { ProjectGateway,RoomGateway } from './project.gateway';

@Module({
    imports: 
    [
        MongooseModule.forFeature(
        [{ name: Project.name, schema: ProjectSchema }]),
    
        MulterModule.register({
        dest:join(__dirname,'..','..','uploads'),

    }),
    
    ],
    controllers: [ProjectController],
    providers: [
        ProjectService, ProjectMongoRepository,
        // 웹소켓 게이트 웨이 프로바이더 
        ProjectGateway,
        // 채팅방 리스트 게이트웨이 프로바이더 
        RoomGateway,

    ],
    exports: [ProjectService],
})
export class ProjectModule {}
