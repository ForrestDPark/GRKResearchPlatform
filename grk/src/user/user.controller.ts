// src/blog.controller.ts
/* 1.  데코레이터 함수 임포트 */
import {  Controller, Param,Body, Delete, Get, Post, Put} from '@nestjs/common'
// 블로그 서비스 임포트 
import { UserService } from './user.service'

// TypeORM setting 
import { User } from './user.entity'
import chalk from 'chalk'

// User DTO import 
import { CreateUserDto, UpdateUserDto } from './user.dto'



@Controller('user') 
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/create') 
  createUser(@Body() user: CreateUserDto) {
    console.log(chalk.yellowBright(">> create 실행"))
    return this.userService.createUser(user)
  }
  @Get('/getUser/:email')
  async getUser(@Param('email') email: string) {
    const user = await this.userService.getUser(email)
    console.log(user)
    return user 
  }
  @Put('/update/:email')
  updateUser(@Param('email') email:string, @Body() user: UpdateUserDto) {
    console.log(chalk.yellow(" update 쿼리에 들어갈 user info"))
    console.log(user)
    return this.userService.updateUser(email,user)
  }
  @Delete('/delete/:email')
  deleteUser(@Param('email') email:string) {
    return this.userService.deleteUser(email)
  }


}