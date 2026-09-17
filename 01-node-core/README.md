# Phase 1 · Node 核心

目标：理解 Node 运行时（事件循环 / 非阻塞 I/O），用原生 API（无框架）做出两个产出：

1. 静态文件服务器
2. 内存版 TODO REST API

## 环境要求

- Node 24 LTS（`nvm use 24` 切换）
- pnpm

## 运行与检查

```bash
node day01/hello.ts      # Node 24 原生运行 .ts（type stripping，无需编译）
pnpm typecheck           # 全量类型检查
```

## 目录约定

- `day01/`–`day10/`：每天一个目录，当天的交付物放里面
- `notes/`：学习笔记（`dayXX.md`）

## 每日任务

Phase 1 已按项目驱动重排（概念随用随补，每天以可交付小产出收尾）：

1. 块 1 · 静态文件服务器（Day 2–5）：多路由 → 读文件 → 事件循环实验 → 流式静态服务器
2. 块 2 · 内存 TODO API（Day 6–8）：CRUD + JSON 解析 + 错误处理 + curl 测试
3. Day 9–10 缓冲：问题清单消化 + 验收自测

完整课表见 [../study-plan.md](../study-plan.md)
