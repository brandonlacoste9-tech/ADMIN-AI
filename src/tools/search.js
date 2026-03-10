'use strict';

// Simulated knowledge-base search for admin topics.
// In production this would connect to a real search API or vector database.
const KNOWLEDGE_BASE = [
  {
    title: 'How to reset a user password',
    content:
      'Navigate to Admin > Users, select the user, and click "Reset Password". An email will be sent to the user with a reset link.',
    category: 'user-management',
  },
  {
    title: 'Generating monthly reports',
    content:
      'Go to Reports > Monthly Summary, choose the date range, and click Export. Reports are available in PDF and CSV formats.',
    category: 'reporting',
  },
  {
    title: 'Setting up 2FA for admin accounts',
    content:
      'Navigate to Settings > Security > Two-Factor Authentication and follow the TOTP setup wizard. Authenticator apps like Google Authenticator are supported.',
    category: 'security',
  },
  {
    title: 'Configuring email notifications',
    content:
      'Under Settings > Notifications you can configure which events trigger email alerts and which email addresses receive them.',
    category: 'configuration',
  },
  {
    title: 'Managing roles and permissions',
    content:
      'Roles are defined under Admin > Roles. Assign permissions per role and then assign roles to users from the Users management panel.',
    category: 'user-management',
  },
  {
    title: 'Scheduling automated backups',
    content:
      'Go to Settings > Backup and set a schedule (daily, weekly, monthly). Backups are stored in the configured storage backend.',
    category: 'maintenance',
  },
  {
    title: 'Integrating with third-party APIs',
    content:
      'API keys for third-party integrations are managed under Settings > Integrations. Each integration has its own configuration panel.',
    category: 'integration',
  },
  {
    title: 'Audit log review',
    content:
      'All admin actions are logged and accessible via Admin > Audit Logs. You can filter by user, action type, or date range.',
    category: 'security',
  },
];

const definition = {
  type: 'function',
  function: {
    name: 'search_knowledge_base',
    description:
      'Search the admin knowledge base for documentation, how-to guides, and best practices.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search terms or a question to find relevant articles.',
        },
        category: {
          type: 'string',
          enum: [
            'user-management',
            'reporting',
            'security',
            'configuration',
            'maintenance',
            'integration',
            'all',
          ],
          description: 'Optionally narrow the search to a category.',
        },
        max_results: {
          type: 'integer',
          description: 'Maximum number of results to return (default 3).',
        },
      },
      required: ['query'],
    },
  },
};

function execute({ query, category = 'all', max_results = 3 }) {
  if (!query || typeof query !== 'string') {
    return { error: 'No query provided.' };
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  let results = KNOWLEDGE_BASE.filter(
    (article) => category === 'all' || article.category === category
  );

  // Simple relevance scoring: count matched terms
  results = results
    .map((article) => {
      const haystack = `${article.title} ${article.content}`.toLowerCase();
      const score = terms.reduce(
        (acc, term) => acc + (haystack.includes(term) ? 1 : 0),
        0
      );
      return { ...article, score };
    })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max_results)
    .map(({ title, content, category: cat }) => ({ title, content, category: cat }));

  return {
    results,
    total: results.length,
    query,
  };
}

module.exports = { definition, execute };
