
// API 라이브러리 
import { 
    Controller, Body, Get, Post,
    Request,Response, HttpStatus,
    UseGuards  //가드 
    } from '@nestjs/common';

// user Dto(create, update) 로 데이터 전송 
import { CreateUserDto, UpdateUserDto } from 'src/user/user.dto';

// 인증 서비스 임포트 
import { AuthService } from './auth.service';
import chalk from 'chalk';

// 가드 사용 임포트 
import { AuthenticatedGuard, LocalAuthGuard, LoginGuard } from './auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService) {}

    // 회원가입
    @Post('register')
    async register(@Body() userDto: CreateUserDto) {
        console.log(chalk.yellow(" >> register start"))
        return await this.authService.register(userDto)
    }

    // 로그인  1(검증없음)
    @Post('login')
    async login(@Request() req, @Response() res) {
        
        console.log(chalk.blue(" \n >>> login service "))
        // validateUser
        const userInfo = await this.authService.validateUser(
            req.body.email,
            req.body.password
        )
        console.log('user info :',userInfo)
        // 유저 정보가 있으면, 쿠키 정보를 response 저장 
        if (userInfo) {
            console.log(chalk.red('쿠키를 만듭니다!!'))
            
            // login 이라는 이름의 쿠키를 만듬. (user email, password 가 있음. )
            res.cookie('login', JSON.stringify(userInfo), {
                httpOnly: false, 
                maxAge: 1000 * 60 * 60 * 24 * 1 ,//7 day 단위는 밀리초 쿠키 지속 시간 
                // https 설정 
                // secure: true,
                // sameSite: 'none'
            })
            res.status(HttpStatus.OK)
        }
        console.log(chalk.cyanBright("Login success!!"))
        return res.send({ message: 'login success'})
    } 
 
    // 로그인 2. 사용자 인증 (쿠키)
    @UseGuards(LoginGuard)
    @Post('login2')
    async login2(@Request() req, @Response() res) {

        console.log(chalk.green(" >> login2 process start"))
        console.log('login2에서 쿠키 확인',req.cookies)
        // 쿠키정보는 없지만 request에 user 정보가 있다면 응답값에 쿠키 정보 추가 
        if (!req.cookies['login'] && req.user) {
            // 응답에 쿠키 정보 추가 
            res.cookie('login', JSON.stringify(req.user), {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 1  // test 용 
            })
        }
        return res.send({message: 'login2 success'})
    }
    // [[test guard]] -- 로그인을 한 때만 실행되는 메서드 
    @UseGuards(LoginGuard)
    @Get('test-guard')
    testGuard() {
        return '로그인 된 떄만 이 글이 보입니다. '
    }

    // Login 3. 가드, 세션, 쿠키 사용 
    @UseGuards(LocalAuthGuard) // login3 핸들러 도착전에 이미 검증을 함. 
    @Post('login3')
    login3(@Request() req ) {
        console.log(chalk.green(" >> 사용자 인증이 되었습니다. "))
        return req.user
    }

    @UseGuards(AuthenticatedGuard)
    @Get('test-guard2')
    testGuardWithSession(@Request() req){
        return req.user
    }



}


