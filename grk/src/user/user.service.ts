//src/user/user.service.ts

//User dto import
import { UserDto } from './user.model'

// mogodb 용 repository import 
// import { UserFileRepository, UserMongoRepository, UserRepository} from './user.repository'

// 의존성 주입 기능 import
import { Injectable } from '@nestjs/common'

/* RDB 설정 ,typeORM */
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { ConfigService } from '@nestjs/config'
import chalk from 'chalk'

@Injectable()
export class UserService {
    constructor(
        // private configService: ConfigService,
        // private userMongoRepository: UserMongoRepository,
        // private userFileRepository: UserFileRepository,
        // private userSQLiteRepository: Repository<User>,
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}
    // user 생성 
    createUser(user) : Promise<User> {
        return this.userRepository.save(user)
    }
    // user 한명 정보 찾기 
    async getUser(email: string) {
        const result = await this.userRepository.findOne({
            where: { email }
        })
        return result
    }
    // user update (_user 는 수정된 user 객체임 )
    async updateUser(email, _user) {
        console.log(chalk.yellow(">> Select 로 해당메일의 user 찾음 "))
        const user : User = await this.getUser(email)
        console.log(chalk.yellow(">> 수정하려는 유저 정보 "))
        console.log(_user)

        user.username = _user.username
        user.password = _user.password
        user.role=_user.role
        console.log(user)
        this.userRepository.save(user)
    }
    // user 정보 삭제 
    deleteUser(email : any) {
        return this.userRepository.delete({ email })
    }

/************************************************ */
    // Mongo DB Version. 
    // constructor (private userRepository : UserMongoRepository) {}
    // /* 3. 모든 프로젝트  가져오기 */
    // async getAllUsers() {
    //     return await this.userRepository.getAllUser()
    // }
    // /* 4. 프로젝트 생성 */
    // createUser(userDto : UserDto){
    //     this.userRepository.createUser(userDto)
    // }
    // /* 5. 프로젝트 하나 읽기 */
    // async getUser(id) : Promise<UserDto>{
    //     return await this.userRepository.getUser(id)
    // }
    // /* 6. 프로젝트 삭제 */
    // deleteUser(id) {
    //     this.userRepository.deleteUser(id)
    // }
    // /* 7. 프로젝트 업데이트 */
    // updateUser(id, userDto : UserDto) {
    //     this.userRepository.updateUser(id, userDto)
    // }
}