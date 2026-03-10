'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const { runAgent } = require('./agent');
const sessions = require('./sessions');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ADMIN-AI',
    sessions: sessions.count(),
    timestamp: new Date().toISOString(),
  });
});

// ── Create session ────────────────────────────────────────────────────────────
app.post('/api/sessions', (_req, res) => {
  const id = sessions.create();
  res.status(201).json({ sessionId: id });
});

// ── Delete session ────────────────────────────────────────────────────────────
app.delete('/api/sessions/:id', (req, res) => {
  const removed = sessions.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  res.json({ success: true });
});

// ── Chat endpoint ─────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId is required.' });
  }
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required.' });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'OPENAI_API_KEY is not configured. Set it in your .env file.',
    });
  }

  try {
    const { reply, toolCalls, updatedHistory } = await runAgent(
      sessionId,
      session.history,
      message.trim()
    );

    sessions.update(sessionId, updatedHistory);

    res.json({ reply, toolCalls });
  } catch (err) {
    const status = err.status || 500;
    const message =
      status === 401
        ? 'Invalid OpenAI API key.'
        : status === 429
          ? 'Rate limit reached. Please try again shortly.'
          : 'An error occurred while processing your request.';

    res.status(status > 599 ? 500 : status).json({ error: message });
  }
});

// ── Conversation history ──────────────────────────────────────────────────────
app.get('/api/sessions/:id/history', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired.' });
  }
  res.json({ history: session.history });
});

// ── Clear conversation history ────────────────────────────────────────────────
app.delete('/api/sessions/:id/history', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired.' });
  }
  sessions.update(req.params.id, []);
  res.json({ success: true });
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Export for testing; only listen when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`ADMIN-AI server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
