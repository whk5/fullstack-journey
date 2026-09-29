# Phase 2 · Express / REST

目标：把 Phase 1 用原生 `http` 写的静态服务器 + 内存 TODO，迁到 Express 5 并升级成分层 REST API（校验 + 日志 + 统一错误处理）。

## 环境要求

- Node 24 LTS（`nvm use 24` 切换）
- pnpm

## 运行与检查

```bash
pnpm dev               # node --watch src/index.ts（开发模式，改动自动重启）
node src/index.ts      # 直接跑
pnpm typecheck         # 全量类型检查
```

## 目录约定

- `src/`：源码（`index.ts` 入口；分层后：`routes/` · `controllers/` · `data/`）
- `test-matrix.md`：Day 8 的 curl 边界用例矩阵
- `notes/`：学习笔记（`dayXX.md`）

## 每日任务

Phase 2 已按项目驱动排成 10 天（3 块）：

1. 块 1 · Express 上手（Day 1–3）：脚手架 + `/echo` 迁移 → 路由 + 中间件 → 错误处理中间件
2. 块 2 · 分层 REST（Day 4–7）：routes/controllers/data 分层 → 校验层 → 日志 + 环境配置 → 完整 CRUD + CORS
3. 块 3 · 打磨 + 验收（Day 8–10）：curl 测试矩阵 → 缓冲消化 → 验收自测 + 复盘

完整课表见 [../study-plan.md](../study-plan.md)

## 技术决策

- Express **5**（async 错误自动转发给错误中间件，少踩 Express 4 的坑）
- 校验、日志用手写中间件（不引 zod / morgan，够用即止，Phase 3 再评估）
- Node 24 type stripping 限制延续：相对导入写 `.ts` 扩展名、不用 `enum` / `namespace`
