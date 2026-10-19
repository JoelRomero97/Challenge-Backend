const createEventService = ({ eventRepository, userRepository }) => {
  const getEvents = () => eventRepository.getEvents();

  const getEventsByUserId = async (userId) => {
    const userData = await userRepository.getUserById(userId);
    const userEvents = userData.events;
    const eventArray = [];

    for (const eventId of userEvents) {
      const event = await eventRepository.getEventById(eventId);
      eventArray.push(event);
    }
    return eventArray;
  };

  const addEvent = async (event) => {
    return eventRepository.addEvent({
      id: new Date().getTime(),
      ...event,
    });
  };

  return {
    getEvents,
    getEventsByUserId,
    addEvent,
  }
};

module.exports = createEventService;
