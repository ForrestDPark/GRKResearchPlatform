// messages.js

// socket.io 객체 생성
let socket = null;
let roomSocket = null;
let nickname = null;
let currentRoom = '';
let mySocketId = null; // 나의 socket.id 저장 변수


document.addEventListener('DOMContentLoaded', function () {
  //nickname
  nickname = localStorage.getItem('nickname');
  if (!nickname) {
      // 서버에 닉네임 요청 (예: /auth/get-username)
      fetch('http://localhost:3000/auth/get-username')
      .then(response => response.json())
      .then(data => {
          if (data.username) {
              nickname = data.username;
              localStorage.setItem('nickname', nickname);
          }
      });
  }
  username = nickname

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
