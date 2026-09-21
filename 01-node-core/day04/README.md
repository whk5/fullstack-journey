# Day 4 · 事件循环实验

## 学习材料

按顺序读，每篇只抓一件事：

| 顺序 | 文档 | 只抓 |
|---|---|---|
| 1 | [Discover JavaScript Timers](https://nodejs.org/en/learn/asynchronous-work/discover-javascript-timers) | 定时器从哪来；延迟为什么不准（受事件循环影响） |
| 2 | [Understanding process.nextTick()](https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick) | nextTick 插队在哪（比 Promise.then 还早）；递归 nextTick 会饿死事件循环 |
| 3 | [Understanding setImmediate()](https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate) | setImmediate vs setTimeout(0)，在 I/O 回调内外谁先 |
| 4 | [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) | 收口：阶段顺序 + 同步 → nextTick → 微任务 → 宏任务，够用即停 |

- 中文对照：域名 `nodejs.org` → `nodejs.cn`，路径不变
- 逐日导读 + 常见坑：见 [../../study-plan.md](../../study-plan.md) 的 Day 4 行

## 任务

1. 先在 `day04/predict.md` 写预测（**不许先跑**）
2. 写 `day04/order.ts`，验证 nextTick / Promise.then / setImmediate / setTimeout 的输出顺序
3. 对不上的记入问题清单；顺手自答「Node 单线程为什么能并发处理请求」

## 验收清单

- [ ] 预测先于运行写出（`predict.md` 有完整预测表）
- [ ] 覆盖 4 类：同步 → nextTick → Promise.then → setTimeout / setImmediate
- [ ] 含「主模块里 setTimeout(0) vs setImmediate 谁先」用例（连跑多次观察是否稳定）
- [ ] 跑出实际顺序，与预测逐条对照，差异有自己的解释
- [ ] 问题清单 Day 4 项有自答（写进 `notes/day04.md` 收尾时）

## 运行

在 `01-node-core/` 下：

```bash
node day04/order.ts
```

坑：Node 24 直接跑 `.ts`（type stripping），别装 tsx / ts-node。

## 今天不做（留给后面）

- 不深挖 libuv 源码 / 全部相位细节 —— 抓「同步 → nextTick → 微任务 → 宏任务」规律，够用就行
- 进程/线程层面的并发实现（Worker、cluster）→ Phase 7
