import connectDB from '../../lib/mongodb';
import LeaveRequest from '../../models/LeaveRequest';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const leaveRequests = await LeaveRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
      res.json(leaveRequests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else if (req.method === 'PUT') {
    const { id, status } = req.body;
    
    try {
      const leaveRequest = await LeaveRequest.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      res.json({ msg: 'Leave request updated', leaveRequest });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
