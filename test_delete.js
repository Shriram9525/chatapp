const http = require('http');

console.log('Sending DELETE request to http://localhost:5000/api/rooms/69c8e496996225df69bcfb1c');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/rooms/69c8e496996225df69bcfb1c',
    method: 'DELETE',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
