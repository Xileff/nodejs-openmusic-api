const Joi = require('joi');

const PostPlaylistSchema = Joi.object({
  name: Joi.string().required(),
});

const PostPlaylistSongSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeletePlaylistSongSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistSchema,
  PostPlaylistSongSchema,
  DeletePlaylistSongSchema,
};
