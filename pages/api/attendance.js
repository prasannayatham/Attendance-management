import connectDB from '../../lib/mongodb';
import Attendance from '../../models/Attendance';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { studentId, date, section, startDate, endDate } = req.query;
    
    try {
      let query = {};
      if (studentId) query.studentId = studentId;
      if (date) query.date = date;
      if (section) query.section = section;
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }
      
      const attendance = await Attendance.find(query);
      res.json(attendance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else if (req.method === 'POST') {
    const { studentId, section, subject, status, date } = req.body;
    
    try {
      const attendance = new Attendance({ studentId, section, subject, status, date });
      await attendance.save();
      res.json({ msg: 'Attendance recorded' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
