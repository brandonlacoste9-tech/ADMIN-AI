'use strict';

const datetime = require('../src/tools/datetime');
const calculator = require('../src/tools/calculator');
const tasks = require('../src/tools/tasks');
const notes = require('../src/tools/notes');
const search = require('../src/tools/search');
const toolsIndex = require('../src/tools/index');

// ── datetime ──────────────────────────────────────────────────────────────────
describe('Tool: get_datetime', () => {
  it('returns datetime object for UTC', () => {
    const result = datetime.execute({ timezone: 'UTC', format: 'datetime' });
    expect(result.datetime).toBeDefined();
    expect(result.timezone).toBe('UTC');
  });

  it('returns date only', () => {
    const result = datetime.execute({ format: 'date' });
    expect(result.date).toBeDefined();
    expect(result.time).toBeUndefined();
  });

  it('returns time only', () => {
    const result = datetime.execute({ format: 'time' });
    expect(result.time).toBeDefined();
    expect(result.date).toBeUndefined();
  });

  it('falls back to UTC for invalid timezone', () => {
    const result = datetime.execute({ timezone: 'Not/ATimezone', format: 'datetime' });
    expect(result.datetime).toBeDefined();
  });

  it('has a valid tool definition', () => {
    expect(datetime.definition.type).toBe('function');
    expect(datetime.definition.function.name).toBe('get_datetime');
  });
});

// ── calculator ────────────────────────────────────────────────────────────────
describe('Tool: calculate', () => {
  it('evaluates basic arithmetic', () => {
    expect(calculator.execute({ expression: '2 + 2' }).result).toBe(4);
    expect(calculator.execute({ expression: '10 * 5' }).result).toBe(50);
    expect(calculator.execute({ expression: '100 / 4' }).result).toBe(25);
  });

  it('evaluates percentages', () => {
    const { result } = calculator.execute({ expression: '15% of 200' });
    expect(result).toBe(30);
  });

  it('evaluates sqrt', () => {
    const { result } = calculator.execute({ expression: 'sqrt(144)' });
    expect(result).toBe(12);
  });

  it('returns error for missing expression', () => {
    const { error } = calculator.execute({});
    expect(error).toBeDefined();
  });

  it('returns error for unsupported characters', () => {
    const { error } = calculator.execute({ expression: 'alert("xss")' });
    expect(error).toBeDefined();
  });

  it('has a valid tool definition', () => {
    expect(calculator.definition.type).toBe('function');
    expect(calculator.definition.function.name).toBe('calculate');
  });
});

// ── tasks ─────────────────────────────────────────────────────────────────────
describe('Tool: tasks', () => {
  const sid = 'test-session-tasks';

  it('adds a task', () => {
    const { success, task } = tasks.addTask(sid, { title: 'Write tests', priority: 'high' });
    expect(success).toBe(true);
    expect(task.title).toBe('Write tests');
    expect(task.priority).toBe('high');
    expect(task.status).toBe('pending');
    expect(task.id).toBeDefined();
  });

  it('lists all tasks', () => {
    const { tasks: list, total } = tasks.listTasks(sid);
    expect(total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(list)).toBe(true);
  });

  it('updates a task status', () => {
    const { task } = tasks.addTask(sid, { title: 'Update me' });
    const result = tasks.updateTask(sid, { task_id: task.id, status: 'completed' });
    expect(result.success).toBe(true);
    expect(result.task.status).toBe('completed');
  });

  it('returns error when updating unknown task', () => {
    const result = tasks.updateTask(sid, { task_id: 'bogus' });
    expect(result.error).toBeDefined();
  });

  it('deletes a task', () => {
    const { task } = tasks.addTask(sid, { title: 'Delete me' });
    const result = tasks.deleteTask(sid, { task_id: task.id });
    expect(result.success).toBe(true);
  });

  it('returns error when deleting unknown task', () => {
    const result = tasks.deleteTask(sid, { task_id: 'bogus' });
    expect(result.error).toBeDefined();
  });

  it('filters tasks by status', () => {
    const { tasks: pending } = tasks.listTasks(sid, { status: 'pending' });
    pending.forEach((t) => expect(t.status).toBe('pending'));
  });

  it('has valid tool definitions', () => {
    expect(tasks.definitions.length).toBe(4);
    tasks.definitions.forEach((d) => expect(d.type).toBe('function'));
  });
});

