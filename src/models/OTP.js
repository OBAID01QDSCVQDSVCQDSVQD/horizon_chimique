import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' }, // Auto-delete after 5 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
