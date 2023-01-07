const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;
