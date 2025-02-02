//src/auth/auth.service.ts 
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';

// 회원 정보 암호화 라이브러리 
import * as bcrypt from 'bcrypt'
// import { User } from 'src/user/user.schema';
import { User } from 'src/user/user.entity';
// import chalk from 'chalk';


@Injectable() // provider 
export class AuthService {
    constructor(private userService: UserService) {}

    async register(userDto : CreateUserDto) {
        // 1. 이미 가입된 유저 있는지 체크 
        const user = await this.userService.getUser(userDto.email)
        if (user) {
            console.log(("해당 유저 있음."))
            // 이미 가입된 유저 있을 경우 에러 발생 
            throw new HttpException(
                '해당 유저가 이미 있습니다. ',
                HttpStatus.BAD_REQUEST
            )
        }
        // password 암호화  10 : cost factor: 암호화 과정에서 얼마나 많은 계산을 수행할지 결정 시간 걸림. 
        // const encryptedPassword = bcrypt.hashSync(userDto.password, 10)

        const encryptedPassword = await bcrypt.hash(userDto.password,10)

        // db 저장, 저장중 error 나면 서버 에러 발생 
        try {
            const user = await this.userService.createUser({
                ...userDto,
                password: encryptedPassword
            })
            // 회원 가입 후 반환하는 값에는 password 를 주지 않음. 
            user.password =undefined
            return user

        } catch (error) {
            throw new HttpException('서버 에러 ', 500)
        }

    }

    // 회원 검증 
    async validateUser(email: string, password: string) {
        console.log((" >> auth.service.ts >> validateUser 실행"))
        const user = await this.userService.getUser(email)
        
        
        // 이메일로 유저 정보를 받음. 
        if (!user) { // 유저가 없는 경우 -> 검증 실패 
            console.log((" >> user 가 없습니다. 검증실패"))
            return null
        }
        const { password: hashedPassword, ...userInfo } = user

        if (bcrypt.compareSync(password, hashedPassword)) {
            // password 일치 
            console.log(" >> user 가 있습니다. ",userInfo)
            return userInfo
        }
        throw new HttpException('비밀번호가 일치하지 않습니다.', HttpStatus.UNAUTHORIZED);
    }




}

