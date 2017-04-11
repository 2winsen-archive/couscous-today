const _ = require('lodash')

module.exports = {
    isCouscousToday: todaysItem => {
        const couscousWords = [
            'KUSKUS',
            'KUS-KUS',
            'COUSCOUS',
        ]
        return _.some(couscousWords, (couscousWord) => {
            return !!todaysItem.toUpperCase().match(couscousWord)
        })
    }
}