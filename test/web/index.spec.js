require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const TestUtils = require('test/test-utils')
const expect = require('chai').expect

describe('index.spec.js', function () {
    let sandbox
    let targetStubs
    let response
    let next

    const routerStub = (allowedPath) => {
        return {
            get: (path, callback) => {
                if (path === allowedPath) callback(null, response, next)
            }
        }
    }

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
        targetStubs = {
            'express': { Router: TestUtils.empty },
            'models/couscous-today-mediator.model': { isCouscousToday: TestUtils.empty }
        }
        response = { send: TestUtils.empty, render: TestUtils.empty }
        sandbox.stub(response, 'send')
    })

    afterEach(() => {
        sandbox = sinon.sandbox.restore()
    })

    describe('router.get /', function () {
        it('should call render with index', function () {
            sandbox.stub(targetStubs.express, 'Router').returns(routerStub('/'))
            sandbox.stub(response, 'render')
            proxyquire('web/routes/index', targetStubs)
            sinon.assert.calledWith(response.render, 'index')
        })
    })

    describe('router.get isCouscousToday', function () {
        it('should call send with correct text value when there is coucous', function () {
            sandbox.stub(targetStubs.express, 'Router').returns(routerStub('/isCouscousToday'))
            sandbox.stub(targetStubs['models/couscous-today-mediator.model'], 'isCouscousToday').returns(TestUtils.emptyObservableNext(true))
            proxyquire('web/routes/index', targetStubs)
            sinon.assert.calledWith(response.send, 'YES :(, damn that couscous')
        })

        it('should call send with correct text value when there is no coucous', function () {
            sandbox.stub(targetStubs.express, 'Router').returns(routerStub('/isCouscousToday'))
            sandbox.stub(targetStubs['models/couscous-today-mediator.model'], 'isCouscousToday').returns(TestUtils.emptyObservableNext(false))
            proxyquire('web/routes/index', targetStubs)
            sinon.assert.calledWith(response.send, 'Nope :)')
        })

        it('should pass error to next handler', function () {
            sandbox.stub(targetStubs.express, 'Router').returns(routerStub('/isCouscousToday'))
            sandbox.stub(targetStubs['models/couscous-today-mediator.model'], 'isCouscousToday').returns(TestUtils.emptyObservableError('some error'))
            next = (error) => {
                expect(error).to.equal('some error')
            }
            proxyquire('web/routes/index', targetStubs)
        })

    })

})