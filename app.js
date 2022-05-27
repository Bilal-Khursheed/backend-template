const express = require('express');
const cors = require('cors');
const app = express();
require('./src/config/mongoose').connect();
const bodyParser = require('body-parser');
const error_handler = require('./src/utils/error-handler');
const { isJsonStr } = require('./src/utils/utils');
const { createUserApiLog } = require('./src/models/LogModel');
const winston = require('winston');

const requestIp = require('request-ip');
const {
    expressLogger,
    expressErrorLogger
} = require('./src/utils/winston-logger');
const endMw = require('express-end');
const { errors } = require('celebrate');
const fileUpload = require('express-fileupload');

app.use(express.static('public'));

// testing
winston.info('loading app file....');

//----------------------------Middleware for reading uploaded Files and saving them
app.use(
    fileUpload({
        limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
    })
);
//----------------------------------Middleware Ended-------------------------------

//Order of this route matters need to place this above store log middleware as it's returning empty result and we don't need to store record of this
app.get('/' + process.env.ROUTE + '/pingServer', (req, res) => {
    //Route to Ping & check if Server is online
    res.status(200).send('OK');
});

//----------------------------Middleware for accepting encoded & json request parms
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//----------------------------------Middleware Ended-------------------------------

//----------------------------Middleware for capturing request is actually ended even though listener is timed out
app.use(endMw);
//----------------------------------Middleware Ended-------------------------------

//----------------------------Middleware for reading raw Body as text use req.body
app.use(bodyParser.text({ type: 'text/plain', limit: '50mb' }));
//----------------------------------Middleware Ended-------------------------------

//----------------------------Middleware for Getting a user's IP
app.use(requestIp.mw());
//----------------------------------Middleware Ended-------------------------------

//----------------------------Middleware for printing logs on console
app.use(expressLogger);
//----------------------------------Middleware Ended-------------------------------------

//----------------------------Middleware to Fix CORS Errors This Will Update The Incoming Request before sending to routes
app.use(cors());
//--------------------------------------------------------Middleware Ended----------------------------------------------

app.use(errors());

//-----------------------------Middleware for storing API logs into DB
app.use(function (req, res, next) {
    // Do whatever you want this will execute when response is finished
    res.once('end', function () {
        createUserApiLog(req, res);
    });

    // Save Response body
    let oldSend = res.send;
    res.send = function (data) {
        res.locals.res_body = isJsonStr(data) ? JSON.parse(data) : data;
        oldSend.apply(res, arguments);
    };
    next();
});
//--------------------------------------------------------Middleware Ended----------------------------------------------

// Routes which should handle requests
require('./src/routes')(app);

//----------------------------Middleware for catching 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error(error_handler.ERROR_404);
    error.statusCode = 404;
    next(error);
});

// error handlers
let errorHandler = require('./src/utils/errorHandler');
app.use(errorHandler.allErrorHandler);

//----------------------------ERROR LISITING--------------------------------
global.errors = require('./src/common/errors');

// ----------------------------Success Messages Listing--------------------------------
global.success = require('./src/common/sucessResponses');
//Error handler
app.use((error, req, res, next) => {
    // Because we hooking post-response processing into the global error handler, we
    // get to leverage unified logging and error handling; but, it means the response
    // may have already been committed, since we don't know if the error was thrown
    // PRE or POST response. As such, we have to check to see if the response has
    // been committed before we attempt to send anything to the user.
    if (!res.headersSent) {
        res.status(error.statusCode || 500);
        res.json({
            result: 'error',
            code: error.statusCode || 500,
            desc: error.message
        });
    }
});

//Best Tested place that store only uncaught errors
app.use(expressErrorLogger);

module.exports = app;
