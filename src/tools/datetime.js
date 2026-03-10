/**
 * Date/time tool — returns current date and time information.
 */

const definition = {
  type: 'function',
  function: {
    name: 'get_datetime',
    description:
      'Get the current date, time, day of the week, and timezone. Use this whenever the user asks about the current time or date.',
    parameters: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description:
            'IANA timezone name, e.g. "America/New_York". Defaults to UTC if not provided.',
        },
      },
      required: [],
    },
  },
};

function execute({ timezone } = {}) {
  const tz = timezone || 'UTC';
  try {
    const now = new Date();
    const options = {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    };
    const formatted = new Intl.DateTimeFormat('en-US', options).format(now);
    return { datetime: formatted, iso: now.toISOString(), timezone: tz };
  } catch {
    // Fall back to UTC if the timezone is invalid
    const now = new Date();
    return {
      datetime: now.toUTCString(),
      iso: now.toISOString(),
      timezone: 'UTC',
      warning: `Invalid timezone "${tz}", defaulted to UTC.`,
    };
  }
}

export default { definition, execute };
