/**
 * Calculator tool — evaluate safe mathematical expressions.
 */

const definition = {
  type: 'function',
  function: {
    name: 'calculate',
    description:
      'Evaluate a mathematical expression and return the result. Supports standard arithmetic, ' +
      'powers, square roots, and common math functions. Do NOT use this for currency conversion ' +
      'or real-time data.',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description:
            'The mathematical expression to evaluate, e.g. "2 + 2", "sqrt(144)", "2 ** 10".',
        },
      },
      required: ['expression'],
    },
  },
};

// Only allow safe mathematical characters and words — used to pre-screen the expression
const SAFE_PATTERN = /^[\d\s+\-*/.()\^%,]+$|^[a-z_]+\s*\(/i;

function sanitize(expr) {
  // Strip whitespace and check for dangerous patterns
  const cleaned = expr.trim();
  // Block anything that looks like property access or function calls not in our allow-list
  if (/[;`]/.test(cleaned)) return null;
  if (/\.\s*constructor/.test(cleaned)) return null;
  if (/prototype|__proto__|globalThis|process|require|import|eval|Function/.test(cleaned)) {
    return null;
  }
  // Accept expressions that look like pure math or start with a known function call
  if (!SAFE_PATTERN.test(cleaned)) return null;
  return cleaned;
}

function buildSafeExpression(expression) {
  // Replace bare function names with Math.xxx so "sqrt(4)" works
  const mathified = expression.replace(
    /\b(abs|ceil|floor|round|sqrt|cbrt|pow|log(?:2|10)?|sin|cos|tan|a(?:sin|cos|tan2?)|exp|sign|max|min|hypot|trunc)\s*\(/g,
    'Math.$1(',
  );
  // Replace PI and E constants, and ^ as exponent
  return mathified
    .replace(/\bPI\b/g, 'Math.PI')
    .replace(/\bE\b(?![a-zA-Z])/g, 'Math.E')
    .replace(/\^/g, '**');
}

function execute({ expression } = {}) {
  if (!expression) return { error: 'expression is required.' };

  const clean = sanitize(expression);
  if (!clean) {
    return { error: 'Invalid or potentially unsafe expression.' };
  }

  try {
    const safeExpr = buildSafeExpression(clean);
    // Use Function constructor in a controlled way — only Math is exposed
    // eslint-disable-next-line no-new-func
    const fn = new Function('Math', `"use strict"; return (${safeExpr});`);
    const result = fn(Math);
    if (typeof result !== 'number') {
      return { error: 'Expression did not produce a numeric result.' };
    }
    if (!isFinite(result)) {
      return { expression: clean, result: result.toString() };
    }
    return { expression: clean, result };
  } catch (err) {
    return { error: `Could not evaluate expression: ${err.message}` };
  }
}

export default { definition, execute };
