// src/auth/google.strategy.ts

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { UserService } from "src/user/user.service";

// Google id, secret은 Config file 에 있음 
import { ConfigService } from "@nestjs/config";

//validate 에서 profile 중 email 을 가져와 db 에 저장(User필요)하는 기능 
import { User } from "src/user/user.entity";


@Injectable()
// Passport Strategy 상속 
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        private userService: UserService,
        private configService: ConfigService
    ) {
        super({
            clientID : configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret : configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL : 'http://localhost:3000/auth/google',
            scope : ['email', 'profile']

        })
    }
    // Google 용 validate
    async validate(accessToken: string, refreshToken: string, profile: Profile) {

        const {id, name, emails} =profile
        console.log(accessToken)
        console.log(refreshToken)
        const providerId = id
        const email = emails[0].value
        console.log(providerId, email, name.familyName, name.givenName)

        // db 용 User entity 포맷 <- userService 
        const user : User =await this.userService.findByEmailOrSave(
            email,
            name.familyName + name.givenName,
            providerId
        )
        return user
        //db 에 저장된 user 정보를 반환함. 세션에서 유저정보 다룰때 user Entity 사용 
    }

}