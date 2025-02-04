# Static 


# 1. index.html
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>GRK Research Project Chat Room</title>
    </head>
    <body>
        <h2> GRK research project chat</h2>
        <div id="chat">GRK Chat</div>
        <div>
            <h2>채팅방 목록</h2>
            <ul id="rooms"></ul>
        </div>

        <input type="text" id="message" placeholder="input your message">
        <button onclick="sendMessage()">전송</button>
        <!-- 방 만들기 버튼 -->
        <button onclick="createRoom()">방 만들기</button>

        <!--채팅방 들어올 때  공지 영역 -->
        <div>
            <h2>notification </h2>
            <div id="notice"></div>
        </div>

    </body>
    <!-- jquery 로드 -->
    <script src = "http://code.jquery.com/jquery-3.6.1.slim.js"></script>
    <!-- socket.io 클라이언트 로드  -->
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    
    <script src="http://localhost:3000/script.js"></script>
    

</html>
```

# 2. script.js
```js
// src/script.js 

// socket.io 객체 생성 
const socket =io('http://localhost:3000/project/chat')
const roomSocket = io('http://localhost:3000/project/room')

const nickname = prompt('input your nickname')

//------------------------ 채팅방 입장시 notice ------------------------
let currentRoom = ''
socket.on('notice', (data) => {
    // 방 생성시 '누가' '방이름 '을 만들었습니다라는 메시지가 emit 될 것임. 
    $('#notice').append(`<div>${data.message}</div>`)
})

function joinRoom(room) {
    // 서버측 joinRoom 이벤트 발생 : 방에 들어가면 기존에 있던 방에서는 나가야함. 
    roomSocket.emit('joinRoom', { room, nickname, toLeaveRoom: currentRoom})
    // 채팅방 이동시 기존 메시지 삭제 -> 안지우면 채팅방 이동해도 그대로 채팅방 내용이 남아있음. 
    $('#chat').html('')
    // 현재 들어있는 방의 값 변경 
    currentRoom = room 
}

// ------------------------ 채팅방 생성 기능 구현 ------------------------
// 채팅방 생성 버튼 클릭 시 실행하는 함수 
function createRoom() {
    const room = prompt('input room name to create.')
    roomSocket.emit('createRoom', { room, nickname})
}

// ------------------------ 클라이언트 측에서 채팅방 추가하는 함수 
roomSocket.on("rooms", (data) => {
    console.log(data)
    $('#rooms').empty()
    data.forEach((room) => {
        $('#rooms').append(`<li>${room} <button onclick="joinRoom('${room}')" 
            >join</button></li>`)
    })
})

//---------------- 채팅 기능 구현  ----------------
// 전송 버튼 클릭 시 입력된 글을 socket 의 message 이벤트로 보냄 
function sendMessage() {
    //join 한 룸이나 생성한 룸이 없을때 
    if (currentRoom == '') {
        alert(' 방을 선택해 주세요 ')
        return
    }
    // message 창에 입력된 값 할당
    const message = $('#message').val()
    const data = { message, nickname, room: currentRoom, isSelf: true}
    const messageDiv = data.isSelf ? `<div style="text-align:right"> 나 : ${data.message}</div>` :`<div> ${data.message}</div>` 
    $('#chat').append(messageDiv)
    roomSocket.emit('message',data)

    // 채팅 소켓의 message 로 방출 
    // socket.emit('message', {message, nickname})
    
    $('#message').val('') // 입력창 비우기
    return false
}
// 메시지 수신 이벤트 :  체팅방 내 대화를 나눌때 사용하는 이벤트 
roomSocket.on('message', (data) => {
    console.log(data)
    // 나인경우  오른쪽  내가 아닌경우 왼쪽 정렬 
    const messageDiv = data.isSelf ? `<div style="text-align:right"> 나 : ${data.message}</div>` :`<div> ${data.message}</div>` 

    $('#chat').append(messageDiv)


    console.log('roomSocket.on(message) 실행 : #chat 에 추가 ')
})


// 지난 메시지 수신 이벤트 
roomSocket.on('messageHistory', (message) => {
    $('#chat').empty()
    message.forEach((data) => {
        const messageDiv = data.isSelf ===roomSocket.id? `<div style="text-align:right"> 나 : ${data.message}</div>` :`<div> ${data.message}</div>` 
        $('#chat').append(messageDiv)
    })
})

```



# 2023.2.4 채팅방 기능 수정 
1. init() 함수 수정:
init() 함수 내부의 모든 로직을 showChat() 함수로 이동하여, 소켓 연결 및 초기화가 한 번만 이루어지도록 합니다.

2. showChat() 함수 수정:
showChat() 함수에서 init() 함수를 호출하지 않고 직접 소켓 연결 및 이벤트 핸들러를 설정하도록 수정합니다.

3. createRoom() 함수 수정
console.log("createRoom 실행") 을 추가하여 디버깅합니다.
