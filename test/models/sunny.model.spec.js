require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const expect = require('chai').expect
const Rx = require('rxjs/Rx')
const sinon = require('sinon')
const EventEmitter = require('events').EventEmitter
const testEmitter = new EventEmitter()


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
            'models/ocr-web-service.model': {
                parsePdf: (val) => Rx.Observable.create(observable => observable.next(val))
            }
        }
        target = proxyquire('models/sunny.model', targetStubs)
    })

    afterEach(() => {
        targetObservable.unsubscribe()
        sandbox = sinon.sandbox.restore()
    })

    const asyncTryCatch = (done, expect) => {
        try {
            expect()
            done()
        } catch (error) {
            done(error)
        }
    }

    describe('anyCouscousToday', function () {
        it('should return pdf path if pdf file exists', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(true)
            targetObservable = target.anyCouscousToday().subscribe(result => {
                asyncTryCatch(done, () => expect(result).to.match(/downloads\/sunny-\d{4}-\w{3}-\d{2}.pdf/))
            })
        })

        it('should return pdf path if pdf file needs to be downloaded', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'createWriteStream').returns(testEmitter)
            sandbox.stub(targetStubs.request, 'get').returns({ pipe: () => { } })
            targetObservable = target.anyCouscousToday()
                .subscribe(result => {
                    asyncTryCatch(done, () => {
                        expect(result).to.match(/downloads\/sunny-\d{4}-\w{3}-\d{2}.pdf/)

                    })
                })
            testEmitter.emit('finish')
        })

        it('should return error if pdf file can not be downloaded', done => {
            sandbox.stub(targetStubs.fs, 'existsSync').returns(false)
            sandbox.stub(targetStubs.fs, 'createWriteStream').returns(testEmitter)
            sandbox.stub(targetStubs.request, 'get').returns({ pipe: () => { } })
            targetObservable = target.anyCouscousToday()
                .subscribe(null, err => {
                    asyncTryCatch(done, () => expect(err).to.equal('PROBLEM SAVING SUNNY PDF FILE'))
                })
            testEmitter.emit('error')
        })
    })
})

