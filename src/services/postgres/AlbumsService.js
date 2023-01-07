const { Pool } = require('pg');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  // Crud
}

module.exports = AlbumsService;
