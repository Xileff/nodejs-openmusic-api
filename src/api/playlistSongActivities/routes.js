const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getActivitiesHandler,
  },
];

module.exports = routes;
