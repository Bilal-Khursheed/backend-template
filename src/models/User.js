const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, default: null },
        last_name: { type: String, default: null },
        email: { type: String, unique: true },
        secondary_email: { type: String, default: '' },
        // profile_image: { type: String },

        bio: { type: String },
        phone_number: { type: String },
        password: { type: String },
        profile_image: {
            name: { type: String },
            path: { type: String },
        
        },
        // is_verified: {
        //     type: Boolean,
        //     default: false
        // },
        status: { type: String, enum: ['approved', 'declined', 'pending'], default: 'pending' },
        files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
        role: { type: String, enum: ['super admin', 'admin', 'student', 'collaborator', 'guest'] },
        deleted_at: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
