# ADMIN-AI — Agentic AI Assistant

An agentic AI assistant for administrative tasks, built with Node.js, Express, and the OpenAI API.

![ADMIN-AI Screenshot](https://github.com/user-attachments/assets/0d62e1fc-e736-4e85-a7bc-0abeb36ddfe3)

## Features

- 🤖 **Agentic loop** — the assistant autonomously chains tool calls to complete complex tasks
- 📅 **Date & time** — queries the current date/time in any IANA timezone
- 📝 **Notes** — create, read, update, and delete session notes
- ✅ **Tasks** — to-do list with priorities, due dates, and completion tracking
- 🧮 **Calculator** — evaluates mathematical expressions safely
- 🔍 **Web search** — fetches instant answers via DuckDuckGo
- 💬 **Chat UI** — dark-themed web interface with markdown rendering
- 🔒 **Rate limiting** — built-in per-IP rate limiting on all API endpoints

## Getting Started

### Prerequisites

- Node.js 18+ (ES modules required)
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY

# 3. Start the server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Development (auto-reload)

```bash
npm run dev
```

## Configuration

| Variable          | Description                                  | Default         |
|-------------------|----------------------------------------------|-----------------|
| `OPENAI_API_KEY`  | Your OpenAI API key (required)               | —               |
| `PORT`            | Port the server listens on                   | `3000`          |
| `OPENAI_BASE_URL` | Custom OpenAI-compatible API base URL        | OpenAI default  |
| `MODEL`           | LLM model to use                             | `gpt-4o-mini`   |

## Project Structure

```
├── src/
│   ├── index.js          # Express server entry point
│   ├── agent.js          # Agentic loop (OpenAI function calling)
│   ├── routes/
│   │   └── chat.js       # POST /api/chat — session-aware chat endpoint
│   ├── tools/
│   │   ├── index.js      # Tool registry
│   │   ├── datetime.js   # get_datetime tool
│   │   ├── notes.js      # manage_notes tool
│   │   ├── tasks.js      # manage_tasks tool
│   │   ├── calculator.js # calculate tool
│   │   └── web_search.js # web_search tool
│   └── tests/
│       └── tools.test.js # Unit tests (Node.js built-in runner)
├── public/
│   ├── index.html        # Chat UI
│   ├── css/style.css     # Styles
│   └── js/app.js         # Frontend JavaScript
└── .env.example          # Environment variable template
```

## API

### `POST /api/chat`

Send a message and receive the assistant's reply.

**Request:**
```json
{ "message": "What time is it?", "sessionId": "optional-session-id" }
```

**Response:**
```json
{ "reply": "It's 2:30 PM UTC on Tuesday, March 10, 2026.", "sessionId": "..." }
```

### `DELETE /api/chat/:sessionId`

Clear a session's conversation history.

### `GET /api/health`

Health check endpoint.

## Running Tests

```bash
npm test
```

22 unit tests covering all tools.

## License

MIT
