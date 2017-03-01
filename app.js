require('app-module-path').addPath(__dirname)

var express = require('express')
var path = require('path')
// uncomment after placing your favicon in /public
// var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var index = require('web/routes/index')
var error404 = require('web/routes/error404')
var error = require('web/routes/error')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'web/views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'web/public')))

app.use('/', index)
app.use(error404)
app.use(error)

module.exports = app
