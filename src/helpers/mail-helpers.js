const nodemailer = require('nodemailer');
const { isEmpty } = require('../utils/utils');
const { ErrorHandler } = require('../utils/error-handler');

//Function for sending general emails
const sendMail = async (userEmail, subject, text, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASS
        }
    });

    const info = await transporter.sendMail({
        from: process.env.SMTP_MAIL,
        to: userEmail,
        subject: subject,
        text: text,
        html: html
    });

    if (!info.messageId) console.error('Email not sent successfully');
};

//Send OTP Function
const sendOTPMail = async (userEmail, otpCode) => {
    if (isEmpty(userEmail)) return next(new ErrorHandler(300));
    const subject = `Verfication Code EXN`;
    const text = `Your verification code is: ${otpCode}`;

    const html = `<html> <div style="background-color: #2d4061; border-radius: 8px; max-width: 500px;margin: auto; padding: 30px 20px 90px 15px">
        <h4 style="text-align: center;color: #fff;font-family: sans-serif;">
        Your verification code: ${otpCode}
        </h4>
    </div></html>`;

    await sendMail(userEmail, subject, text, html);
};

const sendUserEmailNotification = async (userEmail, message) => {
    if (isEmpty(userEmail)) return next(new ErrorHandler(300));
    const subject = `User Notification Message For Exn`;
    const text = message;

    const html = `<html> <div style="background-color: #2d4061; border-radius: 8px; max-width: 500px;margin: auto; padding: 30px 20px 90px 15px">
        <h5 style="text-align: center;color: #fff;font-family: sans-serif;">
           ${message}  
        </h5>
    </div></html>`;

    await sendMail(userEmail, subject, text, html);
};

const sendForgetPasswordMail = async (userEmail, otpCode) => {
    if (isEmpty(userEmail)) return next(new ErrorHandler(300));
    const subject = `Verification Code For Reset Password EXN`;
    const text = `Your verification code is: ${otpCode}`;

    const html = `<html> <div style="background-color: #2d4061; border-radius: 8px; max-width: 500px;margin: auto; padding: 30px 20px 90px 15px">
        <h4 style="text-align: center;color: #fff;font-family: sans-serif;">
        Your verification code: ${otpCode}
        </h4>
    </div></html>`;

    await sendMail(userEmail, subject, text, html);
};

module.exports = {
    sendOTPMail,
    sendForgetPasswordMail,
    sendUserEmailNotification
};
