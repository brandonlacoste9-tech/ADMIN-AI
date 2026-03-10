/**
 * app.js — Frontend logic for the ADMIN-AI chat interface.
 */

// ─── State ──────────────────────────────────────────────────────────────────────
let sessionId = generateSessionId();
let isLoading = false;

// ─── DOM References ──────────────────────────────────────────────────────────────
const messagesEl    = document.getElementById('messages');
const chatForm      = document.getElementById('chat-form');
const inputEl       = document.getElementById('message-input');
const sendBtn       = document.getElementById('send-btn');
const clearBtn      = document.getElementById('clear-btn');
const typingEl      = document.getElementById('typing-indicator');
const statusEl      = document.getElementById('status-indicator');

// ─── Helpers ─────────────────────────────────────────────────────────────────────
function generateSessionId() {
  return `session_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function setStatus(state) {
  statusEl.className = `status ${state}`;
  statusEl.title = state === 'idle' ? 'Ready' : state === 'working' ? 'Thinking…' : 'Error';
}

function setLoading(loading) {
  isLoading = loading;
  sendBtn.disabled = loading;
  inputEl.disabled = loading;
  typingEl.classList.toggle('hidden', !loading);
  setStatus(loading ? 'working' : 'idle');
  if (!loading) scrollToBottom();
}

function scrollToBottom() {
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

/** Auto-resize the textarea to fit its content. */
function autoResize() {
  inputEl.style.height = 'auto';
  inputEl.style.height = `${Math.min(inputEl.scrollHeight, 160)}px`;
}

/** Format the current time as HH:MM. */
function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Very lightweight markdown-like renderer for assistant messages.
 * Handles: **bold**, `code`, fenced code blocks, bullet lists, and newlines.
 */
function renderContent(text) {
  // Escape HTML first
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks (```lang\n...\n```)
  escaped = escaped.replace(
    /```(?:\w+)?\n([\s\S]*?)```/g,
    (_, code) => `<pre><code>${code.trimEnd()}</code></pre>`,
  );

  // Inline code
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold **text**
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Bullet lists: lines starting with "- " or "* "
  escaped = escaped.replace(
    /((?:^[ \t]*[-*] .+\n?)+)/gm,
    (block) => {
      const items = block.trim().split('\n').map((l) => {
        const content = l.replace(/^[ \t]*[-*] /, '');
        return `<li>${content}</li>`;
      });
      return `<ul>${items.join('')}</ul>`;
    },
  );

  // Numbered lists: lines starting with "1. "
  escaped = escaped.replace(
    /((?:^[ \t]*\d+\. .+\n?)+)/gm,
    (block) => {
      const items = block.trim().split('\n').map((l) => {
        const content = l.replace(/^[ \t]*\d+\. /, '');
        return `<li>${content}</li>`;
      });
      return `<ol>${items.join('')}</ol>`;
    },
  );

  // Double newline → paragraph break; single newline → <br>
  const paragraphs = escaped.split(/\n\n+/);
  escaped = paragraphs
    .map((p) => {
      // Don't wrap block elements again
      if (/^<(ul|ol|pre)/.test(p.trim())) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return escaped;
}

/** Append a message bubble to the conversation. */
function appendMessage(role, content, isError = false) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? '👤' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = `bubble${isError ? ' error' : ''}`;

  if (role === 'assistant' && !isError) {
    bubble.innerHTML = renderContent(content);
  } else {
    // User messages and errors: plain text with newlines
    bubble.innerHTML = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  const meta = document.createElement('p');
  meta.className = 'message-meta';
  meta.textContent = formatTime();

  wrapper.appendChild(avatar);
  const right = document.createElement('div');
  right.appendChild(bubble);
  right.appendChild(meta);
  wrapper.appendChild(right);

  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

// ─── API ──────────────────────────────────────────────────────────────────────────
async function sendMessage(text) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, sessionId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  return data.reply;
}

async function clearSession() {
  try {
    await fetch(`/api/chat/${sessionId}`, { method: 'DELETE' });
  } catch {
    // Ignore network errors on clear
  }
  sessionId = generateSessionId();
}

// ─── Event Handlers ───────────────────────────────────────────────────────────────
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoading) return;

  const text = inputEl.value.trim();
  if (!text) return;

  // Clear input
  inputEl.value = '';
  inputEl.style.height = 'auto';
  autoResize();

  // Show user message
  appendMessage('user', text);
  setLoading(true);

  try {
    const reply = await sendMessage(text);
    appendMessage('assistant', reply);
  } catch (err) {
    appendMessage('assistant', `⚠️ ${err.message}`, true);
    setStatus('error');
    setTimeout(() => setStatus('idle'), 3000);
  } finally {
    setLoading(false);
    inputEl.focus();
  }
});

// Shift+Enter adds newline; Enter submits
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

inputEl.addEventListener('input', autoResize);

clearBtn.addEventListener('click', async () => {
  if (isLoading) return;
  await clearSession();
  // Remove all messages except the welcome one (first child)
  while (messagesEl.children.length > 1) {
    messagesEl.removeChild(messagesEl.lastChild);
  }
  inputEl.focus();
});

// ─── Init ─────────────────────────────────────────────────────────────────────────
inputEl.focus();
