import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { name, email, studentId, branch, section, subject, profilePicture } = req.body;
    
    const updateData = {
      name,
      email,
      ...(studentId && { studentId }),
      ...(branch && { branch }),
      ...(section && { section }),
      ...(subject && { subject }),
      ...(profilePicture && { profilePicture })
    };

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
}
