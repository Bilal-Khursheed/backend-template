const { ErrorHandler } = require('../utils/error-handler');
const { isEmpty } = require('../utils/utils');
const jwt = require('jsonwebtoken');

//This middleware is used to validate incoming JSON Web Token & only allow further if token is valid
module.exports = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
   
    if (isEmpty(token)) {
        return next(new ErrorHandler(403));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //Verify JWT using private key;
        req.user = decoded; //Saving decoded info like email, so that it can be used later in any route
    } catch (err) {
        return next(new ErrorHandler(401));
    }

    return next();
};
