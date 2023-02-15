const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumsToModel } = require('../../utils/mapping');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  // Crud
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const resultAlbums = await this._pool.query(queryAlbum);

    if (!resultAlbums.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const resultSongs = await this._pool.query(querySongs);

    return {
      album: resultAlbums.rows.map(mapAlbumsToModel)[0],
      songs: resultSongs.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $2, year = $3 WHERE id = $1 RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album karena id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id;',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus album karena id tidak ditemukan.');
    }
  }

  async editAlbumCoverById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $2 WHERE id = $1 RETURNING id;',
      values: [id, coverUrl],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memasukkan cover album karena id tidak ditemukan');
    }
  }

  async setAlbumLikesById(id, userId) {
    const likeId = `likes-${nanoid(16)}`;

    const queryCheck = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, id],
    };
    const resultCheck = await this._pool.query(queryCheck);

    if (resultCheck.rowCount) {
      const queryDelete = {
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
        values: [userId, id],
      };
      await this._pool.query(queryDelete);
    } else {
      const queryAdd = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
        values: [likeId, userId, id],
      };
      await this._pool.query(queryAdd);
    }
    await this._cacheService.del(`likes-of-album:${id}`);
  }

  async getAlbumLikesById(id) {
    try {
      const result = await this._cacheService.get(`likes-of-album:${id}`);
      return {
        isCache: true,
        likes: JSON.parse(result),
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`likes-of-album:${id}`, JSON.stringify(result.rows[0].count));

      return {
        isCache: false,
        likes: result.rows[0].count,
      };
    }
  }

  async verifyAlbumExists(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
