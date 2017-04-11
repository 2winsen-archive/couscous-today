const Rx = require('rxjs/Rx')

module.exports = {
    asyncTryCatch: (done, expect) => {
        try {
            expect()
            done()
        } catch (error) {
            done(error)
        }
    },

    empty: () => { },

    emptyObservableNext: (value) => Rx.Observable.create(observer => observer.next(value)),
    emptyObservableError: (error) => Rx.Observable.create(observer => observer.error(error))
}