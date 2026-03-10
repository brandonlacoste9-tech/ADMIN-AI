/**
 * chat.js — Express router for the /api/chat endpoint.
 *
 * Maintains per-session conversation history and delegates to the agent.
 */

import { Router } from 'express';
import { createAgent } from '../agent.js';

const router = Router();

// In-memory session store: sessionId → { messages: [], agent: Agent }
const sessions = new Map();

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Get or create a session.
 * @param {string} sessionId
 * @param {string} apiKey
 */
function getSession(sessionId, apiKey) {
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      messages: [],
      agent: createAgent(apiKey),
      lastAccess: Date.now(),
    };
    sessions.set(sessionId, session);
  }
  session.lastAccess = Date.now();
  return session;
}

// Periodically clean up expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastAccess > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 10 * 60 * 1000); // every 10 minutes

/**
 * POST /api/chat
 * Body: { message: string, sessionId?: string }
 */
router.post('/', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.',
    });
  }

  const sid = sessionId || 'default';
  const session = getSession(sid, apiKey);

  // Append the new user message
  session.messages.push({ role: 'user', content: message.trim() });

  try {
    const reply = await session.agent.chat(session.messages);

    // Keep the history in sync: the agent appended messages to a copy,
    // so we store the final assistant reply in our history.
    session.messages.push({ role: 'assistant', content: reply });

    return res.json({ reply, sessionId: sid });
  } catch (err) {
    // Remove the user message on failure so history stays consistent
    session.messages.pop();

    const status = err.status || 500;
    const errorMessage =
      status === 401
        ? 'Invalid OpenAI API key. Please check your OPENAI_API_KEY configuration.'
        : err.message || 'An unexpected error occurred.';

    return res.status(status).json({ error: errorMessage });
  }
});

/**
 * DELETE /api/chat/:sessionId — reset a session's conversation history.
 */
router.delete('/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId);
  return res.json({ success: true, message: 'Session cleared.' });
});

export default router;
