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