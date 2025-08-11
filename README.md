# Age Calculator

A beautiful, modern age calculator web application that calculates your exact age in years, months, and days with stunning visual effects.

## ✨ Features

- **Precise Age Calculation**: Calculates age down to the exact day
- **Beautiful UI**: Modern glassmorphism design with gradient backgrounds
- **Interactive Elements**: Animated buttons with ripple effects
- **Celebratory Animation**: Confetti burst effect when age is calculated
- **Responsive Design**: Works perfectly on all devices
- **Real-time Validation**: Prevents future dates and empty inputs

## 🎨 Design Features

- **Glassmorphism Effect**: Semi-transparent container with backdrop blur
- **Gradient Background**: Beautiful blue-to-pink gradient
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Modern Typography**: Clean, readable fonts with proper spacing
- **Color-coded Results**: Results displayed in an elegant card format

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern CSS features including:
  - CSS Grid and Flexbox
  - Backdrop filters
  - CSS transitions and transforms
  - Responsive design with media queries
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **EmailJS**: For email notifications (optional)

## 📱 Responsive Features

- Mobile-first design approach
- Flexible layouts that adapt to screen sizes
- Touch-friendly interface elements
- Optimized for all device types

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open** `index.html` in your web browser
3. **Enter** your date of birth
4. **Click** "Calculate Age" to see your results

## 📁 Project Structure

```
Age Calculator/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Styles and animations
└── script/
    └── script.js      # Age calculation logic
```

## 🎯 How It Works

1. **Input Validation**: Checks for valid date and prevents future dates
2. **Date Calculation**: Computes the difference between birth date and current date
3. **Month/Day Adjustment**: Handles edge cases for month boundaries
4. **Result Display**: Shows age in years, months, and days
5. **Animation**: Triggers confetti effect and smooth reveal

## 🔧 Customization

### Colors
- Modify the gradient in `css/style.css`:
  ```css
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  ```

### Animations
- Adjust transition timing in CSS
- Modify confetti emojis in `script/script.js`

### Email Notifications
- Configure EmailJS in `script/script.js`:
  ```javascript
  emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {...});
  ```

## 🌟 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this project.

---

**Enjoy calculating your age with style! 🎉**
