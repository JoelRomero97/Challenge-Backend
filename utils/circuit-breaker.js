const { CircuitState } = require('./enums');
const { CircuitOpenError } = require('./errors');

const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW_MS = 30_000;
// How long to wait before each test request, the last value is reused until the service recovers: 15s
const RETRY_DELAYS_MS = [1_000, 2_000];

const createCircuitBreaker = (logger = console) => {
  let state = CircuitState.CLOSED;
  let failures = [];
  let retryIndex = 0;
  let nextAttemptAt = 0;

  const setState = (newState, details = '') => {
    state = newState;
    logger.warn(`Circuit breaker is ${state} ${details}`.trim());
  };

  const open = () => {
    const delayMs = RETRY_DELAYS_MS[retryIndex];
    nextAttemptAt = Date.now() + delayMs;
    setState(CircuitState.OPEN, `retrying in ${delayMs}ms`);
  };

  const close = () => {
    // Reset values
    failures = [];
    retryIndex = 0;
    setState(CircuitState.CLOSED);
  };

  const recordFailure = () => {
    const now = Date.now();
    failures = failures.filter((time) => now - time < FAILURE_WINDOW_MS);
    failures.push(now);

    if (failures.length >= FAILURE_THRESHOLD) {
      open();
    }
  };

  // Moves to the next retry delay, staying on the last one once reached
  const useNextRetryDelay = () => {
    const lastIndex = RETRY_DELAYS_MS.length - 1;
    if (retryIndex < lastIndex) {
      retryIndex++;
    }
  };

  // CLOSED runs the call and keep track of failures
  const runNormalCall = async (fn) => {
    try {
      return await fn();
    } catch (err) {
      // Skip if other calls already opened the circuit while this one was running
      if (state === CircuitState.CLOSED) {
        recordFailure();
      }
      throw err;
    }
  };

  // HALF_OPEN runs the single test call, its result decides if the API has recovered or not
  const runTestCall = async (fn) => {
    try {
      const result = await fn();
      close();
      return result;
    } catch (err) {
      useNextRetryDelay();
      open();
      throw err;
    }
  };

  const execute = async (fn) => {
    if (state === CircuitState.CLOSED) {
      return runNormalCall(fn);
    }

    if (state === CircuitState.HALF_OPEN) {
      // A test call is already running
      throw new CircuitOpenError(RETRY_DELAYS_MS[retryIndex]);
    }

    // OPEN: reject until the retry delay is over, then let this call through as the test call
    const remainingMs = nextAttemptAt - Date.now();
    if (remainingMs > 0) {
      throw new CircuitOpenError(remainingMs);
    }
    setState(CircuitState.HALF_OPEN);
    return runTestCall(fn);
  };

  const getState = () => state;

  return {
    execute,
    getState,
  };
};

module.exports = {
  createCircuitBreaker,
  RETRY_DELAYS_MS,
};
