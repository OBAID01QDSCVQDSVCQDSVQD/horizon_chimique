import mongoose from 'mongoose';

const RealizationSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Le titre du projet est requis']
    },
    description: {
        type: String,
        required: [true, 'Une description est requise']
    },
    tags: [{
        type: String // Multi-tags: 'Peinture', 'Etanchéité', etc.
    }],
    images: [{
        type: String // URLs from Cloudinary
    }],
    location: {
        type: String
    },
    completionDate: {
        type: Date
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVisible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Check if model exists and if 'likes' is still a Number (old schema)
if (mongoose.models.Realization) {
    const likesPath = mongoose.models.Realization.schema.path('likes');
    if (likesPath && likesPath.instance === 'Number') {
        console.log("Deleting old Realization model from Mongoose cache to apply schema update...");
        delete mongoose.models.Realization;
    }
}

export default mongoose.models.Realization || mongoose.model('Realization', RealizationSchema);
