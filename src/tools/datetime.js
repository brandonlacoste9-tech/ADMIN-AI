'use strict';

const definition = {
  type: 'function',
  function: {
    name: 'get_datetime',
    description:
      'Get the current date and/or time, optionally in a specific timezone.',
    parameters: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description:
            'IANA timezone name (e.g. "America/New_York"). Defaults to UTC.',
        },
        format: {
          type: 'string',
          enum: ['date', 'time', 'datetime'],
          description: 'What to return: date only, time only, or full datetime.',
        },
      },
      required: [],
    },
  },
};

function execute({ timezone = 'UTC', format = 'datetime' } = {}) {
  let date;
  try {
    date = new Date().toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    date = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    timezone = 'UTC';
  }

  const now = new Date();
  const options = { timeZone: timezone };

  if (format === 'date') {
    return {
      date: now.toLocaleDateString('en-US', {
        ...options,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      timezone,
    };
  }

  if (format === 'time') {
    return {
      time: now.toLocaleTimeString('en-US', {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      timezone,
    };
  }

  return { datetime: date, timezone };
}

module.exports = { definition, execute };
