import connectDB from '../../../lib/mongodb';
import Class from '../../../models/Class';

export default async function handler(req, res) {
  const { id } = req.query;
  await connectDB();

  if (req.method === 'PUT') {
    const { day, time, subject, section } = req.body;
    
    try {
      await Class.findByIdAndUpdate(id, { day, time, subject, section });
      res.json({ msg: 'Schedule updated' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await Class.findByIdAndDelete(id);
      res.json({ msg: 'Schedule deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  } else {
    res.status(405).json({ msg: 'Method not allowed' });
  }
}
