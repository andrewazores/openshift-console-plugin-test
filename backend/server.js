const https = require('https');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 9943;

const tlsOpts = {
  cert: fs.readFileSync('/var/cert/tls.crt'),
  key: fs.readFileSync('/var/cert/tls.key'),
};

app.use(morgan('combined'));

let connections = [];

app.get('/test', (req, res) => {
  res.on('close', () => {
    console.log(`Request headers: ${JSON.stringify(req.headers, null, 2)}`);
  });
  res.send(`Hello from backend service: ${new Date().toISOString()}`);
});

const svc = https.createServer(tlsOpts, app).listen(port, () => {
  console.log(`Service started on port ${port}`);
});

svc.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

const shutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  svc.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
