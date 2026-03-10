'use strict';

const definition = {
  type: 'function',
  function: {
    name: 'calculate',
    description:
      'Evaluate a mathematical expression and return the result. Supports arithmetic, percentages, and basic math functions.',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description:
            'A mathematical expression to evaluate (e.g. "2 + 2", "15% of 200", "sqrt(144)").',
        },
      },
      required: ['expression'],
    },
  },
};

const ALLOWED_PATTERN =
  /^[\d\s+\-*/().%,e^]+$|^sqrt\([\d.]+\)$|^([\d.]+)%\s*of\s*([\d.]+)$/i;

function execute({ expression }) {
  if (!expression || typeof expression !== 'string') {
    return { error: 'No expression provided.' };
  }

  const expr = expression.trim();

  // Handle "X% of Y" shorthand
  const percentOf = expr.match(/^([\d.]+)%\s*of\s*([\d.]+)$/i);
  if (percentOf) {
    const pct = parseFloat(percentOf[1]);
    const base = parseFloat(percentOf[2]);
    if (!isNaN(pct) && !isNaN(base)) {
      return { expression: expr, result: (pct / 100) * base };
    }
  }

  // Handle sqrt shorthand
  const sqrtMatch = expr.match(/^sqrt\(([\d.]+)\)$/i);
  if (sqrtMatch) {
    const n = parseFloat(sqrtMatch[1]);
    if (!isNaN(n)) {
      return { expression: expr, result: Math.sqrt(n) };
    }
  }

  // Validate safe characters only – no eval on arbitrary input
  const sanitized = expr.replace(/\^/g, '**');
  if (!ALLOWED_PATTERN.test(sanitized)) {
    // Try with the substituted ^ as well
    const cleanTest = /^[\d\s+\-*/().%,e^*]+$/.test(sanitized);
    if (!cleanTest) {
      return { error: 'Expression contains unsupported characters or operations.' };
    }
  }

  try {
    // Use Function constructor in a restricted way – only numeric expressions
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + sanitized + ')')();
    if (typeof result !== 'number' || !isFinite(result)) {
      return { error: 'Expression did not produce a valid number.' };
    }
    return { expression: expr, result };
  } catch {
    return { error: 'Could not evaluate expression.' };
  }
}

module.exports = { definition, execute };
