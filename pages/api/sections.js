import connectDB from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  try {
    await connectDB();
    const sections = await User.distinct('section', { role: 'student' });
    res.json(sections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
}
