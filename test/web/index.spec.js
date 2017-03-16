require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const TestUtils = require('test/test-utils')
const Rx = require('rxjs/Rx')
const expect = require('chai').expect

describe('index.spec.js', function () {
    let sandbox
    let targetStubs
    let response
    let next

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
        targetStubs = {
            'express': { Router: TestUtils.empty },
            'models/sunny.model': { isCouscousToday: TestUtils.empty }
        }
        response = {render: TestUtils.empty}
        sandbox.stub(response, 'render')    
        sandbox.stub(targetStubs.express, 'Router').returns({ get: (path, callback) => callback(null, response, next) })        
    })

    afterEach(() => {
        sandbox = sinon.sandbox.restore()
    })

    describe('router.get /', function () {
        it('should call render with correct text value when there is coucous', function () {
            sandbox.stub(targetStubs['models/sunny.model'], 'isCouscousToday').returns(Rx.Observable.create(observer => observer.next(true)))
            proxyquire('web/routes/index', targetStubs)
            sinon.assert.calledWith(response.render, 'index', {text: 'YES :(, damn that couscous'})
        })

        it('should call render with correct text value when there is no coucous', function () {
            sandbox.stub(targetStubs['models/sunny.model'], 'isCouscousToday').returns(Rx.Observable.create(observer => observer.next(false)))
            proxyquire('web/routes/index', targetStubs)
            sinon.assert.calledWith(response.render, 'index', {text: 'Nope :)'})
        })

        it('should pass error to next handler', function () {
            sandbox.stub(targetStubs['models/sunny.model'], 'isCouscousToday').returns(Rx.Observable.create(observer => observer.error('some error')))
            next = (error) => {
                expect(error).to.be.an('error')
                expect(error.message).to.equal('some error')
            }
            proxyquire('web/routes/index', targetStubs)            
        })
        
    })

})