// 日志中间件：记录每个请求的方法、URL、状态码和耗时
// 必须放在最前面，才能连 body-parser 拒掉的请求也记录到
import type { RequestHandler } from 'express';

const logger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  // finish 在响应数据交给系统后才触发，此时才能拿到最终状态码
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`);
  });
  next();
};

export default logger;
