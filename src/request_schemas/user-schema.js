const { Joi, Segments } = require('celebrate');

const register = {
    [Segments.BODY]: Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        role: Joi.string().required()
      
    })
};
const login = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required()
    })
};

const verifyOtp = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required(),
        code: Joi.string().required()
    })
};

const resendOtp = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required()
    })
};

const forgetPassword = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required()
    })
};
const emailNotification = {
    [Segments.BODY]: Joi.object().keys({
        email: Joi.array().required(),
        message: Joi.string().required()
    })
};

const updateProfile = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            'x-access-token': Joi.string().required()
        })
        .unknown(),
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required(),
        first_name: Joi.string(),
        last_name: Joi.string(),
        secondary_email: Joi.string().allow(null, ''),
        bio: Joi.string(),
        phone_number: Joi.string(),
        password: Joi.string(),
        old_password: Joi.string(),
        role: Joi.string(),
        pass_type: Joi.string(),
        status : Joi.string(),
    })
};

const getAllUsers = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            'x-access-token': Joi.string().required()
        })
        .unknown(),
        [Segments.QUERY]: {
            role: Joi.string().allow(null, '')
        }
        
};

const getUser = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            'x-access-token': Joi.string().required()
        })
        .unknown(),
    [Segments.QUERY]: {
        email: Joi.string().required()
    }
};

const deleteUser = {
    [Segments.HEADERS]: Joi.object()
        .keys({
            'x-access-token': Joi.string().required()
        })
        .unknown(),
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required()
    })
};

module.exports = {
    register,
    login,
    verifyOtp,
    resendOtp,
    forgetPassword,
    updateProfile,
    getAllUsers,
    getUser,
    deleteUser,
    emailNotification
};
