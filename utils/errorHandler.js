const { CircuitOpenError, ExternalServiceError } = require('./errors');

const errorHandler = (err, request, reply) => {
  if (err instanceof CircuitOpenError) {
    const retryAfter = Math.ceil(err.retryAfterMs / 1000);
    return reply
      .code(503)
      .header('Retry-After', retryAfter)
      .send({
        error: 'Service Unavailable',
        message: 'Event service is temporarily unavailable, please try again later',
        retryAfter,
      });
  }

  if (err instanceof ExternalServiceError) {
    request.log.error({ err }, 'Event API request failed');
    return reply.code(502).send({
      error: 'Bad Gateway',
      message: 'Event service failed to process the request',
    });
  }

  // Anything else keeps Fastify's default error handling
  throw err;
};

module.exports = errorHandler;
