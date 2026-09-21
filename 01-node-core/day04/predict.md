# Day 4 · 预测清单

> 规则：写 `order.ts` 之前先把「我的预测」填完；跑完再把「实际输出」「差异原因」补上。对不上的记入 [study-plan 问题清单](../../study-plan.md)。

## 用例 A · 混合顺序（必做）

一个文件里同时写：同步 `console.log`、`process.nextTick`、`Promise.then`、`setTimeout(..., 0)`、`setImmediate`。

| | 顺序 |
|---|---|
| 我的预测 | 1. → 2. → 3. → 4. → 5. |
| 实际输出 | |
| 差异原因 | |

## 用例 B · 主模块里 setTimeout(0) vs setImmediate（必做）

主模块里各排一个，谁先？官方说这个顺序「会因上下文而异」——建议单独一个文件连跑 10 次，看是否稳定。

| | 顺序 |
|---|---|
| 我的预测 | |
| 实际输出 | |
| 差异原因 | |

## 用例 C · 自选（可选加分）

自己设计一个变体，例如：嵌套 nextTick、Promise 里再排任务、I/O 回调（如 `fs.readFile`）里 setTimeout vs setImmediate。

| | 顺序 |
|---|---|
| 我的预测 | |
| 实际输出 | |
| 差异原因 | |
