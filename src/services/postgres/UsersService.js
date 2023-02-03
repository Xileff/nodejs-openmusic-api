const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    const queryCheck = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    const existingUser = await this._pool.query(queryCheck);
    if (existingUser.rowCount) {
      throw new InvariantError('Username sudah digunakan');
    }

    const userId = `user-${nanoid(16)}`;
    const queryInsert = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id;',
      values: [userId, username, password, fullname],
    };

    const { rows } = await this._pool.query(queryInsert);

    if (!rows[0].id) {
      throw new InvariantError('User gagal diregistrasi.');
    }

    return rows[0].id;
  }
}

module.exports = UsersService;
