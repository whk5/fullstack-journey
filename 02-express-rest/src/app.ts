// app 层：装配中间件 + 挂载路由 + 404/错误兜底；不负责启动
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import todoRouter from './routes/todo.ts';

const app = express();

app.use(express.json());
app.use('/api/todos', todoRouter);

// 404 fallback：所有路由都没命中才走到这里
const unknownEndpoint: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not found' });
};
app.use(unknownEndpoint);

// 错误处理中间件：必须 4 个参数，Express 才识别
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
};
app.use(errorHandler);

export default app;
