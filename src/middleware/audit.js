const {ErrorHandler} = require('../utils/error-handler');
const {formatErrorString, printErrorLog, trimAllFieldsInObjectAndChildren} = require("../utils/utils");
const {auditPersonJson} = require("../models/LogModel");
const moment = require('moment');
const now = require('performance-now');



//This middleware store incoming request audit details, so that we can log it via bunyan library & can later use these logs for benchmarking or debugging
module.exports = (req, res, next) => {
    try {
        //Getting single variable for both type of request data
        let reqData = "";
        if (req.method == "POST") {
            reqData = req.body;
        }
        else if (req.method == "GET") {
            reqData = req.query
        }

        res.locals.json_req = trimAllFieldsInObjectAndChildren(reqData);   //Storing incoming request object
        res.locals.request_id = moment().valueOf();   //Assigning unique key to trace this request cycle later in logs
        res.locals.audit_p_detail = auditPersonJson(req, res.locals.request_id);    //Storing user's info
        res.locals.startTime = moment().format("HH:mm:ss.SSS"); //For benchmarking purpose
        res.locals.startTimeStamp = now();
        return next();
    } 
    catch (error) {
        printErrorLog("Exception: " + formatErrorString(error));
    }
    
    return next(new ErrorHandler(300));
};
