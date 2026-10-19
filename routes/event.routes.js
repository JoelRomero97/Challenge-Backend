const eventRoutes = async (fastify, { eventService }) => {
  fastify.get('/getEvents', async () => eventService.getEvents());

  fastify.get('/getEventsByUserId/:id', async (request) => {
      const { id } = request.params;
      return eventService.getEventsByUserId(id);
    }
  );

  fastify.post('/addEvent', async (request) => eventService.addEvent(request.body));
};

module.exports = eventRoutes;
