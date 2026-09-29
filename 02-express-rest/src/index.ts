import express from 'express';

const app = express();
const PORT = Number(process.env.PORT ?? 3040);

app.get('/hello', (_req, res) => {
  res.type('text/plain').send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
