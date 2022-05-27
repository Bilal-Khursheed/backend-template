/**
 * Created by Bilal Khursheed on 24/05/2022.
 */
const glob = require('glob'),
    _ = require('lodash'),
    fs = require('fs'),
    winston = require('winston');

console.log(
    '*****************************Loading ERRORs***********************************'
);
let routePath = 'src/common/errors/*.errors.json';
// initialising with common error message objects
let errorObject = {};

glob.sync(routePath).forEach(function (file) {
    _.extend(errorObject, JSON.parse(fs.readFileSync(file, 'utf-8')));
    console.log('ERROR file ', file + ' is loaded');
});
module.exports = errorObject;
