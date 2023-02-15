require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const config = require('./utils/config');
const ClientError = require('./exceptions/ClientError');

// Import plugin, service, and validator
// albums
const AlbumsPlugin = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const SongsPlugin = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// users
const UsersPlugin = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const AuthenticationsPlugin = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlists
const PlaylistsPlugin = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// collaborations
const CollaborationsPlugin = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborators');

// Exports
const ExportsPlugin = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// Uploads
const UploadsPlugin = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// Cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  // Instance of services
  const cacheService = new CacheService();
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Error handling
  // Jika sudah pake ext onPreResponse, tidak boleh pake trycatch di Service
  server.ext('onPreResponse', (request, h) => {
    // Getting the context of response from the request
    const { response } = request;

    if (response instanceof Error) {
      // Handling client error with our custom error -> NotFoundError/InvariantError
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

    // if there is no error, then response is not intervened
    return h.continue;
  });

  // Registering external plugin
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.access_token_key,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.access_token_age,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Registering plugins with their service and validator
  await server.register([
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: SongsPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: UsersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: AuthenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: PlaylistsPlugin,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: CollaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: ExportsPlugin,
      options: {
        producerService: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: UploadsPlugin,
      options: {
        storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  process.stdout.write(`Server running at ${server.info.uri}`);
};

init();
