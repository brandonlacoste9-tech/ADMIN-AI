/**
 * Tasks tool — create, list, update, complete, and delete tasks.
 */

import { randomUUID } from 'crypto';

const tasks = new Map();

const PRIORITIES = ['low', 'medium', 'high'];

const definition = {
  type: 'function',
  function: {
    name: 'manage_tasks',
    description:
      'Create, list, complete, update, or delete tasks in a to-do list. Supports priorities and due dates.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'list', 'complete', 'update', 'delete'],
          description: 'The operation to perform.',
        },
        title: {
          type: 'string',
          description: 'Task title (required for create/update).',
        },
        description: {
          type: 'string',
          description: 'Optional longer description of the task.',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level (default: medium).',
        },
        due_date: {
          type: 'string',
          description: 'Due date in ISO 8601 format, e.g. "2024-12-31".',
        },
        id: {
          type: 'string',
          description: 'Task ID (required for complete/update/delete).',
        },
        filter: {
          type: 'string',
          enum: ['all', 'pending', 'completed'],
          description: 'Filter tasks when listing (default: all).',
        },
      },
      required: ['action'],
    },
  },
};

function execute({ action, title, description, priority, due_date, id, filter } = {}) {
  switch (action) {
    case 'create': {
      if (!title) return { error: 'title is required to create a task.' };
      const p = PRIORITIES.includes(priority) ? priority : 'medium';
      const task = {
        id: randomUUID(),
        title,
        description: description || '',
        priority: p,
        due_date: due_date || null,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      tasks.set(task.id, task);
      return { success: true, task };
    }

    case 'list': {
      let list = Array.from(tasks.values());
      if (filter === 'pending') list = list.filter((t) => !t.completed);
      else if (filter === 'completed') list = list.filter((t) => t.completed);
      list.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      });
      return { count: list.length, tasks: list };
    }

    case 'complete': {
      if (!id) return { error: 'id is required to complete a task.' };
      const task = tasks.get(id);
      if (!task) return { error: `Task with id "${id}" not found.` };
      task.completed = true;
      task.updatedAt = new Date().toISOString();
      return { success: true, task };
    }

    case 'update': {
      if (!id) return { error: 'id is required to update a task.' };
      const task = tasks.get(id);
      if (!task) return { error: `Task with id "${id}" not found.` };
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined && PRIORITIES.includes(priority)) task.priority = priority;
      if (due_date !== undefined) task.due_date = due_date;
      task.updatedAt = new Date().toISOString();
      return { success: true, task };
    }

    case 'delete': {
      if (!id) return { error: 'id is required to delete a task.' };
      if (!tasks.has(id)) return { error: `Task with id "${id}" not found.` };
      tasks.delete(id);
      return { success: true, message: `Task "${id}" deleted.` };
    }

    default:
      return { error: `Unknown action "${action}".` };
  }
}

export default { definition, execute };
