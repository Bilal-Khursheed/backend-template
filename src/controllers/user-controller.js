'use strict';
const utils = require('../utils/utils');
const mailHelpers = require('../helpers/mail-helpers');
const { ErrorHandler } = require('../utils/error-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OTPModel = require('../models/Otp');
const User = require('../models/User');
const moment = require('moment');

const userLogin = async (req, res, next) => {
    try {
        let rq = res.locals.json_req; //Getting req_body from audit middleware after sanitizing them
        const { email, password } = rq;

        // Validate if user exist in our database
        const user = await User.findOne({ email });
        if (utils.isEmpty(user)) return next(new ErrorHandler(300));

        //Matching Given password with stored user's password
        const match_password = await bcrypt.compare(password, user.password);

        if (match_password) {
            // Validate if user isVerified in our database
            if (
                !['admin', 'super_admin'].includes(user.role) &&
                (user.status === 'pending' || user.status === 'declined')
            ) {
                return next(
                    new ErrorHandler(
                        '405',
                        'Error: You Are Not Approved From Administration.Please Contact'
                    )
                );
            } else {
                //Creating signed JWT
                const token = jwt.sign(
                    { email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '48h' }
                );

                return res.status(200).json({
                    result: 'success',
                    code: 200,
                    desc: 'User Logged In Successfully',
                    user: user,
                    token: token
                });
            }
        } else {
            return next(
                new ErrorHandler(
                    '302',
                    'Error: Given Email Or Password Is Invalid'
                )
            );
        }
    } catch (error) {
        utils.printErrorLog(
            'user/login catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

const userRegistration = async (req, res, next) => {
    try {
        const rq = res.locals.json_req; //Getting req_body from audit middleware after sanitizing them
        const { first_name, last_name, email, password, role } = rq;

        //Check if user already exist
        const old_user = await User.findOne({ email });

        if (utils.isNotEmpty(old_user)) {
            return next(
                new ErrorHandler('409', 'User Already Exist. Please Login')
            );
        }

        //Password encrpting with bcrypt
        const encrypted_password = await bcrypt.hash(password, 10);

        //Storing data in db via mongoose User model
        const create_user = await User.create({
            first_name,
            last_name,
            email,
            password: encrypted_password,
            role: role ? role : 'admin'
        });

        const otp = await generateOTP(email);

        // mailHelpers.sendOTPMail(email, otp);

        //Create JSON Web Token
        // const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '48h' });

        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'User Registered Successfully',
            data: create_user
        });
    } catch (error) {
        utils.printErrorLog(
            'user/register catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const rq = res.locals.json_req; //Getting req_body from audit middleware after sanitizing them
        const { code, email } = rq;

        const user = await User.findOne({ email: email });

        if (utils.isEmpty(user))
            return next(new ErrorHandler(404, 'User Does Not Exists'));

        const otpCode = await OTPModel.findOne({ code: code, email: email });
        if (utils.isEmpty(otpCode))
            return next(new ErrorHandler(404, 'Invalid OTP'));

        //If current time is past otp expiry time (OTP is expired), show error
        if (moment().isAfter(otpCode.expireIn))
            return next(new ErrorHandler(410, 'OTP Has Been Expired'));
        //Creating signed JWT
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '48h'
        });
        user.is_verified = true;
        const verified_user = await user.save();
        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'OTP Verified Successfully',
            data: verified_user,
            token: token
        });
    } catch (error) {
        utils.printErrorLog(
            'user/verifyOtp catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const rq = res.locals.json_req; //Getting req_body from audit middleware after sanitizing them

        const { email } = rq;
        const user = await User.findOne({ email: email });

        if (utils.isEmpty(user))
            return next(new ErrorHandler(404, 'User Does Not Exists'));

        const otp = await generateOTP(email);
        mailHelpers.sendForgetPasswordMail(email, otp);

        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'OTP Sent Successfully',
            data: user
        });
    } catch (error) {
        printErrorLog(
            'user/forgetPassword catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

const resendOtp = async (req, res, next) => {
    try {
        const rq = res.locals.json_req; //Getting req_body from audit middleware after sanitizing them

        const { email } = rq;

        const user = await User.findOne({ email: email });
        if (utils.isEmpty(user))
            return next(new ErrorHandler(404, 'User Does Not Exists'));

        const otp = await generateOTP(email);
        mailHelpers.sendOTPMail(email, otp);

        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'OTP Sent Successfully',
            data: otp
        });
    } catch (error) {
        utils.printErrorLog(
            'user/resendOtp catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

const sendEmailNotification = async (req, res, next) => {
    try {
        const rq = res.locals.json_req; //Getting req_body from audit middleware after sanitizing them
        const { email, message } = rq;
        mailHelpers.sendUserEmailNotification(email, message);
        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'email Sent Successfully'
        });
    } catch (error) {
        utils.printErrorLog(
            'user/sendEmailNotification catch: ' +
                utils.formatErrorString(error)
        );
        return next(error);
    }
};

const updateUserProfile = async (req, res, next) => {
    try {
        const rq = res.locals.json_req; //Getting req_body from audit middleware after sanitizing them
        const {
            first_name,
            last_name,
            email,
            secondary_email,
            password,
            old_password,
            role,
            bio,
            phone_number,
            pass_type,
            status
        } = rq;
        const user = await User.findOne({ email });
        if (utils.isEmpty(user))
            return next(new ErrorHandler('', 'Error: Given Email Invalid'));
        let image_name = null;

        let uploadedFile = req.files.myfile ? req.files.myfile : '';

        if (uploadedFile !== '') {
            const old_image = user?.profile_image?.path;
            fs.unlinkSync('public/profilies' + old_image);

            image_name =
                '/' +
                user._id +
                '_' +
                moment().format('YYYY-MM-DD_HH-mm-ss_SSS') +
                '.' +
                uploadedFile.name.split('.').pop();

            const file_type = uploadedFile.mimetype || '';
            if (file_type == 'image/png' || file_type == 'image/jpeg') {
                //If image is png or jpg then store, otherwise not
                const path_to_upload = imageUploadDirectory + image_name;
                try {
                    await uploadedFile.mv(path_to_upload);
                } catch (e) {
                    console.log(utils.formatErrorString(e));
                    return next(
                        new ErrorHandler(
                            '',
                            'Error: There was some problem in uploading image'
                        )
                    );
                }
            }
        }

        if (utils.isNotEmpty(first_name)) {
            user.first_name = first_name;
        }

        if (utils.isNotEmpty(last_name)) {
            user.last_name = last_name;
        }
        if (utils.isNotEmpty(secondary_email)) {
            user.secondary_email = secondary_email;
        }
        if (utils.isNotEmpty(bio)) {
            user.bio = bio;
        }
        if (utils.isNotEmpty(phone_number)) {
            user.phone_number = phone_number;
        }

        if (utils.isNotEmpty(role)) {
            user.role = role;
        }

        if (utils.isNotEmpty(status)) {
            user.status = status;
        }

        if (utils.isNotEmpty(image_path)) {
            user.profile_image = {
                name: uploadedUpdateFile.name,
                path: image_path
            };
        }

        if (utils.isNotEmpty(password)) {
            if (pass_type === 'update') {
                const match_password = await bcrypt.compare(
                    old_password,
                    user.password
                );
                if (!match_password) {
                    return next(
                        new ErrorHandler(
                            '',
                            'Error: Given Email Or  Old Password Is Invalid'
                        )
                    );
                }
            }

            const encrypted_password = await bcrypt.hash(password, 10);

            user.password = encrypted_password;
        }

        await user.save();

        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'User Updated Successfully'
        });
    } catch (error) {
        utils.printErrorLog(
            'User/update-profile catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    let rq = res.locals.json_req;
    const { role } = rq;
    try {
        //Find all record   in our database
        let query = {};
        if (utils.isNotEmpty(role)) {
            query['role'] = role;
        }
        const users = await User.find(query);
        if (utils.isEmpty(users))
            return res.status(404).json({
                result: 'erorr',
                code: 404,
                desc: 'No Record Found',
                data: []
            });
        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'Users Fetched Successfully',
            data: users
        });
    } catch (error) {
        utils.printErrorLog(
            'users/get catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

const getUserInfo = async (req, res, next) => {
    try {
        //Find all record   in our database
        let rq = res.locals.json_req;
        const { email } = rq;
        // console.log(email);
        const user = await User.findOne({ email });
        if (utils.isEmpty(user)) return next(new ErrorHandler(300));
        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'User Fetched Successfully',
            data: user
        });
    } catch (error) {
        utils.printErrorLog(
            'users/get catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

//Generate OTP Function
const generateOTP = async (email) => {
    const otpCode = utils.getRandomInt(10000, 99999);

    const otpData = new OTPModel({
        email: email,
        code: otpCode,
        expireIn: new Date().getTime() + 600000 //Ten min from now
    });
    await otpData.save();

    return otpCode;
};

const deleteUser = async (req, res, next) => {
    try {
        //Find all record   in our database
        let rq = res.locals.json_req;
        const { email } = rq;

        const user = await User.find({ email });
        if (utils.isEmpty(user)) return next(new ErrorHandler(300));

        await User.deleteOne({ email });
        return res.status(200).json({
            result: 'success',
            code: 200,
            desc: 'User Deleted Successfully'
        });
    } catch (error) {
        utils.printErrorLog(
            'users/delete catch: ' + utils.formatErrorString(error)
        );
        return next(error);
    }
};

module.exports = {
    userLogin,
    userRegistration,
    verifyOtp,
    forgetPassword,
    resendOtp,
    sendEmailNotification,
    updateUserProfile,
    getAllUsers,
    getUserInfo,
    deleteUser
};
