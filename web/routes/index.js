const express = require('express')
const router = express.Router()
const CouscousTodayMediatorModel = require('models/couscous-today-mediator.model')
const config = require('config')

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/isCouscousToday', (req, res, next) => {
    CouscousTodayMediatorModel.isCouscousToday(config.get('sunny-menu-url'))
        .map(anyCouscous => (anyCouscous) ? `YES :(, damn that couscous` : `Nope :)`)
        .subscribe(value => res.send(value), err => next(err))
})

module.exports = router