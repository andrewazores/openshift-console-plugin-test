const express = require('express');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 9898;

app.use(morgan('combined'));

let connections = [];

app.get('/test', (req, res) => {
  res.on('close', () => {
    console.log(`Request headers: ${JSON.stringify(req.headers, null, 2)}`);
  });

  // TODO set the allowed origins based on the URL of the console of the installation cluster
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.send(`Hello from backend service: ${new Date().toISOString()}`);
});

const svc = app.listen(port, () => {
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
