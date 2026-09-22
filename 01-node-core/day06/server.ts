import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Day 6 交付：内存 TODO API —— 对照 README「核心概念」三节 + 页面删除
// GET    /todos     → 200 + 数组（空列表是 [] 不是 null）
// POST   /todos     → 校验 + 创建 → 201（空 body / 非法 JSON / 缺 title → 400）
// DELETE /todos/:id → 按 id 删 → 200（id 不存在 → 404）
// 其他路径 / 方法 → 404（405、PATCH 留 Day 7）

type Todo = { id: number; title: string; done: boolean };

// 概念 2：内存存储 —— 进程内数组，重启即清空是刻意的
const todos: Todo[] = [{ id: 1, title: '学习 Node.js', done: false }, { id: 2, title: '学习 TypeScript', done: false }, { id: 3, title: '学习 React', done: false }, { id: 4, title: '学习 Vue', done: false }];
let nextId = 5;

const PORT = 3032;

// 统一 JSON 响应头，避免 curl 拿到纯文本
function sendJson(res: import('node:http').ServerResponse, status: number, body: unknown): void {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

// 概念 1：JSON body 流式解析 —— 与 body-parse.ts 同套路，成功/失败用回调交回路由
function readJsonBody(
    req: import('node:http').IncomingMessage,
    onParsed: (value: unknown) => void,
    onFail: (message: string) => void,
): void {
    const chunks: Buffer[] = [];

    req
        .on('error', (err) => {
            // Day 2 的坑：不监听 error，坏请求直接崩进程
            console.error(err);
            onFail('request error');
        })
        .on('data', (chunk: Buffer) => {
            // chunk 是 Buffer，不是 string —— 只 push，不在这里拼
            chunks.push(chunk);
        })
        .on('end', () => {
            // 'end' 之后再拼，才是完整 body
            const raw = Buffer.concat(chunks).toString();

            // 空 body 先判 —— JSON.parse('') 会抛错
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

function deleteTodo(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse): void {
    req.on('error', (err) => {
        console.error(err);
        sendJson(res, 500, { error: 'request error' });
    });
    req.on('end', () => {
        sendJson(res, 200, { message: 'deleted' });
    });
    req.on('data', (chunk: Buffer) => {
        console.log(chunk.toString());
    });
}

const server = createServer((req, res) => {
    // 概念 3：路由分发 —— 手写 method + pathname，无框架
    const pathname = new URL(req.url ?? '/', `http://localhost:${PORT}`).pathname;

    // 调试台页面：GET / 返回 public/index.html（同源，前端 fetch 免 CORS）
    if (pathname === '/' && req.method === 'GET') {
        readFile(path.join(import.meta.dirname, 'public', 'index.html'))
            .then((html) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(html);
            })
            .catch((err) => {
                console.error(err);
                sendJson(res, 500, { error: 'failed to load page' });
            });
        return;
    }

    // 列表 / 创建：精确路径 /todos
    if (pathname === '/todos') {
        if (req.method === 'GET') {
            // 空列表 JSON.stringify([]) 是 '[]' 不是 'null'
            sendJson(res, 200, todos);
            return;
        }

        if (req.method === 'POST') {
            readJsonBody(
                req,
                (parsed) => {
                    if (typeof parsed !== 'object' || parsed === null) {
                        sendJson(res, 400, { error: 'body must be a JSON object' });
                        return;
                    }

                    const title = (parsed as { title?: unknown }).title;
                    if (typeof title !== 'string' || title.trim() === '') {
                        sendJson(res, 400, { error: 'title is required' });
                        return;
                    }

                    const todo: Todo = { id: nextId++, title: title.trim(), done: false };
                    todos.push(todo);
                    // 创建成功是 201 不是 200 —— 今天最容易忘的一条
                    sendJson(res, 201, todo);
                },
                (message) => {
                    sendJson(res, 400, { error: message });
                },
            );
            return;
        }

        // 其他方法打到 /todos：今天一律 404，405 留 Day 7
        sendJson(res, 404, { error: 'not found' });
        return;
    }

    // 删除：DELETE /todos/:id —— 路由参数用正则从 pathname 里抠出 id
    const deleteMatch = pathname.match(/^\/todos\/(\d+)$/);
    if (deleteMatch && req.method === 'DELETE') {
        const id = Number(deleteMatch[1]);
        const index = todos.findIndex((t) => t.id === id);
        if (index === -1) {
            sendJson(res, 404, { error: `todo ${id} not found` });
            return;
        }
        const [removed] = todos.splice(index, 1);
        sendJson(res, 200, { deleted: removed.id });
        return;
    }

    sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
    console.log(`TODO API is running at http://localhost:${PORT}/ (API: /todos)`);
});
