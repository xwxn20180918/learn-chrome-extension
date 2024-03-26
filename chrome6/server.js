// server.mjs
const { createServer } = require('node:http');
const url = require('url');

const server = createServer((req, res) => {
  var pathname = url.parse(req.url).pathname;

  if (pathname.includes('api')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        name: 'John Doe',
        age: 30,
      })
    );
    res.end();
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!\n' + pathname);
  }
});

server.listen(8080, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:8080');
});
