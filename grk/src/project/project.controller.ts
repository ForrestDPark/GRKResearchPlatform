// src/blog.controller.ts
/* 1.  데코레이터 함수 임포트 */
import { 
  Controller,
  // Request, Response 
  Param, Body, Delete, Get, Post, Put,
  // upload-file 
  UploadedFile, UseInterceptors
} from '@nestjs/common'

// 프로젝트 서비스 임포트 
import { ProjectService } from './project.service'

// 파일 업로드 api 
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'
import { multerOption } from 'src/multer.options'

/* Project Controller   */
@Controller('project')
export class ProjectController {

  constructor(private projectService : ProjectService){}

  ///* 3. Get 요청 */
  @Get()
  async getAllProjects() { 
    console.log("모든 프로젝트 가져오기 ")
    return await this.projectService.getAllProjects()
  }
  
  /* 4. POST 요청 처리 */
  @Post()
  createProject(@Body() projectDto){/* 5. HTTP 요청의 body 내용을 project 에 할당 */
    console.log('프로젝트 작성')
    this.projectService.createProject(projectDto)
    return 'success'
  }
  
  /* 6. get 방식 url 에 매개변수에 id 가 있는 요청 처리   */
  @Get('/:id') 
  async getProject(@Param('id') id: string) {
    
    const post = await this.projectService.getProject(id)
    console.log(post)
    return post
  }
  
  /* 7. delete방식 url 매개변수에 id가 있는 요청처리  */
  @Delete("/:id") 
  deleteProject(@Param('id') id: string) {
    console.log("프로젝트 삭제")
    this.projectService.deleteProject(id)
    return 'success'

  }

  /* 8. put 방식 url 매개변수에 id가 있는 요청처리  */
  @Put("/:id")
  updateProject(@Param('id') id: string, @Body() projectDto){
    console.log(`프로젝트 업데이트`,id,projectDto)
    return this.projectService.updateProject(id,projectDto)
  }

  // File Upload 기능 
  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file',multerOption)) 
  fileUpload(@UploadedFile() file : Express.Multer.File){
    console.log('파일 객체 :',file)
    if (!file) {
      return '파일 이 없습니다.'
    }
    console.log('파일 저장 경로: ', file.path)
    try {
      const fileContent = fs.readFileSync(file.path, 'utf-8')
      console.log("file 내용 : ",fileContent)
      return {message: `file upload success
         - original file name  :${file.originalname}
         - upload check : http://localhost:3000/uploads/${file.filename}
        `}
      
    } catch (error) {
      console.error('file read error')
    }
    return 'File Upload'
  }
}

