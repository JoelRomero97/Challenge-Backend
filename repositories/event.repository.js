const createEventRepository = ({ baseUrl }) => {
  const getEvents = async () => {
    const resp = await fetch(`${baseUrl}/getEvents`);
    return resp.json();
  };

  const getEventById = async (id) => {
    const resp = await fetch(`${baseUrl}/getEventById/${id}`);
    return resp.json();
  };

  const addEvent = async (event) => {
    const resp = await fetch(`${baseUrl}/addEvent`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
    return resp.json();
  };

  return {
    getEvents,
    getEventById,
    addEvent,
  }
};

module.exports = createEventRepository;
