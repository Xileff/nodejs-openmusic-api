const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');

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

  async getPlaylists(userId) {
    const query = {
      text: `SELECT p.id, p.name, u.username FROM playlists p 
      LEFT JOIN collaborations c ON p.id = c.playlist_id
      LEFT JOIN users u ON p.owner = u.id
      WHERE p.owner = $1 OR c.user_id = $1
      GROUP BY p.id, u.username
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlist_songs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan song ke playlist');
    }

    const queryActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [
        `playlist_activity-${nanoid(16)}`,
        playlistId,
        songId,
        userId,
        'add',
        new Date().toISOString(),
      ],
    };

    const resultActivity = await this._pool.query(queryActivity);
    if (!resultActivity.rowCount) {
      throw new InvariantError('Gagal menambahkan riwayat playlist');
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

  async deleteSongInPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus song dari playlist. Id Song tidak ditemukan');
    }

    const queryActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [
        `playlist_activity-${nanoid(16)}`,
        playlistId,
        songId,
        userId,
        'delete',
        new Date().toISOString(),
      ],
    };

    const resultActivity = await this._pool.query(queryActivity);
    if (!resultActivity.rowCount) {
      throw new InvariantError('Gagal menambahkan riwayat playlist');
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

  async getPlaylistActivitiesById(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, a.action, a.time
      FROM playlist_song_activities a 
      LEFT JOIN songs s ON a.song_id = s.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.playlist_id = $1
      `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Riwayat tidak ditemukan');
    }

    return result.rows;
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

  async verifyPlaylistExists(playlistId) {
    const queryPlaylist = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const resultPlaylist = await this._pool.query(queryPlaylist);

    if (!resultPlaylist.rowCount) {
      throw new NotFoundError('Gagal menambahkan kolaborasi karena Playlist tidak ditemukan.');
    }
  }
}

module.exports = PlaylistsService;
