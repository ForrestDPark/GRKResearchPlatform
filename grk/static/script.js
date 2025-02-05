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

  // log out button
  const logoutButton = document.getElementById('logout-button');
  const loginSuccess = document.getElementById('login-success');
  const loginSuccessMessage = document.getElementById('login-success-message');
  
  // URL 파라미터에서 사용자 이름 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const usernameFromURL = urlParams.get('username'); 
  if (usernameFromURL) {
    nickname = usernameFromURL
    username = nickname
  } else {
    console.warn('Username not found in URL')
    nickname = 'Unknown User'
    username = nickname
  }

  // 사용자 이름이 있다면 사용자 정보 설정 및 채팅 UI 표시
  if (usernameFromURL) {
      nickname = usernameFromURL; // 변경된 변수명
      username = nickname
      // showMainPage() 호출하지 않도록 수정
      // showMainPage() 호출 삭제
      // 채팅 UI 표시 및 소켓 연결
      showChat();
  }

  // 메시지 입력창에서 엔터키 눌렀을때 메시지 전송 
  const messageInput = document.getElementById('message')
  if (messageInput) {
    messageInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        sendMessage()
      }
    })
  }
  // 로컬스토리지에서 mySocketId 값 읽음 
  const storedMySocketId = localStorage.getItem('mySocketId')
  if (storedMySocketId) {
    mySocketId = storedMySocketId
    console.log('Loaded mySocketId from localStorage', mySocketId)
  }

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

      if (response.ok) {
          // 리다이렉트 처리 (JSON 파싱 코드 제거)
          window.location.href = 'http://localhost:3000/dashboard.html';
      } else {
          // 오류 응답 처리 (JSON 파싱 시도)
          try {
              const data = await response.json();
              loginError.textContent = '로그인 실패: ' + data.message;
          } catch (jsonError) {
              loginError.textContent = '로그인 실패: JSON 파싱 오류';
          }
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
  
  // getCookie
  function getCookie(name) {
    const value =`; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
  }
  const googleUserCookie = getCookie('login')
  if (googleUserCookie) {
    nickname = JSON.parse(googleUserCookie).email
    showMainPage()
  }

  // const logoutButton = document.querySelector('#logout-button');
  logoutButton.addEventListener('click', logout);

  // 채팅방으로 이동 버튼 클릭 시
  goToChatButton.addEventListener('click', function () {
    // 채팅 UI 표시 및 소켓 연결
    window.location.href = 'http://localhost:3000/messages.html';
});
});


// ----------------------------------
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

  $('#chat').html('');
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
  $('#chat').append(messageDiv);
  $('#chat').scrollTop($('#chat')[0].scrollHeight);

  $('#message').val(''); // 입력창 비우기
  return false;
}

// 메인 페이지를 표시하는 함수
function showMainPage() {
  authContainer.style.display = 'none';
  mainPage.style.display = 'block';
  chatContainer.style.display = 'none'; // 채팅 컨테이너 숨김
  $('#main-user-nickname').text(nickname); // 메인 페이지에 닉네임 표시
}

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
  $('#chat').html('');
  $('#notice').html('');
  $('#rooms').empty();
  $('#message').val('');
  mainPage.style.display = 'none';
  authContainer.style.display = 'block';
  chatContainer.style.display = 'none';
  loginSuccess.style.display = 'none';
  loginForm.style.display = 'block';

  // 로그아웃 API 호출 (쿠키 삭제 및 세션 삭제)
  fetch('http://localhost:3000/auth/logout', {
    method: 'POST', // 또는 'GET'
  })
  .then(response => {
    if (response.ok) {
      console.log('로그아웃 성공');
      // 쿠키 삭제 및 화면 초기화
      // (화면 초기화 코드는 기존 코드와 동일)
    } else {
      console.error('로그아웃 실패');
    }
  })
  .catch(error => {
    console.error('로그아웃 중 오류 발생:', error);
  });
}
