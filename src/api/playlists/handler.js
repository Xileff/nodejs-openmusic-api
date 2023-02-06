const autoBind = require('auto-bind');
const AuthorizationError = require('../../exceptions/AuthorizationError');

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

    const playlistId = await this._service.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);

    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    // todo : add collaborator check instead of just checking owner
    await this._service.verifySongExists(songId);
    await this._service.addSongToPlaylist(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist',
    });
    response.code(201);

    return response;
  } //

  async getPlaylistSongsByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // todo : add collaborator check instead of just checking owner. maybe do try catch here
    // maybe we can make a function to simplify this process
    try {
      await this._service.verifyPlaylistOwner(playlistId, credentialId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        console.log('Check collaborator');
        throw error; // this should be removed later
      } else {
        throw error;
      }
    }
    const playlist = await this._service.getSongsInPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.verifySongExists(songId);
    await this._service.deleteSongInPlaylist(playlistId, songId, credentialId);

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  } //

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylist(playlistId);

    return {
      status: 'success',
      message: 'Berhasil menghapus playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivitiesById(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
