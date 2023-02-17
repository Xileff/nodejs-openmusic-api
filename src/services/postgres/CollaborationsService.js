const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

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
    // cek if user exists
    const queryUser = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };
    const resultUser = await this._pool.query(queryUser);

    if (!resultUser.rowCount) {
      throw new NotFoundError('Gagal menambahkan kolaborasi karena User tidak ditemukan.');
    }

    // cek if playlist exists
    const queryPlaylist = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const resultPlaylist = await this._pool.query(queryPlaylist);

    if (!resultPlaylist.rowCount) {
      throw new NotFoundError('Gagal menambahkan kolaborasi karena Playlist tidak ditemukan.');
    }

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
}

module.exports = CollaborationsService;
