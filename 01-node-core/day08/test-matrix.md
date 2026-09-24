# Day 8 · 边界用例矩阵

> 规则：跑 `curl` **之前**先把「期望」列填完；跑完再补「实际」「备注」。对不上的先改代码或记问题，**不要改期望来凑**。C 组标「现状」= day07 不校验，只记录实际行为。

被测：`day08/server.ts`（`http://localhost:3034`）· 配套：[README](./README.md)

## A · 正常路径

| # | 用例 | 请求 | 期望状态 | 期望头 / body | 实际 | 备注 |
|---|---|---|---|---|---|---|
| A1 | 列表 | `GET /todos` | 200 | `Content-Type: application/json`；body 是数组 | | 种子 4 条 |
| A2 | 创建 | `POST /todos` `{"title":"写测试矩阵"}` | **201** | body 含新 `id`、`done: false` | | |
| A3 | 部分更新 | `PATCH /todos/1` `{"done":true}` | 200 | body 里 `done: true`，`title` **不变** | | |
| A4 | 删除 | `DELETE /todos/2` | **204** | **无 body**（`-i` 只见状态行+头） | | 破坏性，放后 |

## B · 边界

| # | 用例 | 请求 | 期望状态 | 期望头 / body | 实际 | 备注 |
|---|---|---|---|---|---|---|
| B1 | 空 body 创建 | `POST /todos`（无 `-d`） | 400 | `{ "error": ... }` | | |
| B2 | 非法 JSON 创建 | `POST /todos` `-d '{title}'` | 400 | 同上 | | |
| B3 | 缺 `title` | `POST /todos` `-d '{}'` | 400 | 同上 | | |
| B4 | `title` 非字符串 | `POST /todos` `-d '{"title":123}'` | 400 | 同上 | | |
| B5 | PATCH 非法 JSON | `PATCH /todos/1` `-d 'not-json'` | 400 | 同上 | | body 先坏，别和 404 混 |
| B6 | PATCH 空对象 | `PATCH /todos/1` `-d '{}'` | 400 | nothing to update | | |
| B7 | `done` 类型错 | `PATCH /todos/1` `-d '{"done":"yes"}'` | 400 | 同上 | | |
| B8 | PATCH 不存在 id | `PATCH /todos/999` `{"done":true}` | **404** | `{ "error": ... }` | | body 合法，只变 id |
| B9 | DELETE 不存在 id | `DELETE /todos/999` | **404** | 同上 | | |
| B10 | id 非数字 | `DELETE /todos/abc` | **404**（不是 500） | 同上 | | |
| B11 | 集合上 PUT | `PUT /todos` | **405** | 头含 `Allow: GET, POST` | | |
| B12 | 条目上 GET | `GET /todos/1` | **405** | 头含 `Allow: PATCH, DELETE` | | 没做单条查询 |
| B13 | 未知路径 | `GET /nope` | 404 | 无 `Allow`（或不作为断言点） | | 与 405 分清 |
| B14 | 集合上 DELETE | `DELETE /todos` | **405** | `Allow: GET, POST` | | |

## C · 怪 URL / 怪头（记录现状）

| # | 用例 | 请求 | 期望（或标现状） | 实际 | 备注 |
|---|---|---|---|---|---|
| C1 | query 附加 | `GET /todos?done=true&page=2` | 应与 A1 同（200 + 数组） | | `pathname` 丢掉 search |
| C2 | 集合尾斜杠 | `GET /todos/` | 现状：多半 404 | | 精确匹配 `/todos` 不认 `/todos/` |
| C3 | 条目尾斜杠 | `DELETE /todos/1/` | 现状：多半 404 | | 正则 `^\/todos\/(\d+)$` 不认 |
| C4 | 前导零 id | `DELETE /todos/01`（或 `/todos/0{夹具id}`） | 现状：当成 id=1 → 204 | | `\d+` 吃 `01`，`Number('01')===1`；回归脚本用自建夹具保证可重复 |
| C5 | 编码 id | `DELETE /todos/%31` | 现状：多半 404 | | pathname **不解码** `%31` |
| C6 | 小数 id | `PATCH /todos/1.5` | 现状：404 | | `\d+` 不吃小数点 |
| C7 | 路径穿越形 | `GET /todos/../todos` | 现状：URL 规范化后像 `GET /todos` | | 记实际 pathname 行为 |
| C8 | 大小写 | `GET /TODOS` | 现状：404 | | 路由区分大小写 |
| C9 | 非 JSON 头 | `POST /todos` `Content-Type: text/plain` + 合法 JSON | 现状：可能 **201**（不校验头） | | 严格拒绝 → Phase 2 |
| C10 | 无 Content-Type | `POST /todos` 不带头 + 合法 JSON | 现状：可能 **201** | | 同上 |
| C11 | 头写 charset | `POST /todos` `Content-Type: application/json; charset=utf-8` | 201 | | 正常变体，应成功 |
| C12 | 方法小写 | 某些客户端发 `get` | 现状：多半 405/404 | | HTTP 方法通常大写；记现状 |

## 汇总（跑完填）

| 状态码 | 覆盖用例 | 是否每码至少一条 |
|---|---|---|
| 200 | | |
| 201 | | |
| 204 | | |
| 400 | | |
| 404 | | |
| 405 | | |

| 检查项 | 结果 |
|---|---|
| 进程全程未崩 | |
| 405 都带了 `Allow` | |
| 204 都无 body | |
| 与期望不一致的条数 | |
| 真 bug（改了 server）条数 | |
