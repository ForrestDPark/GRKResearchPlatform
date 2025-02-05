# 12. server 에 파일 올리기 

# 12.1 프로젝트 생성및 의존성 설치 

### (1)  multer  패키지 설치 
```bash
npm i -D @types/multer
```

# 12.2 파일 업로드 api 만들고 테스트 
### (1) file-upload 핸들러 함수 작성 
project 에서 실행 하도록 하자. 
> project.controller.ts
```ts
import { 
  Controller,
  Param,
  Body, Delete, Get, Post, Put,
  // upload-file 
  UploadedFile, 
  UseInterceptors
} from '@nestjs/common'

// 프로젝트 서비스 임포트 
import { ProjectService } from './project.service'

// 파일 업로드 api 
import { FileInterceptor } from '@nestjs/platform-express'
  // File Upload 기능 
  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file'))
  fileUpload(@UploadedFile() file : Express.Multer.File){
    console.log(file.buffer.toString('utf-8'))
    return 'File Upload'
  }
```
- 파일 업로드는 post 로 가능. Content-Type 을 multipart/forma-data 로 해야함. 
- 인터셉터는 클라이언트와 서버간 요청과 응답간에 로직을 추가하는 미들 웨어임. 
- FileIntercepter() 는 클라이언트의 요청에 따라 파일명이 file 인 파일이 있ㄴ는지 확인함. 
- 함수의 인수로 넘겨줌. 
- @UploadedFile() 데코레이터는 핸들러 함수의 매개변수 데코레이터임. 인수로 넘겨진값중 file 객체를 지정해 거내는 역할을 함. 
- 여러파일 업로드시 사용하는 UploadedFiles() 데코레이터도 있음. 각 파일의 타입은 Express.Multer.File타입 
- 텍스트 파일은 버퍼에 바이너리 값으로 저장됨  toString(utf-8) 사용해 읽을수 있는 문자열로 변환해줌. 

### (2) 파일 업로드 테스트 
> project.controller.ts 
```ts
// 파일 업로드 api 
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'

//(생략 ...)
  // File Upload 기능 
  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() +'-' +Math.round(Math.random() *1e9)
        const fileExt = path.extname(file.originalname)
        const newFileName = `${file.fieldname}-${uniqueSuffix}${fileExt}`
        cb(null, newFileName)
      }
    })
  }))
  fileUpload(@UploadedFile() file : Express.Multer.File){
    console.log('파일 객체 :',file)
    if (!file) {
      return '파일 이 없습니다.'
    }
    console.log('파일 저장 경로: ', file.path)

    // diskstorage 를 사용하면 buffer 를 만들지 않음으로 undefined 
    
    try {
      const fileContent = fs.readFileSync(file.path, 'utf-8')
      console.log("file 내용 : ",fileContent)
      
    } catch (error) {
      console.error('file read error')
    }
    return 'File Upload'
  }
}
```

> test.txt 파일을 grk 밖에다가 생성. 
```bash
curl -v \
    -H "Content-Type: multipart/form-data" \
    --form "file=@./test.txt" \
    http://localhost:3000/project/file-upload
```

<img src="https://blog.kakaocdn.net/dn/bznjlZ/btsL1Dk9nrN/7VLnQlcMrk5nicQhyx8P4k/img.webp" data-mce-src="https://blog.kakaocdn.net/dn/bznjlZ/btsL1Dk9nrN/7VLnQlcMrk5nicQhyx8P4k/img.webp" data-origin-width="888" data-origin-height="410" data-is-animation="false" width="771" height="356" data-mce-selected="1">


# 12.3 업로드한 파일을 특정한 경로에 저장하기 
- FileInterceptor 에는 첫번째 인수로 폼필드의 이름을 넣음. 
- multer 제공 옵션 
storage : 파일이 저장될 위치 및 파일 이름 제어 
fileFilter : 어떤 형식의 파일 허용할지 제어 
limits : 필드명, 값, 파일개수 , 파일 용량, multipart 폼의 인수 개수 , 헤더 개수 제한 설정
preservePath : 파일의 전체 경로를 유지 할지 여부 

- storage 사용하지 않는 상태는 memoryStorage() 를 사용함. 


