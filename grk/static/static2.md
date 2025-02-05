# 로그인 후에 들어가는 dashboard page.
> dashboard.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Research Platform Wireframe</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <header>
        <h1>Research Platform</h1>
        <div class="top-right">
            <button>Settings</button>
            <button id="logoutButton">Log Out</button>
        </div>
    </header>

    <div class="container">
        <aside class="sidebar">
            <h2>Menu</h2>
            <ul>
                <li><a href="dashboard.html">Dashboard</a></li>  
                <li><a href="project.html">Project Management</a></li> 
                <li><a href="task.html">Task Management</a></li> 
                <li><a href="messages.html">Messages</a></li>
                <li><a href="quick_actions.html">Quick Actions</a></li>
                <li><a href="data_management.html">Data Management</a></li> 
            </ul>
        </aside>

        <main class="main">
            <div class="section">
                <h3>Dashboard</h3>
                <p>A summary of ongoing projects, deadlines, and recent activity.</p>
            </div>
            <div class="section">
                <h3>Messages</h3>
                <p>Collaborate with team members and stay updated.</p>
                <a href="#" class="button" id="openMessagesButton">Open Messages</a>
            </div>
            <div class="section" id="chatSection" style="display:none;"> <!-- 채팅 영역 -->
                <h3>Chat Room</h3>
                <div id="chat-area">
                    <!-- 채팅 메시지가 여기에 표시됩니다 -->
                </div>
                <input type="text" id="message-input" placeholder="Enter your message">
                <button id="send-button">Send</button>
            </div>
            <div class="section">
                <h3>Task Management</h3>
                <p>Manage all tasks efficiently in one place.</p>
                <a href="#" class="button">View Tasks</a>
            </div>
            <div class="section">
                <h3>Project Management</h3>
                <p>Manage all your research projects in one place.</p>
                <a href="#" class="button">Create New Project</a>
            </div>
            <div class="section">
                <h3>Quick Actions</h3>
                <a href="#" class="button">Manuscript Assistance</a>
                <a href="#" class="button">IRB Assistance</a>
                <a href="#" class="button">Protocol Assistance</a>
            </div>
        </main>
    </div>

    <footer>
        <p>© GRK Partners Research Platform.</p>
    </footer>

    <script src="dashboard.js"></script>
</body>
</html>
```

> dashboard.js
```js
document.getElementById('logoutButton').addEventListener('click', function() {
    // 로그아웃 API 호출 및 리다이렉션
    fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            console.log('로그아웃 성공');
            // 로그인 페이지로 리다이렉션
            window.location.href = 'http://localhost:3000/index.html'; // 로그인 페이지 URL로 변경
        } else {
            console.error('로그아웃 실패');
            alert('로그아웃 실패');
        }
    })
    .catch(error => {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃 중 오류 발생');
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const openMessageTab = document.getElementById("openMessageTab")


    // "Open Messages" 버튼 클릭 이벤트 핸들러 추가
    document.getElementById('openMessagesButton').addEventListener('click', function() {
        console.log('clicked open messages !')
        // 백엔드 API를 호출하여 사용자 이름 가져오기
        fetch('http://localhost:3000/auth/get-username')  // 변경된 API 엔드포인트
        .then(response => response.json())
        .then(data => {
            const username = data.username; // 변경된 속성 이름
            window.location.href = `http://localhost:3000/index.html?username=${username}`; // URL 파라미터 이름 변경
        })
        .catch(error => {
            console.error('사용자 이름 가져오기 오류:', error);
            alert('사용자 이름 가져오기 오류');
        });
    });
});


```

> dashboard.css
```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f7f9fc;
    color: #333;
}
header {
    background-color: #3b82f6;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
header h1 {
    margin: 0;
}
.top-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.top-right button {
    background-color: white;
    color: #3b82f6;
    border: 1px solid #3b82f6;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
}
.top-right button:hover {
    background-color: #3b82f6;
    color: white;
}
.container {
    display: flex;
    padding: 2rem;
}
.sidebar {
    width: 240px;
    background-color: #ffffff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.sidebar h2 {
    font-size: 1.2rem;
    margin-top: 0;
    color: #3b82f6;
}
.sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.sidebar ul li {
    margin: 1rem 0;
}
.sidebar ul li a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 0.5rem;
    display: block;
    border-radius: 5px;
}
.sidebar ul li a:hover {
    background-color: #f0f4ff;
    color: #3b82f6;
}
.main {
    flex: 1;
    margin-left: 2rem;
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.main h3 {
    font-size: 1.5rem;
    margin-top: 0;
    color: #3b82f6;
}
.button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
}
.button:hover {
    background-color: #2563eb;
}
footer {
    background-color: #ffffff;
    color: #777;
    text-align: center;
    padding: 1rem;
    border-top: 1px solid #eaeaea;
}

