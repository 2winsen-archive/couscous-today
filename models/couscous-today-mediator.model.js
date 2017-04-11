const Rx = require('rxjs/Rx')
const winston = require('winston')
const SunnyModel = require('models/sunny.model')
const OcrWebServiceModel = require('models/ocr-web-service.model')
const OcrException = require('exceptions/ocr-exception')
const CouscousChecker = require('models/couscous-checker.model')
const PdfExtractorModel = require('models/pdf-extractor.model')
const TodaysMenuExtractorModel = require('models/todays-menu-extractor.model')

const processException = exception => {
    return Rx.Observable.create(observer => {
        winston.log('error', exception)
        if (exception instanceof OcrException) {
            winston.log('info', 'initiating pdf-extractor-service fallback mechanism')
            return observer.next(SunnyModel.getPdfPath())
        }
        return observer.error(exception)
    })
}

const fallback = exception => {
    return processException(exception)
        .flatMap(PdfExtractorModel.extractPdfText)
        .map(TodaysMenuExtractorModel.extractTodaysMenu)
        .map(CouscousChecker.isCouscousToday)
}

module.exports = {
    isCouscousToday: path => {
        return Rx.Observable.create(observer => observer.next(path))
            .flatMap(SunnyModel.downloadPdf)
            .flatMap(OcrWebServiceModel.extractPdfText)            
            .map(TodaysMenuExtractorModel.extractTodaysMenu)
            .map(CouscousChecker.isCouscousToday)
            .catch(fallback)
    }
}