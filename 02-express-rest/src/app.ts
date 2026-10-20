// app 层：装配中间件 + 挂载路由 + 404/错误兜底；不负责启动
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import todoRouter from './routes/todo.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.use(express.json());
app.use('/api/todos', todoRouter);
app.use(express.static(__dirname));
// 404 fallback：所有路由都没命中才走到这里
const unknownEndpoint: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not found' });
};
app.use(unknownEndpoint);

// 错误处理中间件：必须 4 个参数，Express 才识别。
// 4xx（客户端错误，如 body-parser 的非法 JSON）用原状态码返回；5xx 记日志并统一返回 500。
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err.status === 'number' && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status >= 500) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
    return;
  }
  const message = err.type === 'entity.parse.failed' ? 'invalid JSON body' : String(err.message ?? 'bad request');
  res.status(status).json({ error: message });
};
app.use(errorHandler);

export default app;
