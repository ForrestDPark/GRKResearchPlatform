// src/blog.controller.ts
/* 1.  데코레이터 함수 임포트 */
import { Controller, Param,Body, Delete, Get, Post, Put} from '@nestjs/common'
// 블로그 서비스 임포트 
import { TaskService } from './task.service'



/* Task Controller   */
@Controller('task')
export class TaskController {
//   taskService : TaskService
//   constructor() {
//     this.taskService = new TaskService()
//   }
  constructor(private taskService : TaskService){}
  @Get()
  async getAllTasks() { /* 3. Get 요청 */
    console.log("모든 사용자 가져오기 ")
    return await this.taskService.getAllTasks()
  }

  @Post() /* 4. POST 요청 처리 */
  createTask(@Body() taskDto){/* 5. HTTP 요청의 body 내용을 task 에 할당 */
    console.log('사용자 작성')
    this.taskService.createTask(taskDto)
    return 'success'
  }

  @Get('/:id') /* 6. get 방식 url 에 매개변수에 id 가 있는 요청 처리   */
  async getTask(@Param('id') id: string) {
    
    const post = await this.taskService.getTask(id)
    console.log(post)
    return post
  }
  @Delete("/:id") /* 7. delete방식 url 매개변수에 id가 있는 요청처리  */
  deleteTask(@Param('id') id: string) {
    console.log("사용자 삭제")
    this.taskService.deleteTask(id)
    return 'success'

  }

  @Put("/:id")/* 8. put 방식 url 매개변수에 id가 있는 요청처리  */
  updateTask(@Param('id') id: string, @Body() taskDto){
    console.log(`사용자 업데이트`,id,taskDto)
    return this.taskService.updateTask(id,taskDto)
  }
}

