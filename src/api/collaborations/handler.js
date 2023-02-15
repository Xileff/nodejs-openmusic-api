const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationsHandler(request, h) {
    this._validator.validatePostCollaborationSchema(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationsService.addCollaborator(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationsHandler(request) {
    this._validator.validateDeleteCollaborationSchema(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const result = await this._collaborationsService.removeCollaborator(playlistId, userId);

    if (!result) {
      throw new InvariantError('Collaborator gagal dihapus');
    }

    return {
      status: 'success',
      message: 'Collaborator berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
