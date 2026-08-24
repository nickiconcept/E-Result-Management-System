const http = require('http');
const req = http.request('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    console.log('Login:', data);
    if (!data.token) return;
    const req2 = http.request('http://localhost:5000/api/teacher/assignments', {
      headers: { 'Authorization': 'Bearer ' + data.token }
    }, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('Status:', res2.statusCode);
        console.log('Assignments:', body2);
      });
    });
    req2.end();
  });
});
req.write(JSON.stringify({ identifier: 'janesmith', password: 'password123' }));
req.end();
