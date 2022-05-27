/**
 * Created by Bilal Khursheed on 24/05/2022.
 */
const glob = require('glob'),
    _ = require('lodash'),
    fs = require('fs'),
    winston = require('winston');

console.log(
    '*****************************Loading Success Messages***********************************'
);
let routePath = 'src/common/sucessResponses/*.success.json';
// initialising with common error message objects
let sucessObject = {};

glob.sync(routePath).forEach(function (file) {
    _.extend(sucessObject, JSON.parse(fs.readFileSync(file, 'utf-8')));
    console.log('Success Message file ', file + ' is loaded');
});
module.exports = sucessObject;
