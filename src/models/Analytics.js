import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
    type: { type: String, enum: ['pageview', 'session_end', 'heartbeat'], required: true },
    page: { type: String }, // URL path
    referrer: { type: String },
    userAgent: { type: String },
    ip: { type: String },
    country: { type: String, default: 'Unknown' },
    city: { type: String, default: 'Unknown' },
    sessionId: { type: String, required: true },
    userId: { type: String, nullable: true },
    duration: { type: Number, default: 0 }, // in seconds (for session_end)
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for better query performance
AnalyticsSchema.index({ createdAt: -1 });
AnalyticsSchema.index({ sessionId: 1 });
AnalyticsSchema.index({ type: 1 });

export default mongoose.models.UserAnalytics || mongoose.model('UserAnalytics', AnalyticsSchema);
