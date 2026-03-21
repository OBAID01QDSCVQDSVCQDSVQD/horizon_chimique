import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Le téléphone est requis'],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    subject: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
