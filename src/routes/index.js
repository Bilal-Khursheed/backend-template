'use strict';
let winston = require('winston');
const userRoutes = require('./user-routes');

module.exports = (app) => {
    // initial route URL for routes
    let routeUrl = process.env.ROUTE;

    console.log('**************Loading Routes******************');
    // usser route
    app.use('/' + routeUrl + '/user', userRoutes);
};
