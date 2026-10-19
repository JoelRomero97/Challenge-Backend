const required = ['PORT', 'EVENT_API'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

const config = Object.freeze({
  port: port,
  eventApi: process.env.EVENT_API,
  logLevel: process.env.LOG_LEVEL || 'info',
});

module.exports = config;
