import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    realization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Realization',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
