require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const expect = require('chai').expect
const sinon = require('sinon')
const TestUtils = require('test/test-utils')
const EventEmitter = require('events').EventEmitter


describe('pdf-extractor.model.spec', () => {
    let target
    let sandbox
    let targetStubs
    let targetObservable
    let stubPdfParser

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
        stubPdfParser = new EventEmitter()
        stubPdfParser.loadPDF = TestUtils.empty
        stubPdfParser.getRawTextContent = TestUtils.empty
        targetStubs = {
            'models/pdf-parser': stubPdfParser
        }
        target = proxyquire('models/pdf-extractor.model', targetStubs)
        sandbox.stub(targetStubs['models/pdf-parser'], 'getRawTextContent')
        sandbox.stub(targetStubs['models/pdf-parser'], 'loadPDF')        
    })

    afterEach(() => {
        targetObservable.unsubscribe()
        sandbox = sinon.sandbox.restore()
    })

    describe('downloadPdf', function () {
        it('should parse pdf locally', done => {
            targetObservable = target.extractPdfText('pdfPath').subscribe(() => {
                TestUtils.asyncTryCatch(done, () => {                    
                    sinon.assert.called(targetStubs['models/pdf-parser'].getRawTextContent)
                    sinon.assert.calledWith(targetStubs['models/pdf-parser'].loadPDF, 'pdfPath')
                })
            })
            stubPdfParser.emit('pdfParser_dataReady')
        })

        it('should fail to parse pdf locally', done => {
            targetObservable = target.extractPdfText('pdfPath').subscribe(null, error => {
                TestUtils.asyncTryCatch(done, () => {                    
                    sinon.assert.notCalled(targetStubs['models/pdf-parser'].getRawTextContent)
                    expect(error).to.be.instanceof(Error)
                    expect(error.message).to.equal('LOCAL PDF Parse Error - error 1111')
                })
            })
            stubPdfParser.emit('pdfParser_dataError', 'error 1111')
        })
    })
})
