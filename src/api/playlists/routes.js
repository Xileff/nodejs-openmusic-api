const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistsHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  // {
  //   method: 'DELETE',
  //   path: '/playlists/{id}',
  //   handler: handler.deletePlaylistsByIdHandler,
  //   options: {
  //     auth: 'openmusic_jwt',
  //   },
  // },
  // {
  //   method: 'POST',
  //   path: '/playlists/{id}/songs',
  //   handler: handler.postPlaylistsSongByIdHandler,
  //   options: {
  //     auth: 'openmusic_jwt',
  //   },
  // },
  // {
  //   method: 'GET',
  //   path: '/playlists/{id}/songs',
  //   handler: handler.getPlaylistsSongByIdHandler,
  //   options: {
  //     auth: 'openmusic_jwt',
  //   },
  // },
  // {
  //   method: 'DELETE',
  //   path: '/playlists/{id}/songs',
  //   handler: handler.deletePlaylistsSongByIdHandler,
  //   options: {
  //     auth: 'openmusic_jwt',
  //   },
  // },
];

module.exports = routes;
