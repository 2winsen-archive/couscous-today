const express = require('express')
const router = express.Router()
const SunnyModel = require('models/sunny.model')
const config = require('config')

router.get('/', (req, res, next) => {
    SunnyModel.anyCouscousToday(config.get('sunny-menu-url'))
        .map(anyCouscous => (anyCouscous) ? `YES :(, damn that couscous` : `Nope :)`)
        .subscribe(value => res.render('index', { text: value }),
        err => next(new Error(err)))
})

module.exports = router