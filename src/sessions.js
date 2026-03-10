'use strict';

const { randomUUID } = require('crypto');

const MAX_SESSIONS = 500;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const sessions = new Map();

function create() {
  // Evict oldest sessions when limit is reached
  if (sessions.size >= MAX_SESSIONS) {
    const oldest = [...sessions.entries()].sort(
      ([, a], [, b]) => a.lastActivity - b.lastActivity
    )[0];
    if (oldest) sessions.delete(oldest[0]);
  }

  const id = randomUUID();
  sessions.set(id, { id, history: [], lastActivity: Date.now() });
  return id;
}

function get(id) {
  const session = sessions.get(id);
  if (!session) return null;

  // Invalidate expired sessions
  if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
    sessions.delete(id);
    return null;
  }

  session.lastActivity = Date.now();
  return session;
}

function update(id, history) {
  const session = sessions.get(id);
  if (!session) return;
  session.history = history;
  session.lastActivity = Date.now();
}

function remove(id) {
  return sessions.delete(id);
}

function count() {
  return sessions.size;
}

module.exports = { create, get, update, remove, count };
