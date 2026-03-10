/**
 * agent.js — Agentic loop.
 *
 * Sends messages to the LLM, handles tool calls, and loops until the model
 * produces a final text response or the step limit is reached.
 */

import OpenAI from 'openai';
import { toolDefinitions, toolExecutors } from './tools/index.js';

const MAX_STEPS = 10; // Safety limit to prevent infinite loops

const SYSTEM_PROMPT = `You are ADMIN-AI, a highly capable agentic administrative assistant.
Your job is to help users with scheduling, tasks, notes, research, and calculations.

Guidelines:
- Always be concise, professional, and helpful.
- Use the available tools whenever they would improve the accuracy or completeness of your answer.
- You can call multiple tools in sequence if needed — think step by step.
- When a user asks to create, list, update, or delete notes or tasks, always use the appropriate tool.
- When asked about the current date or time, always call the get_datetime tool.
- For math problems, use the calculate tool to ensure accuracy.
- For questions that may require up-to-date information, use the web_search tool.
- Summarize tool results in a friendly, readable way — don't just dump raw data.
- If a tool returns an error, explain the issue to the user and suggest alternatives.`;

/**
 * @param {OpenAI} client
 * @param {Array} messages  — mutable conversation history
 * @returns {Promise<string>} — the assistant's final text response
 */
async function runAgentLoop(client, messages) {
  const model = process.env.MODEL || 'gpt-4o-mini';

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await client.chat.completions.create({
      model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Append the assistant's message (may contain tool calls or final text)
    messages.push(message);

    // If no tool calls, the model is done
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content || '';
    }

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      message.tool_calls.map(async (toolCall) => {
        const name = toolCall.function.name;
        const executor = toolExecutors.get(name);

        let result;
        if (!executor) {
          result = { error: `Unknown tool: "${name}"` };
        } else {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            result = await executor(args);
          } catch (err) {
            result = { error: `Tool execution failed: ${err.message}` };
          }
        }

        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        };
      }),
    );

    // Append all tool results to the conversation
    messages.push(...toolResults);
  }

  return 'I reached my step limit while working on your request. Please try again or simplify your request.';
}

/**
 * Creates a configured OpenAI client and wraps the agentic loop.
 *
 * @param {string} apiKey
 * @returns {{ chat: (messages: Array) => Promise<string> }}
 */
export function createAgent(apiKey) {
  const clientOptions = { apiKey };
  if (process.env.OPENAI_BASE_URL) {
    clientOptions.baseURL = process.env.OPENAI_BASE_URL;
  }
  const client = new OpenAI(clientOptions);

  return {
    /**
     * Run the agentic loop.
     * @param {Array} messages — full conversation history including the new user message
     * @returns {Promise<string>} — assistant reply
     */
    async chat(messages) {
      // Prepend the system prompt if not already present
      const withSystem =
        messages.length > 0 && messages[0].role === 'system'
          ? messages
          : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

      const finalReply = await runAgentLoop(client, withSystem);

      // If runAgentLoop returned a non-empty final text, use it directly
      if (finalReply) return finalReply;

      // Fall back: find the last assistant message with text content
      for (let i = withSystem.length - 1; i >= 0; i--) {
        const msg = withSystem[i];
        if (msg.role === 'assistant' && msg.content) {
          return msg.content;
        }
      }
      return 'No response generated.';
    },
  };
}
