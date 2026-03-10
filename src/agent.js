'use strict';

const OpenAI = require('openai').default;
const tools = require('./tools/index');

const SYSTEM_PROMPT = `You are ADMIN-AI, an intelligent agentic assistant built to help administrators manage tasks, notes, and workflows efficiently.

Your capabilities:
- **Task Management**: Create, list, update, and delete tasks with priorities and due dates.
- **Notes**: Create, read, list, and delete notes with tagging support.
- **Knowledge Base**: Search the admin documentation for how-to guides and best practices.
- **Date & Time**: Look up the current date/time in any timezone.
- **Calculator**: Evaluate mathematical expressions, percentages, and calculations.

Guidelines:
- Be concise, professional, and proactive.
- Always use tools to fetch live data rather than making up information.
- When managing tasks or notes, confirm what action was taken.
- If multiple steps are needed, complete them one at a time and report results clearly.
- Format responses using markdown when helpful (lists, bold text, tables).
- If you are unsure, ask a clarifying question.`;

const MAX_TOOL_ROUNDS = 10;

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

/**
 * Run an agentic conversation turn.
 *
 * @param {string} sessionId - Unique session identifier.
 * @param {Array}  history   - Conversation history (array of OpenAI message objects).
 * @param {string} userMessage - The latest user message.
 * @returns {Promise<{reply: string, toolCalls: Array, updatedHistory: Array}>}
 */
async function runAgent(sessionId, history, userMessage) {
  const client = getClient();

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const toolCallLog = [];
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    round++;

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages,
      tools: tools.definitions,
      tool_choice: 'auto',
    });

    const message = response.choices[0].message;
    messages.push(message);

    // No tool calls – we have the final answer
    if (!message.tool_calls || message.tool_calls.length === 0) {
      const updatedHistory = messages.slice(1); // remove system prompt
      return {
        reply: message.content,
        toolCalls: toolCallLog,
        updatedHistory,
      };
    }

    // Execute each tool call
    for (const call of message.tool_calls) {
      let args;
      try {
        args = JSON.parse(call.function.arguments);
      } catch {
        args = {};
      }

      const result = tools.execute(sessionId, call.function.name, args);
      toolCallLog.push({ name: call.function.name, args, result });

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  // Safety fallback after too many rounds
  return {
    reply:
      'I reached the maximum number of processing steps. Please try rephrasing your request.',
    toolCalls: toolCallLog,
    updatedHistory: messages.slice(1),
  };
}

module.exports = { runAgent };
