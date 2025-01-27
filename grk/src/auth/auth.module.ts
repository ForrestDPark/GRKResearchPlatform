//auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import chalk from 'chalk';

// Passport, serializer , local strategy 추가 
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './local.strategy';


console.log(chalk.red('AuthModule Start[[[인증]]]]'))

@Module({
  imports: [
    UserModule,
    PassportModule.register({session: true}),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer
  ],
  controllers: [AuthController]
})
export class AuthModule {}
