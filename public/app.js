'use strict';

/* ── State ─────────────────────────────────────────────────────────────────── */
let sessionId = null;
let isLoading = false;

/* ── DOM refs ───────────────────────────────────────────────────────────────── */
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const statusDot = document.getElementById('statusDot');
const sessionInfo = document.getElementById('sessionInfo');
const newChatBtn = document.getElementById('newChatBtn');
const clearChatBtn = document.getElementById('clearChatBtn');

/* ── Init ───────────────────────────────────────────────────────────────────── */
(async function init() {
  await startSession();
  setupEventListeners();
})();

/* ── Session ────────────────────────────────────────────────────────────────── */
async function startSession() {
  try {
    const res = await fetch('/api/sessions', { method: 'POST' });
    const data = await res.json();
    sessionId = data.sessionId;
    sessionInfo.textContent = `Session: ${sessionId.slice(0, 8)}…`;
    setStatus('online');
  } catch {
    setStatus('offline');
    showToast('Could not connect to ADMIN-AI server.');
  }
}

async function endSession() {
  if (!sessionId) return;
  try {
    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
  } catch { /* ignore */ }
  sessionId = null;
}

/* ── UI helpers ─────────────────────────────────────────────────────────────── */
function setStatus(state) {
  statusDot.className = 'status-dot ' + (state === 'online' ? 'online' : state === 'thinking' ? 'thinking' : '');
}

function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function showWelcome() {
  messages.innerHTML = '';
  const welcome = document.createElement('div');
  welcome.className = 'welcome-screen';
  welcome.innerHTML = `
    <div class="welcome-icon">🤖</div>
    <h2>Welcome to ADMIN-AI</h2>
    <p>Your intelligent agentic admin assistant. I can help you with:</p>
    <div class="capability-grid">
      <div class="capability-card" data-prompt="Show me all my current tasks">
        <span class="cap-icon">✅</span>
        <span class="cap-title">Task Management</span>
        <span class="cap-desc">Create, update, and track tasks</span>
      </div>
      <div class="capability-card" data-prompt="Create a note about the team meeting agenda">
        <span class="cap-icon">📝</span>
        <span class="cap-title">Notes</span>
        <span class="cap-desc">Save and organize important notes</span>
      </div>
      <div class="capability-card" data-prompt="How do I reset a user's password?">
        <span class="cap-icon">🔍</span>
        <span class="cap-title">Knowledge Base</span>
        <span class="cap-desc">Find admin how-to guides</span>
      </div>
      <div class="capability-card" data-prompt="What is 15% of 3500?">
        <span class="cap-icon">🧮</span>
        <span class="cap-title">Calculator</span>
        <span class="cap-desc">Compute values and percentages</span>
      </div>
    </div>
  `;
  messages.appendChild(welcome);
  bindCapabilityCards();
}

function bindCapabilityCards() {
  messages.querySelectorAll('.capability-card').forEach((card) => {
    card.addEventListener('click', () => {
      const prompt = card.dataset.prompt;
      if (prompt) {
        messageInput.value = prompt;
        messageInput.dispatchEvent(new Event('input'));
        sendMessage();
      }
    });
  });
}

function appendTypingIndicator() {
  const el = document.createElement('div');
  el.className = 'message assistant';
  el.id = 'typing';
  el.innerHTML = `
    <div class="message-meta">ADMIN-AI</div>
    <div class="bubble">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>`;
  messages.appendChild(el);
  scrollToBottom();
  return el;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing');
  if (el) el.remove();
}

function appendUserMessage(text) {
  // Remove welcome screen on first message
  const welcome = messages.querySelector('.welcome-screen');
  if (welcome) welcome.remove();

  const el = document.createElement('div');
  el.className = 'message user';
  el.innerHTML = `
    <div class="message-meta">You</div>
    <div class="bubble">${escapeHtml(text)}</div>`;
  messages.appendChild(el);
  scrollToBottom();
}

