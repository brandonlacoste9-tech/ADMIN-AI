/**
 * index.js — Express application entry point.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRouter from './routes/chat.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 chat requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});

// Middleware
app.use(generalLimiter);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(join(__dirname, '..', 'public')));

// API routes
app.use('/api/chat', chatLimiter, chatRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the SPA for all other GET requests
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ADMIN-AI server running on http://localhost:${PORT}`);
});

export default app;
