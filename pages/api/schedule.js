import connectDB from '../../lib/mongodb';
import Class from '../../models/Class';
import Notification from '../../models/Notification';
import User from '../../models/User';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { section } = req.query;
    try {
      const query = section ? { section } : {};
      const schedule = await Class.find(query);
      res.json(schedule);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else if (req.method === 'POST') {
    const { day, time, subject, section } = req.body;
    
    try {
      const newClass = new Class({ day, time, subject, section });
      await newClass.save();

      // Create notifications for students in that section
      const students = await User.find({ role: 'student', section });
      const notifications = students.map(student => ({
        userId: student._id,
        message: `New class scheduled: ${subject} on ${day} at ${time}`,
        type: 'schedule'
      }));
      await Notification.insertMany(notifications);

      res.json({ msg: 'Schedule added' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
