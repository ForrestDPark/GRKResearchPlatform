//auth/local.strategy.ts

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    // 1. PassportStrategy 믹스 인 
    constructor( private authService: AuthService) {
        // 기본값이 username 이므로 email 로 변경함. 
        super({usernameField :'email'})
    }
    // 유저 정보의 유효성 검증 
    async validate(email: string, password: string) : Promise<any> {
        
        const user = await this.authService.validateUser(email,password)
        
        if (!user) {
            return null // null -> 404 에러 
        }
        return user  // user 정보 반환 

    }
}