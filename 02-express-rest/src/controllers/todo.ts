// 控制器层：负责 HTTP 语义（解析、状态码），调用校验层 + 数据层，不直接写校验逻辑
import type { Request, Response } from 'express';
import { create, getAll, remove, update } from '../data/todo.ts';
import { validateCreate, validateUpdate } from '../validation/todo.ts';

// 非数字 id → 404（day07 里 /todos/abc 不匹配正则就落到 404，这里等价处理）
function parseId(raw: string | string[] | undefined): number | null {
  if (raw === undefined) return null;
  if (Array.isArray(raw)) return null;
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export function getTodos(_req: Request, res: Response): void {
  res.json(getAll());
}

export function createTodo(req: Request, res: Response): void {
  const error = validateCreate(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const title = (req.body as { title: string }).title;
  const todo = create(title.trim());
  res.status(201).json(todo);
}

export function updateTodo(req: Request, res: Response): void {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(404).json({ error: 'not found' });
    return;
  }

  const error = validateUpdate(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { title, done } = req.body as { title?: string; done?: boolean };
  const patch: { title?: string; done?: boolean } = {};
  if (title !== undefined) patch.title = title.trim();
  if (done !== undefined) patch.done = done;

  const updated = update(id, patch);
  if (!updated) {
    res.status(404).json({ error: `todo ${id} not found` });
    return;
  }
  res.json(updated);
}

export function deleteTodo(req: Request, res: Response): void {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(404).json({ error: 'not found' });
    return;
  }

  const removed = remove(id);
  if (!removed) {
    res.status(404).json({ error: `todo ${id} not found` });
    return;
  }
  res.status(204).end();
}

// 405 兜底：返回方法工厂；条目路径上若 id 非法仍算 404（保持 day07 语义）
export function methodNotAllowed(allow: string[]) {
  return (req: Request, res: Response): void => {
    if (req.params.id !== undefined && parseId(req.params.id) === null) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.set('Allow', allow.join(', '));
    res.status(405).json({ error: 'method not allowed' });
  };
}
