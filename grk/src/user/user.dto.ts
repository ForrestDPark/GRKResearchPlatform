//user.dto.ts

import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email : string 

    @IsString()
    password: string

    @IsString()
    username : string 

    @IsString() 
    role: string 
}

export class UpdateUserDto {
    @IsString()
    username: string
    @IsString()
    password: string 
}