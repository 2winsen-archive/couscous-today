require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const expect = require('chai').expect

describe('ocr-exception.spec.js', () => {
    let OcrException

    beforeEach(() => {
        OcrException = proxyquire('exceptions/ocr-exception.js', {})
    })

    it('should create new exception object that is extended from Error', () => {
        const exception = new OcrException('Some exception')
        expect(exception.message).to.equal('Some exception')
        expect(exception.name).to.equal('OcrException')
        expect(exception).to.be.instanceof(Error)
    })
})
