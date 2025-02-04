// src/script.js

// socket.io 객체 생성
let socket = null;
let roomSocket = null;
let nickname = null;
let currentRoom = '';
let mySocketId = null; // 나의 socket.id 저장 변수

const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const mainPage = document.getElementById('main-page');

// 전역 스코프로 함수 이동
function joinRoom(room) {
  console.log(
    `joinRoom 실행, room: ${room}, nickname: ${nickname}, currentRoom: ${currentRoom}`
  );
  // 서버측 joinRoom 이벤트 발생 : 방에 들어가면 기존에 있던 방에서는 나가야함.

  roomSocket.emit('joinRoom', {
    room,
    nickname,
    toLeaveRoom: currentRoom,
  });

  // ✅ 바로 currentRoom 업데이트
  currentRoom = room;
  console.log('currentRoom 업데이트 완료:', currentRoom);

  // 채팅방 이동시 기존 메시지 삭제 -> 안지우면 채팅방 이동해도 그대로 채팅방 내용이 남아있음.

  console.log(`joinRoom 실행 후 , currentRoom: ${currentRoom}`);

  $('#chat').html('');
}

// 채팅방 생성 함수 (전역 스코프로 이동)
function createRoom() {
  console.log('createRoom 실행');
  const room = prompt('input room name to create.');
  roomSocket.emit('createRoom', {
    room,
    nickname,
  });
}

function sendMessage() {
  console.log('sendMessage 실행, currentRoom:', currentRoom);
  if (currentRoom == '') {
    alert('방을 선택해 주세요');
    return;
  }

  const message = $('#message').val();
  const data = {
    message,
    nickname,
    room: currentRoom,
    isSelf: true, // ✅ 자신이 보낸 메시지임을 명시적으로 표시
  };
  roomSocket.emit('message', data);

  $('#message').val(''); // 입력창 비우기
  return false;
}

document.addEventListener('DOMContentLoaded', function () {
  // auth form
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  // Google login button
  const googleLoginButton = document.getElementById('google-login-button');
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');
  // go to chat button
  const goToChatButton = document.getElementById('go-to-chat-button');

  const loginSuccess = document.getElementById('login-success');
  const loginSuccessMessage = document.getElementById('login-success-message');

  // auth Form switch logic
  showRegisterLink.addEventListener('click', function (event) {
    event.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });
  showLoginLink.addEventListener('click', function (event) {
    event.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // login Button action
  loginButton.addEventListener('click', async function (event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch('http://localhost:3000/auth/login3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log('로그인 성공', data);

        // 쿠키를 사용한 로그인 2
        const response2 = await fetch('http://localhost:3000/auth/login2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data2 = await response2.json();

        loginSuccessMessage.textContent = '로그인 성공!';
        loginForm.style.display = 'none';
        loginSuccess.style.display = 'block';

        // 로그인 성공 후 사용자 정보 설정
        nickname = data.email;
        // 메인 페이지 표시
        showMainPage();
      } else {
        loginError.textContent = '로그인 실패: ' + data.message;
      }
    } catch (error) {
      loginError.textContent = '로그인 중 오류가 발생했습니다.' + error;
    }
  });
  // register Button action
  registerButton.addEventListener('click', async function (event) {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const username = document.getElementById('register-username').value;
    const role = 'user'


    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          role
        }),
      });
      const data = await response.json();
      if (response.ok) {
        registerError.textContent = '회원가입 성공!';
      } else {
        registerError.textContent = '회원가입 실패 : ' + data.message;
      }
    } catch (error) {
      registerError.textContent = '회원가입 중 오류 발생 ' + error;
    }
  });
  // Google login action
  googleLoginButton.addEventListener('click', async function (event) {
    event.preventDefault();
    // 구글 로그인 페이지로 이동 (백엔드 컨트롤러가 리다이렉트 담당)
    window.location.href = 'http://localhost:3000/auth/to-google';
  });
  // 구글 로그인 후 리다이렉트 되어 돌아왔을 때의 처리 로직
  // URL에서 사용자 정보를 파싱하여 로그인 처리
  const urlParams = new URLSearchParams(window.location.search);
  const googleUser = urlParams.get('user');

  if (googleUser) {
    console.log(' google 유저가 있음', googleUser);
    // 로그인 성공 후 사용자 정보 설정
    nickname = JSON.parse(googleUser).email;
    // 메인 페이지 표시
    showMainPage();
  }
  // 채팅방으로 이동 버튼 클릭 시
  goToChatButton.addEventListener('click', function () {
    // 채팅 UI 표시 및 소켓 연결
    showChat();
  });
});

