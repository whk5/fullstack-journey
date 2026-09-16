# Node.js + TypeScript 全栈学习计划

> 学员背景：前端工程师（React / TypeScript）
> 节奏：每周 5 天 × 每天 2 小时 = 10h/周
> 核心阶段：约 18 周（≈4.5 个月）→ 目标：能独立设计、开发、部署完整全栈应用
> 当前进度：**Phase 1（Day 1–10）**

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

## 每日 2 小时节奏（固定套路）

| 时段 | 内容 |
|---|---|
| 0:00–0:30 | 读当天文档章节，记关键词 |
| 0:30–1:40 | 先跟敲跑通，再脱离教程做变体练习 |
| 1:40–2:00 | 写 3 行笔记（学会什么 / 卡在哪 / 明天问什么）→ git commit |

约定：

- 练习一律用 TypeScript；Node 24 原生支持直接运行 `.ts`（type stripping），无需 ts-node/tsx
- 注意：只剥离类型，不支持 enum / namespace 等语法；相对导入要写 `.ts` 扩展名
- 类型检查：在 `01-node-core` 下运行 `pnpm typecheck`
- 每周五天不必是周一到周五，以 Day 1–Day 10 计进度

## Phase 1 逐日课表

| Day | 主题 | 学（材料） | 练（交付物） |
|---|---|---|---|
| 1 | 环境与运行时认知 | [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) · [Differences between Node.js and the Browser](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser) · [The V8 JavaScript Engine](https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine) · [Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively) | 跑通 `day01/hello.ts` 并扩展（打印系统信息）；笔记《前端 vs Node 思维差异》 |
| 2 | 模块系统 + process + path | [Run Node.js scripts from the command line](https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line) · [Read environment variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs) · API：[process](https://nodejs.org/docs/latest-v24.x/api/process.html) · [path](https://nodejs.org/docs/latest-v24.x/api/path.html) | CLI 工具：解析命令行参数并输出路径解析结果 |
| 3 | fs 文件系统 | [File stats](https://nodejs.org/en/learn/manipulating-files/nodejs-file-stats) · [Reading files](https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs) · [Writing files](https://nodejs.org/en/learn/manipulating-files/writing-files-with-nodejs) · [Working with folders](https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs) · API：[fs](https://nodejs.org/docs/latest-v24.x/api/fs.html) | CLI 工具：目录递归统计（文件数 / 总大小 / 按扩展名分组） |
| 4 | 事件循环（上） | [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) · [Understanding process.nextTick()](https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick) · [Understanding setImmediate()](https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate) · [Discover JavaScript Timers](https://nodejs.org/en/learn/asynchronous-work/discover-javascript-timers) | 实验：先预测再验证 nextTick / Promise.then / setImmediate / setTimeout 的输出顺序 |
| 5 | 事件循环（下）+ EventEmitter | [The Node.js Event Emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter) · API：[events](https://nodejs.org/docs/latest-v24.x/api/events.html) · 选读：[Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) | 用 EventEmitter 写简易任务调度器；周复盘 |
| 6 | Buffer 与二进制 | API：[Buffer](https://nodejs.org/docs/latest-v24.x/api/buffer.html) | 工具：文件 ⇄ base64 转换（utf8 / hex / base64 三种编码验证） |
| 7 | Stream 与背压 | [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) · [Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) · API：[stream](https://nodejs.org/docs/latest-v24.x/api/stream.html) | stream 复制大文件 vs readFile，对比内存占用 |
| 8 | 原生 HTTP（上） | [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) · API：[http](https://nodejs.org/docs/latest-v24.x/api/http.html) | 最小服务器：`/hello`、`/time` 两个 endpoint |
| 9 | 原生 HTTP（下） | 回顾 Day 7–8 材料 · API：[fs](https://nodejs.org/docs/latest-v24.x/api/fs.html)（`createReadStream`）· [stream](https://nodejs.org/docs/latest-v24.x/api/stream.html) | 静态文件服务器（MIME 映射 / stream 响应 / 404、500 / 防路径穿越） |
| 10 | 综合产出 + 验收 | [MDN：HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)（方法、状态码速览）· API：[http](https://nodejs.org/docs/latest-v24.x/api/http.html) 回顾 | 内存版 TODO API（GET/POST/PATCH/DELETE）+ curl 全量测试 + 阶段复盘 |

> 中文对照规则：把域名 `nodejs.org` 换成 `nodejs.cn`，路径不变（例：https://nodejs.cn/learn/getting-started/introduction-to-nodejs）。

## 进度勾选

- [ ] Day 1 · 环境与运行时认知
- [ ] Day 2 · 模块系统 + process + path
- [ ] Day 3 · fs 文件系统
- [ ] Day 4 · 事件循环（上）
- [ ] Day 5 · 事件循环（下）+ EventEmitter（含周复盘）
- [ ] Day 6 · Buffer 与二进制
- [ ] Day 7 · Stream 与背压
- [ ] Day 8 · 原生 HTTP（上）
- [ ] Day 9 · 原生 HTTP（下）
- [ ] Day 10 · 综合产出 + 阶段验收

## Phase 1 验收标准（进 Phase 2 的门槛）

- [ ] 能用自己的话解释：事件循环、微任务 vs 宏任务、Node 单线程为何能并发
- [ ] 不看教程（只查 API 文档）能写出静态文件服务器
- [ ] 不看教程能写出内存版 TODO API（状态码语义正确、有错误处理）
- [ ] 两个 CLI 工具 + 10 天 git 提交记录 + 2 篇笔记
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
| 通用 | MDN HTTP | https://developer.mozilla.org/zh-CN/docs/Web/HTTP | Day 8–10、Phase 2 |
| Phase 2 | Express | https://expressjs.com | 框架文档 |
| Phase 2+ | Full Stack Open | https://fullstackopen.com | 主教材 |
| Phase 3 | PostgreSQL | https://www.postgresql.org/docs/ | 数据库手册 |
| Phase 3 | Prisma | https://www.prisma.io/docs | ORM 文档 |

## 协作方式（AI 助教）

1. 每天：先独立做题 → 卡住随时问 → 完成后请 review（按真实 code review 标准）→ 改进后 commit
2. AI 维护进度（勾选 + 问题清单），Day 5 / Day 10 做复盘和验收

### 问题清单

（遇到卡住的概念记到这里，边用边补）
