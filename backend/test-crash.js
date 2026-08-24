const { spawn } = require('child_process');
const http = require('http');

const serverProc = spawn('node', ['server.js'], { cwd: __dirname });

serverProc.stdout.on('data', data => console.log('SERVER STDOUT:', data.toString()));
serverProc.stderr.on('data', data => console.error('SERVER STDERR:', data.toString()));

serverProc.on('close', code => console.log('SERVER EXITED WITH CODE:', code));

setTimeout(() => {
  const req = http.request('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const data = JSON.parse(body);
      if (!data.token) return;
      const req2 = http.request('http://localhost:5001/api/teacher/assignments', {
        headers: { 'Authorization': 'Bearer ' + data.token }
      }, (res2) => {
        let body2 = '';
        res2.on('data', chunk => body2 += chunk);
        res2.on('end', () => {
          console.log('Assignments Status:', res2.statusCode);
          serverProc.kill();
        });
      });
      req2.on('error', e => console.error('REQ2 ERROR:', e));
      req2.end();
    });
  });
  req.on('error', e => console.error('REQ ERROR:', e));
  req.write(JSON.stringify({ identifier: 'janesmith', password: 'password123' }));
  req.end();
}, 2000);
