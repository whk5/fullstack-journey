import { createServer } from 'node:http';

// 热身：最小 JSON body 回显 —— 对照 README「核心概念 1」的骨架填实
// 三条路径：正常 JSON → 200 回显 / 空 body → 400 / 非法 JSON → 400

const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const chunks: Buffer[] = [];

    req
        .on('error', (err) => {
            // Day 2 的坑：不监听 error，坏请求直接崩进程
            console.error(err);
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'request error' }));
        })
        .on('data', (chunk: Buffer) => {
            // chunk 是 Buffer，不是 string —— 只 push，不在这里拼
            chunks.push(chunk);
        })
        .on('end', () => {
            // 'end' 之后再拼，才是完整 body
            const raw = Buffer.concat(chunks).toString();

            // 路径 2：空 body（GET 没有 body；POST 不带 -d 也是这里）
            if (raw === '') {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'empty body' }));
                return;
            }

            // 路径 1 / 3：JSON.parse 成功 = 回显；抛错 = 非法 JSON
            try {
                const parsed = JSON.parse(raw);
                res.statusCode = 200;
                res.end(JSON.stringify(parsed));
            } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'invalid JSON' }));
            }
        });
});

server.listen(3032, () => {
    console.log('body-parse is running at http://localhost:3032');
});
