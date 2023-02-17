// Membungkus Handler dan Route menjadi 1 plugin
const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { playlistsService, collaborationsService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      collaborationsService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};

// instance service dan validator diperoleh dari server
