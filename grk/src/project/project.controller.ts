// src/blog.controller.ts
/* 1.  데코레이터 함수 임포트 */
import { Controller, Param,Body, Delete, Get, Post, Put} from '@nestjs/common'
// 블로그 서비스 임포트 
import { ProjectService } from './project.service'



/* Project Controller   */
@Controller('project')
export class ProjectController {
//   projectService : ProjectService
//   constructor() {
//     this.projectService = new ProjectService()
//   }
  constructor(private projectService : ProjectService){}
  @Get()
  async getAllProjects() { /* 3. Get 요청 */
    console.log("모든 프로젝트 가져오기 ")
    return await this.projectService.getAllProjects()
  }

  @Post() /* 4. POST 요청 처리 */
  createProject(@Body() projectDto){/* 5. HTTP 요청의 body 내용을 project 에 할당 */
    console.log('프로젝트 작성')
    this.projectService.createProject(projectDto)
    return 'success'
  }

  @Get('/:id') /* 6. get 방식 url 에 매개변수에 id 가 있는 요청 처리   */
  async getProject(@Param('id') id: string) {
    
    const post = await this.projectService.getProject(id)
    console.log(post)
    return post
  }
  @Delete("/:id") /* 7. delete방식 url 매개변수에 id가 있는 요청처리  */
  deleteProject(@Param('id') id: string) {
    console.log("프로젝트 삭제")
    this.projectService.deleteProject(id)
    return 'success'

  }

  @Put("/:id")/* 8. put 방식 url 매개변수에 id가 있는 요청처리  */
  updateProject(@Param('id') id: string, @Body() projectDto){
    console.log(`프로젝트 업데이트`,id,projectDto)
    return this.projectService.updateProject(id,projectDto)
  }
}

