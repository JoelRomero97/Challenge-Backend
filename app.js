const fastify = require('fastify');
const config = require('./config');
const createUserRepository = require('./repositories/user.repository');
const createEventRepository = require('./repositories/event.repository');
const createUserService = require('./services/user.service');
const createEventService = require('./services/event.service');
const userRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');

const buildApp = (opts = {}) => {
  const app = fastify({ logger: { level: config.logLevel } });

  const userRepository = createUserRepository({ baseUrl: config.eventApi });
  const eventRepository = createEventRepository({ baseUrl: config.eventApi });

  const userService = createUserService({ userRepository });
  const eventService = createEventService({ eventRepository, userRepository });

  app.register(userRoutes, { userService });
  app.register(eventRoutes, { eventService });

  return app;
};

module.exports = buildApp;
