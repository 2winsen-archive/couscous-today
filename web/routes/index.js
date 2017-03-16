const express = require('express')
const router = express.Router()
const SunnyModel = require('models/sunny.model')
const config = require('config')

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/isCouscousToday', (req, res, next) => {
    SunnyModel.isCouscousToday(config.get('sunny-menu-url'))
        .map(anyCouscous => (anyCouscous) ? `YES :(, damn that couscous` : `Nope :)`)
        .subscribe(value => res.send(value),
        err => next(new Error(err)))
})

module.exports = router