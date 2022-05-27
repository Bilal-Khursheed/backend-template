const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const audit = require('../middleware/audit');
const { celebrate } = require('celebrate');
const userValidationSchema = require('../request_schemas/user-schema.js');
const check_auth = require('../middleware/check-auth');
const userController = require('../controllers/user-controller');
const responseMoudle = require('../utils/responseHandler');

const imageUploadDirectory = path.join(
    __dirname + '../../../public',
    'profiles'
); //root/public/assets/img/attendances/somefile.png
// ensure log directory exists
fs.existsSync(imageUploadDirectory) ||
    fs.mkdirSync(imageUploadDirectory, {
        recursive: true
    });

// For testing  Data
router.get('/testing', (req, res, next) => {
    return responseMoudle.successResponse(res, 1001, []);
    // return next({ msgCode: 1000 });
    res.send({
        Message: 'Testing project'
    });
});

//Authenticate user
router.post(
    '/login',
    audit,
    celebrate(userValidationSchema.login),
    userController.userLogin
);

// Register new user & storing their info in mongodb
router.post(
    '/register',
    audit,
    celebrate(userValidationSchema.register),
    userController.userRegistration
);

//Verify OTP
router.post(
    '/verifyOtp',
    audit,
    celebrate(userValidationSchema.verifyOtp),
    userController.verifyOtp
);

//Forget password api
router.post(
    '/forgetPassword',
    audit,
    celebrate(userValidationSchema.forgetPassword),
    userController.forgetPassword
);

//Resend OTP
router.post(
    '/resendOtp',
    audit,
    celebrate(userValidationSchema.resendOtp),
    userController.resendOtp
);

//User email Notification
router.post(
    '/sendNotificationEmail',
    audit,
    celebrate(userValidationSchema.emailNotification),
    userController.sendEmailNotification
);

// Change User Profile
router.post(
    '/updateProfile',
    audit,
    check_auth,
    userController.updateUserProfile
);

//Get All Users  data
router.get(
    '/getAll',
    audit,
    check_auth,
    celebrate(userValidationSchema.getAllUsers),
    userController.getAllUsers
);

//Get  User  Data
router.get(
    '/get',
    audit,
    check_auth,
    celebrate(userValidationSchema.getUser),
    userController.getUserInfo
);

//Delete  User  Data
router.post(
    '/delete',
    audit,
    check_auth,
    celebrate(userValidationSchema.deleteUser),
    userController.deleteUser
);

module.exports = router;
