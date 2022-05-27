const { isEmpty, getCurrentTimeStampWithMs } = require('../utils/utils');
const moment = require('moment');
const now = require('performance-now');
const { logger } = require('../utils/winston-logger');
const port = process.env.PORT || 4000;

//Use to create Log via Winston
function createUserApiLog(req, res) {
    let json_req = res.locals.json_req;
    if (!isEmpty(json_req)) {
        //Make sure when it's verified request only then log it
        let { request_id, audit_app, app_version, api_name, ip } = res.locals.audit_p_detail;

        let res_body = res.locals.res_body;
        let startTime = res.locals.startTime;
        let startTimeStamp = res.locals.startTimeStamp;
        let executionTime = (now() - startTimeStamp).toFixed(3) + 'ms';
        let endTime = moment().format('HH:mm:ss.SSS');
        let executionLog = { startTime, endTime, executionTime };

        let log_data = {
            time_stamp: getCurrentTimeStampWithMs(),
            request_id: request_id,
            api_name: api_name,
            port: port,
            type: 'audit_api', //Although this will be override but it is for log order
            api_detail: {
                status_code: res.statusCode,
                request: json_req,
                response: res_body,
                benchmark: executionLog
            }
        };

        log_data['type'] = 'audit_api';
        log_data['audit_p_detail'] = audit_app;
        if (app_version != '0') log_data['app_version'] = app_version;
        log_data['ip'] = ip;

        logger.log({
            level: res.statusCode >= 300 ? 'error' : 'info',
            message: log_data
        });
    } else {
        console.log('res.locals is null');
    }
}

function auditPersonJson(req, request_id) {
    return {
        request_id: request_id,
        audit_app: isEmpty(req.headers['app-flavour']) ? 'Postman' : req.headers['app-flavour'],
        app_version: isEmpty(req.headers['app-version-code']) ? '0' : req.headers['app-version-code'],
        api_name: req.originalUrl.replace(/\?.*$/, '').replace('/' + process.env.ROUTE + '/', ''), //Get only api name
        ip: req.clientIp
    };
}

module.exports = {
    createUserApiLog,
    auditPersonJson
};
