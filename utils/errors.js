// Thrown when the external Event API fails: network error, timeout or non-2xx response
class ExternalServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

// Thrown by the circuit breaker when it rejects a call without reaching the external API
class CircuitOpenError extends Error {
  constructor(retryAfterMs) {
    super('Circuit is open');
    this.name = 'CircuitOpenError';
    this.retryAfterMs = retryAfterMs;
  }
}

module.exports = {
  ExternalServiceError,
  CircuitOpenError,
};
