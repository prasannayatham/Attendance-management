import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  reason: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  proof: { type: String },
  section: { type: String, required: true },
  contactNumber: { type: String, required: true },
  leaveType: { type: String, enum: ['sick', 'casual', 'emergency', 'medical', 'other'], default: 'sick' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);
