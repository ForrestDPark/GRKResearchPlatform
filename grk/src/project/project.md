# Project directory 


── project
│   ├── project.controller.ts
│   ├── project.gateway.spec.ts
│   ├── project.gateway.ts
│   ├── project.md
│   ├── project.model.ts
│   ├── project.module.ts
│   ├── project.repository.ts
│   ├── project.schema.ts
│   └── project.service.ts


## 1. project.controller.ts
```ts
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


```
## 2. project.gateway.ts
```ts
// project.gateway.ts
import { 
  SubscribeMessage, 
  WebSocketGateway,
  WebSocketServer,
  // chat room 을 위한 임포트 
  MessageBody,

} from '@nestjs/websockets';

// socket io 임포트 
import { Server, Socket } from 'socket.io'

// ---------------- 채팅방 연결 핸들러 (ChatGateWay -> ProjectGateway)----------------
@WebSocketGateway({namespace:'project/chat'})
export class ProjectGateway {
  // 웹 소켓 서버 인ㅅ턴스 선언 
  @WebSocketServer() server : Server
  

  // // message event 구독 (전체 챗 )
  // @SubscribeMessage('message')
  // handleMessage(socket: Socket, data : any): void {
  //   // 접속한 클라이언트에게 멧지 전송
  //   // this.server.emit('message', `User-${socket.id.substring(0,4)} : ${data}`,)
  //   const { message, nickname} =data
  //   socket.broadcast.emit('message',`${nickname}: ${message}`)
  // }
}

//----------------  채팅방 목록 및 입장  핸들러 ----------------
@WebSocketGateway({ namespace: 'project/room'})
export class RoomGateway {
  // 채팅방 내부 핸들러인 ProjectGateway의 의존성을 chatGateway 에 주입하여 사용 
  constructor (private readonly chatGateway : ProjectGateway) {}
  rooms = [] // 채팅방 리스트
  roomMessage ={} // 방별 메시지 저장 객체 
  userMap = new Map<string,string>() // socket.id 를 key 로 nickname 저장 


  // server instance 접근을 위한 변수 선언 
  @WebSocketServer()
  server: Server
  // 클라이언트 접속시 실행하는 함수 
  handleConnection(socket: Socket){
    // console.log('client 접속 : ',socket.id)
    socket.emit('rooms', this.rooms)
  }



  // -------------- 채팅방 조인후 message 전송 click 시 핸들러 --------------
  @SubscribeMessage('message')
  handleMessageToRoom(socket: Socket, data) {
    const { nickname, room, message, isSelf } = data
    console.log(data)
    // 나 이외에 사람에게 데이터 전송 
    socket.broadcast.to(room).emit('message', {
      message: `${nickname} : ${message}`,
      isSelf: false // 
    })

    // 메시지 저장 
    if (!this.roomMessage[room]) {
      this.roomMessage[room] =[]
    }
    this.roomMessage[room].push({
      message: `${nickname} : ${message}`,
      isSelf: isSelf, // 클라이언트에게 받은값을 저장 
      sender: socket.id
    })

    console.log(`${message}`)
  }


  // -------------- createRoom 핸들러 --------------
  @SubscribeMessage('createRoom')
  handleMessage(@MessageBody() data ){
    const { nickname, room } =data
    // 방 생성시 이벤트 발생시켜 클라이언트에 송신 
    this.chatGateway.server.emit('notice', {
      message:`${nickname}님이 ${room} 방을 만들었습니다.`
    })
    // 채팅방 목록에 삽입 
    this.rooms.push(room)
    // rooms 이벤트로 채팅방 리스트 전송 
    this.server.emit('rooms', this.rooms)
    console.log(" 방생성 ")
  }

  // -------------- joinRoom 핸들러 --------------
  @SubscribeMessage('joinRoom')
  handleJoinRoom(socket: Socket, data) {
    const { nickname, room, toLeaveRoom } = data
    // 유저 맵에 socket.id 를 key 로 nickname 저장 
    this.userMap.set(socket.id,nickname)

    // 기존방에서 퇴장 
    socket.leave(toLeaveRoom)
    this.chatGateway.server.emit('notice', {
      message: `${nickname}님이 ${room} 방에 입장 했습니다. `
    })
    // 새로운 방 입장. 
    socket.join(room)

    // 저장된 메세지 전송 
    if (this.roomMessage[room]) {
      socket.emit('messageHistory', this.roomMessage[room])
    }
  }
}
```
## 3. project.model.ts
```ts
// status 
/*
1 : ontrack
2 : complete
3 : delayed
4 : approved
*/
// export interface ProjectDto{}

export interface ProjectDto {
    id : string
    title : string
    desc : string
    createdBy: string
    updateBy?: string
    status? : number
    createdDt : Date
    updatedDt? : Date 
}
```
## 4. project.module.ts
```ts
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

```
## 5. project.repository.ts
```ts
// project.repository.ts 

import { readFile, writeFile } from 'fs/promises'
import { ProjectDto } from './project.model'
import { Injectable } from '@nestjs/common'

// MongoDB 
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Project, ProjectDocument } from './project.schema'


// 블로그 리포지토리 인터페이스 정의 
export interface ProjectRepository {
    getAllProject() : Promise<ProjectDto[]>
    createProject(projectDto: ProjectDto) 
    getProject(id:string) : Promise<ProjectDto>
    deleteProject(id: string)
    updateProject(id: string, projectDto: ProjectDto)
}

// 3. ProjectRepository를 구현한 클래스. 파일 읽고 쓰기 
// getAllProject()의 결과물이 db model 이 되어 return 값인 projects 에 find(), filter(), push() 같은 json 처리 함수를 붙인다. . 
@Injectable()
export class ProjectFileRepository implements ProjectRepository {
    FILE_NAME = './src/project.data.json'
    // 4. 게시글 불러오기 
    async getAllProject() : Promise<ProjectDto[]> {
        const data = await readFile(this.FILE_NAME, 'utf-8')
        const projects = JSON.parse(data)
        return projects
    }
    // 5. 게시글 쓰기 
    async createProject(projectDto : ProjectDto) {
        const projects = await this.getAllProject()
        const id = projects.length +1
        const createProject = {
            ...projectDto,
            id: id.toString(),
            createDt: new Date()
        }
        projects.push(createProject)
        await writeFile(this.FILE_NAME, JSON.stringify(projects))
    }
    // 게시글 하나 가져오기 
    async getProject(id :string): Promise<ProjectDto> {
        const projects = await this.getAllProject()
        const result = projects.find((project) => project.id ===id)
        
        return result 
    }
    // 7. 게시글 하나 삭제 
    async deleteProject(id: string) {
        const projects = await this.getAllProject()
        const filteredProjects = projects.filter((project) => project.id !==id)
        await writeFile(this.FILE_NAME, JSON.stringify(filteredProjects))
    }

    // 9. 개사글 하나 수정 
    async updateProject(id: string, projectDto: ProjectDto) {
        const projects = await this.getAllProject()
        const index = projects.findIndex((project) => project.id ===id)
        const updateProject = {
            ...projectDto,
            id,
            updateDt: new Date()
            // updatedBy: 향후 추가 
        }
        projects[index] = updateProject;
        await writeFile(this.FILE_NAME, JSON.stringify(projects))
    }
    // 
}


// MongoDB 용 리포지토리 
@Injectable()
export class ProjectMongoRepository implements ProjectRepository {
    // constructor 생성 
    // Project(위에서 임포트된 몽구스 모델) 라는 이름의 몽구스 모델을 찾아서  현재 클래스의 ProjectModel 속성에 주입하라고 지시함. 
    // Project.name 은 객체 내의 name 속성이아니라 클래스의 이름을 뜻하는 것이다. 
    // Project 라는 class 를 주입 받아서 ProjectDocument 타입으로 projectModel 을 생성한다는 이야기 
    // ProjectDto 를 사용하지않고 Project 를 사용한다. 
    // db 를 가리키는 것은 projectModel 이고 여기에 find() 등 쿼리명령어를 사용할 수 있다. 
    constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>){}

    // 모든 프로젝트 읽기 
    async getAllProject() : Promise<Project[]> {
        return await this.projectModel.find().exec()
    }
    // 프로젝트 작성 
    async createProject(projectDto: ProjectDto){
        const createProject = {
            ...projectDto,
            createdDt: new Date(),
            updatedDt: new Date()
        }
        this.projectModel.create(createProject)
    }

    async getPost(id:string) : Promise<ProjectDto> {
        return await this.projectModel.findById(id)
        // await this.projectModel.findByIdAndDelete(id)
    }

    // 프로젝트 읽기(상세)
    async getProject(id:string) : Promise<ProjectDto> {
        return await this.projectModel.findById(id)
    }
    // 프로젝트 삭제 
    async deleteProject(id: string) {
        await this.projectModel.findByIdAndDelete(id)
    }
    // 프로젝트 업데이트(수정)
    async updateProject(id: string, projectDto : ProjectDto){
        const updateProject = { 
            ...projectDto, 
            id, 
            updateDt: new Date()}
        await this.projectModel.findByIdAndUpdate(id,updateProject)
    }

}
```
## 6. project.schema.ts
```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// mongodb document type 
import { Document } from "mongoose";

import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;
// export type ProjectDocument = Project & Document

@Schema()
export class Project {
    @Prop()
    id: string
    @Prop()
    title: string
    @Prop()
    desc: string
    @Prop()
    createdBy : string
    @Prop()
    updatedBy : string
    @Prop()
    status : number
    @Prop()
    createdDt: Date
    @Prop()
    updatedDt: Date
}
// 스키마 생성
export const ProjectSchema = SchemaFactory.createForClass(Project)
```
## 7. project.service.ts
```ts
//src/project.service.ts

//Project dto import
import { ProjectDto } from './project.model'


// json file local db 용 기능 import 
// import { ProjectFileRepository, ProjectRepository} from './project.repository'

// mogodb 용 repository import 
import { ProjectMongoRepository, ProjectRepository} from './project.repository'
// 의존성 주입 기능 import
import { Injectable } from '@nestjs/common'

@Injectable()
export class ProjectService {
    
    // projectRepository : ProjectRepository
    // constructor() {
    //     this.projectRepository = new ProjectFileRepository()
    // }

    // constructor(private projectRepository: ProjectFileRepository){}
    constructor (private projectRepository : ProjectMongoRepository) {}
    
    
    /* 3. 모든 프로젝트  가져오기 */
    async getAllProjects() {
        return await this.projectRepository.getAllProject()
    }
    /* 4. 프로젝트 생성 */
    createProject(projectDto : ProjectDto){
        this.projectRepository.createProject(projectDto)
    }
    /* 5. 프로젝트 하나 읽기 */
    async getProject(id) : Promise<ProjectDto>{
        return await this.projectRepository.getProject(id)
    }
    /* 6. 프로젝트 삭제 */
    deleteProject(id) {
        this.projectRepository.deleteProject(id)
    }
    /* 7. 프로젝트 업데이트 */
    updateProject(id, projectDto : ProjectDto) {
        this.projectRepository.updateProject(id, projectDto)
    }
}
```


# 2023.2.4 수정 내역 


## 1. 채팅방  클릭시 화면 이동 없는 문제 해결 

