import mongoose, { Schema, Document } from 'mongoose';

export interface ISMSLog extends Document {
  to: string | string[];
  message: string;
  status: 'sent' | 'failed';
  reference?: string;
  error?: string;
  type: 'single' | 'bulk';
  triggeredBy?: string; // Admin ID, system, etc.
  sentAt: Date;
}

const SMSLogSchema: Schema = new Schema({
  to: { type: Schema.Types.Mixed, required: true }, // Array of strings or single string
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  reference: { type: String },
  error: { type: String },
  type: { type: String, enum: ['single', 'bulk'], required: true },
  triggeredBy: { type: String },
  sentAt: { type: Date, default: Date.now }
});

export default mongoose.models.SMSLog || mongoose.model<ISMSLog>('SMSLog', SMSLogSchema, 'sms_logs');
