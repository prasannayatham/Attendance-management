import connectDB from '../../lib/mongodb';
import Announcement from '../../models/Announcement';
import Notification from '../../models/Notification';
import User from '../../models/User';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const announcements = await Announcement.find().sort({ createdAt: -1 });
      res.json(announcements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else if (req.method === 'POST') {
    const { title, content, facultyId } = req.body;
    
    try {
      const announcement = new Announcement({ title, content, facultyId });
      await announcement.save();

      // Create notifications for all students
      const students = await User.find({ role: 'student' });
      const notifications = students.map(student => ({
        userId: student._id,
        message: `New announcement: ${title}`,
        type: 'announcement'
      }));
      await Notification.insertMany(notifications);

      res.json({ msg: 'Announcement posted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
