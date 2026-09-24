# Day 8 · curl 全量测试 + 边界矩阵

> 块 2 · 内存 TODO API（Day 6–8）收口日。功能昨天已齐，今天**只测不扩**：用 `curl -i` 把正常路径和边界全打一遍，留下可复查的用例矩阵，并把矩阵固化成可重复回归脚本。做完顺手写块 2 小结。

## 学习材料

按顺序读，每篇只抓一件事：

| 顺序 | 文档 | 只抓 |
|---|---|---|
| 1 | [MDN：HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)（复习 Day 7 那 6 个） | 200 / 201 / 204 / 400 / 404 / 405 的语义边界；**404 vs 405** 再对一遍 |
| 2 | [MDN：HTTP 请求头](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers)（只看 `Content-Type`、`Allow`） | `Content-Type` 描述 **body 是什么格式**；`Allow` 是 405 时告诉客户端「这路径支持啥」 |
| 3 | 终端 `curl --help` 或 [curl 手册](https://curl.se/docs/manpage.html)（查用） | `-i` 打印响应头、`-X` 指定方法、`-H` 加头、`-d` 发 body、`-v` 看完整事务 |

- 中文对照：域名 `nodejs.org` → `nodejs.cn`，路径不变；MDN 本身就是中文
- 逐日导读 + 常见坑：见 [../../study-plan.md](../../study-plan.md) 的 Day 8 行（重点：`curl -i` 看响应头；先测正常路径，再测边界）

## 核心概念（动手前过一遍）

### 1. `curl -i` 在看什么

```bash
curl -i -X PATCH http://localhost:3034/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```

`-i` 会把**响应头原样打出来**，四个位置必须扫一眼：

| 位置 | 看什么 | 本 API 的预期 |
|---|---|---|
| 状态行 | `HTTP/1.1 <code>` | 与矩阵「期望」列一致 |
| `Content-Type` | 成功/错误 JSON 响应 | `application/json; charset=utf-8` |
| `Allow` | **仅 405** 时应出现 | `/todos` → `GET, POST`；`/todos/:id` → `PATCH, DELETE` |
| 响应体 | 204 必须**空**；4xx 应有 `{ "error": "..." }` | 204 时 `-i` 后只有状态行和头，没有 JSON |

只看状态码不够：405 没有 `Allow` 头算半残，204 带了 body 算错。

### 2. 测试顺序：正常 → 边界

| 阶段 | 打什么 | 目的 |
|---|---|---|
| A · 正常路径 | GET 列表 → POST 创建 → PATCH 更新 → DELETE 删除 | 先证明主路径是通的；坏了先修功能，别急着测边界 |
| B · 边界 | 非法 JSON / 空 body / 字段类型错 / 不存在 id / 错误方法 | 主路径稳了再打；每条只变**一个**因素 |
| C · 怪 URL / 怪头 | query、尾斜杠、编码 id、非 `application/json` 的 Content-Type | 记录**现状**，不强制改代码（严格 Content-Type → Phase 2） |

一条用例只动一个变量。PATCH 测「id 不存在」时，body 就用合法的 `{"done":true}`——否则 400 和 404 会搅在一起。

### 3. 边界矩阵怎么设计

完整表在 [test-matrix.md](./test-matrix.md)。设计原则：

| 原则 | 反例 |
|---|---|
| 每行一个明确期望 | 「应该报错」→ 改成「400 + `error` 含 empty body」 |
| 覆盖每个状态码至少一次 | 只测 200/201，不测 204/405 |
| 覆盖每个路由分支 | 只测 `/todos`，忘了 `/todos/:id` 和未知路径 |
| 破坏性用例放后面 | 先 DELETE 再 GET，后面的列表断言全废 |
| 现状 ≠ 正确语义 | 非 JSON Content-Type 现在也能解析成功——矩阵里标「现状」，别写成「必须 201」 |

### 4. 非法 Content-Type / 复杂 URL（今天只记录）

day07 留给今天的两类「怪请求」：

| 类型 | 例子 | day07 现状 | 今天怎么做 |
|---|---|---|---|
| 非法 / 缺失 Content-Type | `text/plain`、不带头，body 却是 JSON | **照解析**（不校验头） | 矩阵标「现状」，记下实际状态码；严格拒绝 → Phase 2 |
| 复杂 URL | `/todos?x=1`、`/todos/`、`/todos/01`、`/todos/%31` | 路由只看 `pathname` + 纯数字 id 正则 | 逐条跑，把「匹配到谁 / 404 / 405」记进矩阵 |

`new URL(req.url, ...).pathname` 会丢掉 query、**不会**解码 `%31`——所以 `/todos/%31` 不等于 `/todos/1`。这类细节靠实测记下来，比背结论有用。

## 任务

1. 热身：打开 [test-matrix.md](./test-matrix.md)，**先填「期望」列**（不许先跑）；至少覆盖 A 正常 4 条 + B 边界里非法 JSON、不存在 id、错误方法三类
2. 交付一（手测）：启动 `day08/server.ts`，按矩阵顺序用 `curl -i` 逐条打，把状态码 / `Allow` / body 形状写进「实际」列；对不上的**先改代码或记问题**，不要改期望来凑
3. 交付二（固化）：把矩阵写成 `day08/run-cases.ts`（用全局 `fetch`，见下方骨架），`node day08/run-cases.ts` 一键跑完并打印 PASS/FAIL——这是「脱教程」步，以后改 API 就跑它
4. 收尾：`notes/day08.md` 写 3 行笔记 + **块 2（Day 6–8）小结**（TODO API 会了什么 / 状态码语义 / 还欠什么）→ `pnpm typecheck` → git commit → 喊 AI review

## curl 全量快测（按顺序打）

服务跑起来后，另开一个终端。端口 **3034**。

```bash
# ========== A · 正常路径 ==========

# A1 列表 → 200 + JSON 数组（含种子数据）
curl -i http://localhost:3034/todos

# A2 创建 → 201 + 新对象（id 自增、done: false）
curl -i -X POST http://localhost:3034/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"写测试矩阵"}'

# A3 部分更新 → 200；只改 done，title 不变
curl -i -X PATCH http://localhost:3034/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"done":true}'

# A4 删除 → 204 且响应体为空（-i 才看得到状态行）
curl -i -X DELETE http://localhost:3034/todos/2

# ========== B · 边界 ==========

# B1 空 body → 400
curl -i -X POST http://localhost:3034/todos

# B2 非法 JSON → 400
curl -i -X POST http://localhost:3034/todos \
  -H "Content-Type: application/json" \
  -d '{title}'

# B3 缺 title → 400
curl -i -X POST http://localhost:3034/todos \
  -H "Content-Type: application/json" \
  -d '{}'

# B4 PATCH 非法 JSON → 400（body 先坏掉，别和 404 混）
curl -i -X PATCH http://localhost:3034/todos/1 \
  -H "Content-Type: application/json" \
  -d 'not-json'

# B5 PATCH 不存在的 id → 404（body 合法，只变 id）
curl -i -X PATCH http://localhost:3034/todos/999 \
  -H "Content-Type: application/json" \
  -d '{"done":true}'

# B6 DELETE 不存在的 id → 404
curl -i -X DELETE http://localhost:3034/todos/999

# B7 id 非数字 → 404（不是 500）
curl -i -X DELETE http://localhost:3034/todos/abc

# B8 已知路径 + 不支持的方法 → 405，响应头必须有 Allow: GET, POST
curl -i -X PUT http://localhost:3034/todos \
  -H "Content-Type: application/json" \
  -d '{}'

# B9 条目上打 GET → 405 + Allow: PATCH, DELETE（没做单条查询，不是 200）
curl -i http://localhost:3034/todos/1

# B10 未知路径 → 404（和 405 分清）
curl -i http://localhost:3034/nope

# ========== C · 怪 URL / 怪头（记现状） ==========

# C1 query 不影响路由 → 应与 GET /todos 相同
curl -i "http://localhost:3034/todos?done=true&page=2"

# C2 尾斜杠 → 现状多为 404（正则/精确匹配都不认）
curl -i http://localhost:3034/todos/

# C3 前导零 id → 现状常能匹配到 id=1（\d+ 吃掉 01，Number('01')===1）
curl -i -X DELETE http://localhost:3034/todos/01

# C4 编码 id：%31 是字符 '1' 的编码，pathname 不解码 → 多为 404
curl -i -X DELETE http://localhost:3034/todos/%31

# C5 非 JSON Content-Type + JSON body → day07 现状：照解析（可能 201）
curl -i -X POST http://localhost:3034/todos \
  -H "Content-Type: text/plain" \
  -d '{"title":"怪头"}'

# C6 完全不带 Content-Type → 同上，记现状
curl -i -X POST http://localhost:3034/todos \
  -d '{"title":"无头"}'
```

## 回归脚本骨架（交付二）

`day08/run-cases.ts` 建议长这样——**你来把矩阵填进 `cases`**：

```ts
const BASE = 'http://localhost:3034';

type Case = {
    id: string;              // A1、B5…
    name: string;
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: string;
    expectStatus: number;
    expectAllow?: string;    // 405 时断言 Allow 头
    expectEmptyBody?: boolean; // 204
    expectBodyHas?: string;    // 响应体包含某子串
};

const cases: Case[] = [
    // 从 test-matrix.md 逐行搬进来；破坏性用例放最后
];

for (const c of cases) {
    const res = await fetch(BASE + c.path, {
        method: c.method,
        headers: c.headers,
        body: c.body,
    });
    const text = await res.text();
    // 对比 res.status / res.headers.get('allow') / text
    // 打印 PASS 或 FAIL + 期望 vs 实际
}
```

## 验收清单

- [ ] `test-matrix.md`「期望」列先于运行填完；「实际」列无空行（C 组现状也要写）
- [ ] A 组正常路径全绿：200 / 201 / 200 / 204
- [ ] 非法 JSON、空 body、缺 `title` → 400，进程不崩
- [ ] 不存在 id、非数字 id → 404（PATCH / DELETE 都验过）
- [ ] 错误方法 → 405，且 `curl -i` 看得到 **`Allow` 头**（集合与条目两条都验）
- [ ] 未知路径 → 404，与 405 不混用
- [ ] 204 响应体为空；JSON 响应 `Content-Type: application/json; charset=utf-8`
- [ ] C 组怪 URL / 怪头至少 4 条，矩阵里标了「现状」
- [ ] `run-cases.ts` 能一键跑完矩阵并输出 PASS/FAIL；故意改坏一条期望会 FAIL
- [ ] `notes/day08.md`：3 行笔记 + **块 2 小结**
- [ ] `pnpm typecheck` 通过 + git commit

## 运行

在 `01-node-core/` 下：

```bash
node day08/server.ts     # 被测服务（day07 快照，端口 3034）
node day08/run-cases.ts  # 交付二：回归脚本
```

端口避免冲突：day02 占 8080、day03 占 3030、day05 占 3031、day06 占 3032、day07 约定 3033，day08 用 **3034**。

坑：Node 24 直接跑 `.ts`（type stripping），别装 tsx / ts-node；相对导入写 `.ts` 扩展名；别用 `enum` / `namespace`。`fetch` 是全局的，不用引 undici。

`day08/server.ts` 是 day07 的**被测快照**——今天原则上不改业务逻辑；测出真 bug 才动它，并在矩阵「备注」里写清改了什么。

## 今天不做（留给后面）

- 严格校验 `Content-Type: application/json`、body 大小限制 → Phase 2（Express 中间件）
- `GET /todos/:id` 单条查询、`PUT` 整体替换 → 有余力再做，不进验收
- 自动化测试框架（Vitest / supertest）→ Phase 4
- 持久化（写文件 / 数据库）→ Phase 3
- Day 9–10：问题清单消化 + 验收自测（块 2 小结今天先写）
