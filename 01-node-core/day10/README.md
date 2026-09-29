# Day 10 · 验收自测 + 阶段复盘（Phase 1 收官）

> Phase 1（Node 核心）最后一天。今天**不写新功能**，做两件事：① 对着 `study-plan.md` 的「Phase 1 验收标准」5 条逐条「说出口」自测——不是背笔记，是面试式复述；② 写阶段复盘笔记 `notes/day10.md`。5 条做到 4 条（80%）即算过，可进 Phase 2；卡住的概念记入问题清单，进 Phase 2 边用边补。

## 学习材料（全为复习，零新增阅读）

按需回看，只回看卡住的那几条对应材料：

| 验收标准 | 卡壳时回看 |
|---|---|
| 1 · 事件循环 / 微任务 vs 宏任务 / 单线程并发 | 自己的 `day04/` 实验 + [Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) · [process.nextTick](https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick) |
| 2 · 静态文件服务器 | 自己的 `day03/`、`day05/` + API：[path](https://nodejs.org/docs/latest-v24.x/api/path.html) · [fs](https://nodejs.org/docs/latest-v24.x/api/fs.html) |
| 3 · 内存 TODO API | 自己的 `day06/`、`day07/` + `day08/test-matrix.md` + [MDN 状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status) |
| 4 · 产物清点 | 自己的 `git log`、`notes/`、`day03/`、`day06/` |
| 5 · `readFile` vs `createReadStream` / `pipe` | 自己的 `day05/` + [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) |

- 中文对照：域名 `nodejs.org` → `nodejs.cn`，路径不变；MDN 本身就是中文
- 逐日导读 + 验收标准原文：见 [../../study-plan.md](../../study-plan.md) 的 Day 10 行与「Phase 1 验收标准」一节

## 核心概念（动手前过一遍）

### 1. 验收标准 5 条（自测什么）

| # | 验收标准 | 判据（能算过） | 卡壳回看 |
|---|---|---|---|
| 1 | 用自己的话解释：事件循环、微任务 vs 宏任务、Node 单线程为何能并发 | 讲出：单线程 + 非阻塞 I/O + 事件循环轮询；微任务（`Promise.then` / `nextTick`）在宏任务之间跑、先于 `setTimeout`；I/O 回调进宏任务队列；能举自己 day04 实验里的一个真实输出 | day04/ |
| 2 | 不看教程（只查 API 文档）能写出静态文件服务器 | 写出：`path.join/resolve` 拼路径、`fs.promises.readFile`、Content-Type 映射、404/500、防路径穿越 | day03/、day05/ |
| 3 | 不看教程能写出内存版 TODO API（状态码语义正确、有错误处理） | 写出：200/201/204/400/404/405 语义对、405 带 `Allow`、PATCH 只改传入字段、JSON body 流式解析、空 body / 非法 JSON → 400、进程不崩 | day06/、day07/ |
| 4 | 静态服务器 + TODO API 代码 + 每日 git 提交记录 + 笔记 ≥2 篇 | 清点：`git log` 有逐日提交；`notes/` 有归档 + 块复盘 ≥2 篇；两个可运行服务都在 | git log、notes/ |
| 5 | 口头自测：`readFile` vs `createReadStream` 何时用哪个；`pipe` 解决了什么问题 | 讲出：`readFile` 一次性读入内存、适合小文件；`createReadStream` 分块流式、背压可控、适合大文件 / 慢客户端；`pipe` 自动处理背压（`pipeline` 还管错误转发） | day05/ |

### 2. 自测方法（为什么是「说出口」）

- **别背笔记**：每一条先合上屏幕，像给同事讲一样说。说不顺的地方 = 没消化的点，当场标记
- **二分判定**：每条按判据给「能 / 不能」，别含糊其辞
- **卡住不卡流程**：没过的条目标「留待 Phase 2 / Phase 7」并进问题清单——**5 过 4（80%）即可进 Phase 2**，不用全过
- 完整的勾选表在 [self-check.md](./self-check.md)，结果直接填里面

### 3. 复盘笔记怎么写（`notes/day10.md` 模板）

三段，每段不贪多，写真实体会：

```markdown
# Day 10 · 验收自测 + 阶段复盘

## 一、验收自测结果
5 条逐条「能/不能」+ 卡壳点（填 self-check.md 后汇总到这里）

## 二、阶段复盘
- **做成了什么**：两个可运行服务（静态服务器 + TODO API）+ 每日常提交 + 笔记清单
- **最扎实的 3 个收获**：如「事件循环真的理解了（day04 预测全对）」/「状态码语义刻进直觉」/「req 是流、res 有生命周期」
- **还欠什么**：从问题清单里挑 1–3 条最想补的，注明留待哪个阶段

## 三、给 Phase 2 的三条提醒（写给未来的自己）
如「Content-Type 严格校验该做了」/「别再手写 body 解析」/「先抄 Express 官方例子再谈分层」
```

## 任务

1. **自测**：打开 [self-check.md](./self-check.md)，5 条逐条合屏「说出口」，把「能 / 不能」和答案要点填进去
2. **复盘**：按概念 3 模板写 `notes/day10.md`（自测结果 + 阶段复盘三问 + 三条提醒）
3. **收尾**：没过的条 / 没消化的概念更新进 `study-plan.md` 文末「问题清单」→ `pnpm typecheck` → git commit → 喊 AI 做 Phase 1 阶段验收 review（对照 5 条标准判是否达标）

## 验收清单

- [ ] [self-check.md](./self-check.md) 5 条全填了「能 / 不能」，判据覆盖关键点
- [ ] `notes/day10.md`：自测结果 + 阶段复盘三问 + 三条提醒（不适用写 N/A，不留空）
- [ ] 5 过 4（≥80%）确认可进 Phase 2；没过的是「留待 X」而不是「算了」
- [ ] 遗留问题已更新进 `study-plan.md` 问题清单
- [ ] `pnpm typecheck` 通过 + git commit

## 运行

今天不跑服务（无新代码）。只检查已有产出能跑：

```bash
node day05/server.ts   # 静态服务器（按需确认能起）
node day08/server.ts   # TODO API（按需确认能起）
git log --oneline      # 清点逐日提交
```

## 今天不做（留给后面）

- 自动化测试框架（Vitest / supertest）→ Phase 4
- 持久化（写文件 / 数据库）→ Phase 3
- Express / 分层 REST → Phase 2（今天最多做预热，见下）

## Phase 2 预热（可选，做完上面的还有余力）

提前完成进 Phase 2 前，先攒点手感：

- [Express Getting Started](https://expressjs.com/en/starter/installing.html)：看「Hello world」和路由两篇，别写代码，只找「Express 帮你省掉了什么」（body 解析、路由、404）
- [Full Stack Open · Part 3](https://fullstackopen.com/en/part3)（Node.js 与 Express）：读前几节，对照自己的 TODO API 看框架怎么落地 REST
