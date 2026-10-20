// 校验层：手写校验器。只判断「字段合不合法」，返回错误消息或 null，不碰 HTTP。
// 约定：create 只收 title（必填）；PATCH 只校验传入的字段，title/done 至少传一个。

const TITLE_MAX_LENGTH = 100;
const CREATE_FIELDS = ['title'];
const UPDATE_FIELDS = ['title', 'done'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function findIllegalFields(input: Record<string, unknown>, allowed: string[]): string | null {
  const illegal = Object.keys(input).filter((key) => !allowed.includes(key));
  if (illegal.length === 0) return null;
  return `unknown field${illegal.length > 1 ? 's' : ''}: ${illegal.join(', ')}`;
}

function validateTitle(value: unknown): string | null {
  if (typeof value !== 'string') return 'title must be a string';
  if (value.trim() === '') return 'title must not be empty';
  if (value.length > TITLE_MAX_LENGTH) return `title must be at most ${TITLE_MAX_LENGTH} characters`;
  return null;
}

// 创建：body 必须是对象、无非法字段、title 必填且合法
export function validateCreate(input: unknown): string | null {
  if (!isRecord(input)) return 'body must be a JSON object';
  const illegal = findIllegalFields(input, CREATE_FIELDS);
  if (illegal) return illegal;
  if (input.title === undefined) return 'title is required';
  return validateTitle(input.title);
}

// 更新（PATCH）：body 必须是对象、无非法字段、至少传一个字段；只校验传入的字段
export function validateUpdate(input: unknown): string | null {
  if (!isRecord(input)) return 'body must be a JSON object';
  const illegal = findIllegalFields(input, UPDATE_FIELDS);
  if (illegal) return illegal;
  const hasTitle = input.title !== undefined;
  const hasDone = input.done !== undefined;
  if (!hasTitle && !hasDone) return 'nothing to update';
  if (hasTitle) {
    const error = validateTitle(input.title);
    if (error) return error;
  }
  if (hasDone && typeof input.done !== 'boolean') return 'done must be a boolean';
  return null;
}
