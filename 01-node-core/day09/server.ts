import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Day 9 交付：补漏多路由服务器 —— 对照 README「核心概念」三节
// GET    /hello        → 200 纯文本（Content-Type: text/plain）
// GET    /time         → 200 JSON（iso + epoch，每次请求都不同）
// GET    /echo         → 200 JSON 回显 query（无 query 时是 {}，不是 null）
// POST   /echo         → 200 JSON 回显 body（空 body → 400）
// 已知路径 + 错误方法  → 405 + Allow
// 其他路径             → 404

const PORT = 3035;

// 统一 JSON 响应
function sendJson(res: ServerResponse, status: number, body: unknown): void {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

// 统一错误出口 —— 405 时可带 Allow 头（Day 7 的约定）
function sendError(res: ServerResponse, status: number, message: string, allow?: string): void {
    res.statusCode = status;
    if (allow !== undefined) {
        res.setHeader('Allow', allow);
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: message }));
}

// 概念 1（Day 6 复用）：JSON body 流式解析 —— 'end' 后再拼
function readJsonBody(
    req: IncomingMessage,
    onParsed: (value: unknown) => void,
    onFail: (message: string) => void,
): void {
    const chunks: Buffer[] = [];

    req
        .on('error', (err) => {
            console.error(err);
            onFail('request error');
        })
        .on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        })
        .on('end', () => {
            const raw = Buffer.concat(chunks).toString();

            if (raw === '') {
                onFail('empty body');
                return;
            }

            try {
                onParsed(JSON.parse(raw));
            } catch {
                onFail('invalid JSON');
            }
        });
}

const server = createServer((req, res) => {
    // 概念 2：new URL 拆 pathname（不含 query）和 searchParams
    // req.url 是 '/echo?name=foo' 这种相对串，必须给 base
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // 浏览器调试方便，保留 CORS 头（同 day02）
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (pathname === '/hello') {
        if (req.method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Hello, Node!');
            return;
        }
        sendError(res, 405, 'method not allowed', 'GET');
        return;
    }

    if (pathname === '/time') {
        if (req.method === 'GET') {
            const now = Date.now();
            // 每次请求都是当前时刻 —— 多打两次 curl 对比 epoch
            sendJson(res, 200, { iso: new Date(now).toISOString(), epoch: now });
            return;
        }
        sendError(res, 405, 'method not allowed', 'GET');
        return;
    }

    if (pathname === '/echo') {
        if (req.method === 'GET') {
            // 概念 2：Object.fromEntries(searchParams) —— 无 query 时是 {} 不是 null
            sendJson(res, 200, {
                method: 'GET',
                path: pathname,
                query: Object.fromEntries(url.searchParams),
            });
            return;
        }

        if (req.method === 'POST') {
            readJsonBody(
                req,
                (parsed) => {
                    sendJson(res, 200, {
                        method: 'POST',
                        path: pathname,
                        query: Object.fromEntries(url.searchParams),
                        body: parsed,
                    });
                },
                (message) => {
                    sendError(res, 400, message);
                },
            );
            return;
        }

        sendError(res, 405, 'method not allowed', 'GET, POST');
        return;
    }

    // 未知路径 → 404
    sendError(res, 404, 'not found');
});

server.listen(PORT, () => {
    console.log(`Day 9 multi-route server is running at http://localhost:${PORT}/`);
    console.log(`  GET /hello · GET /time · GET|POST /echo`);
});
