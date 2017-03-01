const config = require('config')
const Rx = require('rxjs/Rx')
const request = require('request')
const base64 = require('base-64')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
    
const readFileAsJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))

const getOcrResponse = pdfPath => {
    const username = config.get('ocrwebservice-username')
    const licenceCode = config.get('ocrwebservice-licence-code')

    return Rx.Observable.create(observer => {
        const DOWNLOADS_DIR = config.get('downloads-dir')
        const jsonPath = `${DOWNLOADS_DIR}/sunny-${moment().format('YYYY-MMM-DD')}.json`
        if (fs.existsSync(jsonPath)) {
            observer.next(readFileAsJson(jsonPath))
            return
        }
        const options = {
            url: config.get('ocrwebservice-rest-url'),
            headers: {
                'Authorization': `Basic ${base64.encode(username + ':' + licenceCode)}`,
                'Content-Type': 'application/json'
            },
            formData: {
                my_file: fs.createReadStream(pdfPath)
            }
        }
        request.post(options, (err, httpResponse, body) => {
            if (err) {
                observer.error('UNABLE TO CONNECT TO OCR SERVICE')
                return
            }
            fs.writeFileSync(jsonPath, body)
            observer.next(readFileAsJson(jsonPath))
        })
    })
}

const parseOcrResponse = response => {
    const LATVIAN_WEEK_DAYS = [
        'PIRMDIENA',
        'OTRDIENA',
        'TRESDIENA',
        'CETURTDIENA',
        'PIEKTDIENA'
    ]
    const regEx = _(LATVIAN_WEEK_DAYS)
        .map(date => `${date}, \\d+\\. \\w+|`)
        .value()
        .join('')
        .slice(0, -1)
    const parsedOcr = _.flatten(response.OCRText)
        .join(' -newline- ')
        .split(new RegExp(regEx, 'gi'))
        .slice()
    if (parsedOcr && parsedOcr[moment().day()]) {
        return parsedOcr[moment().day()]
    }
    return `CAN"T PROPERLY PARSE OCR DATA`
}

const matchCouscous = todayDishes => {
    return !!todayDishes.match(/kuskus/)
}

module.exports = {
    parsePdf: pdfPath => {
        return getOcrResponse(pdfPath)
            .map(parseOcrResponse)
            .map(matchCouscous)
    }
}