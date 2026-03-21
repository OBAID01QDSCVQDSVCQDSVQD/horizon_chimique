import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est requis']
    },
    content: {
        type: String,
        required: [true, 'Le contenu est requis']
    },
    position: {
        type: String,
        enum: ['left', 'right'], // 'left' = Offre Principale, 'right' = Nouveauté
        default: 'left'
    },
    color: {
        type: String,
        default: 'bg-gradient-to-br from-blue-600 to-blue-800'
    },
    link: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
