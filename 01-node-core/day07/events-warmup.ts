import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';

// 热身：req / res 都是 EventEmitter —— 对照 README「核心概念 1」跑通三件事
// 1. 自定义 EventEmitter：on / emit / once（跑完看控制台，once 第二次为何没打印？）
// 2. req 的 'data' / 'end' / 'error' 与上面是同一套 API
// 3. res 的 'finish'：响应全部写出时触发 —— 调试日志挂这里

const bus = new EventEmitter();

bus.on('tick', (n: number) => {
    console.log(`[bus] on   tick #${n}`);
});

bus.once('tick', () => {
    console.log('[bus] once tick（只该出现一次）');
});

bus.emit('tick', 1);
bus.emit('tick', 2);
// 期望输出：on #1 → once → on #2（once 触发一次后自动移除，on 还在）

const server = createServer((req, res) => {
    // res 也是 EventEmitter：'finish' = 响应完整写出
    res.on('finish', () => {
        console.log(`[res] finish ${req.method} ${req.url} → ${res.statusCode}`);
    });

    // 'close' = 连接关闭；客户端中途断开时可能只有 close 没有 finish
    res.on('close', () => {
        console.log(`[res] close  ${req.method} ${req.url}`);
    });

    const chunks: Buffer[] = [];

    req
        .on('error', (err) => {
            // Day 2 的坑：不监听 error，坏请求直接崩进程
            console.error('[req] error', err);
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'request error' }));
        })
        .on('data', (chunk: Buffer) => {
            // chunk 是 Buffer，不是 string —— 只 push，不在这里拼
            chunks.push(chunk);
        })
        .on('end', () => {
            // 'end' 之后再拼，才是完整 body
            const raw = Buffer.concat(chunks).toString();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
                JSON.stringify({
                    echo: raw,
                    note: "req/res 的 on 与 new EventEmitter() 是同一套 API",
                }),
            );
        });
});

server.listen(3033, () => {
    console.log('events-warmup is running at http://localhost:3033');
});
