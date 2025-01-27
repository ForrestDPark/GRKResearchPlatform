//src/task/task.service.ts

//Task dto import
import { TaskDto } from './task.model'


// json file local db 용 기능 import 
// import { TaskFileRepository, TaskRepository} from './task.repository'

// mogodb 용 repository import 
import { TaskMongoRepository, TaskRepository} from './task.repository'
// 의존성 주입 기능 import
import { Injectable } from '@nestjs/common'

@Injectable()
export class TaskService {
    
    // taskRepository : TaskRepository
    // constructor() {
    //     this.taskRepository = new TaskFileRepository()
    // }

    // constructor(private taskRepository: TaskFileRepository){}
    constructor (private taskRepository : TaskMongoRepository) {}
    
    
    /* 3. 모든 프로젝트  가져오기 */
    async getAllTasks() {
        return await this.taskRepository.getAllTask()
    }
    /* 4. 프로젝트 생성 */
    createTask(taskDto : TaskDto){
        this.taskRepository.createTask(taskDto)
    }
    /* 5. 프로젝트 하나 읽기 */
    async getTask(id) : Promise<TaskDto>{
        return await this.taskRepository.getTask(id)
    }
    /* 6. 프로젝트 삭제 */
    deleteTask(id) {
        this.taskRepository.deleteTask(id)
    }
    /* 7. 프로젝트 업데이트 */
    updateTask(id, taskDto : TaskDto) {
        this.taskRepository.updateTask(id, taskDto)
    }
}