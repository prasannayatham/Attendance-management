# 🎓 University Attendance Management System

A professional, innovative attendance management system designed for university-level operations. Built with Next.js, React, and MongoDB.

## ✨ Key Features

### 🎨 **Modern UI/UX Design**
- Animated gradient backgrounds
- Glassmorphism effects
- Smooth transitions and hover effects
- Professional color scheme
- Dark/Light mode support
- Responsive design for all devices

### 👨‍🎓 **Student Portal**
- View real-time attendance records
- Interactive class schedule
- Announcements dashboard
- Attendance statistics
- Profile management

### 👨‍🏫 **Faculty Portal**
- Quick attendance marking
- Student list management
- Schedule creation & editing
- Announcement posting
- Section-wise filtering
- Analytics dashboard

### 🔐 **Security Features**
- Secure authentication with bcryptjs
- JWT token management
- Password reset functionality
- Role-based access control

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, Next.js 14 |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB with Mongoose |
| **UI Framework** | React Bootstrap 5 |
| **Styling** | Custom CSS with animations |
| **Icons** | Bootstrap Icons |
| **Authentication** | bcryptjs |

## 📦 Installation

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account or local MongoDB
- Git

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd attendance-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create/update `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

4. **Add university logos**

Place these images in `public/` folder:
- `university.png` - Main university logo
- `nacc-logo.png` - NAAC accreditation logo
- `qs-ranking-logo.png` - QS ranking logo

5. **Run development server**
```bash
npm run dev
```

Visit: **http://localhost:3000**

6. **Build for production**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
attendance-system/
├── components/          # Reusable React components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── StudentDashboard.jsx
│   ├── FacultyDashboard.jsx
│   ├── Navbar.jsx
│   └── Footer.jsx
├── pages/              # Next.js pages & routing
│   ├── api/           # Backend API endpoints
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── forgot-password.js
│   │   ├── users.js
│   │   ├── sections.js
│   │   ├── attendance.js
│   │   ├── schedule.js
│   │   └── announcements.js
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard pages
│   ├── _app.js       # App wrapper
│   └── index.js      # Home page
├── models/            # MongoDB schemas
│   ├── User.js
│   ├── Attendance.js
│   ├── Announcement.js
│   ├── Class.js
│   └── LeaveRequest.js
├── lib/               # Utilities
│   └── mongodb.js    # Database connection
├── styles/            # Global styles
│   └── globals.css
└── public/            # Static assets

```

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/forgot-password` - Password reset

### User Management
- `GET /api/users` - Get students list
- `GET /api/sections` - Get all sections

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/[id]` - Update attendance

### Schedule
- `GET /api/schedule` - Get class schedule
- `POST /api/schedule` - Create schedule
- `PUT /api/schedule/[id]` - Update schedule
- `DELETE /api/schedule/[id]` - Delete schedule

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Post announcement

## 🎨 Design Features

### Animations
- ✨ Gradient shifting backgrounds
- 🎭 Glassmorphism login box
- 🎪 Floating logo animation
- 📊 Smooth card transitions
- 🌊 Hover effects on all interactive elements

### Color Palette
- **Primary**: `#1e3a8a` (Navy Blue)
- **Secondary**: `#3b82f6` (Sky Blue)
- **Success**: `#10b981` (Green)
- **Danger**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

## 🌙 Dark Mode

Fully functional dark mode with:
- Automatic theme persistence
- Smooth transitions
- Optimized color contrast
- Toggle button in navbar

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1919px)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

## 🔒 Security Best Practices

- Password hashing with bcryptjs
- Environment variable protection
- MongoDB injection prevention
- CORS configuration
- Input validation
- Secure session management

## 🚀 Performance Optimizations

- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (student/faculty),
  name: String,
  studentId: String (for students),
  branch: String (for students),
  section: String,
  subject: String (for faculty)
}
```

### Attendance Model
```javascript
{
  studentId: String,
  section: String,
  subject: String,
  date: Date,
  status: String (present/absent)
}
```

## 👨‍💻 Developer

Developed and maintained by a single contributor.

For feature requests or bug reports, please create an issue on GitHub.

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 👨‍💻 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@university.edu

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts
- [ ] Biometric integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Export to PDF/Excel
- [ ] Multi-language support
- [ ] Parent portal

---

**Made with ❤️ for Universities**
