import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IICPProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  description: string;
  industries: string[];
  locations: string[];
  minEmployees?: number;
  maxEmployees?: number;
  roleTitles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ICPProfileSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'ICP description is required'],
    trim: true,
  },
  industries: {
    type: [String],
    default: [],
  },
  locations: {
    type: [String],
    default: [],
  },
  minEmployees: {
    type: Number,
    min: 0,
  },
  maxEmployees: {
    type: Number,
    min: 0,
  },
  roleTitles: {
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

// Update the updatedAt timestamp on save
ICPProfileSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const ICPProfile: Model<IICPProfile> = mongoose.models.ICPProfile || mongoose.model<IICPProfile>('ICPProfile', ICPProfileSchema);

export default ICPProfile;

