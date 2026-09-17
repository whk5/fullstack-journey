# Day 1 · 环境与运行时认知（归档）

> 学习日期：2026-09-16 · 归档：2026-09-17

## 产出清单

| 文件 | 做什么 | 标注 | 备注 |
|---|---|---|---|
| `hello.ts` | 打印运行时信息（version / platform / cwd） | 自主完成 | 计划内交付物 |
| `server.ts` | 最小 http 服务器，固定响应 | 跟敲 | 改过响应文本；无路由、请求对象未用 |
| `get.ts` | 全局 `fetch` 请求 GitHub API 并打印仓库名 | 跟敲 | 残留下 jsonplaceholder 的示例注释，待清理 |
| `streams.ts` | `undici.stream()` + `Writable` 接收分块 | 跟敲 | 说是流式读取，实际把全部内容拼进字符串再 `JSON.parse` → 背压没体现 |
| `WebSocket.ts` | 原生 WebSocket 客户端（浏览器同款 API） | 跟敲 | 兴趣探索 → Phase 7 正式学 |
| `ws-server.ts` | `ws` 库 echo 服务器 | 跟敲 | 同上；`port` 变量和硬编码 8080 重复 |

> 标注说明：「跟敲」= 跟教程跑通，尚未脱离教程做变体；「自主完成」= 独立写出来的。

## 前端 vs Node 思维差异（初稿，待自己确认/补充）

- 运行时：浏览器 = DOM/BOM + 渲染引擎；Node = 无 DOM，但多了 `process`、`fs`、`net` 等系统能力
- 全局对象：`window`/`document` → `globalThis`/`process`/`Buffer`；`fetch` 现在两边都有
- 模块：统一 ESM；Node 24 原生跑 `.ts`（type stripping），相对导入要带 `.ts` 扩展名
- 并发模型：浏览器主线程 + Web Worker；Node 单线程事件循环 + 非阻塞 I/O（Day 4 深入）
- （自己补 1–2 条昨天体会到的差异）

## 遗留问题（已同步进 study-plan 问题清单）

- Node 单线程为什么能并发处理请求？→ Day 4 事件循环实验
- `streams.ts` 里逐块 `write` 和 `await response.text()` 的区别？背压为什么重要？→ Day 5
- 为什么 ws 服务器需要第三方库？Node 原生 WebSocket 和浏览器的有什么关系？→ Phase 7

## 下一步

- 块 1 · 静态文件服务器（Day 2–5）从 `server.ts` 扩展：多路由 `/hello`、`/time`、`/echo`
