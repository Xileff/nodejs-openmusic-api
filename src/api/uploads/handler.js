const autoBind = require('auto-bind');
const config = require('../../utils/config');

class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const fileName = await this._storageService.writeFile(cover, cover.hapi);
    const pictureUrl = `http://${config.app.host}:${config.app.port}/upload/images/${fileName}`;

    await this._albumsService.editAlbumCoverById(id, pictureUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
