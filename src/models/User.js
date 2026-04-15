import mongoose from 'mongoose';

// FIX: Force re-compile model in dev to apply schema changes without restart
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.User;
}

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allows null values to be ignored for uniqueness
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Veuillez utiliser une adresse email valide'],
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    },
    role: {
        type: String,
        enum: ['client', 'artisan', 'admin'],
        default: 'client',
    },
    status: {
        type: String, // approved, pending, rejected
        enum: ['approved', 'pending', 'rejected'],
        default: 'approved',
    },
    // Artisan specific
    specialty: {
        type: String,
    },
    points: {
        type: Number,
        default: 0,
    },
    image: {
        type: String,
    },
    // Artisan Pro Details
    companyName: { type: String },
    address: { type: String },
    bio: { type: String },
    whatsapp: { type: String },
    website: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    taxId: { type: String }, // Matricule Fiscale
    cachet: { type: String }, // Digital stamp with transparent background
    fidelityRank: {
        type: String,
        enum: ['bronze', 'silver', 'gold']
    },
    parentGoldArtisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Geolocation
    lastLocation: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },

    // Impersonation
    impersonationToken: { type: String, select: false },
    impersonationExpires: { type: Date, select: false },

    // Password Reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    }
}, { timestamps: true });

// Auto-generate clean slug for artisans without random symbols (unless collision)
UserSchema.pre('save', async function(next) {
    if (this.role === 'artisan' && (!this.slug || this.isModified('companyName') || this.isModified('name'))) {
        let baseSlug = this.companyName || this.name || 'artisan';
        
        if (this.specialty) {
            baseSlug += ` ${this.specialty}`;
        }
        // Extract city from address if possible
        if (this.address) {
            const city = this.address.split(',')[0].split('-')[0].trim();
            baseSlug += ` ${city}`;
        }

        let cleanSlug = baseSlug
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove accents
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Keep only letters and numbers
            .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
            
        // Final uniqueness check
        const User = mongoose.models.User || mongoose.model('User');
        const existing = await User.findOne({ slug: cleanSlug, _id: { $ne: this._id } });
        
        if (existing) {
            // Only add suffix if name collision happens
            cleanSlug = `${cleanSlug}-${this._id.toString().slice(-4)}`;
        }

        this.slug = cleanSlug;
    }
    next();
});

// Check if model already exists to prevent overwrite in dev
export default mongoose.models.User || mongoose.model('User', UserSchema);
