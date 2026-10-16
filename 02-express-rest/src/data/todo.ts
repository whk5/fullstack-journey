// 数据层：只负责 TODO 数据的存取，不碰 HTTP（不 import express）

export type Todo = {
  id: number;
  title: string;
  done: boolean;
};

// 内存存储 —— 进程内数组，重启即清空是刻意的（和 day07 一致）
const todos: Todo[] = [
  { id: 1, title: '学习 Node.js', done: false },
  { id: 2, title: '学习 TypeScript', done: false },
  { id: 3, title: '学习 React', done: false },
  { id: 4, title: '学习 Vue', done: false },
];

let nextId = 5;

export function getAll(): Todo[] {
  return todos;
}

export function getById(id: number): Todo | undefined {
  return todos.find((t) => t.id === id);
}

export function create(title: string): Todo {
  const todo: Todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}

// 只更新传入的字段，白名单由 controller 校验后传入
export function update(id: number, patch: { title?: string; done?: boolean }): Todo | undefined {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return undefined;
  if (patch.title !== undefined) todo.title = patch.title;
  if (patch.done !== undefined) todo.done = patch.done;
  return todo;
}

export function remove(id: number): boolean {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}
