const mapSongsToModel = ({
  id, title, year, genre, performer, duration, album_id,
}) => ({
  id, title, year, genre, performer, duration, albumId: album_id,
});

const mapPlaylistsToModel = ({ id, name, owner }) => ({ id, name, username: owner });

module.exports = { mapSongsToModel, mapPlaylistsToModel };
