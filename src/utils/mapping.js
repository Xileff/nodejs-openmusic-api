const mapSongsToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const mapPlaylistsToModel = ({
  id,
  name,
  owner,
}) => ({
  id,
  name,
  username: owner,
});

const mapAlbumsToModel = ({
  id,
  name,
  year,
  cover_url,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
});

module.exports = { mapSongsToModel, mapPlaylistsToModel, mapAlbumsToModel };
