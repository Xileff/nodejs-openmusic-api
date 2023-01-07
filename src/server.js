require('dotenv').config();
const Hapi = require('@hapi/hapi');

// Plugin, service, and validator
const AlbumsPlugin = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const init = async () => {
  // Services
  const albumsService = new AlbumsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register plugins
  await server.register([
    {
      plugin: AlbumsPlugin,
      options: {
        albums: [
          albumsService,
          AlbumsValidator,
        ],
      },
    },
  ]);

  await server.start();
  process.stdout.write(`Server running at ${server.info.uri}`);
};

init();
