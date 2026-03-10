/**
 * Tests for the admin tools (datetime, notes, tasks, calculator).
 * Uses Node.js built-in test runner (node --test).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── datetime tool ────────────────────────────────────────────────────────────────
import datetime from '../tools/datetime.js';

describe('datetime tool', () => {
  it('returns a result with iso and timezone fields', () => {
    const result = datetime.execute();
    assert.ok(result.iso, 'should have an iso field');
    assert.strictEqual(result.timezone, 'UTC');
  });

  it('accepts a valid IANA timezone', () => {
    const result = datetime.execute({ timezone: 'America/New_York' });
    assert.strictEqual(result.timezone, 'America/New_York');
    assert.ok(result.datetime, 'should have a datetime string');
  });

  it('falls back to UTC for an invalid timezone', () => {
    const result = datetime.execute({ timezone: 'Invalid/Zone' });
    assert.strictEqual(result.timezone, 'UTC');
    assert.ok(result.warning, 'should include a warning');
  });
});

// ─── notes tool ───────────────────────────────────────────────────────────────────
import notes from '../tools/notes.js';

describe('notes tool', () => {
  it('creates a note successfully', () => {
    const result = notes.execute({ action: 'create', title: 'Test Note', content: 'Hello' });
    assert.ok(result.success);
    assert.strictEqual(result.note.title, 'Test Note');
    assert.ok(result.note.id);
  });

  it('lists notes including the created one', () => {
    notes.execute({ action: 'create', title: 'List Test', content: 'content' });
    const result = notes.execute({ action: 'list' });
    assert.ok(result.count >= 1);
  });

  it('reads a specific note by id', () => {
    const created = notes.execute({ action: 'create', title: 'Read Me', content: 'body' });
    const read = notes.execute({ action: 'read', id: created.note.id });
    assert.strictEqual(read.note.title, 'Read Me');
  });

  it('updates a note', () => {
    const created = notes.execute({ action: 'create', title: 'Old Title', content: 'old' });
    const updated = notes.execute({ action: 'update', id: created.note.id, title: 'New Title' });
    assert.strictEqual(updated.note.title, 'New Title');
  });

  it('deletes a note', () => {
    const created = notes.execute({ action: 'create', title: 'Delete Me', content: 'bye' });
    const deleted = notes.execute({ action: 'delete', id: created.note.id });
    assert.ok(deleted.success);
    const read = notes.execute({ action: 'read', id: created.note.id });
    assert.ok(read.error);
  });

  it('returns error when creating without a title', () => {
    const result = notes.execute({ action: 'create' });
    assert.ok(result.error);
  });
});

// ─── tasks tool ───────────────────────────────────────────────────────────────────
import tasks from '../tools/tasks.js';

describe('tasks tool', () => {
  it('creates a task with default priority', () => {
    const result = tasks.execute({ action: 'create', title: 'Buy groceries' });
    assert.ok(result.success);
    assert.strictEqual(result.task.priority, 'medium');
    assert.strictEqual(result.task.completed, false);
  });

  it('creates a task with high priority', () => {
    const result = tasks.execute({ action: 'create', title: 'Urgent', priority: 'high' });
    assert.strictEqual(result.task.priority, 'high');
  });

  it('lists pending tasks', () => {
    tasks.execute({ action: 'create', title: 'Pending task' });
    const result = tasks.execute({ action: 'list', filter: 'pending' });
    assert.ok(result.tasks.every((t) => !t.completed));
  });

  it('marks a task as completed', () => {
    const created = tasks.execute({ action: 'create', title: 'Finish report' });
    const completed = tasks.execute({ action: 'complete', id: created.task.id });
    assert.strictEqual(completed.task.completed, true);
  });

  it('deletes a task', () => {
    const created = tasks.execute({ action: 'create', title: 'Temp task' });
    const deleted = tasks.execute({ action: 'delete', id: created.task.id });
    assert.ok(deleted.success);
  });

  it('returns error when creating without a title', () => {
    const result = tasks.execute({ action: 'create' });
    assert.ok(result.error);
  });
});

// ─── calculator tool ──────────────────────────────────────────────────────────────
import calculator from '../tools/calculator.js';

describe('calculator tool', () => {
  it('evaluates basic arithmetic', () => {
    const result = calculator.execute({ expression: '2 + 3 * 4' });
    assert.strictEqual(result.result, 14);
  });

  it('evaluates square root', () => {
    const result = calculator.execute({ expression: 'sqrt(144)' });
    assert.strictEqual(result.result, 12);
  });

  it('evaluates exponentiation via **', () => {
    const result = calculator.execute({ expression: '2 ** 10' });
    assert.strictEqual(result.result, 1024);
  });

  it('evaluates exponentiation via ^', () => {
    const result = calculator.execute({ expression: '3 ^ 3' });
    assert.strictEqual(result.result, 27);
  });

  it('handles division by zero gracefully', () => {
    const result = calculator.execute({ expression: '1 / 0' });
    assert.ok(result.result !== undefined);
  });

  it('rejects dangerous input', () => {
    const result = calculator.execute({ expression: 'process.env' });
    assert.ok(result.error, 'should return an error for dangerous input');
  });

  it('requires expression parameter', () => {
    const result = calculator.execute({});
    assert.ok(result.error);
  });
});
