import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['diagnostic', 'reclamation', 'rdv'] },
    message: { type: String, required: true },
    date: { type: Date }, // For RDV specific single date
    surface: { type: Number },
    phone: { type: String },
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    times: [Date], // For Diagnostic multiple slots
    images: [String],
    status: { type: String, default: 'pending', enum: ['pending', 'contacted', 'resolved'] },
}, { timestamps: true });

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
