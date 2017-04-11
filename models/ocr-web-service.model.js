const config = require('config')
const Rx = require('rxjs/Rx')
const request = require('request')
const base64 = require('base-64')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
const OcrException = require('exceptions/ocr-exception')

const readFile = (path) => fs.readFileSync(path, 'utf8')

module.exports = {
    extractPdfText: pdfPath => {
        const username = config.get('ocrwebservice-username')
        const licenceCode = config.get('ocrwebservice-licence-code')

        return Rx.Observable.create(observer => {
            const DOWNLOADS_DIR = config.get('downloads-dir')
            const jsonPath = `${DOWNLOADS_DIR}/sunny-${moment().format('YYYY-MMM-DD')}.json`
            if (fs.existsSync(jsonPath)) {
                observer.next(readFile(jsonPath))
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
                const MIN_HTTP_ERROR_CODE = 400
                if (httpResponse.statusCode >= MIN_HTTP_ERROR_CODE) {
                    const errorMessage = err || httpResponse.statusMessage
                    observer.error(new OcrException(`OCR COMMUNICATION ERROR - ${errorMessage}`))
                    return
                }
                const parsedBody = JSON.parse(body)
                if (parsedBody.ErrorMessage) {
                    observer.error(new OcrException(`OCR RESPONSE ERROR - ${parsedBody.ErrorMessage}`))
                    return
                }
                const extractedPdfText = _.flatten(parsedBody.OCRText).join('\n')
                fs.writeFileSync(jsonPath, extractedPdfText)
                observer.next(extractedPdfText)
            })

        })
    }
}