/* dashboard.css */

#create-room-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
    border: none; /* 기본 테두리 제거 */
    cursor: pointer; /* 마우스 커서를 포인터로 변경 */
}

#create-room-button:hover {
    background-color: #2563eb;
}
```


# 2. 채팅기능을 담당하는 message part
> message.html
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>GRK Research Project Chat Room</title>
    <!-- 공통 스타일 (dashboard.css 또는 common.css) -->
    <link rel="stylesheet" href="dashboard.css">
    <!-- 채팅에 필요한 추가 스타일 (선택 사항) -->
    <link rel="stylesheet" href="message.css"> <!-- 변경: message.css 연결 -->
    <!-- Google Fonts 추가 -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <%- include('header') %>
    <!-- <header>
        <h1>GRK Research - Messages</h1>
        <div class="top-right">
            <button>Settings</button>
            <button id="logout-button">Log Out</button>
        </div>
    </header> -->

    <div class="container">
        <aside class="sidebar">
            <h2>Menu</h2>
            <ul>
                <li><a href="dashboard.html">Dashboard</a></li>  
                <li><a href="project.html">Project Management</a></li> 
                <li><a href="task.html">Task Management</a></li> 
                <li><a href="messages.html">Messages</a></li>
                <li><a href="quick_actions.html">Quick Actions</a></li>
                <li><a href="data_management.html">Data Management</a></li> 
            </ul>
        </aside>

        <main class="main">
            <div class="section">
                <h3>Chat Room</h3>
                <div id="chat-area">
                    <!-- 채팅 메시지가 여기에 표시됩니다 -->
                </div>
                <input type="text" id="message" placeholder="Input your message">
                <button id="send-message-button">Send</button>
            </div>
            <div class="section">
                 <h2>Notification</h2>
                 <div id="notice"></div>
             </div>
             <div class="section">
                  <h2>Chat Room List</h2>
                  <button id="create-room-button">Create Room</button>
                 <ul id="rooms">
                      <!-- 채팅방 목록은 JavaScript로 동적으로 추가됩니다 -->
                  </ul>
             </div>
        </main>
    </div>

    <footer>
        <p>© GRK Partners Research Platform.</p>
    </footer>

    <script src="http://code.jquery.com/jquery-3.6.1.slim.js"></script>
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="messages.js"></script>
</body>
</html>
```

