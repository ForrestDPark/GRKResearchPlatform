// project.gateway.ts
import { 
  SubscribeMessage, 
  WebSocketGateway,
  WebSocketServer,
  // chat room 을 위한 임포트 
  MessageBody,

} from '@nestjs/websockets';

// socket io 임포트 
import { Server, Socket } from 'socket.io'

// ---------------- 채팅방 연결 핸들러 (ChatGateWay -> ProjectGateway)----------------
@WebSocketGateway({namespace:'project/chat'})
export class ProjectGateway {
  // 웹 소켓 서버 인ㅅ턴스 선언 
  @WebSocketServer() server : Server
  

  // // message event 구독 (전체 챗 )
  // @SubscribeMessage('message')
  // handleMessage(socket: Socket, data : any): void {
  //   // 접속한 클라이언트에게 멧지 전송
  //   // this.server.emit('message', `User-${socket.id.substring(0,4)} : ${data}`,)
  //   const { message, nickname} =data
  //   socket.broadcast.emit('message',`${nickname}: ${message}`)
  // }
}

//----------------  채팅방 목록 및 입장  핸들러 ----------------
@WebSocketGateway({ namespace: 'project/room'})
export class RoomGateway {
  // 채팅방 내부 핸들러인 ProjectGateway의 의존성을 chatGateway 에 주입하여 사용 
  constructor (private readonly chatGateway : ProjectGateway) {}
  rooms = [] // 채팅방 리스트
  roomMessage ={} // 방별 메시지 저장 객체 
  userMap = new Map<string,string>() // socket.id 를 key 로 nickname 저장 


  // server instance 접근을 위한 변수 선언 
  @WebSocketServer()
  server: Server
  // 클라이언트 접속시 실행하는 함수 
  handleConnection(socket: Socket){
    // console.log('client 접속 : ',socket.id)
    socket.emit('rooms', this.rooms)
  }



  // -------------- 채팅방 조인후 message 전송 click 시 핸들러 --------------
  @SubscribeMessage('message')
  handleMessageToRoom(socket: Socket, data) {
    const { nickname, room, message, isSelf } = data
    console.log(data)
    // 나 이외에 사람에게 데이터 전송 
    socket.broadcast.to(room).emit('message', {
      message: `${nickname} : ${message}`,
      isSelf: false // 
    })

    // 메시지 저장 
    if (!this.roomMessage[room]) {
      this.roomMessage[room] =[]
    }
    this.roomMessage[room].push({
      message: `${nickname} : ${message}`,
      isSelf: isSelf, // 클라이언트에게 받은값을 저장 
      sender: socket.id
    })

    console.log(`${message}`)
  }


  // -------------- createRoom 핸들러 --------------
  @SubscribeMessage('createRoom')
  handleMessage(@MessageBody() data ){
    const { nickname, room } =data
    // 방 생성시 이벤트 발생시켜 클라이언트에 송신 
    this.chatGateway.server.emit('notice', {
      message:`${nickname}님이 ${room} 방을 만들었습니다.`
    })
    // 채팅방 목록에 삽입 
    this.rooms.push(room)
    // rooms 이벤트로 채팅방 리스트 전송 
    this.server.emit('rooms', this.rooms)
    console.log(" 방생성 ")
  }

  // -------------- joinRoom 핸들러 --------------
  @SubscribeMessage('joinRoom')
  handleJoinRoom(socket: Socket, data) {
    const { nickname, room, toLeaveRoom } = data
    // 유저 맵에 socket.id 를 key 로 nickname 저장 
    this.userMap.set(socket.id,nickname)

    // 기존방에서 퇴장 
    socket.leave(toLeaveRoom)
    this.chatGateway.server.emit('notice', {
      message: `${nickname}님이 ${room} 방에 입장 했습니다. `
    })
    // 새로운 방 입장. 
    socket.join(room)

    // 저장된 메세지 전송 
    if (this.roomMessage[room]) {
      socket.emit('messageHistory', this.roomMessage[room])
    }
  }
}