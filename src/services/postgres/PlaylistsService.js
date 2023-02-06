const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const { mapPlaylistsToModel } = require('../../utils/index');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapPlaylistsToModel);
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_songs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan song ke playlist');
    }
  }

  async getSongsInPlaylist(playlistId) {
    const queryPlaylist = {
      text: `SELECT p.id, p.name, u.username
      FROM playlists p LEFT JOIN users u
      ON p.owner = u.id
      WHERE p.id = $1`,
      values: [playlistId],
    };
    const resultPlaylist = await this._pool.query(queryPlaylist);
    const playlist = resultPlaylist.rows[0];

    const querySongs = {
      text: `SELECT s.id, s.title, s.performer
      FROM playlist_songs ps LEFT JOIN songs s
      ON s.id = ps.song_id
      WHERE ps.playlist_id = $1
      `,
      values: [playlistId],
    };
    const resultSongs = await this._pool.query(querySongs);
    const songs = resultSongs.rows;

    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs,
    };
  }

  async deleteSongInPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus song dari playlist. Id Song tidak ditemukan');
    }
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist. Id playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini.');
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Song tidak ditemukan');
    }
  }

  // async verifyPlaylistAccess(playlistId, userId) {
  //   try {
  //     this.verifyPlaylistOwner(playlistId, userId);
  //   } catch (error) {
  //     if (error instanceof NotFoundError) {
  //       throw error;
  //     }

  //     // todo : complete collaborations logic
  //   }
  // }
}

module.exports = PlaylistsService;
