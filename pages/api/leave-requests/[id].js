import connectDB from '../../../lib/mongodb';
import LeaveRequest from '../../../models/LeaveRequest';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await LeaveRequest.findByIdAndDelete(id);
      res.json({ msg: 'Leave request deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
