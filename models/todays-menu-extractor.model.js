const _ = require('lodash')
const moment = require('moment')
const winston = require('winston')

const splitByWeekDaysNames = extractedPdfText => {
    const LATVIAN_WEEK_DAYS = [
        'PIRMDIENA',
        'OTRDIENA',
        'TRESDIENA',
        'CETURTDIENA',
        'PIEKTDIENA'
    ]
    const splitByWeekDaysNamesRegEx = _(LATVIAN_WEEK_DAYS)
        .map(date => `${date}, \\d+\\. \\w+|`)
        .value()
        .join('')
        .slice(0, -1)
    return extractedPdfText
        .split(new RegExp(splitByWeekDaysNamesRegEx, 'gi'))
        .slice()
}

const splitByWeekDaysNumbers = extractedPdfText => {
    const monthFirstLetter = moment().format('MMM').slice(0, 1)
    const splitByWeekDaysNumbersRegEx = `,\\d+\\.${monthFirstLetter}`
    return extractedPdfText
        .replace(new RegExp(' ', 'g'), '')
        .split(new RegExp(splitByWeekDaysNumbersRegEx, 'gi'))
        .slice()
}

module.exports = {
    extractTodaysMenu: extractedPdfText => {
        const splitMetods = [
            splitByWeekDaysNames,
            splitByWeekDaysNumbers
        ]
        for (let i = 0; i < splitMetods.length; i++) {
            const method = splitMetods[i]
            winston.log('info', `EXTRACTING TODAY'S MENU ITEMS USING: ${method.name}`)
            const split = method.call(null, extractedPdfText)
            if (split && split[moment().day()]) {
                winston.log('info', `TODAY'S MENU ITEMS ARE: ${split[moment().day()]}`)
                return split[moment().day()]
            }
        }
        winston.log('error', `UNABLE TO PARSE EXTRACTED PDF TEXT DATA: ${extractedPdfText}`)
        throw new Error(`UNABLE TO PARSE EXTRACTED PDF TEXT DATA`)
    }
}