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