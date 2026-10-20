# Day 6 · 日志中间件 + 环境配置

**学会什么**
- 手写日志中间件：请求进来时 `process.hrtime.bigint()` 记开始，监听 `res.on('finish')` 在响应结束后拿最终状态码、算耗时；必须 `next()` 否则请求挂起
- Express 中间件 4 种类型；日志属于应用级、无挂载路径，放最前面（连 body-parser 拒掉的 400 / 404 fallback 都能记到）
- `.env` 管 PORT：Node 24 原生 `--env-file-if-exists=.env` 在启动前把变量注入 `process.env`，零依赖、不引 dotenv；`.env` 不入库，`.env.example` 当模板

**卡在哪**
- 一开始以为在中间件里直接读 `res.statusCode` 就有最终状态，忘了「响应还没发出去」——状态码要在 `finish` 事件里才拿得到

**明天问什么**
- `next('route')` / `next('router')` 到底跳到哪里，和普通 `next()` 什么区别？
