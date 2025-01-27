import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
// userService 주입 -> 유저정보를 검증 
import { UserService } from "src/user/user.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private userService: UserService){
        super();
    }
    // 세션에 유저의 이메일 정보 저장 
    serializeUser(user: any, done: (err:Error, user:any) => void):any {
        done(null,user.email) // 세션에 저장할 정보 
    }
    // 세션에서 정보를 꺼내옴  userService 의 getUser 필요.
    async deserializeUser(
        payload: any,
        done: (err: Error, payload: any) => void,
    ): Promise<any> {
        const user = await this.userService.getUser(payload)
        // 유저 정보가 없는경우 done()함수에 에러 전달
        if(!user) {
            done(new Error('No User'), null)
            return 
        }
        const { password, ...userInfo} = user
        done(null,userInfo)
        
    }
}