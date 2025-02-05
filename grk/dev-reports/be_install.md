# 1. 패키지 설치 및 기본 세팅 플로우 
```Bash
## 디렉토리 생성 
cd GRKResearchPlatform
cd grk 

##초기 tsconfig setting 
vi tsconfig.json
################################
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
################################
cd grk
## npm 인스톨 
npm install

## NestJS + typescript  setting
npm install  -g @nestjs/cli
npm i @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata typescript
npm i -g typescript ts-node

## console beautify library setting
npm install chalk

## Mongo DB + mongoose install 
npm install mongodb
npm install @nestjs/mongoose mongoose

## Sqlite & typeORM install 
npm install sqlite3 typeorm @nestjs/typeorm

## postgreSQL install 
npm install pg

## 핸들바 UI package install 
npm i express-handlebars@6.0.3

### Config 환경변수  패키지
npm i @nestjs/config

## yaml 설치 
npm i js-yaml
npm i -D @types/js-yaml

## 비밀번호 hash 암호화 패키지 
npm install class-validator class-transformer
npm install bcrypt
npm install -D @types/bcrypt 

## cookie parser 설치 
npm install cookie-parser

## session and passport 설치 
npm i @nestjs/passport passport passport-local express-session
npm i -D @types/passport-local @types/express-session 

## google oauth 
npm i passport-google-oauth20
npm i -D @types/passport-google-oauth20 

## Server static file management 
npm i @nestjs/serve-static

## Web Socket chatting 

cd grk/src

nest g module events
nest g gateway events 

npm i --save @nestjs/websockets @nestjs/platform-socket.io
npm i --save-dev @types/socket.io


## 서버 개발자 모드 실행 
npm run start:dev

```

### (1) conf.controller.ts, app.module.ts 생성  후 기존 파일 지우기 



### (2) appmodule setting > mongodb, postgres setting 
> app.module.ts
```ts

```

### (1) Config.setting > [common.ts, config.ts, dev.ts, local.ts, prod.ts ]생성 

### (2) package.json > start 수정 : 개발자 모드로 들어가면서 dev -> config 파일 접근하여 환경변수로 인가도디록 설정 
```JSON
    "start": "NODE_ENV=local nest start",
    "start:dev": "NODE_ENV=dev nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "NODE_ENV=prod&& node dist/main",
```

### (6) project (controller,module,repository,schema,service)

### (7) user (controller, dto, entity,model,module,service)

### (8) auth (controller,guard,module,service, google.strategy, local.strategy, session.serializer)

### (9) main.ts  작성 >> port, session, cookie 설정 세팅
> main.ts
```ts

```

### (10) src/uploads 폴더 생성후 multer.option 작성 

### (11) git ignore 설정 



