'use strict';

const { randomUUID } = require('crypto');

// In-memory notes store keyed by session.
const notesBySession = new Map();

const createDefinition = {
  type: 'function',
  function: {
    name: 'create_note',
    description: 'Create a new note.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the note.' },
        content: { type: 'string', description: 'Body content of the note.' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags for the note.',
        },
      },
      required: ['title', 'content'],
    },
  },
};

const listDefinition = {
  type: 'function',
  function: {
    name: 'list_notes',
    description: 'List all notes, optionally filtered by tag.',
    parameters: {
      type: 'object',
      properties: {
        tag: { type: 'string', description: 'Filter notes by this tag.' },
      },
      required: [],
    },
  },
};

const readDefinition = {
  type: 'function',
  function: {
    name: 'read_note',
    description: 'Read the full content of a specific note.',
    parameters: {
      type: 'object',
      properties: {
        note_id: { type: 'string', description: 'The note ID to read.' },
      },
      required: ['note_id'],
    },
  },
};

const deleteDefinition = {
  type: 'function',
  function: {
    name: 'delete_note',
    description: 'Delete a note.',
    parameters: {
      type: 'object',
      properties: {
        note_id: { type: 'string', description: 'The note ID to delete.' },
      },
      required: ['note_id'],
    },
  },
};

function getNotes(sessionId) {
  if (!notesBySession.has(sessionId)) {
    notesBySession.set(sessionId, []);
  }
  return notesBySession.get(sessionId);
}

function createNote(sessionId, { title, content, tags = [] }) {
  const notes = getNotes(sessionId);
  const note = {
    id: randomUUID(),
    title,
    content,
    tags,
    created_at: new Date().toISOString(),
  };
  notes.push(note);
  return { success: true, note };
}

function listNotes(sessionId, { tag } = {}) {
  const notes = getNotes(sessionId);
  const filtered = tag
    ? notes.filter((n) => n.tags.includes(tag))
    : notes;
  return {
    notes: filtered.map(({ id, title, tags, created_at }) => ({
      id,
      title,
      tags,
      created_at,
    })),
    total: filtered.length,
  };
}

function readNote(sessionId, { note_id }) {
  const notes = getNotes(sessionId);
  const note = notes.find((n) => n.id === note_id);
  if (!note) {
    return { error: `Note with id "${note_id}" not found.` };
  }
  return { note };
}

function deleteNote(sessionId, { note_id }) {
  const notes = getNotes(sessionId);
  const idx = notes.findIndex((n) => n.id === note_id);
  if (idx === -1) {
    return { error: `Note with id "${note_id}" not found.` };
  }
  const [removed] = notes.splice(idx, 1);
  return { success: true, deleted: removed };
}

module.exports = {
  definitions: [createDefinition, listDefinition, readDefinition, deleteDefinition],
  createNote,
  listNotes,
  readNote,
  deleteNote,
};
