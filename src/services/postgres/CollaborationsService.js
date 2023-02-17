const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
  constructor(usersService, playlistsService) {
    this._pool = new Pool();
    this._usersService = usersService;
    this._playlistsService = playlistsService;
  }

  async addCollaborator(playlistId, userId) {
    await this._usersService.verifyUserExists(userId);
    await this._playlistsService.verifyPlaylistExists(playlistId);

    const collaborationsId = `collaborations-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [collaborationsId, playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan kolaborasi');
    }

    return result.rows[0].id;
  }

  async removeCollaborator(playlistId, userId) {
    await this._usersService.verifyUserExists(userId);
    await this._playlistsService.verifyPlaylistExists(playlistId);

    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    return result.rowCount;
  }

  async verifyAccess(playlistId, userId) {
    try {
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        const collaborator = await this.verifyCollaborator(playlistId, userId);
        if (!collaborator) {
          throw new AuthorizationError('Anda bukan kolaborator playlist ini');
        }
      } else {
        throw error;
      }
    }
  }
}

module.exports = CollaborationsService;
