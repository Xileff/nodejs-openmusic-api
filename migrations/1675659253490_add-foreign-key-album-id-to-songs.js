/* eslint-disable max-len */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // Kolom album_id akan diset menjadi foreign key, sehingga semua songs yang memiliki album_id NULL harus diberi nilai
  pgm.sql("INSERT INTO albums VALUES('no_album', 'no_album', '9999')");

  pgm.sql("UPDATE songs SET album_id = 'no_album' WHERE album_id IS NULL");

  pgm.addConstraint('songs', 'fk_songs.albums_id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.albums_id');

  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id IS 'no_album");

  pgm.sql("DELETE FROM albums WHERE id = 'no_album'");
};