// 메인 페이지를 표시하는 함수
function showMainPage() {
  authContainer.style.display = 'none';
  mainPage.style.display = 'block';
  chatContainer.style.display = 'none'; // 채팅 컨테이너 숨김
  $('#main-user-nickname').text(nickname); // 메인 페이지에 닉네임 표시
}
// 채팅 페이지를 표시하는 함수
function showChat() {
  mainPage.style.display = 'none'; // 메인 페이지 숨김
  authContainer.style.display = 'none';
  chatContainer.style.display = 'block';

  // 소켓 연결 및 이벤트 핸들러 설정
  // 기존 소켓 연결 해제
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (roomSocket) {
    roomSocket.disconnect();
    roomSocket = null;
  }

  socket = io('http://localhost:3000/project/chat');
  roomSocket = io('http://localhost:3000/project/room');

  roomSocket.on('connect', () => {
    console.log('roomSocket 연결됨:', roomSocket.id);
    mySocketId = roomSocket.id; // 내 socket.id 저장

    // 연결된 후에 joinRoom 실행
    if (currentRoom) {
      joinRoom(currentRoom);
    }
  });
  

  // "방 만들기" 버튼에 이벤트 리스너 연결
  const createRoomButton = document.querySelector('#create-room-button');
  if (createRoomButton) {
    createRoomButton.addEventListener('click', createRoom);
  }
  const sendMessageButton = document.querySelector('#send-message-button');
  if (sendMessageButton) {
    sendMessageButton.addEventListener('click', sendMessage);
  }
  const logoutButton = document.querySelector('#logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }

  //------------------------ 채팅방 입장시 notice ------------------------
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
        `<li>${room} <button class="join-button" data-room="${room}">join</button></li>`
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

    roomSocket.on('message', (data) => {
        console.log(data);
        // 메시지 div 생성
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');

        // 발신자 여부에 따라 클래스 추가
        if (data.sender === mySocketId) { //  내 socket.id 와 sender 가 같으면 내 메세지
          messageDiv.classList.add('chat-message-self');
        } else {
          messageDiv.classList.add('chat-message-other');
        }
        //닉네임 div 생성
        const nickNameDiv = document.createElement('div');
        nickNameDiv.classList.add('chat-message-nickname');
        nickNameDiv.textContent = data.nickname;
          // 메세지 div 생성
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('chat-message-content');
        contentDiv.textContent = data.message;

          // messageDiv에 nickNameDiv, contentDiv 추가
        messageDiv.appendChild(nickNameDiv);
        messageDiv.appendChild(contentDiv);

        // 화면에 메시지 추가
        $('#chat').append(messageDiv);
        console.log('roomSocket.on(message) 실행 : #chat 에 추가 ');
      });
      // 지난 메시지 수신 이벤트
      roomSocket.on('messageHistory', (message) => {
        console.log('messageHistory 수신:', message);
        $('#chat').empty();
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
          //닉네임 div 생성
          const nickNameDiv = document.createElement('div');
          nickNameDiv.classList.add('chat-message-nickname');
          nickNameDiv.textContent = data.nickname;
    
          // 메세지 div 생성
          const contentDiv = document.createElement('div');
          contentDiv.classList.add('chat-message-content');
          contentDiv.textContent = data.message;
           // messageDiv에 nickNameDiv, contentDiv 추가
            messageDiv.appendChild(nickNameDiv);
            messageDiv.appendChild(contentDiv);
    
          // 화면에 메시지 추가
          $('#chat').append(messageDiv);
        });
      });
}
function logout() {
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
  $('#chat').html('');
  $('#notice').html('');
  $('#rooms').empty();
  $('#message').val('');
  mainPage.style.display = 'none';
  authContainer.style.display = 'block';
  chatContainer.style.display = 'none';
}