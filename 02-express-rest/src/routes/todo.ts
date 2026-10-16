// 路由层：只声明「URL/方法 → 处理函数」的映射，业务逻辑都在 controller
import { Router } from 'express';
import {
  createTodo,
  deleteTodo,
  getTodos,
  methodNotAllowed,
  updateTodo,
} from '../controllers/todo.ts';

const router = Router();

// 集合路径 /api/todos：只有 GET / POST，其它方法 → 405 + Allow
router.get('/', getTodos);
router.post('/', createTodo);
router.all('/', methodNotAllowed(['GET', 'POST']));

// 条目路径 /api/todos/:id：只有 PATCH / DELETE，其它方法 → 405 + Allow
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);
router.all('/:id', methodNotAllowed(['PATCH', 'DELETE']));

export default router;
