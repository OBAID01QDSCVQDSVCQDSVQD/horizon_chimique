import mongoose from 'mongoose';

const SolutionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    icon: { type: String, default: 'Layers' },
    image: { type: String }, // Optional but good for future
    color: { type: String, default: 'bg-blue-500' },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

export default mongoose.models.Solution || mongoose.model('Solution', SolutionSchema);
