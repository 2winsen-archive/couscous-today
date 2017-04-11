require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const expect = require('chai').expect
const sinon = require('sinon')
const EventEmitter = require('events').EventEmitter
const testEmitter = new EventEmitter()
const TestUtils = require('test/test-utils')


describe('sunny.model.spec.js', () => {
    let target
    let sandbox
    let targetStubs
    let targetObservable

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
        targetStubs = {
            'fs': {},
            'request': {},
            'config': { get: TestUtils.empty }
        }
        target = proxyquire('models/sunny.model', targetStubs)
    })

    afterEach(() => {
        targetObservable.unsubscribe()
        sandbox = sinon.sandbox.restore()
    })

    describe('downloadPdf', function () {
        it('should return pdf path if pdf file exists', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(true)
            sandbox.stub(targetStubs.config, 'get').returns('testDownloads')
            targetObservable = target.downloadPdf().subscribe(result => {
                TestUtils.asyncTryCatch(done, () => expect(result).to.match(/testDownloads\/sunny-\d{4}-\w{3}-\d{2}.pdf/))
            })
        })

        it('should return pdf path if pdf file needs to be downloaded', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.config, 'get').returns('testDownloads')
            sandbox.stub(targetStubs.fs, 'createWriteStream').returns(testEmitter)
            sandbox.stub(targetStubs.request, 'get').returns({ pipe: () => { } })
            targetObservable = target.downloadPdf().subscribe(result => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(result).to.match(/testDownloads\/sunny-\d{4}-\w{3}-\d{2}.pdf/)
                })
            })
            testEmitter.emit('finish')
        })

        it('should return error if pdf file can not be downloaded', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'createWriteStream').returns(testEmitter)
            sandbox.stub(targetStubs.request, 'get').returns({ pipe: () => { } })
            targetObservable = target.downloadPdf().subscribe(null, err => {
                TestUtils.asyncTryCatch(done, () => {
                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal('PROBLEM SAVING SUNNY PDF FILE')
                })
            })
            testEmitter.emit('error')
        })
    })
})

