const config = require('./config');
const buildApp = require('./app');
const listenMock = require('./mock-server');

const start = async () => {
  listenMock();

  const app = buildApp();
  try {
    await app.listen({ port: config.port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
