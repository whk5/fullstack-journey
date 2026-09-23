# Day 7 · TODO API：PATCH/DELETE + 统一错误处理

> 块 2 · 内存 TODO API（Day 6–8）第二天。GET/POST 已拿下，今天补全更新与删除，把「id 不存在」「方法不对」「body 非法」三类错误收进一套统一出口——做完再进 Day 8 全量测试就有靶子可打。

## 学习材料

按顺序读，每篇只抓一件事：

| 顺序 | 文档 | 只抓 |
|---|---|---|
| 1 | API：[events](https://nodejs.org/docs/latest-v24.x/api/events.html)（`EventEmitter`） | `on` / `emit` / `once` / `off` 四个方法；**`req`/`res` 本身就是 EventEmitter**——之前用的 `'data'`/`'end'`/`'error'` 全是它的事件 |
| 2 | [MDN：HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)（只看本表列出的 6 个） | 200 / 201 / **204** / 400 / 404 / **405** 各自语义；405 要带 `Allow` 头 |
| 3 | API：[http](https://nodejs.org/docs/latest-v24.x/api/http.html) | 查用：`res.on('finish')`、`res.on('close')`、`IncomingMessage` 的 `'error'` |

- 中文对照：域名 `nodejs.org` → `nodejs.cn`，路径不变；MDN 本身就是中文
- 逐日导读 + 常见坑：见 [../../study-plan.md](../../study-plan.md) 的 Day 7 行（重点：PATCH 只改传入的字段；id 不存在一律 404）

## 核心概念（动手前过一遍）

### 1. `req` / `res` 都是 EventEmitter

`req`（`IncomingMessage`）继承自 `Readable`，`res`（`ServerResponse`）继承自 `Writable`，两者最终都是 `EventEmitter`。前两天用的事件没一个是新的 API——全是同一套 `on`/`emit`：

| 对象 | 事件 | 何时触发 |
|---|---|---|
| `req` | `'data'` | body 到达一块（chunk 是 Buffer） |
| `req` | `'end'` | body 收完，可以拼了 |
| `req` | `'error'` | 请求出错（不监听 → 崩进程，Day 2 的坑） |
| `res` | `'finish'` | 响应**全部写出**时触发（调试日志挂这里） |
| `res` | `'close'` | 连接关闭（客户端中途断开时可能**不**触发 `'finish'`） |

热身跑 `day07/events-warmup.ts`：先看自定义 `EventEmitter` 的 `once` 第二次为何不触发，再对照 `req`/`res` 的事件表确认「都是同一套 API」。

### 2. 路由参数 + PATCH 部分更新

路由参数用正则从 `pathname` 里抠 id（day06 的 DELETE 已用过，今天 PATCH 复用同一套）：

```ts
const itemMatch = pathname.match(/^\/todos\/(\d+)$/);
// itemMatch === null  → /todos/abc、/todos/1x 等：id 不是纯数字 → 404
// itemMatch 非 null    → id = Number(itemMatch[1])，进数组查
```

**PATCH 只改传入的字段**（今天最大的坑）：

| body | 结果 |
|---|---|
| `{ "done": true }` | 只改 `done`，`title` 原样不动 |
| `{ "title": "新标题" }` | 只改 `title`，`done` 原样不动 |
| `{ "title": "x", "done": false }` | 两个都改 |
| `{}` / 空 body / 非法 JSON | 400（没有可改的字段，或根本不是 JSON） |
| `{ "done": "yes" }` | 400（`done` 必须是 boolean，类型校验别省） |
| id 在数组里找不到 | **404**（不是 400——请求格式对了，资源不存在） |

对照记忆：POST 校验「必须有 `title`」；PATCH 校验「**出现的**字段必须合法」，没出现的不碰。

### 3. 状态码语义（本阶段的完整表）

| 场景 | 方法 · 路径 | 状态码 | 响应体 |
|---|---|---|---|
| 列表 | `GET /todos` | 200 | JSON 数组 |
| 创建成功 | `POST /todos` | **201** | 新对象 |
| 更新成功 | `PATCH /todos/:id` | 200 | 更新后的完整对象 |
| 删除成功 | `DELETE /todos/:id` | **204** | **无 body**（`No Content`） |
| body 空 / 非法 JSON / 字段校验失败 | `POST`·`PATCH` | 400 | `{ "error": "..." }` |
| id 不存在 / 非数字 / 未知路径 | — | 404 | `{ "error": "..." }` |
| 路径认识、方法不支持（如 `PUT /todos`） | — | **405** + `Allow` 头 | `{ "error": "..." }` |

两条新语义：

- **204 = 成功但没有内容可回**。删完了就是删完了，不必再回 `{ deleted: 1 }`。代价：前端拿到 204 调 `res.json()` 会抛 `SyntaxError`（body 是空串）——照搬 day06 调试页时要先判 `res.status === 204`
- **405 ≠ 404**。`PUT /todos`：路径 `/todos` 是认识的，只是不支持 PUT → 405，并用 `Allow: GET, POST` 告诉客户端支持什么；`/nope` 这种路径压根不认识 → 404

### 4. 统一错误处理

day06 的错误出口散在各处（有的 `sendJson`、有的裸 `end`、死代码 `deleteTodo` 没人调用）。今天收成一条路：

```ts
function sendJson(res, status, body): void { /* day06 已有，保持 */ }
function sendError(res, status, message): void {
    sendJson(res, status, { error: message }); // 所有错误只有这一个出口
}
```

规则：

- 业务错误（400 / 404 / 405）→ 一律 `sendError`
- `req.on('error')` → 读 body 阶段挂了 → `sendError(res, 400, ...)`，**绝不能崩进程**
- id 提取 + `findIndex` 查找抽成小函数，PATCH / DELETE 共用——两处 404 判断只写一次
- 顺手删掉 day06 里没被调用的 `deleteTodo` 函数（死代码）

## 任务

1. 热身：跑 `day07/events-warmup.ts`——确认自定义 `emit` 两条日志、`once` 只打一次、POST 一个 body 后终端出现 `res finish`；再对照概念 1 的表把用过的事件各标一行「它是 EventEmitter 事件」
2. 交付：把 `day06/server.ts` 拷成 `day07/server.ts`，改造四件事：
   - 新增 `PATCH /todos/:id`：部分更新 + 字段校验 + 404（概念 2）
   - `DELETE` 成功改回 **204 无 body**（同时前端/调试页若拷贝要适配）
   - 已知路径错误方法 → **405 + `Allow` 头**；未知路径 → 404（概念 3 两者的分界）
   - 错误出口收敛到 `sendError`；id 查找抽公共函数；删死代码（概念 4）
3. 收尾：`notes/day07.md` 写 3 行笔记（学会了 / 卡在哪 / 明天问什么）→ `pnpm typecheck` → git commit → 喊 AI review

## curl 快测

服务跑起来后，另开一个终端：

```bash
# PATCH 只传 done → 期望 200，返回对象里 title 没变、done: true
curl -i -X PATCH http://localhost:3033/todos/1 -H "Content-Type: application/json" -d '{"done":true}'

# PATCH 不存在的 id → 期望 404
curl -i -X PATCH http://localhost:3033/todos/999 -H "Content-Type: application/json" -d '{"done":true}'

# PATCH done 类型错 → 期望 400
curl -i -X PATCH http://localhost:3033/todos/1 -H "Content-Type: application/json" -d '{"done":"yes"}'

# DELETE 成功 → 期望 204，响应体为空（-i 才能看到状态行）
curl -i -X DELETE http://localhost:3033/todos/2

# 已知路径 + 不支持的方法 → 期望 405 且响应头有 Allow
curl -i -X PUT http://localhost:3033/todos -H "Content-Type: application/json" -d '{}'

# id 非数字 → 期望 404（不是 500）
curl -i -X DELETE http://localhost:3033/todos/abc
```

## 验收清单

- [ ] `PATCH /todos/:id` 只更新**传入**的字段；未传的字段原样保留（curl 第 1 条可验证）
- [ ] PATCH 字段校验：`done` 非 boolean / `title` 非非空 string / `{}` / 空 body / 非法 JSON → 400；进程不崩
- [ ] id 不存在或非数字 → 404（PATCH、DELETE 两条路径都验过）
- [ ] DELETE 成功 → **204 且无响应体**（不是 200 + JSON）
- [ ] 已知路径错误方法 → 405，且响应头含 `Allow`（`curl -i` 看得到）
- [ ] 未知路径 → 404，与 405 语义不混用
- [ ] 所有错误响应走同一个 `sendError`；无裸 `res.end` 散落；day06 死代码 `deleteTodo` 已删
- [ ] 能对照 events 文档说出 `req`/`res` 上至少 3 个事件属于 EventEmitter，以及 `finish` vs `close` 的区别
- [ ] `notes/day07.md`：3 行笔记
- [ ] `pnpm typecheck` 通过 + git commit

## 运行

在 `01-node-core/` 下：

```bash
node day07/events-warmup.ts
node day07/server.ts
```

端口避免冲突：day02 占 8080、day03 占 3030、day05 占 3031、day06 占 3032，建议 **3033**。

坑：Node 24 直接跑 `.ts`（type stripping），别装 tsx / ts-node；相对导入写 `.ts` 扩展名；别用 `enum` / `namespace`（type stripping 不支持）。

可选：拷贝 `day06/public/` 到 `day07/public/` 当调试台——记得改端口引用（3032 → 3033）、标题改 Day 7、DELETE 分支适配 204（先判状态码再 `.json()`）、可顺手加一个 PATCH 按钮。

## 今天不做（留给后面）

- curl 全量边界矩阵、非法 Content-Type、复杂 URL → Day 8
- `GET /todos/:id` 单条查询、`PUT` 整体替换（与 PATCH 对比）→ 有余力再做，不进验收
- body 大小限制、只收 `Content-Type: application/json` → Phase 2（Express 中间件做）
- 持久化（写文件 / 数据库）→ Phase 3
