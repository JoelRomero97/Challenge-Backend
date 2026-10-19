const { ExternalServiceError } = require('../utils/errors');

const REQUEST_TIMEOUT_MS = 5_000;

const createEventRepository = ({ baseUrl, addEventBreaker }) => {
  const getEvents = async () => {
    const resp = await fetch(`${baseUrl}/getEvents`);
    return resp.json();
  };

  const getEventById = async (id) => {
    const resp = await fetch(`${baseUrl}/getEventById/${id}`);
    return resp.json();
  };

  const addEvent = (event) => addEventBreaker.execute(async () => {
    let resp;
    try {
      resp = await fetch(`${baseUrl}/addEvent`, {
        method: 'POST',
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      throw new ExternalServiceError(`Request to Event API failed with ${err.message}`);
    }

    if (!resp.ok) {
      throw new ExternalServiceError(`Event API responded with ${resp.status}`);
    }
    return resp.json();
  });

  return {
    getEvents,
    getEventById,
    addEvent,
  }
};

module.exports = createEventRepository;
