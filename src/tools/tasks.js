'use strict';

const { randomUUID } = require('crypto');

// In-memory task store (keyed by session).
// In production this would be backed by a database.
const tasksBySession = new Map();

const addDefinition = {
  type: 'function',
  function: {
    name: 'add_task',
    description: 'Add a new task to the admin task list.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short title of the task.' },
        description: {
          type: 'string',
          description: 'Optional detailed description.',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority level.',
        },
        due_date: {
          type: 'string',
          description: 'Optional due date in YYYY-MM-DD format.',
        },
      },
      required: ['title'],
    },
  },
};

const listDefinition = {
  type: 'function',
  function: {
    name: 'list_tasks',
    description: 'List all tasks, optionally filtered by status or priority.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'all'],
          description: 'Filter tasks by status.',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'all'],
          description: 'Filter tasks by priority.',
        },
      },
      required: [],
    },
  },
};

const updateDefinition = {
  type: 'function',
  function: {
    name: 'update_task',
    description: 'Update the status or details of an existing task.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'The task ID to update.' },
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed'],
          description: 'New status.',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'New priority.',
        },
        title: { type: 'string', description: 'New title.' },
        description: { type: 'string', description: 'New description.' },
      },
      required: ['task_id'],
    },
  },
};

const deleteDefinition = {
  type: 'function',
  function: {
    name: 'delete_task',
    description: 'Delete a task from the list.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'The task ID to delete.' },
      },
      required: ['task_id'],
    },
  },
};

function getTasks(sessionId) {
  if (!tasksBySession.has(sessionId)) {
    tasksBySession.set(sessionId, []);
  }
  return tasksBySession.get(sessionId);
}

function addTask(sessionId, { title, description = '', priority = 'medium', due_date = null }) {
  const tasks = getTasks(sessionId);
  const task = {
    id: randomUUID(),
    title,
    description,
    priority,
    due_date,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  tasks.push(task);
  return { success: true, task };
}

function listTasks(sessionId, { status = 'all', priority = 'all' } = {}) {
  const tasks = getTasks(sessionId);
  const filtered = tasks.filter(
    (t) =>
      (status === 'all' || t.status === status) &&
      (priority === 'all' || t.priority === priority)
  );
  return { tasks: filtered, total: filtered.length };
}

function updateTask(sessionId, { task_id, ...updates }) {
  const tasks = getTasks(sessionId);
  const idx = tasks.findIndex((t) => t.id === task_id);
  if (idx === -1) {
    return { error: `Task with id "${task_id}" not found.` };
  }
  const allowed = ['status', 'priority', 'title', 'description', 'due_date'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) {
      tasks[idx][key] = updates[key];
    }
  });
  tasks[idx].updated_at = new Date().toISOString();
  return { success: true, task: tasks[idx] };
}

function deleteTask(sessionId, { task_id }) {
  const tasks = getTasks(sessionId);
  const idx = tasks.findIndex((t) => t.id === task_id);
  if (idx === -1) {
    return { error: `Task with id "${task_id}" not found.` };
  }
  const [removed] = tasks.splice(idx, 1);
  return { success: true, deleted: removed };
}

module.exports = {
  definitions: [addDefinition, listDefinition, updateDefinition, deleteDefinition],
  addTask,
  listTasks,
  updateTask,
  deleteTask,
};
