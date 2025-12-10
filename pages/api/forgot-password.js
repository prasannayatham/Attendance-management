import bcrypt from 'bcryptjs';
import connectDB from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  const { userIdOrEmail, newPassword } = req.body;

  if (!userIdOrEmail || !newPassword) {
    return res.status(400).json({ msg: 'Please provide user ID/email and new password' });
  }

  try {
    await connectDB();

    const user = await User.findOne({
      $or: [
        { email: userIdOrEmail },
        { studentId: userIdOrEmail }
      ]
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: 'Password reset successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
}