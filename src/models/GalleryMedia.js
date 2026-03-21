import mongoose from 'mongoose';

const GalleryMediaSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true,
        default: 'image'
    },
    url: {
        type: String // Used for video or legacy single image
    },
    images: [{
        type: String
    }],
    title: {
        type: String,
        required: [true, 'Le titre est requis']
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'La catégorie est requise']
    },
    is_published: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.models.GalleryMedia || mongoose.model('GalleryMedia', GalleryMediaSchema);
