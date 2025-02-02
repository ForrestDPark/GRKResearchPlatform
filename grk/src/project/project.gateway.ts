
import { 
  SubscribeMessage, 
  WebSocketGateway,
  WebSocketServer,

} from '@nestjs/websockets';
// socket io 임포트 
import { Server, Socket } from 'socket.io'

@WebSocketGateway({namespace:'project/chat'})
export class ProjectGateway {
  // 웹 소켓 서버 인ㅅ턴스 선언 
  @WebSocketServer() server : Server
  

  // message event 구독
  @SubscribeMessage('message')
  handleMessage(socket: Socket, data : any): void {
    // 접속한 클라이언트에게 멧지 전송
    // this.server.emit('message', `User-${socket.id.substring(0,4)} : ${data}`,)
    const { message, nickname} =data
    socket.broadcast.emit('message',`${nickname}: ${message}`)
  }
}
