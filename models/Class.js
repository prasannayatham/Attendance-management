import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  day: { type: String, required: true },
  time: { type: String, required: true },
  subject: { type: String, required: true },
  section: { type: String, required: true },
});

export default mongoose.models.Class || mongoose.model('Class', classSchema);
