const config = require('config')
const fs = require('fs')
const request = require('request')
const moment = require('moment')
const Rx = require('rxjs/Rx')
const OcrWebServiceModel = require('models/ocr-web-service.model')

const downloadPdf = sunnyMenuUrl => {
    const TEMP_DIR = config.get('downloads-dir')
    const pdfPath = `${TEMP_DIR}/sunny-${moment().format('YYYY-MMM-DD')}.pdf`
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
                    observer.error(`PROBLEM SAVING SUNNY PDF FILE`)
                })
        )
    })
}

module.exports = {
    anyCouscousToday: path => {
        return downloadPdf(path)
            .flatMap(OcrWebServiceModel.parsePdf)
    }
}