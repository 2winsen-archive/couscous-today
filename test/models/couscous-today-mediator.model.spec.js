require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const expect = require('chai').expect
const sinon = require('sinon')
const TestUtils = require('test/test-utils')
const OcrException = require('exceptions/ocr-exception')

describe('couscous-today-mediator.model.spec', () => {
    let sandbox
    let target
    let targetStubs
    let targetObservable

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
        targetStubs = {
            'models/sunny.model': {},
            'models/ocr-web-service.model': {},
            'models/couscous-checker.model': {},
            'models/todays-menu-extractor.model': {},
            'models/pdf-extractor.model': {},
            'winston': {log: TestUtils.empty}
        }
        target = proxyquire('models/couscous-today-mediator.model', targetStubs)
    })

    afterEach(() => {
        targetObservable && targetObservable.unsubscribe()
        sandbox = sinon.sandbox.restore()
    })

    describe('isCouscousToday', () => {
        it('should successfully check for couscous', (done) => {
            sandbox.stub(targetStubs['models/sunny.model'], 'downloadPdf').returns(TestUtils.emptyObservableNext('pdfPath'))
            sandbox.stub(targetStubs['models/ocr-web-service.model'], 'extractPdfText').returns(TestUtils.emptyObservableNext('pdfText'))
            sandbox.stub(targetStubs['models/todays-menu-extractor.model'], 'extractTodaysMenu').returns('todaysMenu')
            sandbox.stub(targetStubs['models/couscous-checker.model'], 'isCouscousToday').returns(true)
            targetObservable = target.isCouscousToday().subscribe(result => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(result).to.equal(true)
                })
            })
        })

        it('should catch error', (done) => {
            sandbox.stub(targetStubs['models/sunny.model'], 'downloadPdf').returns(TestUtils.emptyObservableNext('pdfPath'))
            sandbox.stub(targetStubs['models/ocr-web-service.model'], 'extractPdfText').returns(TestUtils.emptyObservableError('pdfTextError'))
            sandbox.stub(targetStubs['models/todays-menu-extractor.model'], 'extractTodaysMenu').returns('todaysMenu')
            sandbox.stub(targetStubs['models/couscous-checker.model'], 'isCouscousToday').returns(true)
            targetObservable = target.isCouscousToday().subscribe(null, error => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(error).to.equal('pdfTextError')
                })
            })
        })

        it('should execute fallback mechanism', (done) => {
            sandbox.stub(targetStubs['models/sunny.model'], 'downloadPdf').returns(TestUtils.emptyObservableNext('pdfPath'))
            sandbox.stub(targetStubs['models/ocr-web-service.model'], 'extractPdfText').returns(TestUtils.emptyObservableError(new OcrException('ocrException')))
            sandbox.stub(targetStubs['models/todays-menu-extractor.model'], 'extractTodaysMenu').returns('todaysMenu')
            sandbox.stub(targetStubs['models/couscous-checker.model'], 'isCouscousToday').returns(true)
            sandbox.stub(targetStubs['models/pdf-extractor.model'], 'extractPdfText').returns(TestUtils.emptyObservableNext(new OcrException('pdfTextFallback')))
            targetObservable = target.isCouscousToday().subscribe(result => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(result).to.equal(true)
                })
            })
        })
    })
})
