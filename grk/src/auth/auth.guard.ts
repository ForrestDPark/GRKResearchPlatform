/// src/auth/auth.guard.ts

// Guard 를 사용하기 위한 임포트 
import { CanActivate, ExecutionContext, Injectable, Request} from '@nestjs/common'

// 패스포트 사용하는 AuthGuard 임포트 
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service'

@Injectable()
// Google stratagey Guard 상속 
export class GoogleAuthGuard extends AuthGuard('google'){
  async canActivate(context: ExecutionContext):  Promise<boolean>  {
    const result = (await super.canActivate(context)) as boolean

    // context 에서 request 를 추출 함. 
    const request = context.switchToHttp().getRequest()
    
    // 세션 사용하여 인증 유지 
    await super.logIn(request)
    return result
      
  }
}

@Injectable()
// AuthGuard 상속 
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: any):   Promise<boolean>  {
    const result = (await super.canActivate(context)) as boolean
    // 로컬 스트래티지 실행 
    const request = context.switchToHttp().getRequest()
    // 세션 저장 
    await super.logIn(request)
    return result 
      
  }
}

@Injectable() 
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext):  boolean{
        const request = context.switchToHttp().getRequest()
        // 세션에서 정보를 읽어서 인증 확인 
        return request.isAuthenticated()
  }
}

// 패스포트 사용하지 않고 쿠키만 사용해서 구현된 코드 
@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService) {}
    canActivate(
        context: ExecutionContext,
    ): boolean {
        const request = context.switchToHttp().getRequest();
         console.log("LoginGuard 쿠키 확인 : ", request.cookies); // 쿠키 로그 추가
        if (!request.cookies['login']) {
            console.log("쿠키 정보 없음.")
          //  throw new UnauthorizedException('로그인 정보가 없습니다.');
          return false;
        }
        const user = JSON.parse(request.cookies['login']); // 쿠키에서 user 정보 추출 
        if (user) {
            request.user = user
            console.log("user 정보 : ", user)
            return true;
        }
        console.log("로그인 정보가 유효하지 않음.")
        return false
      }
}






//**********************기존 코드 ******************* */
// @Injectable()
// export class LoginGuard implements CanActivate {

//     constructor(private authService: AuthService) {}

//     // CanActivate 인터페이스의 메서드 
//     async canActivate(context: any): Promise<boolean> {
//         // 컨텍스트에서 리퀘스트 정보를 가져옴
//         const request =  context.switchToHttp().getRequest()
//         // 쿠키가 있으면 인증된 것
//         if (request.cookies['login']) {
//             return true
//         }
//         // 쿠키가 없으면 request 의 body정보 확인 
//         if (!request.body.email || !request.body.password) {
//             return false 
//         }

//         //기존의 authService.validateUser 를 사용하여 인증
//         const user = await this.authService.validateUser(
//             request.body.email,
//             request.body.password
//         )
//         // 유저 정보 없을시 fals e
//         if (!user) {
//             return false 
//         }
//         // 유저정보가 있으면 request 에 user 정보 추가후 true 
//         request.user = user
//         return true 
//     }
// }