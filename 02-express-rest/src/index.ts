import express from 'express';

const app = express();
const PORT = Number(process.env.PORT ?? 3040);

app.use(express.json());

app.get('/hello', (_req, res) => {
  res.type('text/plain').send('Hello, Express!');
});

app.get('/time', (_req, res) => {
  res.json({ iso: new Date().toISOString(), epoch: Date.now() });
});

app.get('/echo', (req, res) => {
  res.json({ method: 'GET', path: '/echo', query: req.query });
});

app.post('/echo', (req, res) => {
  res.json({ method: 'POST', path: '/echo', body: req.body });
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