### (1) multerOption 객체를 만들기 
> src/multer.option.ts
```ts
import { randomUUID } from "crypto";
import { diskStorage } from "multer";
import { extname, join } from "path";

export const multerOption = {
    storage: diskStorage({
        destination: join( __dirname, '..', 'uploads'),
        filename: (req,file,cb)=> {
            cb(null,randomUUID()+extname(file.originalname))
        }
    })
}
```

> project.controller.ts
```ts
  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file',multerOption))
  fileUpload(@UploadedFile() file : Express.Multer.File){
    console.log('파일 객체 :',file)
    if (!file) {
      return '파일 이 없습니다.'
    }
    console.log('파일 저장 경로: ', file.path)
```


# 12.4 정적 파일 서비스 
- 텍스트 이미지, 도영상 같은 파일이 저장되면 변경되지 않으므로 정적 파일이라 부름 


### (1) serve-static 라이브러리 설치 
```bash
npm i @nestjs/serve-static
```
### (2) app.module forRoot 세팅 
> app.module.ts
```ts
    // 정적 서버 서비스 를 위한 라이브러리 주입 
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '...','uploads'), // 실제 파일존재 디렉터리
      serveRoot: '/uploads' // url 뒤에 붙을 경로 지정 
    })
```
- ServeStaticModule.forRoot() 함수 싫ㅇ 정적 파일 서비스 ServeStaticModule 초기화 
- rootPath 옵션은 업로드한 파일이 저장되어있는 경로를 설정 
- serverRoot 옵션이 없으면 업로드 파일에 localhost:3000/{파일명} 으로 접근 가능 
- localhost:3000/uploads/{파일명}으로 접근할 수있음. 

### (3) file-upload.http 를 추가해서 업로드하고 브라우저에서 볼수 있는지 확인 
- src 디렉터리 아래에 cat. jpg 이미지 파일을 저장 합니다. 
> image-test.http
```http
POST http://localhost:3000/project/file-upload

Content-Type : multipart/form-data; boundary=test-file-upload

--test-file-upload
Content-Disposition: form-data; name="file"; filename="test.txt"

hello
--test-file-upload--
```


> test 결과 

### (4) image file upload test 
> grk/test/image-test.http

```http
POST http://localhost:3000/project/file-upload
Content-Type: multipart/form-data; boundary=image-file-upload

--image-file-upload
Content-Disposition: form-data; name="file"; filename="test-image.jpg"
Content-Type: image/jpeg

< test-image.jpg  
--image-file-upload--
```
> test 결과..
<img src="https://blog.kakaocdn.net/dn/AglRU/btsL3oNOW4u/GJnamUb4wOz6zStooWDs91/img.png" data-origin-width="1016" data-origin-height="983" data-is-animation="false" width="745" height="721" data-filename="blob">

# 12.5 HTML 폼 업로드 

- nestJS 에서 HTML 파일을 볼수 있게 하려면 ㅅ트테틱 에셋 설정이 필요함. 


> main.ts 

```ts
  // HTML form 파일을 제공할 staticAsset 
  app.useStaticAssets(join(__dirname,'..','static'))
```

### (5) grk/static 폴더 생성 > form.html 작성 

> grk/static/form.html
```html
<html>
    <body>
        <form action="file-upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file"/>
            <input type="submit" value="Upload"/>
        </form>
    </body>
</html>
```


### (7) project.controller 수정 
```ts
// File Upload 기능 
  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file',multerOption)) 
  fileUpload(@UploadedFile() file : Express.Multer.File){
    console.log('파일 객체 :',file)
    if (!file) {
      return '파일 이 없습니다.'
    }
    console.log('파일 저장 경로: ', file.path)
    try {
      const fileContent = fs.readFileSync(file.path, 'utf-8')
      console.log("file 내용 : ",fileContent)
      return {message: `file upload success
         - original file name  :${file.originalname}
         - upload check : http://localhost:3000/uploads/${file.filename}
        `}
      
    } catch (error) {
      console.error('file read error')
    }
    return 'File Upload'
  }
```

# 결과 
<img src="https://blog.kakaocdn.net/dn/bGzi3c/btsL3kSWnDQ/JAv1Bysr1PAQBoF1zc8aKK/img.gif" data-mce-src="https://blog.kakaocdn.net/dn/bGzi3c/btsL3kSWnDQ/JAv1Bysr1PAQBoF1zc8aKK/img.gif" data-origin-width="856" data-origin-height="848" data-is-animation="true" width="751" height="744">


