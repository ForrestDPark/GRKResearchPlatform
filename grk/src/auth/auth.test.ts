const data = {
    email: "test1@grkcon.com",
    password: "grkcon2025!"
  };
  
  fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
  })
  .then((response) => {
       const setCookieHeaders = [];
       const cookies = [];
       
       response.headers.forEach((value, key) => {
           if (key.toLowerCase() === "set-cookie") {
              setCookieHeaders.push(value);
               const parsedCookies = value.split(';').reduce((acc, cookie) => {
                  const [name, value] = cookie.trim().split('=');
                  if (name && value) {
                      acc[name] = value;
                  }
                  return acc;
              }, {});
              cookies.push(parsedCookies)
           }
       });
    
       console.log("Set-Cookie 헤더들:", setCookieHeaders);
       console.log("파싱 된 쿠키들:", cookies)
    
    
    return response.json();
  })
  .then((result) => console.log("응답 결과:", result))
  .catch((error) => console.error("오류 발생:", error));