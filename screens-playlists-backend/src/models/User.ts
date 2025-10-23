import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface IUser extends Document {
  email: string;
  password: string; // hashed password
  role: Role;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'EDITOR', 'VIEWER'], default: 'VIEWER' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
