import bcrypt from 'bcryptjs';
import User from '../../models/User';
import connectDB from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  const { userIdOrEmail, password } = req.body;

  try {
    await connectDB();

    const user = await User.findOne({
      $or: [
        { email: userIdOrEmail },
        { studentId: userIdOrEmail }
      ]
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      ...(user.role === 'student' && {
        studentId: user.studentId,
        branch: user.branch,
        section: user.section
      }),
      ...(user.role === 'faculty' && {
        subject: user.subject,
        section: user.section
      })
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
}