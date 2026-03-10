'use strict';

const datetime = require('./datetime');
const calculator = require('./calculator');
const tasks = require('./tasks');
const notes = require('./notes');
const search = require('./search');

/**
 * All tool definitions to send to the OpenAI API.
 */
const definitions = [
  datetime.definition,
  calculator.definition,
  ...tasks.definitions,
  ...notes.definitions,
  search.definition,
];

/**
 * Execute a tool call by name, passing the session context and arguments.
 *
 * @param {string} sessionId - Session identifier for stateful tools.
 * @param {string} name      - Tool function name.
 * @param {object} args      - Parsed arguments from the AI.
 * @returns {object}         - Tool result object.
 */
function execute(sessionId, name, args) {
  switch (name) {
    case 'get_datetime':
      return datetime.execute(args);

    case 'calculate':
      return calculator.execute(args);

    case 'add_task':
      return tasks.addTask(sessionId, args);
    case 'list_tasks':
      return tasks.listTasks(sessionId, args);
    case 'update_task':
      return tasks.updateTask(sessionId, args);
    case 'delete_task':
      return tasks.deleteTask(sessionId, args);

    case 'create_note':
      return notes.createNote(sessionId, args);
    case 'list_notes':
      return notes.listNotes(sessionId, args);
    case 'read_note':
      return notes.readNote(sessionId, args);
    case 'delete_note':
      return notes.deleteNote(sessionId, args);

    case 'search_knowledge_base':
      return search.execute(args);

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

module.exports = { definitions, execute };
