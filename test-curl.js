import http from 'http';
http.get('http://127.0.0.1:3000/api/committee', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data.substring(0, 1000)));
}).on('error', console.error);
