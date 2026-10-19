const CircuitState = Object.freeze({
  CLOSED: 'CLOSED', // Normal, if 3 calls fail within 30s, the circuit moves to OPEN.
  OPEN: 'OPEN', // API is considered down: calls are rejected right away without reaching it. Once the current retry delay is over, the next call moves the circuit to HALF_OPEN.

  // This state checks if the external API has recovered: exactly one call is allowed as some sort of test,
  // while any other call that arrives is rejected:
  //   1. Test call succeeds -> the API is back, move to CLOSED state and start over.
  //   2. Test call fails -> the API is still down, move back to OPEN and wait the next retry (which now, has a higher delay).
  HALF_OPEN: 'HALF_OPEN',
});

module.exports = {
  CircuitState,
};
