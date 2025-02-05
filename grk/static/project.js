
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
  