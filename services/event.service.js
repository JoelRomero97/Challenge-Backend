const createEventService = ({ eventRepository, userRepository }) => {
  const getEvents = () => eventRepository.getEvents();

  const getEventsByUserId = async (userId) => {
    const userData = await userRepository.getUserById(userId);
    const userEvents = userData.events;

    /*
      Fetch all events concurrently instead of one at a time, Promise.all keeps the results in the same order.
      One change we could implement here is to use Promise.allSettled instead, so if one event fails, we can still get
      results for the ones that didn't fail or even implement retries for the ones that failed.
    */
    return Promise.all(
      userEvents.map((eventId) => eventRepository.getEventById(eventId))
    );
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
