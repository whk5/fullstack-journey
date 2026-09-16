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

完整课表见 [../study-plan.md](../study-plan.md)
