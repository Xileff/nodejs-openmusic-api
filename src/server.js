require('dotenv').config();
const Hapi = require('@hapi/hapi');

// Plugin, service, and validator
const AlbumsPlugin = require('./api/albums');
const ClientError = require('./exceptions/ClientError');
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

  // Error handling
  server.ext('onPreResponse', (request, h) => {
    // Getting the context of response from the request
    const { response } = request;

    if (response instanceof Error) {
      // Handling client error ourselves
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Handling client error with native Hapi
      if (!response.isServer) {
        return h.continue;
      }

      // Handling server error
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      console.error(response.message);
      newResponse.code(500);
      return newResponse;
    }

    // if there is no error, then response is not intervend
    return h.continue;
  });

  // Register plugins
  await server.register([
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
  ]);

  await server.start();
  process.stdout.write(`Server running at ${server.info.uri}`);
};

init();
