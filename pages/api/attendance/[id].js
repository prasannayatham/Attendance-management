import connectDB from '../../../lib/mongodb';
import Attendance from '../../../models/Attendance';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  const { status } = req.body;

  try {
    await connectDB();
    await Attendance.findByIdAndUpdate(id, { status });
    res.json({ msg: 'Attendance updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
}
