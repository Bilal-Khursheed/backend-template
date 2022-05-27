const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            max: 50
        },

        code: {
            type: Number,
            default: 2
        },
        expireIn: { type: Date, default: Date.now },
        deleted_at: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Otp', OTPSchema);