>message.js
```js
// messages.js

// socket.io 객체 생성
let socket = null;
let roomSocket = null;
let nickname = null;
let currentRoom = '';
let mySocketId = null; // 나의 socket.id 저장 변수

document.addEventListener('DOMContentLoaded', function () {
  // 로그아웃 버튼 클릭 이벤트
  const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

  // 메시지 입력창에서 엔터키 눌렀을때 메시지 전송
  const messageInput = document.getElementById('message');
  if (messageInput) {
    messageInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault(); // Enter 키의 기본 동작(줄 바꿈) 방지
        sendMessage();
      }
    });
  }

  // 로컬스토리지에서 mySocketId 값 읽음
  const storedMySocketId = localStorage.getItem('mySocketId');
  if (storedMySocketId) {
    mySocketId = storedMySocketId;
    console.log('Loaded mySocketId from localStorage', mySocketId);
  }

  // "방 만들기" 버튼에 이벤트 리스너 연결
  const createRoomButton = document.querySelector('#create-room-button');
  if (createRoomButton) {
    createRoomButton.addEventListener('click', createRoom);
  }
  const sendMessageButton = document.querySelector('#send-message-button');
  if (sendMessageButton) {
    sendMessageButton.addEventListener('click', sendMessage);
  }

  // 소켓 연결 및 이벤트 핸들러 설정 (이제 초기화 시점에 실행)
  socket = io('http://localhost:3000/project/chat');
  roomSocket = io('http://localhost:3000/project/room');

  // 채팅방 연결
  roomSocket.on('connect', () => {
    console.log('roomSocket 연결됨:', roomSocket.id);

    // 로컬스토리지에 이미 저장된 값 있을경우 해당 값 사용
    if (!mySocketId) {
      mySocketId = roomSocket.id;
      localStorage.setItem('mySocketId', mySocketId);
    }

    // local storage 에 웹소켓 아이디 저장
    localStorage.setItem('mySocketId', mySocketId);
    // 연결된 후에 joinRoom 실행
    if (currentRoom) {
      joinRoom(currentRoom);
    }
  });

  // ------------------------ 채팅방 입장시 notice ------------------------
  socket.on('notice', (data) => {
    // 방 생성시 '누가' '방이름 '을 만들었습니다라는 메시지가 emit 될 것임.
    $('#notice').append(`<div>${data.message}</div>`);
  });

  // ------------------------ 클라이언트 측에서 채팅방 추가하는 함수
  roomSocket.on('rooms', (data) => {
    console.log(data);
    $('#rooms').empty();
    data.forEach((room) => {
      $('#rooms').append(
        `<li>${room} <button class="join-button" data-room="${room}">Join</button></li>`
      );
    });
    // join button event delegation
    $('#rooms')
      .off('click', '.join-button')
      .on('click', '.join-button', function () {
        const room = $(this).data('room');
        console.log('join 버튼 클릭');
        joinRoom(room);
      });
  });

  // ------------------------ 메시지 전송 ------------------------
  roomSocket.on('message', (data) => {
    console.log(data);
    // 메시지 div 생성
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');

    // 발신자 여부에 따라 클래스 추가
    if (data.sender === mySocketId) { // 내 socket.id 와 sender 가 같으면 내 메세지
      messageDiv.classList.add('chat-message-self');
    } else {
      messageDiv.classList.add('chat-message-other');
    }
    // 닉네임 div 생성
    const nickNameDiv = document.createElement('div');
    nickNameDiv.classList.add('chat-message-nickname');
    nickNameDiv.textContent = data.username;
    // 메세지 div 생성
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('chat-message-content');
    contentDiv.textContent = data.message;
    // messageDiv에 nickNameDiv, contentDiv 추가
    messageDiv.appendChild(nickNameDiv);
    messageDiv.appendChild(contentDiv);

    // 화면에 메시지 추가
    $('#chat-area').append(messageDiv);
    console.log('roomSocket.on(message) 실행 : #chat 에 추가 ');

    // 스크롤을 가장 아래쪽으로 이동
    $('#chat-area').scrollTop($('#chat-area')[0].scrollHeight);
  });

  // ------------------------ 지난 메시지 수신 이벤트------------------------
  roomSocket.on('messageHistory', (message) => {
    console.log('messageHistory 수신:', message);
    $('#chat-area').empty();
    message.forEach((data) => {
      // 메시지 div 생성
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('chat-message');

      // 발신자 여부에 따라 클래스 추가
      if (data.sender === mySocketId) { // 내 socket.id 와 sender 가 같으면 내 메세지
        messageDiv.classList.add('chat-message-self');
      } else {
        messageDiv.classList.add('chat-message-other');
      }
      // 닉네임 div 생성
      const nickNameDiv = document.createElement('div');
      nickNameDiv.classList.add('chat-message-nickname');
      nickNameDiv.textContent = data.username;

      // 메세지 div 생성
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('chat-message-content');
      contentDiv.textContent = data.message;
      // messageDiv에 nickNameDiv, contentDiv 추가
      messageDiv.appendChild(nickNameDiv);
      messageDiv.appendChild(contentDiv);

      // 화면에 메시지 추가
      $('#chat-area').append(messageDiv);
    });
  });
});

// ------------------------ 로그아웃
function logout() {
  console.log("logout function 실행")
  // 소켓 연결 해제
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (roomSocket) {
    roomSocket.disconnect();
    roomSocket = null;
  }

  // 로컬 스토리지 또는 세션 스토리지에 저장된 사용자 정보 삭제
  nickname = null;
  currentRoom = null;
  mySocketId = null
  // 화면 초기화
  $('#chat-area').html('');
  $('#notice').html('');
  $('#rooms').empty();
  $('#message').val('');

  // 로그아웃 API 호출 (쿠키 삭제 및 세션 삭제)
  fetch('http://localhost:3000/auth/logout', {
    method: 'POST', // 또는 'GET'
  })
  .then(response => {
    if (response.ok) {
      console.log('로그아웃 성공');
      // 쿠키 삭제 및 화면 초기화
      // (화면 초기화 코드는 기존 코드와 동일)
      window.location.href = 'dashboard.html'; // 로그아웃 후 대시보드로 이동
    } else {
      console.error('로그아웃 실패');
    }
  })
  .catch(error => {
    console.error('로그아웃 중 오류 발생:', error);
  });
}

// 채팅방 입장
function joinRoom(room) {
  console.log(
    `joinRoom 실행, room: ${room}, username: ${nickname}, currentRoom: ${currentRoom}`
  );
  // 서버측 joinRoom 이벤트 발생 : 방에 들어가면 기존에 있던 방에서는 나가야함.

  roomSocket.emit('joinRoom', {
    room,
    username:nickname,
    toLeaveRoom: currentRoom,
  });

  // ✅ 바로 currentRoom 업데이트
  currentRoom = room;
  console.log('currentRoom 업데이트 완료:', currentRoom);

  // 채팅방 이동시 기존 메시지 삭제 -> 안지우면 채팅방 이동해도 그대로 채팅방 내용이 남아있음.

  console.log(`joinRoom 실행 후 , currentRoom: ${currentRoom}`);

  $('#chat-area').html('');
}

// 채팅방 생성 함수 (전역 스코프로 이동)
function createRoom() {
  console.log('createRoom 실행');
  const room = prompt('input room name to create.');
  roomSocket.emit('createRoom', {
    room,
    username: nickname,
  });
}

// Message 전송
function sendMessage() {
  console.log('sendMessage 실행, currentRoom:', currentRoom);
  if (currentRoom == '') {
    alert('방을 선택해 주세요');
    return;
  }

  const message = $('#message').val();
  const data = {
    message,
    username:nickname,
    room: currentRoom,
    isSelf: true, // ✅ 자신이 보낸 메시지임을 명시적으로 표시
  };
  roomSocket.emit('message', data);

  // 자신이 보낸 메시지를 즉시 화면에 추가 (수정된 부분)
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', 'chat-message-self');
  const nickNameDiv = document.createElement('div');
  nickNameDiv.classList.add('chat-message-nickname');
  nickNameDiv.textContent = nickname; // username 사용
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('chat-message-content');
  contentDiv.textContent = message;
  messageDiv.appendChild(nickNameDiv);
  messageDiv.appendChild(contentDiv);
  $('#chat-area').append(messageDiv);
  $('#chat-area').scrollTop($('#chat-area')[0].scrollHeight);

  $('#message').val(''); // 입력창 비우기
  return false;
}
```


