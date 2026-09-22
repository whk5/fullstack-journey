# Day 6 · TODO API：GET 列表 + POST 创建

> 块 2 · 内存 TODO API（Day 6–8）开工日。静态服务器到此为止，今天起写 REST API：先拿下「收 JSON body」和「状态码语义」两件事。

## 学习材料

按顺序读，每篇只抓一件事：

| 顺序 | 文档 | 只抓 |
|---|---|---|
| 1 | 重读 [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) 的 **Request Body** 段 | body 是流：`'data'` 一块块到（chunk 是 **Buffer**），`'end'` 之后再拼；`'error'` 必须监听 |
| 2 | [MDN：HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)（方法、状态码速览） | GET / POST 语义；200 vs 201 vs 400 各代表什么 |
| 3 | API：[http](https://nodejs.org/docs/latest-v24.x/api/http.html) | 查用：`IncomingMessage` 就是可读流；`res.writeHead` / `statusCode` / `setHeader` |

- 中文对照：域名 `nodejs.org` → `nodejs.cn`，路径不变；MDN 本身就是中文
- 逐日导读 + 常见坑：见 [../../study-plan.md](../../study-plan.md) 的 Day 6 行

## 核心概念（动手前过一遍）

### 1. JSON body 流式解析

`req` 是可读流，body 不会一次性给你，而是 `'data'` 事件一块一块到。**`'end'` 之后再拼**，拼完才是完整字符串：

```ts
const chunks: Buffer[] = [];
req
    .on('error', () => { /* 坏请求回 400，别让进程崩 */ })
    .on('data', (chunk: Buffer) => { chunks.push(chunk); })
    .on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        // raw === ''           → 空 body，400
        // JSON.parse(raw) 抛错 → 非法 JSON，400
        // 解析成功             → 继续校验 title
    });
```

三个坑（Day 2 踩过 + study-plan 点名）：

- chunk 是 **Buffer** 不是 string；`Buffer.concat` 里混进字符串直接抛 TypeError 崩进程
- 空 body：GET 根本没 body，`'data'` 不触发；POST 空 body 时 `raw === ''`，`JSON.parse('')` 会抛错 → 先判空
- `'error'` 不监听，一个坏请求就崩掉整个进程

### 2. 内存存储

不碰磁盘、不碰数据库，进程内存放个数组就行（重启即清空，这是刻意的）：

```ts
type Todo = { id: number; title: string; done: boolean };

const todos: Todo[] = [];
let nextId = 1; // 创建时 id 自增
```

### 3. 路由分发 + 状态码语义

无框架 = 手写 `method` + `pathname` 判断：

| 场景 | 方法 · 路径 | 状态码 | 响应体 |
|---|---|---|---|
| 列表 | `GET /todos` | 200 | JSON 数组（空列表是 `[]` 不是 `null`） |
| 创建成功 | `POST /todos` | **201** | 新对象（含 `id`、`done: false`） |
| 空 body / 非法 JSON / 缺 `title` | `POST /todos` | 400 | 错误信息 |
| 其他路径或方法 | — | 404 | （405 留 Day 7） |

- **创建成功是 201 不是 200**——今天最容易忘的一条
- JSON 响应记得 `Content-Type: application/json; charset=utf-8`，否则 `curl` 拿到的是纯文本

## 任务

1. 热身：写 `day06/body-parse.ts` —— 最小回显：POST 任意 JSON 原样返回解析结果；把「正常 JSON / 空 body / 非法 JSON」三条路径都跑通（照概念 1 的骨架填实，这是「跟敲」步）
2. 交付：写 `day06/server.ts` —— 内存 TODO API：
   - `GET /todos` → 200 + 数组
   - `POST /todos` → 校验 + 创建 → 201（失败一律 400）
   - 其他路径 / 方法 → 404
3. 收尾：`notes/day06.md` 写 3 行笔记（学会了 / 卡在哪 / 明天问什么）→ `pnpm typecheck` → git commit → 喊 AI review

## curl 快测

服务跑起来后，另开一个终端：

```bash
# 创建 → 期望 201，响应含 id
curl -i -X POST http://localhost:3032/todos -H "Content-Type: application/json" -d '{"title":"学 Node"}'

# 列表 → 期望 200，数组里有上面那条
curl -i http://localhost:3032/todos

# 空 body → 期望 400
curl -i -X POST http://localhost:3032/todos

# 非法 JSON → 期望 400
curl -i -X POST http://localhost:3032/todos -H "Content-Type: application/json" -d '{title}'

# 缺 title → 期望 400
curl -i -X POST http://localhost:3032/todos -H "Content-Type: application/json" -d '{}'
```

完整边界用例（405、不存在的 id 等）→ Day 8 再说。

## 验收清单

- [ ] `GET /todos` → 200 + JSON 数组；空列表是 `[]` 不是 `null`
- [ ] `POST /todos` 带 `{ "title": "..." }` → **201** + 新对象（含自增 `id`、`done: false`）
- [ ] body 用 `req.on('data'/'end')` 流式收集、`'end'` 后 `Buffer.concat` 拼（不引入任何 body 解析库）
- [ ] 空 body / 非法 JSON / 缺 `title` → 400，进程不崩
- [ ] JSON 响应头 `Content-Type: application/json; charset=utf-8`
- [ ] `req.on('error')` 已监听
- [ ] 其他路径 / 方法 → 404
- [ ] `notes/day06.md`：3 行笔记
- [ ] `pnpm typecheck` 通过 + git commit

## 运行

在 `01-node-core/` 下：

```bash
node day06/body-parse.ts
node day06/server.ts
```

端口避免冲突：day02 占 8080、day03 占 3030、day05 占 3031，建议 **3032**。

坑：Node 24 直接跑 `.ts`（type stripping），别装 tsx / ts-node；相对导入写 `.ts` 扩展名；别用 `enum` / `namespace`（type stripping 不支持）。

## 今天不做（留给后面）

- PATCH / DELETE / 路由参数（`/todos/:id`）→ Day 7
- 405（方法不支持）、id 不存在一律 404、统一错误处理 → Day 7
- curl 全量边界测试 → Day 8
- body 大小限制、只收 `Content-Type: application/json` → Phase 2（Express 中间件做）
- 持久化（写文件 / 数据库）→ Phase 3
