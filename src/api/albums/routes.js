const routes = (handler) => [
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: () => {},
  },
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: () => {},
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: () => {},
  },
];

module.exports = routes;
