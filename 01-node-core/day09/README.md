# Day 9 · 问题清单消化 + 补漏（缓冲日）

> 块 2（Day 6–8）已收口，TODO API 全量测过。今天**不学新东西**，是缓冲日：把 `study-plan.md` 文末「问题清单」逐条消化——先自己答、再对照文档/代码验证，答不上的继续留清单；顺手把 Day 2 顺延的 `/hello` `/time` `/echo`（含 query 解析）补上；最后给「`req` 是流 + EventEmitter」写个小结。

## 学习材料（全为复习，无新阅读）

| 顺序 | 文档（重读） | 只抓 |
|---|---|---|
| 1 | [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) 的 **Request Body** 段 | body 是流：`'data'` 一块块到、`'end'` 后再拼、空 body 先判（Day 2/6 的坑） |
| 2 | API：[events](https://nodejs.org/docs/latest-v24.x/api/events.html) | `on` / `once` / `off` / `emit`；**`req`/`res` 本身就是 EventEmitter** |
| 3 | API：[url](https://nodejs.org/docs/latest-v24.x/api/url.html)（只查 `URL` 类） | `new URL(...)` 的 `.pathname`（不含 query）与 `.searchParams` |

- 中文对照：域名 `nodejs.org` → `nodejs.cn`，路径不变
- 逐日导读 + 常见坑：见 [../../study-plan.md](../../study-plan.md) 的 Day 9 行（重点：问题清单逐条先自己答，再对照文档验证）

## 核心概念（动手前过一遍）

### 1. 怎么消化问题清单（方法，不是知识）

三步，逐条走，别跳过：

1. **先自己答**：不翻文档，用一句话写下当前理解（写不出来 = 没消化，直接标注「没消化」）
2. **对照验证**：翻对应文档 / 自己的代码，确认对错，把差异写下来
3. **归档**：答对的划掉；答错的改；答不上的继续留清单，并注明「留待 X」

当前清单与今天怎么验：

| # | 问题 / 遗留 | 状态 | 今天怎么验 |
|---|---|---|---|
| 1 | Node 单线程为什么能并发处理请求？ | Day 4 已解决 | 用自己话复述一遍（答不上就重读 day04 笔记） |
| 2 | `streams.ts` 里 Writable 逐块 `write` 和 `await response.text()` 的区别？背压为什么重要？ | Day 5 已解决 | 对照 `day05/` 自己的代码复述 |
| 3 | 为什么 ws 服务器需要第三方库？Node 原生 WebSocket 和浏览器的一样吗？ | Phase 7 解决 | 只留一句当前理解，标注「留待 Phase 7」 |
| 4 | Day 2 遗留：`/hello` `/time` `/echo` 未做 | 今天补 | 交付 `day09/server.ts`（概念 3） |
| 5 | Day 2 遗留：`new URL(request.url!, base)` 解析 query 未验证 | 今天补 | 热身 + `/echo` 实现（概念 2） |

### 2. query 解析补漏（Day 2 遗留）

`req.url` 是 `/echo?name=foo` 这种**以 `/` 开头**的原始串，不是完整 URL，必须给 `new URL` 一个 base：

```ts
const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

url.pathname;                          // '/echo' —— 不含 query（Day 8 C1 已验证：路由只看它，query 被丢）
url.searchParams.get('name');          // 'foo'
Object.fromEntries(url.searchParams);  // { name: 'foo', lang: 'ts' }
```

三个坑（Day 8 实测过的结论，在这里自己验证一遍）：

- `pathname` **不解码** `%31`（Day 8 C5：`/todos/%31` ≠ `/todos/1`）
- 重复参数 `?a=1&a=2` → `searchParams.getAll('a')` 才是 `['1','2']`，`get` 只取第一个
- 无 query 时 `Object.fromEntries(url.searchParams)` 得到 `{}`，不是 `null`/`undefined`

### 3. `/hello` `/time` `/echo` 规格（今天的补漏交付）

| 端点 | 方法 | 状态码 | 响应 |
|---|---|---|---|
| `/hello` | GET | 200 | 纯文本 `Hello, Node!`（`Content-Type: text/plain; charset=utf-8`） |
| `/time` | GET | 200 | JSON `{ "iso": "<当前ISO时间>", "epoch": <毫秒时间戳> }`（每次请求都不同） |
| `/echo` | GET | 200 | JSON 回显 query：`{ "method": "GET", "path": "/echo", "query": { ... } }`（无 query 时 `query` 是 `{}`） |
| `/echo` | POST | 200 | JSON 回显 body：`{ "method": "POST", "path": "/echo", "query": {}, "body": <解析后的 JSON> }`；空 body → `body: null` 并 `400`（与 Day 6 同一套校验） |
| 上述路径 | 其他方法 | **405** + `Allow` 头 | `{ "error": "method not allowed" }`（`Allow` 列支持的方法） |
| 其他路径 | — | 404 | `{ "error": "not found" }` |

`/echo` 是 Day 2 的 echo 加 query 解析、加 Day 6 的 body 解析——把两块知识拧成一条路由。实现时可从 `day02/createServer.ts` 起手（保留 `Access-Control-Allow-Origin: *`），也可以从零写。

### 4. `req` 流 + EventEmitter 小结（写进 notes）

十天下来，所有「事件」其实是同一套 `on` / `emit`。整理成表放进 `notes/day09.md`：

| 对象 | 本质 | 用过的『事件』 | 何时触发（自己补全） |
|---|---|---|---|
| `req`（`IncomingMessage`） | 可读流 → EventEmitter | `'data'` / `'end'` / `'error'` | body 一块块到 / body 收完 / 请求出错 |
| `res`（`ServerResponse`） | 可写流 → EventEmitter | `'finish'` / `'close'` | 响应全部写出 / 连接关闭（可能不触发 finish） |

一句话小结：**`req` 的 body 是流（Day 2/6），`res` 的写出有生命周期（Day 7），底层都是 EventEmitter 那四个方法。**

## 任务

1. **热身（可选但推荐）**：写 `day09/query-check.ts`，用 `new URL` 验证概念 2 的三行结论（pathname 丢 query / `get` vs `getAll` / 无 query 得 `{}`），跑 `node day09/query-check.ts`
2. **交付**：写 `day09/server.ts`——多路由服务器，按概念 3 规格实现 `/hello` `/time` `/echo`（GET 带 query、POST 带 body），已知路径错误方法 405 + `Allow`，未知路径 404（规格已给全，这是「脱教程」步）
3. **消化**：按概念 1 的方法，把清单 5 条逐条「先答后验」，结果写进 `notes/day09.md`
4. **收尾**：`notes/day09.md` 写 3 行笔记 + 问题清单消化结果 + `req`/EventEmitter 小结（概念 4）→ `pnpm typecheck` → git commit → 喊 AI review

## curl 快测

服务跑起来后，另开一个终端。端口 **3035**。

```bash
# /hello → 200，纯文本
curl -i http://localhost:3035/hello

# /time → 200，JSON 且每次 epoch 都变（多打两次对比）
curl -i http://localhost:3035/time
curl -i http://localhost:3035/time

# /echo GET 带 query → 200，query 解析成对象
curl -i "http://localhost:3035/echo?name=foo&lang=ts"

# /echo GET 无 query → 200，query 是 {}（不是 null）
curl -i http://localhost:3035/echo

# /echo POST 带 JSON body → 200，body 回显
curl -i -X POST http://localhost:3035/echo -H "Content-Type: application/json" -d '{"name":"foo"}'

# /echo POST 空 body → 400（复用 Day 6 校验）
curl -i -X POST http://localhost:3035/echo

# 已知路径 + 不支持的方法 → 405，响应头有 Allow
curl -i -X DELETE http://localhost:3035/hello

# 未知路径 → 404
curl -i http://localhost:3035/nope
```

## 验收清单

- [ ] 问题清单 5 条逐条「先答后验」：答对的划掉、答错的改、答不上的标注「留待 X」（`notes/day09.md` 可追溯）
- [ ] `/hello` → 200 `text/plain`；`/time` → 200 JSON，**两次请求 `epoch` 不同**
- [ ] `/echo` GET：query 被解析成**对象**（不是原始字符串）；无 query 时 `{}` 而不是 `null`
- [ ] `/echo` POST：body 回显成对象；空 body → 400（进程不崩）
- [ ] query 不影响 pathname 路由：`/echo?x=1` 仍命中 `/echo`（Day 8 C1 结论复现）
- [ ] 已知路径错误方法 → 405 + `Allow` 头；未知路径 → 404，不混用
- [ ] `new URL(...).searchParams` 已实际用过（代码或热身），并把行为写进 notes
- [ ] `notes/day09.md`：3 行笔记 + 问题清单消化结果 + `req`/EventEmitter 小结
- [ ] `pnpm typecheck` 通过 + git commit

## 运行

在 `01-node-core/` 下：

```bash
node day09/query-check.ts   # 热身（可选）
node day09/server.ts        # 交付
```

端口避免冲突：day02 占 8080、day03 占 3030、day05 占 3031、day06 占 3032、day07/day08 占 3033/3034，day09 用 **3035**。

坑：Node 24 直接跑 `.ts`（type stripping），别装 tsx / ts-node；相对导入写 `.ts` 扩展名；别用 `enum` / `namespace`（type stripping 不支持）。

## 今天不做（留给后面）

- 严格 `Content-Type: application/json`、body 大小限制 → Phase 2（Express 中间件）
- `GET /todos/:id` 单条查询、`PUT` 整体替换 → 有余力再做，不进验收
- 自动化测试框架（Vitest / supertest）→ Phase 4
- 持久化（写文件 / 数据库）→ Phase 3
- Day 10：验收自测 + 阶段复盘（不属今天）
