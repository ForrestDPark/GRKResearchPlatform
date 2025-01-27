    // src/task/task.module.ts
    import { Module } from '@nestjs/common';
    import { MongooseModule } from '@nestjs/mongoose';
    import { Task } from './task.schema';
    import { TaskService } from './task.service';
    import { TaskController } from './task.controller';
     import { TaskMongoRepository } from './task.repository';
     import { TaskSchema } from './task.schema';


    @Module({
        imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])],
        controllers: [TaskController],
        providers: [TaskService, TaskMongoRepository],
        exports: [TaskService],
    })
    export class TaskModule {}