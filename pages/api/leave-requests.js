import connectDB from '../../lib/mongodb';
import LeaveRequest from '../../models/LeaveRequest';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { studentId } = req.query;
    
    try {
      const query = studentId ? { studentId } : {};
      const leaveRequests = await LeaveRequest.find(query).sort({ createdAt: -1 });
      res.json(leaveRequests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else if (req.method === 'POST') {
    const { studentId, name, section, reason, fromDate, toDate, contactNumber, leaveType, proof } = req.body;
    
    try {
      const leaveRequest = new LeaveRequest({ 
        studentId, 
        name, 
        section, 
        reason, 
        fromDate, 
        toDate,
        contactNumber,
        leaveType,
        proof 
      });
      await leaveRequest.save();
      res.json({ msg: 'Leave request submitted successfully', leaveRequest });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
