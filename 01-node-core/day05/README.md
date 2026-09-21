# Day 5 · 完整静态服务器

## 学习材料

按顺序读，每篇只抓一件事：

| 顺序 | 文档 | 只抓 |
|---|---|---|
| 1 | [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) | Readable / Writable 怎么接数据；`readFile` vs `createReadStream` 的区别；`pipe` 一行完成读→写 |
| 2 | [Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) | 背压是什么（生产者比消费者快）；`pipe` 为什么能自动处理它 |
| 3 | API：[stream](https://nodejs.org/docs/latest-v24.x/api/stream.html) | 查用：`createReadStream` 选项、`pipeline` 签名、`'error'` 事件 |

- 中文对照：域名 `nodejs.org` → `nodejs.cn`，路径不变
- 逐日导读 + 常见坑：见 [../../study-plan.md](../../study-plan.md) 的 Day 5 行（重点：流的 `'error'` 不冒泡；防穿越 = `path.resolve` 后查前缀）

## 任务

1. 把 `day03/server.ts` 改造成 `day05/server.ts` 三件事：
   - 主路径改用 `fs.createReadStream` + `pipe` 返回文件（不再全量 `readFile`）
   - 保留 MIME 映射、404 / 500 语义
   - 加防路径穿越：`path.resolve` 出绝对路径后，校验仍在 `public/` 内，否则 403（或 404）
2. 素材：把 `day03/public/` 复制成 `day05/public/`；再用下面的命令生成一个大文件做实测
3. 收尾：`notes/day05.md` 写 3 行笔记 + 自答问题清单的 streams 那条 + 块 1（Day 2–5）小结

## 生成大文件（测试素材）

Windows 下瞬间生成 100MB（全零内容，够用来测流式）：

```powershell
fsutil file createnew day05\public\big.bin 104857600
```

## 验收清单

- [ ] 文件主路径用 `createReadStream` + `pipe`，不再 `readFile` 全量读入内存
- [ ] 流错误已处理（`pipeline` 或监听 `'error'`）：文件不存在不崩进程，读流出错走 500
- [ ] `/` → `public/index.html`；404 / 500 语义与 day03 一致
- [ ] 防路径穿越生效：`/../.env`、`/..%2f.env` 等都读不到 `public/` 外文件（被拒 403 / 404）
- [ ] 大文件实测：≥100MB 文件能完整下载；流式版与 day03 的 `readFile` 版内存占用对比有观察记录
- [ ] `notes/day05.md`：3 行笔记 + streams 问题自答（`Writable.write` 逐块 vs `await response.text()` 全量；背压为什么重要）+ 块 1 小结
- [ ] `pnpm typecheck` 通过 + git commit

## 运行

在 `01-node-core/` 下：

```bash
node day05/server.ts
```

端口避免冲突：day02 占 8080、day03 占 3030，建议 3031 起。

坑：Node 24 直接跑 `.ts`（type stripping），别装 tsx / ts-node；相对导入写 `.ts` 扩展名。

## 今天不做（留给后面）

- HTTP Range / 断点续传、gzip 压缩 → 以后按需
- 目录列表（自动列目录下文件）→ 不做
- 压测工具（ab / autocannon）→ Phase 5 再说
