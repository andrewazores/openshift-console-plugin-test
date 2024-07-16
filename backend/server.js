const { http, https } = require('follow-redirects');
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

app.get('/health', (req, res) => {
  res.on('close', () => {
    console.log(`Request headers: ${JSON.stringify(req.headers, null, 2)}`);
  });
  res.send(`Hello from backend service: ${new Date().toISOString()}`);
});

app.use('/upstream/*', (req, res) => {
  let host = decodeURIComponent(req.query.instance || '');
  const method = req.method;
  let tls = host.startsWith('https://');
  const proto = (tls ? https : http);
  if (tls) {
    host = host.slice('https://'.length);
  } else if (host.startsWith('http://')) {
    host = host.slice('http://'.length);
  } else {
    throw new Error(`Cannot handle scheme for URL: ${host}`)
  }

  const path = (req.baseUrl + req.path).slice('/upstream'.length);
  const options = {
    host,
    method,
    path,
    headers: {
      'Authorization': req.headers.authorization,
      'Referer': req.headers.referer,
    },
  };
  options.agent = new proto.Agent(options);
  let body = '';
  var upReq = proto.request(options, upRes => {
    upRes.setEncoding('utf8');
    upRes.setTimeout(10_000, () => {
      res.status(504).send();
    });
    upRes.on('data', chunk => body += chunk);
    upRes.on('end', () => {
      console.log(`${host} ${path} : ${upRes.statusCode} ${body}`);
      res.status(upRes.statusCode).send(body);
    });
  });
  upReq.on('error', e => {
    console.error(e);
    res.status(502).send();
  });
  upReq.end();
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
