# Todo App with Email Reminders

A feature-rich, responsive todo application with automatic email notifications, beautiful UI, and both client-side and server-side functionality.

## ✨ Features

- **Task Management**: Create, edit, delete, and complete tasks
- **Due Date & Time**: Set specific due dates with 12-hour time format (e.g., "7:30 pm")
- **Planned Time**: Estimate how long tasks will take
- **Email Reminders**: Automatic notifications 1 day before due dates
- **Dual Mode**: Works with or without backend server
- **Responsive Design**: Beautiful UI that works on all devices
- **Data Persistence**: Local storage fallback with optional server sync

## 🎨 Design Features

- **Glassmorphism UI**: Modern semi-transparent design with backdrop blur
- **Gradient Background**: Beautiful color transitions
- **Responsive Grid**: Adapts to different screen sizes
- **Status Chips**: Visual indicators for due dates and planned time
- **Smooth Animations**: Hover effects and transitions

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup with modern form elements
- **CSS3**: Grid layouts, flexbox, glassmorphism effects
- **Vanilla JavaScript**: ES6+ features, async/await, fetch API

### Backend (Optional)
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **SQLite**: Lightweight database
- **Nodemailer**: Email sending
- **node-cron**: Scheduled tasks

## 🚀 Getting Started

### Frontend Only (Local Storage Mode)
1. **Open** `Todo App/index.html` in your browser
2. **Register** your email address
3. **Start adding tasks** with due dates and times
4. **Use EmailJS** for client-side reminders (requires configuration)

### Full Stack Mode (Recommended)
1. **Navigate to** the `server/` directory
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create** `.env` file with your SMTP settings:
   ```env
   PORT=4000
   SMTP_HOST=smtp.yourprovider.com
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   MAIL_FROM=Your App <no-reply@yourdomain.com>
   ```
4. **Start the server**:
   ```bash
   npm run dev
   ```
5. **Open** `Todo App/index.html` in your browser
6. **Register** your email - the app will automatically detect the backend

## 📁 Project Structure

```
Todo App/
├── index.html              # Main application interface
├── css/
│   └── style.css          # Responsive styles and animations
├── script/
│   └── script.js          # Frontend logic and API integration
└── README.md              # This file

server/
├── index.js               # Express server with API endpoints
├── package.json           # Node.js dependencies
└── data.db               # SQLite database (auto-created)
```

## 🔧 Configuration

### EmailJS (Client-side Fallback)
If you want client-side email reminders when the backend is unavailable:

1. **Sign up** at [EmailJS](https://www.emailjs.com/)
2. **Create** an email template
3. **Update** `script/script.js`:
   ```javascript
   emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
   // In sendEmailReminder function:
   emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {...});
   ```

### SMTP Settings (Backend)
For reliable server-side email reminders:

- **Gmail**: Use App Passwords
- **Outlook/Hotmail**: Enable SMTP in account settings
- **Custom Domain**: Configure your mail server settings

## 📱 Usage

### Adding Tasks
1. **Enter task description** in the first input
2. **Set due date** using the date picker
3. **Add due time** in 12-hour format (e.g., "7:30 pm", "9am")
4. **Estimate planned time** and select units (hours/minutes)
5. **Click "Add"** to create the task

### Task Management
- **Complete/Undo**: Toggle task completion status
- **Edit**: Modify task details inline
- **Delete**: Remove tasks permanently

### Email Reminders
- **Automatic**: Server sends reminders 24 hours before due time
- **Reliable**: Works even when the browser is closed
- **Smart**: Only sends one reminder per task

## 🔄 API Endpoints

When using the backend, the following REST endpoints are available:

- `POST /api/register` - Register user email
- `GET /api/tasks?email=...` - Fetch user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update existing task
- `DELETE /api/tasks/:id` - Delete task

## 📱 Responsive Features

- **Mobile-first design** with progressive enhancement
- **Flexible grid layouts** that stack on small screens
- **Touch-friendly interface** elements
- **Adaptive typography** using CSS clamp
- **Optimized spacing** for different screen sizes

## 🚨 Troubleshooting

### Backend Not Detected
- Ensure the server is running on port 4000
- Check browser console for CORS errors
- Verify the server is accessible at `http://localhost:4000`

### Email Not Sending
- **Backend mode**: Check SMTP settings in `.env`
- **Client mode**: Verify EmailJS configuration
- Check browser console for error messages

### Database Issues
- The SQLite database is created automatically
- Ensure the `server/` directory is writable
- Restart the server if database corruption occurs

## 🌟 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔒 Security Notes

- Email addresses are stored locally and on the server
- No authentication required (email-based identification)
- SMTP credentials should be kept secure
- Consider HTTPS for production use

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit:
- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

---

**Stay organized and never miss a deadline! 📅✨**
