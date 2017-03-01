const Rx = require('rxjs/Rx')
const extract = require('pdf-text-extract')

module.exports = {
    parsePdf: pdfPath => {
        return Rx.Observable.create(observer => {
            extract(pdfPath, function (err, pages) {
                if (err) {
                    observer.error(`PROBLEM SAVING SUNNY PDF FILE`)
                }
                observer.next(pages)
            })
        })
    }
}
