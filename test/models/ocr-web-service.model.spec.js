require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const TestUtils = require('test/test-utils')
const expect = require('chai').expect
const OcrException = require('exceptions/ocr-exception')


describe('ocr-web-service.model.spec.js', () => {
    let target
    let sandbox
    let targetStubs
    let targetObservable
    let momentStub
    const testJson = { OCRText: [['prefix PIRMDIENA, 13. Marts AA OTRDIENA, 14. Marts BB']] }

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
        momentStub = { day: TestUtils.empty, format: TestUtils.empty }
        targetStubs = {
            'fs': {},
            'request': {},
            'moment': () => momentStub,
            'models/couscous-checker.model': {},
            'base-64': {}
        }
        target = proxyquire('models/ocr-web-service.model', targetStubs)
    })

    afterEach(() => {
        targetObservable && targetObservable.unsubscribe()
        sandbox = sinon.sandbox.restore()
    })

    describe('parsePdf', function () {
        it('should use cached OCR data', done => {            
            sandbox.stub(targetStubs.fs, 'existsSync').returns(true)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))            
            sandbox.stub(momentStub, 'day').returns(1)
            sandbox.spy(targetStubs.request, 'post')
            targetObservable = target.extractPdfText().subscribe(() => {
                TestUtils.asyncTryCatch(done, () => {
                    sinon.assert.notCalled(targetStubs.request.post)
                })
            })
        })

        it('should send request to OCR service', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs['base-64'], 'encode').returns('1234')
            sandbox.stub(targetStubs.fs, 'createReadStream').returns('readStream')
            sandbox.stub(JSON, 'parse').returns('parsedValue')
            sandbox.stub(targetStubs.request, 'post', (options, callback) => callback(null, {}))
            const PDF_PATH = 'pdfPath'
            targetObservable = target.extractPdfText(PDF_PATH).subscribe(() => {
                TestUtils.asyncTryCatch(done, () => {
                    sinon.assert.calledWith(targetStubs.request.post, sinon.match({
                        headers: {
                            'Authorization': 'Basic 1234',
                            'Content-Type': 'application/json'
                        },
                        formData: {
                            my_file: 'readStream'
                        }
                    }))
                    sinon.assert.calledWith(targetStubs.fs.createReadStream, PDF_PATH)
                })
            })
        })

        it('should fail to send request to OCR service', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))
            sandbox.stub(targetStubs.fs, 'createReadStream')
            sandbox.stub(targetStubs.request, 'post', (options, callback) => callback('ocr error code 111', {statusCode: 500}))
            targetObservable = target.extractPdfText().subscribe(null, error => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(error).to.be.instanceof(OcrException)
                    expect(error.message).to.equal('OCR COMMUNICATION ERROR - ocr error code 111')
                })
            })
        })

        it('should receive ErrorMessage from OCR service', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))
            sandbox.stub(targetStubs.fs, 'createReadStream')
            sandbox.stub(targetStubs.request, 'post', (options, callback) => callback(null, {}))
            sandbox.stub(JSON, 'parse').returns({ErrorMessage: 'ocr error 222'})
            targetObservable = target.extractPdfText().subscribe(null, error => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(error).to.be.instanceof(OcrException)
                    expect(error.message).to.equal('OCR RESPONSE ERROR - ocr error 222')
                })
            })
        })        

        it('should extrace OCR response', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))
            sandbox.stub(targetStubs.fs, 'createReadStream')
            sandbox.stub(targetStubs.request, 'post', (options, callback) => callback(null, {}))
            sandbox.stub(JSON, 'parse').returns({OCRText: [['11', '12'], ['21', '22']]})
            sandbox.stub(targetStubs.fs, 'writeFileSync')
            targetObservable = target.extractPdfText().subscribe(result => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(result).to.equal('11\n12\n21\n22')
                })
            })
        })         
    })
})
