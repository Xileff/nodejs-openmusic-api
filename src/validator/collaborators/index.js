const { PostCollaborationSchema, DeleteCollaborationSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const CollaborationsValidator = {
  validatePostCollaborationSchema: (payload) => {
    const validationResult = PostCollaborationSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteCollaborationSchema: (payload) => {
    const validationResult = DeleteCollaborationSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationsValidator;
