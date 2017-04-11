const config = require('config')
const fs = require('fs')
const request = require('request')
const moment = require('moment')
const Rx = require('rxjs/Rx')

const getPdfPath = () => {
    const TEMP_DIR = config.get('downloads-dir')
    return `${TEMP_DIR}/sunny-${moment().format('YYYY-MMM-DD')}.pdf`
}

module.exports = {
    downloadPdf: sunnyMenuUrl => {
        const pdfPath = getPdfPath()
        return Rx.Observable.create(observer => {
            if (fs.existsSync(pdfPath)) {
                observer.next(pdfPath)
                return
            }
            request.get(sunnyMenuUrl).pipe(
                fs.createWriteStream(pdfPath)
                    .on('finish', () => {
                        observer.next(pdfPath)
                    })
                    .on('error', () => {
                        observer.error(new Error('PROBLEM SAVING SUNNY PDF FILE'))
                    })
            )
        })
    },

    getPdfPath: getPdfPath
}