function appendAssistantMessage(text, toolCalls) {
  removeTypingIndicator();
  const el = document.createElement('div');
  el.className = 'message assistant';

  let toolHtml = '';
  if (toolCalls && toolCalls.length > 0) {
    const toolItems = toolCalls.map((tc) => {
      const hasError = tc.result && tc.result.error;
      const icon = toolIcon(tc.name);
      return `<div class="tool-call">
        <span class="tool-icon">${icon}</span>
        <span class="tool-name">${tc.name}</span>
        <span class="tool-status ${hasError ? 'err' : 'ok'}">${hasError ? '✗ error' : '✓ done'}</span>
      </div>`;
    }).join('');
    toolHtml = `<div class="tool-calls">${toolItems}</div>`;
  }

  el.innerHTML = `
    ${toolHtml}
    <div class="message-meta">ADMIN-AI</div>
    <div class="bubble">${renderMarkdown(text)}</div>`;
  messages.appendChild(el);
  scrollToBottom();
}

function appendErrorMessage(text) {
  removeTypingIndicator();
  const el = document.createElement('div');
  el.className = 'message assistant';
  el.innerHTML = `
    <div class="message-meta">ADMIN-AI</div>
    <div class="bubble" style="border-color:var(--error);color:var(--error);">⚠️ ${escapeHtml(text)}</div>`;
  messages.appendChild(el);
  scrollToBottom();
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function toolIcon(name) {
  if (name.includes('task')) return '✅';
  if (name.includes('note')) return '📝';
  if (name.includes('search')) return '🔍';
  if (name.includes('datetime')) return '🕐';
  if (name.includes('calc')) return '🧮';
  return '🔧';
}

/* ── Simple markdown renderer ───────────────────────────────────────────────── */
function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${code.trim()}</code></pre>`
  );
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Unordered list
  html = html.replace(/^[*-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`);
  // Ordered list
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Line breaks / paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p>(<(?:ul|ol|pre|h[123])[^>]*>)/g, '$1');
  html = html.replace(/(<\/(?:ul|ol|pre|h[123])>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Send message ───────────────────────────────────────────────────────────── */
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || isLoading || !sessionId) return;

  isLoading = true;
  sendBtn.disabled = true;
  messageInput.value = '';
  messageInput.style.height = 'auto';
  setStatus('thinking');

  appendUserMessage(text);
  appendTypingIndicator();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: text }),
    });

    const data = await res.json();

    if (!res.ok) {
      appendErrorMessage(data.error || 'Something went wrong.');
    } else {
      appendAssistantMessage(data.reply, data.toolCalls);
    }
  } catch {
    appendErrorMessage('Network error – could not reach the server.');
  } finally {
    isLoading = false;
    sendBtn.disabled = messageInput.value.trim() === '';
    setStatus('online');
  }
}

/* ── Event listeners ────────────────────────────────────────────────────────── */
function setupEventListeners() {
  // Sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Nav items
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
      document.getElementById(`view-${view}`).classList.add('active');
    });
  });

  // Buttons that link back to chat with a prompt
  document.querySelectorAll('[data-view-switch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.viewSwitch;
      const prompt = btn.dataset.prompt;
      document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
      document.querySelector(`[data-view="${targetView}"]`).classList.add('active');
      document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
      document.getElementById(`view-${targetView}`).classList.add('active');
      if (prompt) {
        messageInput.value = prompt;
        messageInput.dispatchEvent(new Event('input'));
        sendMessage();
      }
    });
  });

  // Capability cards in welcome screen
  bindCapabilityCards();

  // Input auto-resize + send button state
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + 'px';
    sendBtn.disabled = messageInput.value.trim() === '' || isLoading;
  });

  // Send on Enter (Shift+Enter = newline)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // New chat
  newChatBtn.addEventListener('click', async () => {
    await endSession();
    await startSession();
    showWelcome();
  });

  // Clear history
  clearChatBtn.addEventListener('click', async () => {
    if (!sessionId) return;
    try {
      await fetch(`/api/sessions/${sessionId}/history`, { method: 'DELETE' });
      showWelcome();
    } catch {
      showToast('Could not clear conversation.');
    }
  });
}
