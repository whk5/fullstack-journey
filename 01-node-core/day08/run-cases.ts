// Day 8 交付二：把 test-matrix.md 固化成可重复回归
// 先手跑 curl 填矩阵，再跑本脚本对照；以后改 API 就跑它
// 用法：先 node day08/server.ts，再 node day08/run-cases.ts
//
// 可重复跑：破坏性用例不依赖种子 id，脚本自己 POST 夹具再删。

const BASE = 'http://localhost:3034';

type Case = {
    id: string;
    name: string;
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: string;
    expectStatus: number;
    /** 405 时断言 Allow 头（大小写不敏感，子串匹配） */
    expectAllow?: string;
    /** 204 等：响应体必须为空 */
    expectEmptyBody?: boolean;
    /** 响应体应包含的子串 */
    expectBodyHas?: string;
    /** C 组：只记录现状，不算 FAIL */
    observeOnly?: boolean;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

async function createFixture(title: string): Promise<number> {
    const res = await fetch(`${BASE}/todos`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ title }),
    });
    const body = (await res.json()) as { id?: number };
    if (res.status !== 201 || typeof body.id !== 'number') {
        throw new Error(`夹具创建失败: ${res.status} ${JSON.stringify(body)}`);
    }
    return body.id;
}

// 从 test-matrix.md 逐行搬进 cases；破坏性用例（DELETE）放最后
async function buildCases(): Promise<Case[]> {
    const idA4 = await createFixture('夹具-将删除');
    const idC4 = await createFixture('夹具-前导零');

    return [
        // —— A · 正常路径 ——
        {
            id: 'A1',
            name: '列表',
            method: 'GET',
            path: '/todos',
            expectStatus: 200,
            expectBodyHas: '[',
        },
        {
            id: 'A2',
            name: '创建',
            method: 'POST',
            path: '/todos',
            headers: jsonHeaders,
            body: JSON.stringify({ title: '写测试矩阵' }),
            expectStatus: 201,
            expectBodyHas: '写测试矩阵',
        },
        {
            id: 'A3',
            name: '部分更新只改 done',
            method: 'PATCH',
            path: '/todos/1',
            headers: jsonHeaders,
            body: JSON.stringify({ done: true }),
            expectStatus: 200,
            expectBodyHas: '"done":true',
        },

        // —— B · 边界 ——
        {
            id: 'B1',
            name: '空 body 创建',
            method: 'POST',
            path: '/todos',
            expectStatus: 400,
        },
        {
            id: 'B2',
            name: '非法 JSON 创建',
            method: 'POST',
            path: '/todos',
            headers: jsonHeaders,
            body: '{title}',
            expectStatus: 400,
        },
        {
            id: 'B3',
            name: '缺 title',
            method: 'POST',
            path: '/todos',
            headers: jsonHeaders,
            body: '{}',
            expectStatus: 400,
        },
        {
            id: 'B4',
            name: 'title 非字符串',
            method: 'POST',
            path: '/todos',
            headers: jsonHeaders,
            body: JSON.stringify({ title: 123 }),
            expectStatus: 400,
        },
        {
            id: 'B5',
            name: 'PATCH 非法 JSON',
            method: 'PATCH',
            path: '/todos/1',
            headers: jsonHeaders,
            body: 'not-json',
            expectStatus: 400,
        },
        {
            id: 'B6',
            name: 'PATCH 空对象',
            method: 'PATCH',
            path: '/todos/1',
            headers: jsonHeaders,
            body: '{}',
            expectStatus: 400,
        },
        {
            id: 'B7',
            name: 'done 类型错',
            method: 'PATCH',
            path: '/todos/1',
            headers: jsonHeaders,
            body: JSON.stringify({ done: 'yes' }),
            expectStatus: 400,
        },
        {
            id: 'B8',
            name: 'PATCH 不存在 id',
            method: 'PATCH',
            path: '/todos/999',
            headers: jsonHeaders,
            body: JSON.stringify({ done: true }),
            expectStatus: 404,
        },
        {
            id: 'B9',
            name: 'DELETE 不存在 id',
            method: 'DELETE',
            path: '/todos/999',
            expectStatus: 404,
        },
        {
            id: 'B10',
            name: 'id 非数字',
            method: 'DELETE',
            path: '/todos/abc',
            expectStatus: 404,
        },
        {
            id: 'B11',
            name: '集合上 PUT',
            method: 'PUT',
            path: '/todos',
            headers: jsonHeaders,
            body: '{}',
            expectStatus: 405,
            expectAllow: 'GET, POST',
        },
        {
            id: 'B12',
            name: '条目上 GET',
            method: 'GET',
            path: '/todos/1',
            expectStatus: 405,
            expectAllow: 'PATCH, DELETE',
        },
        {
            id: 'B13',
            name: '未知路径',
            method: 'GET',
            path: '/nope',
            expectStatus: 404,
        },
        {
            id: 'B14',
            name: '集合上 DELETE',
            method: 'DELETE',
            path: '/todos',
            expectStatus: 405,
            expectAllow: 'GET, POST',
        },

        // —— C · 怪 URL / 怪头（observeOnly：只打印，不算 FAIL） ——
        {
            id: 'C1',
            name: 'query 不影响路由',
            method: 'GET',
            path: '/todos?done=true&page=2',
            expectStatus: 200,
            observeOnly: true,
        },
        {
            id: 'C2',
            name: '集合尾斜杠',
            method: 'GET',
            path: '/todos/',
            expectStatus: 404,
            observeOnly: true,
        },
        {
            id: 'C3',
            name: '条目尾斜杠',
            method: 'DELETE',
            path: '/todos/1/',
            expectStatus: 404,
            observeOnly: true,
        },
        {
            // 前导零：/todos/0N 现状会当成 id=N（Number('0N')===N）
            // 用自建夹具 id，可重复跑；实测 status 记进 test-matrix 备注
            id: 'C4',
            name: `前导零 id /todos/0${idC4}（夹具 ${idC4}）`,
            method: 'DELETE',
            path: `/todos/0${idC4}`,
            expectStatus: 204,
            expectEmptyBody: true,
            observeOnly: true,
        },
        {
            id: 'C5',
            name: '编码 id %31',
            method: 'DELETE',
            path: '/todos/%31',
            expectStatus: 404,
            observeOnly: true,
        },
        {
            id: 'C6',
            name: '小数 id',
            method: 'PATCH',
            path: '/todos/1.5',
            headers: jsonHeaders,
            body: JSON.stringify({ done: true }),
            expectStatus: 404,
            observeOnly: true,
        },
        {
            id: 'C7',
            name: '路径穿越形 /todos/../todos',
            method: 'GET',
            path: '/todos/../todos',
            expectStatus: 200,
            observeOnly: true,
        },
        {
            id: 'C8',
            name: '路径大小写',
            method: 'GET',
            path: '/TODOS',
            expectStatus: 404,
            observeOnly: true,
        },
        {
            id: 'C9',
            name: '非 JSON Content-Type + JSON body',
            method: 'POST',
            path: '/todos',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ title: '怪头' }),
            expectStatus: 201,
            observeOnly: true,
        },
        {
            id: 'C10',
            name: '无 Content-Type + JSON body',
            method: 'POST',
            path: '/todos',
            body: JSON.stringify({ title: '无头' }),
            expectStatus: 201,
            observeOnly: true,
        },
        {
            id: 'C11',
            name: '头写 charset',
            method: 'POST',
            path: '/todos',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ title: '正常头' }),
            expectStatus: 201,
        },

        // —— 破坏性放最后 ——
        {
            id: 'A4',
            name: `删除夹具 ${idA4}`,
            method: 'DELETE',
            path: `/todos/${idA4}`,
            expectStatus: 204,
            expectEmptyBody: true,
        },
    ];
}

