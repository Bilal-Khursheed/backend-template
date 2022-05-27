/**
 * Created by Bilal Khursheed on 26/05/2022.
 */

'use strict';
const errors = require('../common/errors'),
    success = require('../common/sucessResponses'),
    winston = require('winston');

let successResponse = (res, message, data = []) => {
    if (typeof message === 'number') {
        res.json({
            success: 1,
            response: 200,
            message: success[message].msg.EN,
            data: data
        });
    } else {
        res.json({
            success: 1,
            response: 200,
            message: message,
            data: data
        });
    }
};

let errorResponse = (res, message, response = 500, data = []) => {
    if (typeof message === 'number') {
        res.json({
            success: 0,
            response: response,
            message: errors[message].msg.EN,
            data: data
        });
    } else {
        res.json({
            success: 0,
            response: response,
            message: message,
            data: data
        });
    }
};

module.exports = {
    successResponse,
    errorResponse
};
