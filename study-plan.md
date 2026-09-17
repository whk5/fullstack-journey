# Node.js + TypeScript 全栈学习计划

> 学员背景：前端工程师（React / TypeScript）
> 节奏：每周 5 天 × 每天 2 小时 = 10h/周（不限时，以产出收尾）
> 核心阶段：约 18 周（≈4.5 个月）→ 目标：能独立设计、开发、部署完整全栈应用
> 当前进度：**Phase 1 · Day 1 归档**（课表已按项目驱动重排）

## 总览

| 阶段 | 周数 | 学时 | 核心产出 |
|---|---|---|---|
| Phase 1 · Node 核心 | 2 | 20h | 静态文件服务器 + 内存版 TODO API（原生 http，无框架） |
| Phase 2 · Express / REST | 3 | 30h | 分层 REST API（校验 + 日志 + 统一错误处理） |
| Phase 3 · 数据库 | 4 | 40h | PostgreSQL + Prisma 重构 API、迁移脚本 |
| Phase 4 · 认证 / 安全 / 测试 | 3 | 30h | 注册登录 + RBAC + Vitest 集成测试 |
| Phase 5 · 工程化 / 部署 | 2 | 20h | Docker + GitHub Actions + 公网上线 |
| Phase 6 · 综合项目 | 4+ | 40h+ | 可写进作品集的完整全栈应用 |
| Phase 7 · 进阶 | 按兴趣 | — | WebSocket / Next.js / NestJS / 队列 |

## 每日套路（不设硬时间线）

| 步骤 | 内容 |
|---|---|
| 1 | 读当天材料，记关键词（读不动就直接动手，回头再读） |
| 2 | 先跟敲跑通，再脱离教程做变体练习 |
| 3 | 写 3 行笔记（学会什么 / 卡在哪 / 明天问什么）→ git commit |

约定：

- 练习一律用 TypeScript；Node 24 原生支持直接运行 `.ts`（type stripping），无需 ts-node/tsx
- 注意：只剥离类型，不支持 enum / namespace 等语法；相对导入要写 `.ts` 扩展名
- 类型检查：在 `01-node-core` 下运行 `pnpm typecheck`
- 每周五天不必是周一到周五，以 Day 1–Day 10 计进度

## Phase 1 逐日课表（项目驱动版）

> 重排原则：概念随用随补，不按文档顺序线性推进；每天以可交付小产出收尾；提前完成就提前进入下一块。

### Day 1 · 归档日

| 学 | 练（交付物） |
|---|---|
| 回顾 [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) · [The V8 JavaScript Engine](https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine) | 写 `notes/day01.md`（前端 vs Node 思维差异 + 文件标注 + 遗留问题）→ commit 已写的代码 |

### 块 1 · 静态文件服务器（Day 2–5）

