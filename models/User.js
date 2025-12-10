import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['faculty', 'student'], required: true },
  name: { type: String, required: true },
  studentId: { type: String },
  branch: { type: String },
  section: { type: String },
  subject: { type: String },
  profilePicture: { type: String, default: '' },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
