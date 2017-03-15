require('app-module-path').addPath(__dirname + '/../..')
const proxyquire = require('proxyquire')
const expect = require('chai').expect

describe('couscous-checker.model.spec.js', () => {
    let target

    beforeEach(() => {
        target = proxyquire('models/couscous-checker.model.js', {})
    })

    describe('isCouscousToday', function () {
        it('should return true as couscous is present in todays menu items (any case)', () => {
            let todaysItems = 'lorem ipsum KUSKUS dolorem'
            expect(target.isCouscousToday(todaysItems)).to.be.true
            todaysItems = 'lorem ipsum kuS-kuS dolorem'
            expect(target.isCouscousToday(todaysItems)).to.be.true
            todaysItems = 'lorem ipsum cousCOus dolorem'
            expect(target.isCouscousToday(todaysItems)).to.be.true
        })

        it('should return false as couscous is not present in todays menu items', () => {
            let todaysItems = 'lorem ipsum dolorem'
            expect(target.isCouscousToday(todaysItems)).to.be.false
            todaysItems = ''
            expect(target.isCouscousToday(todaysItems)).to.be.false
        })
    })
})
