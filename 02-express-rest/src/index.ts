// 入口：只负责 import app + 启动监听
import app from './app.ts';

const PORT = Number(process.env.PORT ?? 3040);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