// ── notes ─────────────────────────────────────────────────────────────────────
describe('Tool: notes', () => {
  const sid = 'test-session-notes';

  it('creates a note', () => {
    const { success, note } = notes.createNote(sid, {
      title: 'Meeting',
      content: 'Agenda: budget review',
      tags: ['meeting'],
    });
    expect(success).toBe(true);
    expect(note.title).toBe('Meeting');
    expect(note.id).toBeDefined();
  });

  it('lists notes', () => {
    const { notes: list } = notes.listNotes(sid);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it('filters notes by tag', () => {
    notes.createNote(sid, { title: 'Tagged', content: 'body', tags: ['important'] });
    const { notes: list } = notes.listNotes(sid, { tag: 'important' });
    list.forEach((n) => expect(n.tags).toContain('important'));
  });

  it('reads a note by id', () => {
    const { note } = notes.createNote(sid, { title: 'Full', content: 'Full body', tags: [] });
    const read = notes.readNote(sid, { note_id: note.id });
    expect(read.note.content).toBe('Full body');
  });

  it('returns error when reading unknown note', () => {
    const result = notes.readNote(sid, { note_id: 'bogus' });
    expect(result.error).toBeDefined();
  });

  it('deletes a note', () => {
    const { note } = notes.createNote(sid, { title: 'Delete me', content: 'bye', tags: [] });
    const result = notes.deleteNote(sid, { note_id: note.id });
    expect(result.success).toBe(true);
  });

  it('returns error when deleting unknown note', () => {
    const result = notes.deleteNote(sid, { note_id: 'bogus' });
    expect(result.error).toBeDefined();
  });

  it('has valid tool definitions', () => {
    expect(notes.definitions.length).toBe(4);
    notes.definitions.forEach((d) => expect(d.type).toBe('function'));
  });
});

// ── search ────────────────────────────────────────────────────────────────────
describe('Tool: search_knowledge_base', () => {
  it('finds results for a known query', () => {
    const { results, total } = search.execute({ query: 'reset password' });
    expect(total).toBeGreaterThan(0);
    expect(results[0].title).toBeDefined();
  });

  it('returns no results for unrelated query', () => {
    const { results } = search.execute({ query: 'zzz unrelated xyz' });
    expect(results.length).toBe(0);
  });

  it('respects category filter', () => {
    const { results } = search.execute({ query: 'security', category: 'security' });
    results.forEach((r) => expect(r.category).toBe('security'));
  });

  it('respects max_results', () => {
    const { results } = search.execute({ query: 'admin', max_results: 1 });
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('returns error for missing query', () => {
    const { error } = search.execute({});
    expect(error).toBeDefined();
  });

  it('has a valid tool definition', () => {
    expect(search.definition.type).toBe('function');
    expect(search.definition.function.name).toBe('search_knowledge_base');
  });
});

// ── tool registry ─────────────────────────────────────────────────────────────
describe('Tool registry (tools/index)', () => {
  it('exports all tool definitions', () => {
    expect(toolsIndex.definitions.length).toBeGreaterThan(0);
  });

  it('executes get_datetime', () => {
    const result = toolsIndex.execute('sid', 'get_datetime', {});
    expect(result.datetime || result.date || result.time).toBeDefined();
  });

  it('executes calculate', () => {
    const result = toolsIndex.execute('sid', 'calculate', { expression: '3 + 3' });
    expect(result.result).toBe(6);
  });

  it('returns error for unknown tool', () => {
    const result = toolsIndex.execute('sid', 'non_existent_tool', {});
    expect(result.error).toBeDefined();
  });
});

// ── sessions ──────────────────────────────────────────────────────────────────
describe('Session manager', () => {
  const sessions = require('../src/sessions');

  it('creates and retrieves a session', () => {
    const id = sessions.create();
    expect(typeof id).toBe('string');
    const session = sessions.get(id);
    expect(session).toBeDefined();
    expect(session.id).toBe(id);
    sessions.remove(id);
  });

  it('returns null for unknown session', () => {
    expect(sessions.get('bogus-id')).toBeNull();
  });

  it('updates session history', () => {
    const id = sessions.create();
    sessions.update(id, [{ role: 'user', content: 'hi' }]);
    const session = sessions.get(id);
    expect(session.history.length).toBe(1);
    sessions.remove(id);
  });

  it('removes a session', () => {
    const id = sessions.create();
    const removed = sessions.remove(id);
    expect(removed).toBe(true);
    expect(sessions.get(id)).toBeNull();
  });

  it('counts active sessions', () => {
    const before = sessions.count();
    const id = sessions.create();
    expect(sessions.count()).toBe(before + 1);
    sessions.remove(id);
  });
});
