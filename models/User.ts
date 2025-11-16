import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name?: string;
  linkedInId?: string;
  linkedInAccessToken?: string;
  linkedInTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional now (LinkedIn OAuth users won't have password)
    minlength: 6,
  },
  name: {
    type: String,
    trim: true,
  },
  linkedInId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values
  },
  linkedInAccessToken: {
    type: String,
  },
  linkedInTokenExpiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

