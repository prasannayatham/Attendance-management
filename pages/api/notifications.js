import connectDB from '../../lib/mongodb';
import Notification from '../../models/Notification';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { userId } = req.query;
    
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20);
      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else if (req.method === 'POST') {
    const { userId, message, type } = req.body;
    
    try {
      const notification = new Notification({ userId, message, type });
      await notification.save();
      res.json({ msg: 'Notification created', notification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
