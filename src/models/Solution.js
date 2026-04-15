import mongoose from 'mongoose';

const SolutionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    icon: { type: String, default: 'Layers' },
    image: { type: String }, // Optional but good for future
    color: { type: String, default: 'bg-blue-500' },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    }
}, { timestamps: true });

// Auto-generate slug before saving
SolutionSchema.pre('save', function(next) {
    if (!this.slug && this.title) {
        this.slug = this.title
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

export default mongoose.models.Solution || mongoose.model('Solution', SolutionSchema);

