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
  handleMessageToRoom(socket: Socket, data: { message: string; nickname: string; room: string; isSelf: boolean }) {
    const { nickname, room, message, isSelf } = data;
    console.log(data);

    // 클라이언트에게 받은 isSelf 값을 그대로 사용
    this.server.to(room).emit('message', {
      message: message,
      nickname: nickname,
      isSelf: isSelf, // 클라이언트에서 받은 isSelf 값을 그대로 전달
      sender:socket.id
      
    });

    // 메시지 저장
    if (!this.roomMessage[room]) {
      this.roomMessage[room] = [];
    }
    this.roomMessage[room].push({
      message: message,
      nickname: nickname,
      isSelf: isSelf, // 클라이언트에게 받은 값을 저장
      sender: socket.id,
    });

    console.log(`${message}`);
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
    const { nickname, room, toLeaveRoom } = data;
    console.log(`joinRoom 요청 수신! socket.id: ${socket.id}, 방: ${room}, 나갈 방: ${toLeaveRoom}`);

    // 유저 맵 업데이트
    this.userMap.set(socket.id, nickname);

    // 기존방 퇴장
    if (toLeaveRoom) {
        socket.leave(toLeaveRoom);
        console.log(`${nickname}님이 ${toLeaveRoom} 방에서 나갔습니다.`);
    }

    // 새로운 방 입장
    socket.join(room);
    console.log(`${nickname}님이 ${room} 방에 입장했습니다.`);

    // 채팅방 알림 전송
    this.chatGateway.server.emit('notice', {
        message: `${nickname}님이 ${room} 방에 입장 했습니다. `
    });

    // 저장된 메시지 전송
    if (this.roomMessage[room]) {
        socket.emit('messageHistory', this.roomMessage[room]);
    }

    // 현재 유저가 속한 방 확인
    console.log(`현재 ${nickname}의 방 목록:`, socket.rooms);
}

}