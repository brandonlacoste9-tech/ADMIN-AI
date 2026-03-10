/**
 * Tool registry — imports all tools and exports them as a unified list.
 */

import datetime from './datetime.js';
import notes from './notes.js';
import tasks from './tasks.js';
import calculator from './calculator.js';
import webSearch from './web_search.js';

/**
 * Array of all registered tools.
 * Each tool has:
 *   - definition: OpenAI function-calling schema
 *   - execute(args): function that performs the action and returns a result object
 */
const tools = [datetime, notes, tasks, calculator, webSearch];

/**
 * Map from function name to executor for fast lookup.
 * @type {Map<string, Function>}
 */
export const toolExecutors = new Map(
  tools.map((t) => [t.definition.function.name, t.execute]),
);

/**
 * OpenAI-formatted tool definitions array (passed in `tools` parameter of chat completion).
 */
export const toolDefinitions = tools.map((t) => t.definition);

export default tools;
