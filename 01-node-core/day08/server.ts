import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Day 8 被测快照：从 day07/server.ts 拷贝，端口改为 3034
// 今天原则上不改业务逻辑；测出真 bug 才动，并记进 test-matrix.md 备注
// GET    /todos        → 200 + 数组（空列表是 [] 不是 null）
// POST   /todos        → 校验 + 创建 → 201（空 body / 非法 JSON / 缺 title → 400）
// PATCH  /todos/:id    → 按传入字段部分更新 → 200（校验失败 → 400，id 不存在 → 404）
// DELETE /todos/:id    → 删除 → 204 无 body（id 不存在 → 404）
// 已知路径 + 错误方法  → 405 + Allow
// 其他路径 / 非数字 id → 404

type Todo = { id: number; title: string; done: boolean };

// 概念 2：内存存储 —— 进程内数组，重启即清空是刻意的
const todos: Todo[] = [{ id: 1, title: '学习 Node.js', done: false }, { id: 2, title: '学习 TypeScript', done: false }, { id: 3, title: '学习 React', done: false }, { id: 4, title: '学习 Vue', done: false }];
let nextId = 5;

const PORT = 3034;

// 统一 JSON 成功/普通响应
function sendJson(res: ServerResponse, status: number, body: unknown): void {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

// 概念 4：统一错误出口 —— 所有错误只走这里；405 时可带 Allow
function sendError(res: ServerResponse, status: number, message: string, allow?: string): void {
    res.statusCode = status;
    if (allow !== undefined) {
        res.setHeader('Allow', allow);
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: message }));
}

// 概念 1：JSON body 流式解析 —— 成功/失败用回调交回路由
function readJsonBody(
    req: IncomingMessage,
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

const server = createServer((req, res) => {
    // 概念 3：路由分发 —— 手写 method + pathname，无框架
    const pathname = new URL(req.url ?? '/', `http://localhost:${PORT}`).pathname;

    // 调试台页面：GET / 返回 public/index.html（同源，前端 fetch 免 CORS）
    if (pathname === '/' && req.method === 'GET') {
        readFile(path.join(import.meta.dirname, '../day06/public', 'index.html'))
            .then((html) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(html);
            })
            .catch((err) => {
                console.error(err);
                sendError(res, 500, 'failed to load page');
            });
        return;
    }

    // 集合路径：精确 /todos（集合上只有 GET / POST，别的方法 405）
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
                        sendError(res, 400, 'body must be a JSON object');
                        return;
                    }

                    const title = (parsed as { title?: unknown }).title;
                    if (typeof title !== 'string' || title.trim() === '') {
                        sendError(res, 400, 'title is required');
                        return;
                    }

                    const todo: Todo = { id: nextId++, title: title.trim(), done: false };
                    todos.push(todo);
                    // 创建成功是 201 不是 200 —— 今天最容易忘的一条
                    sendJson(res, 201, todo);
                },
                (message) => {
                    sendError(res, 400, message);
                },
            );
            return;
        }

        // 路径认识、方法不支持 → 405 + Allow（集合上没有 DELETE/PATCH）
        sendError(res, 405, 'method not allowed', 'GET, POST');
        return;
    }

    // 条目路径：/todos/:id —— 正则抠 id；/todos/abc 不匹配 → 落到 404
    const itemMatch = pathname.match(/^\/todos\/(\d+)$/);
    if (itemMatch) {
        const id = Number(itemMatch[1]);
        const index = todos.findIndex((t) => t.id === id);

        if (req.method === 'DELETE') {
            if (index === -1) {
                sendError(res, 404, `todo ${id} not found`);
                return;
            }
            todos.splice(index, 1);
            // 删除成功：204 No Content —— 无状态行以外的 body
            res.statusCode = 204;
            res.end();
            return;
        }

        if (req.method === 'PATCH') {
            readJsonBody(
                req,
                (parsed) => {
                    if (typeof parsed !== 'object' || parsed === null) {
                        sendError(res, 400, 'body must be a JSON object');
                        return;
                    }
                    if (index === -1) {
                        sendError(res, 404, `todo ${id} not found`);
                        return;
                    }

                    // 概念 2：传了谁就校验谁，只写白名单字段 —— 不是「title 必填」
                    const body = parsed as { title?: unknown; done?: unknown };
                    const hasTitle = body.title !== undefined;
                    const hasDone = body.done !== undefined;

                    if (!hasTitle && !hasDone) {
                        sendError(res, 400, 'nothing to update');
                        return;
                    }
                    if (hasTitle && (typeof body.title !== 'string' || body.title.trim() === '')) {
                        sendError(res, 400, 'title must be a non-empty string');
                        return;
                    }
                    if (hasDone && typeof body.done !== 'boolean') {
                        sendError(res, 400, 'done must be a boolean');
                        return;
                    }

                    // 只更新传入的字段；禁止 Object.assign 原样拷贝（防止 id 被注入改掉）
                    if (hasTitle) {
                        todos[index].title = (body.title as string).trim();
                    }
                    if (hasDone) {
                        todos[index].done = body.done as boolean;
                    }
                    sendJson(res, 200, todos[index]);
                },
                (message) => {
                    sendError(res, 400, message);
                },
            );
            return;
        }

        // 条目路径认识、方法不支持 → 405 + Allow（条目上只有 PATCH / DELETE）
        sendError(res, 405, 'method not allowed', 'PATCH, DELETE');
        return;
    }

    // 未知路径、/todos/abc 等 → 404
    sendError(res, 404, 'not found');
});

server.listen(PORT, () => {
    console.log(`TODO API is running at http://localhost:${PORT}/ (API: /todos)`);
});
