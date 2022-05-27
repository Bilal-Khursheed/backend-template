'use strict';
const { default: axios } = require('axios');
const moment = require('moment');

//Enable Logs For Debugging
let showLogs = isDevelopment();
//Enable Error Logs
let showLimiterLogs = isDevelopment();
//Enable Error Logs
let showErrorLogs = isDevelopment();

function enableDisableLogs(enableDisableLogs = false) {
    showLogs = enableDisableLogs;
    showLimiterLogs = enableDisableLogs;
    showErrorLogs = enableDisableLogs;
}

function formatErrorString(errorStr) {
    let resultErrorStr = 'Empty Error';
    if (!isEmpty(errorStr)) {
        if (errorStr instanceof Array) {
            resultErrorStr = JSON.stringify(errorStr);
        } else {
            resultErrorStr = errorStr;
        }
    }
    return resultErrorStr;
}

function sanitizeString(str) {
    str = str.toString().replace(/[^a-z0-9 \.@,_-]/gim, '');
    return str.trim();
}

function isEmptyIncludingZero(str) {
    str = typeof str == 'string' ? str.replace(/\s/g, '') : str; //If it's a string remove all empty spaces
    return isEmpty(str) || str == '0' || str == '0.0';
}

//{}, [], "", null, undefined, "   ", "0000-00-00 00:00:00" will return true
function isEmpty(str) {
    str = typeof str == 'string' ? str.replace(/\s/g, '') : str; //If it's a string remove all empty spaces
    str = typeof str == 'number' ? str.toString() : str; //If it's a number make it string
    str = isJsonObj(str) && Object.keys(str).length === 0 ? '' : str; // if object is empty {}, []
    str = isJsonStr(str) && Object.keys(JSON.parse(str)).length === 0 ? '' : str; // if object string is empty {}, []
    return typeof str == 'undefined' || !str || str.length == 0 || str == '' || str == '0000-00-00 00:00:00' || str == null;
}

function isNotEmpty(str) {
    return !isEmpty(str);
}

function isset(variable) {
    if (typeof variable === 'undefined' || variable == null) {
        return false;
    } else {
        return true;
    }
}

function isNotSet(variable) {
    return !isset(variable);
}

function isJsonObj(obj) {
    // Call if u want to check if an object is a JSON
    if (typeof obj !== 'object') return false;
    try {
        const type = Object.prototype.toString.call(obj).toLowerCase();
        return type === '[object object]' || type === '[object array]';
    } catch (err) {
        return false;
    }
}

function isJsonStr(str) {
    // Call if u want to check if an string is a JSON So JSON.parse(str) can be called
    if (typeof str !== 'string') return false;
    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result).toLowerCase();
        return type === '[object object]' || type === '[object array]';
    } catch (err) {
        return false;
    }
}

function printLog(desc = '', logData = '') {
    if (showLogs === true || showLimiterLogs === true) {
        if (isNotEmpty(desc)) console.log(desc);
        if (isNotEmpty(logData)) console.log(logData);
    }
}

function printErrorLog(logDetail) {
    if (showErrorLogs === true) {
        console.log(logDetail + '\n');
    }
}

function trimAllFieldsInObjectAndChildren(obj) {
    return JSON.parse((typeof obj == 'string' ? obj : JSON.stringify(obj)).replace(/"\s+|\s+"/g, '"'));
}

/*
Usage:
var str = "I have a cat, a dog, and a goat.";
var mapObj = {
    cat:"dog",
    dog:"goat",
    goat:"cat"
};
*/
function replaceAll(str, mapObj) {
    let re = new RegExp(
        Object.keys(mapObj)
            .map((key) => escapeRegex(key))
            .join('|'),
        'gi'
    );
    return str.replace(re, function (matched) {
        return mapObj[matched];
    });
}

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function roundTo(value, decimal = 2) {
    if (isNumeric(value) && value.toString().indexOf('.') !== -1) {
        //Check if floating point number change to 2 decimal place
        return Number(parseFloat(value).toFixed(decimal));
    } else {
        return parseInt(value);
    }
}

function isNumeric(num) {
    return !isNaN(num);
}

function ParseNumber(num) {
    return isNumeric(num) ? Number(num) : 0;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentTimeStamp() {
    //e.g 2020-08-25 13:52:36
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

function getCurrentTimeStampISO() {
    // It is used to save ISO Date in Mongo Db e.g ISODate("2020-09-25T17:42:41.000Z")
    let timestamp = new Date();
    return timestamp;
}

function getCurrentTimeStampWithMs() {
    //e.g 2020-08-18T15:25:06.250Z
    return `${moment().format('YYYY-MM-DDTHH:mm:ss.SSS')}Z`;
}

function utcToLocal(timestamp) {
    return moment(timestamp).utcOffset('+0500').format('YYYY-MM-DD HH:mm:ss');
}

function generatePassword(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function isProduction() {
    return process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'PROD' || process.env.NODE_ENV === 'PRODUCTION';
}

function isDevelopment() {
    return process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'DEVELOPMENT';
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function sendRequest(url, data) {
    const method = data.method || 'post';
    const payload = data.payload || {};
    const headers = data.headers || {};

    let axios_config = {
        method: method,
        url: url,
        headers: {
            Authorization: 'Basic ' + process.env.SS_KEY,
            ...headers
        },
        validateStatus: () => true //Always resolve promise on every http status
    };

    if (method == 'get') {
        axios_config['params'] = payload;
    } else {
        axios_config['data'] = payload;
    }

    try {
        const response = await axios(axios_config);
        return response;
    } catch (error) {
        return error;
    }
}

module.exports = {
    enableDisableLogs,
    isEmpty,
    isNotEmpty,
    isEmptyIncludingZero,
    isJsonStr,
    isJsonObj,
    formatErrorString,
    generatePassword,
    printLog,
    printErrorLog,
    trimAllFieldsInObjectAndChildren,
    roundTo,
    ParseNumber,
    isNumeric,
    getCurrentTimeStamp,
    getCurrentTimeStampISO,
    getCurrentTimeStampWithMs,
    utcToLocal,
    replaceAll,
    sleep,
    isProduction,
    isDevelopment,
    isset,
    isNotSet,
    sanitizeString,
    getRandomInt,
    sendRequest
};
