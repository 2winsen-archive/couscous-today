module.exports = {
    asyncTryCatch: (done, expect) => {
        try {
            expect()
            done()
        } catch (error) {
            done(error)
        }
    },

    empty: () => { }
}