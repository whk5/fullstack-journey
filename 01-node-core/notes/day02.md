# Day 2 · Anatomy HTTP 探索（归档）

> 学习日期：2026-09-17 · 归档：2026-09-18（日期不对请改）

## 产出清单

| 文件 | 做什么 | 标注 | 备注 |
|---|---|---|---|
| `createServer.ts` | Anatomy 文末 Echo 例子改编：把 headers / method / url / body 原样回显成 JSON | 跟敲 | 保留 `Access-Control-Allow-Origin: *`，方便浏览器 fetch 调试 |
| `client.html` | 调试页：表单提交 / fetch / 健康检查三种方式发请求，验证 `'data'` 是否触发 | AI 协助 | 附「预期现象」说明；表单提交走隐藏 iframe，响应只能去终端看 |

> 标注说明：「跟敲」= 跟教程跑通，尚未脱离教程做变体；「自主完成」= 独立写出来的。

## 3 行笔记

- **学会了**
  - `'data'` 只在请求带 body 时触发（GET 健康检查拿到空串，事件不触发）；chunk 是 Buffer
  - `Buffer.concat(chunks)` 里混入字符串会抛 TypeError 直接崩进程 —— 当天最有效的「案发现场」
  - `request.on('error')` 不监听，出错就崩进程
  - `method` / `url` / `headers`（key 全小写）直接从 request 取；`writeHead` + `write` + `end` 可合并成 `end(...)`
- **卡在哪**：`file://` 页面 fetch `localhost:8080` 被浏览器 CORS / 私有网络访问（PNA）拦截 → 改用 HTML 表单提交绕过（不经 fetch，不受 CORS 限制）
- **明天问什么**：`path.join` / `resolve` / `extname` 各自什么时候用；读文件失败为什么返回 404 而不是 500

## 遗留问题

- 课表原定交付物 `/hello`、`/time`、`/echo`（含 query 解析）未做 → 顺延 Day 9 补漏
- query 解析写法文章没讲：`new URL(request.url!, 'http://localhost')`（待自己动手验证）

## 下一步

- Day 3：静态文件服务器第一步 —— `path` + `fs.promises.readFile` + Content-Type 映射（测试素材已备在 `day03/public/`）
