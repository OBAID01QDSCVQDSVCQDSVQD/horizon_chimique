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
        type: String // URLs from Cloudinary/MinIO
    }],
    video: {
        type: String // URL of the video file
    },
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
    },
    slug: {
        type: String,
        unique: true,
        sparse: true, // Allows nulls for old documents until they are updated
        index: true
    }
}, { timestamps: true });

// Auto-generate slug before saving
RealizationSchema.pre('save', function(next) {
    if (!this.slug && this.title) {
        let baseSlug = this.title;
        if (this.location) {
            baseSlug += ` ${this.location}`;
        }
        
        // Convert to SEO-friendly slug
        this.slug = baseSlug
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove accents
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
            .replace(/^-+|-+$/g, ''); // Trim -
            
        // Append part of ID to ensure absolute uniqueness
        if (this.isNew || !this.slug) {
             const shortId = this._id.toString().slice(-4);
             this.slug = `${this.slug}-${shortId}`;
        }
    }
    next();
});

// Check if model exists and if 'likes' is still a Number (old schema)
if (mongoose.models.Realization) {
    const likesPath = mongoose.models.Realization.schema.path('likes');
    if (likesPath && likesPath.instance === 'Number') {
        console.log("Deleting old Realization model from Mongoose cache to apply schema update...");
        delete mongoose.models.Realization;
    }
}

export default mongoose.models.Realization || mongoose.model('Realization', RealizationSchema);
