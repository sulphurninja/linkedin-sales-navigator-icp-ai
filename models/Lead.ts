import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  apolloId: string;
  fullName: string;
  title: string;
  companyName: string;
  companyDomain: string;
  location: string;
  linkedinUrl: string;
  email: string;
  phone?: string;
  rawApolloJson: any;
  aiFitScore: number;
  aiFitLabel: 'good' | 'maybe' | 'bad';
  aiReason: string;
  aiTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  apolloId: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyDomain: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  linkedinUrl: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  rawApolloJson: {
    type: Schema.Types.Mixed,
    required: true,
  },
  aiFitScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  aiFitLabel: {
    type: String,
    enum: ['good', 'maybe', 'bad'],
    required: true,
  },
  aiReason: {
    type: String,
    required: true,
  },
  aiTags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for userId and apolloId to prevent duplicates per user
LeadSchema.index({ userId: 1, apolloId: 1 }, { unique: true });

// Update the updatedAt timestamp on save
LeadSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;

