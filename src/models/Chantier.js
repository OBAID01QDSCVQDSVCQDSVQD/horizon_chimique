import mongoose from 'mongoose';

const ChantierSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientName: {
        type: String,
        required: [true, 'Le nom du client est requis']
    },
    clientPhone: {
        type: String,
        required: [true, 'Le téléphone du client est requis']
    },
    products: [{
        designation: String,
        quantity: { type: Number, default: 1 }
    }],
    // Technical Details
    surface_sol: { type: Number, default: 0 }, // m²
    lineaire_acrotere: { type: Number, default: 0 }, // ml
    surface_murs: { type: Number, default: 0 }, // m²
    support_type: {
        type: String,
        enum: ['Béton', 'Enduit', 'Carrelage', 'Autre'],
        default: 'Béton'
    },
    invoiceImage: {
        type: String,
        required: [true, 'La photo de la facture/chantier est requise']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    },
    verificationToken: {
        type: String,
        unique: true,
        sparse: true
    },
    tokenExpiresAt: {
        type: Date
    },
    clientRating: {
        type: Number,
        min: 1,
        max: 5
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Prevent model overwrite in dev
export default mongoose.models.Chantier || mongoose.model('Chantier', ChantierSchema);
