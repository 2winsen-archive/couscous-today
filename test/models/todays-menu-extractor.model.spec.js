require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const expect = require('chai').expect
const sinon = require('sinon')

describe('todays-menu-extractor.model.spec.js', () => {
    let sandbox
    let target

    beforeEach(() => {
        sandbox = sinon.sandbox.create()        
        target = proxyquire('models/todays-menu-extractor.model', {})
    })

    afterEach(() => {
        sandbox = sinon.sandbox.restore()
    })

    describe('extractTodaysMenu', function () {
        it('should return todays menu using Week Days Names', () => {
            sandbox.useFakeTimers(1490007121000) // MONDAY
            let extractedPdfText = 'prefix PIRMDIENA, 13. Marts AA OTRDIENA, 14. Marts BB'
            expect(target.extractTodaysMenu(extractedPdfText)).to.equal(' AA ')
        })

        it('should return todays menu using Week Days Numbers', () => {
            sandbox.useFakeTimers(1490007121000) // MONDAY
            let extractedPdfText = 'prefix PIRM DIENA, 13. Marts AA OTRD IENA, 14. Marts BB'
            expect(target.extractTodaysMenu(extractedPdfText)).to.equal('artsAAOTRDIENA')
        })

        it('should throw error since there is no wednesday in extratedPdfText', () => {
            sandbox.useFakeTimers(1490266321000) // WEDNESDAY
            let extractedPdfText = 'prefix PIRMDIENA, 13. Marts AA OTRDIENA, 14. Marts BB'
            expect(() => target.extractTodaysMenu(extractedPdfText)).to.throw(Error, 'UNABLE TO PARSE EXTRACTED PDF TEXT DATA')
        })

        it('should throw error since extratedPdfText contains unknown data', () => {
            sandbox.useFakeTimers(1490007121000) // MONDAY
            let extractedPdfText = 'lorem ipsum dolorem'
            expect(() => target.extractTodaysMenu(extractedPdfText)).to.throw(Error, 'UNABLE TO PARSE EXTRACTED PDF TEXT DATA')
        })
    })
})
