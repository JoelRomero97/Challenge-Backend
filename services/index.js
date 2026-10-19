const config = require('../config');
const fastify = require('fastify')({ logger: { level: config.logLevel } });
const listenMock = require('../mock-server');

fastify.get('/getUsers', async (request, reply) => {
    const resp = await fetch(config.eventApi + '/getUsers');
    const data = await resp.json();
    reply.send(data); 
});

fastify.post('/addEvent', async (request, reply) => {
  try {
    const resp = await fetch(config.eventApi + '/addEvent', {
      method: 'POST',
      body: JSON.stringify({
        id: new Date().getTime(),
        ...request.body
      })
    });
    const data = await resp.json();
    reply.send(data);
  } catch(err) {
    reply.error(err);
  }
});

fastify.get('/getEvents', async (request, reply) => {  
    const resp = await fetch(config.eventApi + '/getEvents');
    const data = await resp.json();
    reply.send(data);
});

fastify.get('/getEventsByUserId/:id', async (request, reply) => {
    const { id } = request.params;
    const user = await fetch(config.eventApi + '/getUserById/' + id);
    const userData = await user.json();
    const userEvents = userData.events;
    const eventArray = [];
    
    for(let i = 0; i < userEvents.length; i++) {
        const event = await fetch(config.eventApi + '/getEventById/' + userEvents[i]);
        const eventData = await event.json();
        eventArray.push(eventData);
    }
    reply.send(eventArray);
});

fastify.listen({ port: config.port }, (err) => {
    listenMock();
    if (err) {
      fastify.log.error(err);
      process.exit();
    }
});
