const {isEmpty} = require('./utils');
const ERROR_CONTACT_SUPPORT = ', Please Try again later or contact support if the issue persists.';
const ERROR_UNKNOWN_HOST = 'Cannot establish a connection to the server, please try again.';
const ERROR_UNKNOWN = 'An error occurred' + ERROR_CONTACT_SUPPORT;
const ERROR_TIMEOUT = 'Slow internet connection or Server is currently not responding' + ERROR_CONTACT_SUPPORT;
const ERROR_PARSE_FAILED = 'Unable to process response from server' + ERROR_CONTACT_SUPPORT;
const ERROR_400 = 'You have specified wrong parameters for the request' + ERROR_CONTACT_SUPPORT;
const ERROR_401 = 'You are not authorized to access this API.';
const ERROR_403 = "You're not allowed to be here" + ERROR_CONTACT_SUPPORT;
const ERROR_404 = 'Oops, something wrong' + ERROR_CONTACT_SUPPORT;
const ERROR_410 = 'The page you requested no longer exists' + ERROR_CONTACT_SUPPORT;
const ERROR_429 = 'Sorry! Too many requests your rate limit exceeded. Please Try again after some moments.';
const ERROR_500 = 'There was a problem with the server' + ERROR_CONTACT_SUPPORT;
const ERROR_503 = 'The service is currently unavailable, perhaps because of essential maintenance or overloading' + ERROR_CONTACT_SUPPORT;
const ERROR_300 = 'Invalid Parameters';
const ERROR_405 = 'No Data Found';


class ErrorHandler extends Error {
    constructor(statusCode, customMsg = "") {
        super();
        if (!isEmpty(customMsg)) {
            this.statusCode = isEmpty(statusCode) ? 406 : statusCode;//406 will be used for Custom errors
            this.message = customMsg;
        }
        else {
            this.statusCode = statusCode;
            this.message = getErrorDesc(statusCode);
        }
    }
}


function getErrorDesc(statusCode) {
    switch (statusCode) {
        case 400:
            return ERROR_400;
        case 401:
            return ERROR_401;
        case 403:
            return ERROR_403;
        case 404:
            return ERROR_404;
        case 405:
            return ERROR_405;
        case 410:
            return ERROR_410;
        case 429:
            return ERROR_429;
        case 500:
            return ERROR_500;
        case 503:
            return ERROR_503;
        case 300:
            return ERROR_300;
        default:
            return ERROR_500;
    }
}

module.exports = {
    ERROR_UNKNOWN_HOST,
    ERROR_UNKNOWN,
    ERROR_TIMEOUT,
    ERROR_PARSE_FAILED,
    ERROR_400,
    ERROR_401,
    ERROR_403,
    ERROR_404,
    ERROR_410,
    ERROR_429,
    ERROR_500,
    ERROR_503,
    ERROR_300,
    ERROR_405,
    ErrorHandler,
};
