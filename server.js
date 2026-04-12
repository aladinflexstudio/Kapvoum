const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error');
      return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
});

server.listen(process.env.PORT || 3000);
