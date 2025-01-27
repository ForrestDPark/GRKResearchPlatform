// task.repository.ts 

import { readFile, writeFile } from 'fs/promises'
import { TaskDto } from './task.model'
import { Injectable } from '@nestjs/common'

// MongoDB 
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Task, TaskDocument } from './task.schema'


// 블로그 리포지토리 인터페이스 정의 
export interface TaskRepository {
    getAllTask() : Promise<TaskDto[]>
    createTask(taskDto: TaskDto) 
    getTask(id:string) : Promise<TaskDto>
    deleteTask(id: string)
    updateTask(id: string, taskDto: TaskDto)
}

// 3. TaskRepository를 구현한 클래스. 파일 읽고 쓰기 
// getAllTask()의 결과물이 db model 이 되어 return 값인 Tasks 에 find(), filter(), push() 같은 json 처리 함수를 붙인다. . 
@Injectable()
export class TaskFileRepository implements TaskRepository {
    FILE_NAME = './src/task.data.json'
    // 4. 게시글 불러오기 
    async getAllTask() : Promise<TaskDto[]> {
        const data = await readFile(this.FILE_NAME, 'utf-8')
        const tasks = JSON.parse(data)
        return tasks
    }
    // 5. 게시글 쓰기 
    async createTask(taskDto : TaskDto) {
        const tasks = await this.getAllTask()
        const id = tasks.length +1
        const createTask = {
            ...taskDto,
            id: id.toString(),
            createDt: new Date()
        }
        tasks.push(createTask)
        await writeFile(this.FILE_NAME, JSON.stringify(tasks))
    }
    // 게시글 하나 가져오기 
    async getTask(id :string): Promise<TaskDto> {
        const tasks = await this.getAllTask()
        const result = tasks.find((task) => task.id ===id)
        
        return result 
    }
    // 7. 게시글 하나 삭제 
    async deleteTask(id: string) {
        const tasks = await this.getAllTask()
        const filteredTasks = tasks.filter((task) => task.id !==id)
        await writeFile(this.FILE_NAME, JSON.stringify(filteredTasks))
    }

    // 9. 개사글 하나 수정 
    async updateTask(id: string, taskDto: TaskDto) {
        const tasks = await this.getAllTask()
        const index = tasks.findIndex((task) => task.id ===id)
        const updateTask = {
            ...taskDto,
            id,
            updateDt: new Date()
            // updatedBy: 향후 추가 
        }
        tasks[index] = updateTask;
        await writeFile(this.FILE_NAME, JSON.stringify(tasks))
    }
    // 
}


// MongoDB 용 리포지토리 
@Injectable()
export class TaskMongoRepository implements TaskRepository {
    // constructor 생성 
    // Task(위에서 임포트된 몽구스 모델) 라는 이름의 몽구스 모델을 찾아서  현재 클래스의 TaskModel 속성에 주입하라고 지시함. 
    // Task.name 은 객체 내의 name 속성이아니라 클래스의 이름을 뜻하는 것이다. 
    // Task 라는 class 를 주입 받아서 TaskDocument 타입으로 TaskModel 을 생성한다는 이야기 
    // TaskDto 를 사용하지않고 Task 를 사용한다. 
    // db 를 가리키는 것은 TaskModel 이고 여기에 find() 등 쿼리명령어를 사용할 수 있다. 
    constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>){}

    // 모든 프로젝트 읽기 
    async getAllTask() : Promise<Task[]> {
        return await this.taskModel.find().exec()
    }
    // 프로젝트 작성 
    async createTask(taskDto: TaskDto){
        const createTask = {
            ...taskDto,
            createdDt: new Date(),
            updatedDt: new Date()
        }
        this.taskModel.create(createTask)
    }

    async getPost(id:string) : Promise<TaskDto> {
        return await this.taskModel.findById(id)
        // await this.taskModel.findByIdAndDelete(id)
    }

    // 프로젝트 읽기(상세)
    async getTask(id:string) : Promise<TaskDto> {
        return await this.taskModel.findById(id)
    }
    // 프로젝트 삭제 
    async deleteTask(id: string) {
        await this.taskModel.findByIdAndDelete(id)
    }
    // 프로젝트 업데이트(수정)
    async updateTask(id: string, taskDto : TaskDto){
        const updateTask = { 
            ...taskDto, 
            id, 
            updateDt: new Date()}
        await this.taskModel.findByIdAndUpdate(id,updateTask)
    }

}