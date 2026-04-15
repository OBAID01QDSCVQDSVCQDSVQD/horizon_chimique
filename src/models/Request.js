import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['diagnostic', 'reclamation', 'rdv', 'devis'] },
    fullName: { type: String, required: true },
    message: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String },
    projectName: { type: String },
    date: { type: Date },
    surface: { type: Number },
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    times: [Date],
    images: [String],
    status: { type: String, default: 'pending', enum: ['pending', 'contacted', 'resolved'] },
}, { timestamps: true });

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