function judge(c: Case, status: number, allow: string | null, text: string): string[] {
    const problems: string[] = [];
    if (status !== c.expectStatus) {
        problems.push(`status ${status} ≠ ${c.expectStatus}`);
    }
    if (c.expectAllow !== undefined) {
        const got = allow ?? '';
        if (!got.toUpperCase().includes(c.expectAllow.toUpperCase())) {
            problems.push(`Allow "${got}" 不含 "${c.expectAllow}"`);
        }
    }
    if (c.expectEmptyBody && text !== '') {
        problems.push(`body 应为空，实际 ${JSON.stringify(text.slice(0, 40))}`);
    }
    if (c.expectBodyHas !== undefined && !text.includes(c.expectBodyHas)) {
        problems.push(`body 不含 ${JSON.stringify(c.expectBodyHas)}`);
    }
    return problems;
}

let pass = 0;
let fail = 0;
let observe = 0;

const cases = await buildCases();

for (const c of cases) {
    let status = 0;
    let allow: string | null = null;
    let text = '';
    let problems: string[] = [];

    try {
        const res = await fetch(BASE + c.path, {
            method: c.method,
            headers: c.headers,
            body: c.body,
        });
        status = res.status;
        allow = res.headers.get('allow');
        text = await res.text();
        problems = judge(c, status, allow, text);
    } catch (err) {
        problems = [`请求失败: ${err instanceof Error ? err.message : String(err)}`];
    }

    const tag = c.observeOnly ? 'OBS' : problems.length === 0 ? 'PASS' : 'FAIL';
    if (c.observeOnly) {
        observe += 1;
    } else if (problems.length === 0) {
        pass += 1;
    } else {
        fail += 1;
    }

    const allowNote = allow ? ` allow=${allow}` : '';
    console.log(`[${tag}] ${c.id} ${c.name} → ${status}${allowNote}`);
    for (const p of problems) {
        console.log(`       · ${p}`);
    }
    if (c.observeOnly && problems.length > 0) {
        console.log(`       （现状与脚本期望不一致，记入 test-matrix 备注，不算 FAIL）`);
    }
}

console.log('');
console.log(`合计: PASS ${pass} · FAIL ${fail} · OBS ${observe} · 共 ${cases.length}`);
if (fail > 0) {
    process.exitCode = 1;
}
