const pdfParser = require('models/pdf-parser')
const Rx = require('rxjs/Rx')

module.exports = {
    extractPdfText: pdfPath => {
        return Rx.Observable.create(observer => {
            pdfParser
                .on('pdfParser_dataError', errData => {
                    observer.error(new Error(`LOCAL PDF Parse Error - ${errData}`))
                })
                .on('pdfParser_dataReady', () => {
                    observer.next(pdfParser.getRawTextContent())
                })
            pdfParser.loadPDF(pdfPath)
        })
    }
}
