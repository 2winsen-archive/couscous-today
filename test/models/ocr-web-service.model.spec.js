require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const TestUtils = require('test/test-utils')
const expect = require('chai').expect


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
            'moment': () => (momentStub),
            'models/couscous-checker.model': {}
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
            targetObservable = target.parsePdf().subscribe(() => {
                TestUtils.asyncTryCatch(done, () => {
                    sinon.assert.notCalled(targetStubs.request.post)
                })
            })
        })

        it('should send request to OCR service', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))
            sandbox.stub(targetStubs.fs, 'writeFileSync')
            sandbox.stub(momentStub, 'day').returns(1)
            sandbox.stub(targetStubs.fs, 'createReadStream')
            sandbox.stub(targetStubs.request, 'post', (options, callback) => callback())
            targetObservable = target.parsePdf().subscribe(() => {
                TestUtils.asyncTryCatch(done, () => {
                    sinon.assert.calledWith(targetStubs.request.post, sinon.match({
                        headers: {
                            'Authorization': 'Basic TDM0MzkxNzI6RUExMzUzNjAtRjIzNi00MDUxLTk4M0YtMTI3MjNGREMyQUM1',
                            'Content-Type': 'application/json'
                        }
                    }))
                })
            })
        })

        it('should fail to send request to OCR service', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))
            sandbox.stub(targetStubs.fs, 'writeFileSync')
            sandbox.stub(momentStub, 'day').returns(1)
            sandbox.stub(targetStubs.fs, 'createReadStream')
            sandbox.stub(targetStubs.request, 'post', (options, callback) => callback('error'))
            targetObservable = target.parsePdf().subscribe(null, error => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(error).to.equal('UNABLE TO CONNECT TO OCR SERVICE')
                })
            })
        })

        it('should return today menu item', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(true)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))
            sandbox.stub(targetStubs['models/couscous-checker.model'], 'isCouscousToday')
            sandbox.stub(momentStub, 'day').returns(1)
            targetObservable = target.parsePdf().subscribe(() => {
                TestUtils.asyncTryCatch(done, () => {
                    sinon.assert.calledWith(targetStubs['models/couscous-checker.model'].isCouscousToday, ' AA ')
                })
            })
        })

        it('should fail to return today menu item', () => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(true)
            sandbox.stub(targetStubs.fs, 'readFileSync').returns(JSON.stringify(testJson))
            sandbox.stub(targetStubs['models/couscous-checker.model'], 'isCouscousToday')
            sandbox.stub(momentStub, 'day').returns(3)
            targetObservable = target.parsePdf().subscribe(null, error => {
                expect(error).to.be.an('error')
                expect(error.message).to.equal(`CAN'T PROPERLY PARSE OCR DATA`)
            })
        })
    })
})
