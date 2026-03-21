
import mongoose from 'mongoose';

const AiSystemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // e.g., "Système Standard Béton", "Système Carrelage"
    },
    triggerKeywords: [{
        type: String // e.g., "béton", "dalle", "ciment"
    }],
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        role: { type: String, enum: ['primary', 'finish', 'reinforcement', 'accessory'] }, // Role in the system
        consumptionRate: { type: Number, default: 0 }, // Optional override: kg/m2
        usageInstructions: String // e.g., "Diluer à 10%"
    }],
    basePrompt: {
        type: String,
        required: true
        // "This system is for concrete surfaces. It requires 1 layer of [Product A] diluted and 2 layers of [Product B] crossen."
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.models.AiSystem || mongoose.model('AiSystem', AiSystemSchema);
