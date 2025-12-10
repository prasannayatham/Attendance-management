import connectDB from '../../../lib/mongodb';
import Notification from '../../../models/Notification';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  const { read } = req.body;

  try {
    await connectDB();
    await Notification.findByIdAndUpdate(id, { read });
    res.json({ msg: 'Notification updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
}
