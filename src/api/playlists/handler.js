const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistService, playlistValidator) {
    this._service = playlistService;
    this._validator = playlistValidator;

    autoBind(this);
  }

  async postPlaylistsHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);

    return response;
  }

  async getPlaylistsHandler(request, h) {
    // get user id
    const id = 1;
    const playlists = await this._service.getPlaylists(id);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  // async deletePlaylistsByIdHandler(request, h) {

  // }

  // async postPlaylistsSongByIdHandler(request, h) {

  // }

  // async getPlaylistsSongByIdHandler(request, h) {

  // }

  // async deletePlaylistsSongByIdHandler(request, h) {

  // }
}

module.exports = PlaylistsHandler;