# 3. project 의 웹소켓 게이트웨이
>project.gateway.ts
```ts
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
  //   const { message, username} =data
  //   socket.broadcast.emit('message',`${username}: ${message}`)
  // }
}

//----------------  채팅방 목록 및 입장  핸들러 ----------------
@WebSocketGateway({ namespace: 'project/room'})
export class RoomGateway {
  // 채팅방 내부 핸들러인 ProjectGateway의 의존성을 chatGateway 에 주입하여 사용 
  constructor (private readonly chatGateway : ProjectGateway) {}
  rooms = [] // 채팅방 리스트
  roomMessage ={} // 방별 메시지 저장 객체 
  userMap = new Map<string,string>() // socket.id 를 key 로 username 저장 


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
  handleMessageToRoom(socket: Socket, data: { message: string; username: string; room: string; isSelf: boolean }) {
    const { username, room, message, isSelf } = data;
    console.log(data);

    // 클라이언트에게 받은 isSelf 값을 그대로 사용
    socket.to(room).emit('message', {
      message: message,
      username: username,
      isSelf: isSelf, // 클라이언트에서 받은 isSelf 값을 그대로 전달
      sender:socket.id
      
    });

    // 메시지 저장
    if (!this.roomMessage[room]) {
      this.roomMessage[room] = [];
    }
    this.roomMessage[room].push({
      message: message,
      username: username,
      isSelf: isSelf, // 클라이언트에게 받은 값을 저장
      sender: socket.id,
    });

    console.log(`${message}`);
  }


  // -------------- createRoom 핸들러 --------------
  @SubscribeMessage('createRoom')
  handleMessage(@MessageBody() data ){
    const { username, room } =data
    // 방 생성시 이벤트 발생시켜 클라이언트에 송신 
    this.chatGateway.server.emit('notice', {
      message:`${username}님이 ${room} 방을 만들었습니다.`
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
    const { username, room, toLeaveRoom } = data;
    console.log(`joinRoom 요청 수신! socket.id: ${socket.id}, 방: ${room}, 나갈 방: ${toLeaveRoom}`);

    // 유저 맵 업데이트
    this.userMap.set(socket.id, username);

    // 기존방 퇴장
    if (toLeaveRoom) {
        socket.leave(toLeaveRoom);
        console.log(`${username}님이 ${toLeaveRoom} 방에서 나갔습니다.`);
    }

    // 새로운 방 입장
    socket.join(room);
    console.log(`${username}님이 ${room} 방에 입장했습니다.`);

    // 채팅방 알림 전송
    this.chatGateway.server.emit('notice', {
        message: `${username}님이 ${room} 방에 입장 했습니다. `
    });

    // 저장된 메시지 전송
    if (this.roomMessage[room]) {
        socket.emit('messageHistory', this.roomMessage[room]);
    }

    // 현재 유저가 속한 방 확인
    console.log(`현재 ${username}의 방 목록:`, socket.rooms);
}

}
```



# 4.화면 위에 헤더
```html
<!-- header.html -->
<header>
    <h1>GRK Research - [Page Title]</h1> <!-- 페이지 제목은 각 페이지에서 동적으로 변경 -->
    <div class="top-right">
        <button>Settings</button>
        <button id="logout-button">Log Out</button>
    </div>
</header>
```

asdf