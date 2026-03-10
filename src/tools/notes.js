/**
 * Notes tool — create, read, update, and delete text notes stored in memory.
 */

import { randomUUID } from 'crypto';

// In-memory store (survives for the lifetime of the process)
const notes = new Map();

const definition = {
  type: 'function',
  function: {
    name: 'manage_notes',
    description:
      'Create, list, read, update, or delete personal notes. Notes persist for the duration of the session.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'list', 'read', 'update', 'delete'],
          description: 'The operation to perform on notes.',
        },
        title: {
          type: 'string',
          description: 'Title of the note (required for create/update).',
        },
        content: {
          type: 'string',
          description: 'Body text of the note (required for create/update).',
        },
        id: {
          type: 'string',
          description: 'Note ID (required for read/update/delete).',
        },
      },
      required: ['action'],
    },
  },
};

function execute({ action, title, content, id } = {}) {
  switch (action) {
    case 'create': {
      if (!title) return { error: 'title is required to create a note.' };
      const note = {
        id: randomUUID(),
        title,
        content: content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notes.set(note.id, note);
      return { success: true, note };
    }

    case 'list': {
      const list = Array.from(notes.values()).map(({ id, title, createdAt, updatedAt }) => ({
        id,
        title,
        createdAt,
        updatedAt,
      }));
      return { count: list.length, notes: list };
    }

    case 'read': {
      if (!id) return { error: 'id is required to read a note.' };
      const note = notes.get(id);
      if (!note) return { error: `Note with id "${id}" not found.` };
      return { note };
    }

    case 'update': {
      if (!id) return { error: 'id is required to update a note.' };
      const note = notes.get(id);
      if (!note) return { error: `Note with id "${id}" not found.` };
      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      note.updatedAt = new Date().toISOString();
      return { success: true, note };
    }

    case 'delete': {
      if (!id) return { error: 'id is required to delete a note.' };
      if (!notes.has(id)) return { error: `Note with id "${id}" not found.` };
      notes.delete(id);
      return { success: true, message: `Note "${id}" deleted.` };
    }

    default:
      return { error: `Unknown action "${action}".` };
  }
}

export default { definition, execute };
