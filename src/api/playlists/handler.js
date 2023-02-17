const autoBind = require('auto-bind');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsHandler {
  constructor(playlistsService, songsService, collaborationsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistsHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist(name, credentialId);

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
    const playlists = await this._playlistsService.getPlaylists(credentialId);

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

    await this._collaborationsService.verifyAccess(playlistId, credentialId);
    await this._songsService.verifySongExists(songId);
    await this._playlistsService.addSongToPlaylist(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist',
    });
    response.code(201);

    return response;
  }

  async getPlaylistSongsByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._collaborationsService.verifyAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getSongsInPlaylist(playlistId);
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

    try {
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        const collaborator = await
        this._collaborationsService.verifyCollaborator(playlistId, credentialId);
        if (!collaborator) {
          throw new AuthorizationError('Anda bukan kolaborator playlist ini');
        }
      } else {
        throw error;
      }
    }

    await this._songsService.verifySongExists(songId);
    await this._playlistsService.deleteSongInPlaylist(playlistId, songId, credentialId);

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylist(playlistId);

    return {
      status: 'success',
      message: 'Berhasil menghapus playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const activities = await this._playlistsService.getPlaylistActivitiesById(playlistId);

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