| Day | 主题 | 学（材料） | 练（交付物） |
|---|---|---|---|
| 2 | 多路由服务器 | [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) · API：[http](https://nodejs.org/docs/latest-v24.x/api/http.html) | `/hello`、`/time`、`/echo`（含 query 解析） |
| 3 | 返回磁盘文件 | [File stats](https://nodejs.org/en/learn/manipulating-files/nodejs-file-stats) · [Reading files](https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs) · API：[path](https://nodejs.org/docs/latest-v24.x/api/path.html) · [fs](https://nodejs.org/docs/latest-v24.x/api/fs.html) | `path.join/resolve/extname` + `fs.promises.readFile` + Content-Type 映射 |
| 4 | 事件循环实验日 | [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) · [Understanding process.nextTick()](https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick) · [Understanding setImmediate()](https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate) · [Discover JavaScript Timers](https://nodejs.org/en/learn/asynchronous-work/discover-javascript-timers) | 先预测再验证 nextTick / Promise.then / setImmediate / setTimeout 输出顺序 |
| 5 | 完整静态服务器 | [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) · [Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) · API：[stream](https://nodejs.org/docs/latest-v24.x/api/stream.html) | 流式返回大文件 + 404/500 + 防路径穿越 |

### 块 2 · 内存 TODO API（Day 6–8）

| Day | 主题 | 学（材料） | 练（交付物） |
|---|---|---|---|
| 6 | GET 列表 + POST 创建 | [MDN：HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)（方法、状态码速览）· API：[http](https://nodejs.org/docs/latest-v24.x/api/http.html) | JSON body 流式解析（`req.on('data'/'end')`）+ 201/400 |
| 7 | PATCH/DELETE + 404 + 错误处理 | API：[events](https://nodejs.org/docs/latest-v24.x/api/events.html)（`req`/`res` 上的 EventEmitter 回顾） | 路由参数、id 校验、统一错误处理 |
| 8 | curl 全量测试 | [MDN：HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)（状态码复习） | 边界用例：非法 JSON、不存在的 id、不支持的方法（405） |

### Day 9–10 · 缓冲 + 验收

| Day | 主题 | 练（交付物） |
|---|---|---|
| 9 | 问题清单消化 | 集中解决文末「问题清单」+ 补漏代码（`req` 流、EventEmitter 小结） |
| 10 | 验收自测 + 复盘 | 口头自测验收 5 题 + 阶段复盘笔记 |

> 8 天提前完成 → Day 9–10 直接进入 Phase 2 预热（Express 文档 + Full Stack Open）。

> 中文对照规则：把域名 `nodejs.org` 换成 `nodejs.cn`，路径不变（例：https://nodejs.cn/learn/getting-started/introduction-to-nodejs）。

## 进度勾选

- [ ] Day 1 · 归档日（环境认知 + 笔记 + commit）
- [ ] Day 2 · 多路由服务器
- [ ] Day 3 · 返回磁盘文件（path + fs）
- [ ] Day 4 · 事件循环实验
- [ ] Day 5 · 完整静态服务器（stream + 背压 + 安全）
- [ ] Day 6 · TODO API：GET/POST
- [ ] Day 7 · TODO API：PATCH/DELETE + 错误处理
- [ ] Day 8 · curl 全量测试 + 边界用例
- [ ] Day 9 · 问题清单消化（缓冲）
- [ ] Day 10 · 验收自测 + 阶段复盘

## Phase 1 验收标准（进 Phase 2 的门槛）

- [ ] 能用自己的话解释：事件循环、微任务 vs 宏任务、Node 单线程为何能并发
- [ ] 不看教程（只查 API 文档）能写出静态文件服务器
- [ ] 不看教程能写出内存版 TODO API（状态码语义正确、有错误处理）
- [ ] 静态服务器 + TODO API 代码 + 每日 git 提交记录 + 笔记 ≥2 篇（归档 + 块复盘）
- [ ] 口头自测：`readFile` vs `createReadStream` 何时用哪个；`pipe` 解决了什么问题

完成 80% 即可进入 Phase 2，卡住的概念记入问题清单，后续边用边补。

## 资源索引

| 阶段 | 资源 | 地址 | 用途 |
|---|---|---|---|
| Phase 1 | Node Learn 主线教材（英） | https://nodejs.org/en/learn | 每天阅读材料 |
| Phase 1 | Node Learn 中文版 | https://nodejs.cn/learn | 中文对照 |
| Phase 1 | Node 24 API 参考（固定 v24，勿看 latest） | https://nodejs.org/docs/latest-v24.x/api/ | 查 API |
| Phase 1 | Node API 中文 | https://nodejs.cn/api | 中文查 API |
| 通用 | Node 版本发布记录 | https://nodejs.org/en/about/previous-releases | 查版本状态 |
| 通用 | MDN HTTP | https://developer.mozilla.org/zh-CN/docs/Web/HTTP | Day 6–8、Phase 2 |
| Phase 2 | Express | https://expressjs.com | 框架文档 |
| Phase 2+ | Full Stack Open | https://fullstackopen.com | 主教材 |
| Phase 3 | PostgreSQL | https://www.postgresql.org/docs/ | 数据库手册 |
| Phase 3 | Prisma | https://www.prisma.io/docs | ORM 文档 |

## 协作方式（AI 助教）

1. 每天：先独立做题 → 卡住随时问 → 完成后请 review（按真实 code review 标准）→ 改进后 commit
2. AI 维护进度（勾选 + 问题清单），Day 5 / Day 10 做复盘和验收

### 问题清单

- Node 单线程为什么能并发处理请求？（Day 4 解决）
- `streams.ts` 里 Writable 逐块 write 和 `await response.text()` 的区别？背压为什么重要？（Day 5 解决）
- 为什么 ws 服务器需要第三方库？Node 原生 WebSocket 和浏览器的一样吗？（Phase 7 解决）
