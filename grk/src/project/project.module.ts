// src/project/project.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project } from './project.schema';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectMongoRepository } from './project.repository';
import { ProjectSchema } from './project.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])],
    controllers: [ProjectController],
    providers: [ProjectService, ProjectMongoRepository],
    exports: [ProjectService],
})
export class ProjectModule {}
