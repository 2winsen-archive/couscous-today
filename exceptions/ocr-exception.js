const util = require('util')

function OcrException(message) {
    Error.apply(this, arguments)
    Error.captureStackTrace(this, OcrException)
    this.message = message
}
util.inherits(OcrException, Error)
OcrException.prototype.name = 'OcrException'

module.exports = OcrException
