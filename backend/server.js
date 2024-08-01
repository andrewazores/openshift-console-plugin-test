const { http, https } = require('follow-redirects');
const fs = require('fs');
const k8s = require('@kubernetes/client-node');
const express = require('express');
const morgan = require('morgan');
const qs = require('qs');
const app = express();
const port = process.env.PORT || 9943;
const crVersion = process.env.CRYOSTAT_CR_VERSION || 'v1beta2';
const skipTlsVerify = process.env.SKIP_TLS_VERIFY == 'true';
const htmlDir = process.env.HTML_DIR || './html';

const tlsOpts = {
  cert: fs.readFileSync('/var/cert/tls.crt'),
  key: fs.readFileSync('/var/cert/tls.key'),
};

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
kc.applyToHTTPSOptions({
  rejectUnauthorized: !skipTlsVerify,
});
kc.applyToRequest({
  strictSSL: !skipTlsVerify,
});

const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

app.use(morgan('combined'));

let connections = [];

app.use(express.static(htmlDir))

app.get('/health', (req, res) => {
  res.send(`Hello from backend service: ${new Date().toISOString()}`);
});

app.use('/upstream/*', async (req, res) => {
  let ns = req.headers['cryostat-cr-ns'];
  let name = req.headers['cryostat-cr-name'];
  if (!ns || !name) {
    res.status(400).send();
    return;
  }

  const cr = await k8sApi.getNamespacedCustomObjectStatus('operator.cryostat.io', crVersion, ns, 'cryostats', name);
  let host = cr.body.status.applicationUrl;

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

  let path = (req.baseUrl + req.path).slice('/upstream'.length);
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  const query = qs.stringify(req.query);
  if (query) {
    path += `?${query}`;
  }
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
      console.log(`${host} ${path} : ${upRes.statusCode} ${body.length}`);
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
