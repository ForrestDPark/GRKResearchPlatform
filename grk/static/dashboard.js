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

