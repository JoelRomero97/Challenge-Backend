const userRoutes = async (fastify, { userService }) => {
  fastify.get('/getUsers', async () => userService.getUsers());
};

module.exports = userRoutes;
