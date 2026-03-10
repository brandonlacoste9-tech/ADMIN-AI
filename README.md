# ADMIN-AI — Agentic Admin Assistant

An intelligent, agentic AI assistant built to help administrators manage tasks, notes, and workflows efficiently.

![ADMIN-AI Screenshot](https://github.com/user-attachments/assets/62a45111-7f4d-4ba2-bb6c-656f16ac97e3)

## Features

- **💬 Agentic Chat** — Conversational AI powered by OpenAI GPT-4o with multi-step tool use
- **✅ Task Management** — Create, list, update, and delete tasks with priorities and due dates
- **📝 Notes** — Create, tag, search, and delete notes
- **🔍 Knowledge Base** — Search built-in admin documentation and how-to guides
- **🧮 Calculator** — Evaluate math expressions and percentages
- **🕐 Date & Time** — Look up the current date/time in any timezone
- **🗂 Session Management** — Per-user conversation history with automatic expiry

## Architecture

```
ADMIN-AI/
├── index.js                  # Entry point
├── src/
│   ├── server.js             # Express REST API
│   ├── agent.js              # Agentic AI loop (OpenAI + tool use)
│   ├── sessions.js           # In-memory session manager
│   └── tools/
│       ├── index.js          # Tool registry
│       ├── datetime.js       # Date/time tool
│       ├── calculator.js     # Math calculator tool
│       ├── tasks.js          # Task CRUD tools
│       ├── notes.js          # Notes CRUD tools
│       └── search.js         # Knowledge base search tool
├── public/
│   ├── index.html            # Admin dashboard UI
│   ├── style.css             # Dark-theme styles
│   └── app.js                # Frontend JavaScript
└── tests/
    ├── server.test.js        # API endpoint tests
    └── tools.test.js         # Tool unit tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=sk-your-api-key-here
# OPENAI_MODEL=gpt-4o   (optional, defaults to gpt-4o)
# PORT=3000              (optional, defaults to 3000)
```

### Running

```bash
npm start
```

Open your browser at [http://localhost:3000](http://localhost:3000).

### Development (auto-reload)

```bash
npm run dev
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/sessions` | Create a chat session |
| `DELETE` | `/api/sessions/:id` | Delete a session |
| `POST` | `/api/chat` | Send a message to ADMIN-AI |
| `GET` | `/api/sessions/:id/history` | Get conversation history |
| `DELETE` | `/api/sessions/:id/history` | Clear conversation history |

### Chat request

```json
POST /api/chat
{
  "sessionId": "<session-id>",
  "message": "Add a high-priority task to review the Q1 budget report"
}
```

### Chat response

```json
{
  "reply": "I've added the task **Review Q1 budget report** with high priority. ✅",
  "toolCalls": [
    {
      "name": "add_task",
      "args": { "title": "Review Q1 budget report", "priority": "high" },
      "result": { "success": true, "task": { "id": "...", "status": "pending" } }
    }
  ]
}
```

## Testing

```bash
npm test
```

55 tests covering all API endpoints, tools, and session management.

## Available Tools

| Tool | Description |
|------|-------------|
| `get_datetime` | Current date/time in any timezone |
| `calculate` | Evaluate math expressions and percentages |
| `add_task` | Add a task with priority and due date |
| `list_tasks` | List tasks filtered by status/priority |
| `update_task` | Update task status or details |
| `delete_task` | Delete a task |
| `create_note` | Create a tagged note |
| `list_notes` | List notes, optionally filtered by tag |
| `read_note` | Read the full content of a note |
| `delete_note` | Delete a note |
| `search_knowledge_base` | Search admin documentation |
