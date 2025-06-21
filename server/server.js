const express = require('express');
const app = express();
app.set('trust proxy', true);

// In-memory log storage
const logs = [];

app.get('/pixel', (req, res) => {
  const id = req.query.uid || 'unknown';
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logs.push({ id, time: timestamp, ip });
  console.log(`📨 Pixel hit – id: ${id}, time: ${timestamp}, IP: ${ip}`);

  const imgData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
    'base64'
  );
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': imgData.length,
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(imgData);
});

// Logs endpoint with optional UID filter
app.get('/logs', (req, res) => {
  const uid = req.query.uid;
  if (uid) {
    return res.json(logs.filter(log => log.id === uid));
  }
  res.json(logs);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Pixel tracker server running on port ${PORT}`);
});