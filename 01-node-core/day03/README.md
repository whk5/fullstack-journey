# Day 3 · 返回磁盘文件

## 学习材料

- [File stats](https://nodejs.org/en/learn/manipulating-files/nodejs-file-stats) · [Reading files](https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs)
- API：[path](https://nodejs.org/docs/latest-v24.x/api/path.html) · [fs](https://nodejs.org/docs/latest-v24.x/api/fs.html)
- 逐日导读 + 常见坑：见 [../../study-plan.md](../../study-plan.md) 的 Day 3 行

## 任务

自己写 `day03/server.ts`：把 `public/` 下的文件按 URL 返回给浏览器。

## 验收清单

- [ ] URL → 磁盘路径用 `path.join` / `path.resolve`；扩展名用 `path.extname`
- [ ] 读文件用 `fs.promises.readFile`（回调版不写）
- [ ] Content-Type 映射：`.html` / `.css` / `.js` / `.png`（其他扩展名自己定策略，至少不崩）
- [ ] `/` 默认返回 `public/index.html`
- [ ] 读文件包在 try/catch：文件不存在 → 404（不是 500）；其他读失败 → 500
- [ ] 浏览器能看到：页面 + 样式 + 图片 + 按钮能读 `data.json`

## 运行

在 `01-node-core/` 下：

```bash
node day03/server.ts
```

端口自己挑：day02 的 Echo 占了 8080，建议换一个（如 3000）。

## 今天不做（留给后面）

- 防路径穿越 → Day 5
- `createReadStream` 流式返回大文件 + 背压 → Day 5
