# WorkForce Tracker 🚀

A modern, comprehensive workforce management system designed for small businesses and solo entrepreneurs. Track workers, log hours, manage tasks, and generate detailed reports - all from a beautiful, intuitive web interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-web-lightgrey)

## 📋 Features

### Core Functionality
- **Worker Management**: Add, edit, and track multiple workers with detailed profiles
- **Time Tracking**: Log work hours with specific tasks and hourly rates
- **Task Management**: Create, assign, and track tasks with priority levels
- **Real-time Dashboard**: View today's statistics at a glance
- **Comprehensive Reports**: Generate detailed reports for any date range
- **Local Storage**: All data stored locally in your browser for privacy

### Key Highlights
- 💼 **Professional UI**: Modern, gradient-based design with smooth animations
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🔒 **Privacy First**: No server required - all data stays on your device
- 📊 **Data Export**: Export your data as JSON for backup or analysis
- 🎨 **Beautiful Interface**: Thoughtfully designed with attention to detail
- ⚡ **Fast & Lightweight**: No external dependencies, instant loading

## 🚀 Quick Start

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/workforce-tracker.git
cd workforce-tracker
```

2. **Open in browser:**
Simply open `index.html` in your web browser. No server or build process required!

### File Structure
```
workforce-tracker/
│
├── index.html          # Main HTML file
├── styles.css          # All styling and responsive design
├── app.js             # Application logic and data management
├── README.md          # Documentation (this file)
├── LICENSE           # MIT License
└── assets/           # Optional folder for any additional assets
    └── screenshots/  # Application screenshots
```

## 💻 Usage Guide

### Getting Started

1. **Add Workers**: Navigate to the Workers tab and click "Add Worker"
   - Enter worker name, contact info, and default hourly rate
   - Add skills or notes for easy reference

2. **Track Time**: Use the "Quick Add" button in the header
   - Select worker, date, and hours worked
   - Describe the task completed
   - Set the hourly rate

3. **Manage Tasks**: Go to the Tasks tab
   - Create tasks with descriptions and priorities
   - Assign to specific workers
   - Track status (pending, in-progress, completed)

4. **View Reports**: Access the Reports tab
   - Select date range
   - Generate comprehensive reports
   - Export or print for records

### Dashboard Overview
The dashboard provides real-time insights:
- **Total Hours Today**: Sum of all logged hours
- **Active Workers**: Number of workers with time logged today
- **Tasks Completed**: Tasks marked complete today
- **Today's Earnings**: Total earnings based on hours × rates

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Object-oriented architecture with classes
- **Local Storage API**: Persistent data storage
- **No frameworks**: Pure vanilla JavaScript for maximum performance

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Data Structure
```javascript
{
  "workers": [
    {
      "id": "unique_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-0123",
      "rate": "20.00",
      "skills": "Delivery, Repairs",
      "status": "active",
      "createdAt": "ISO_DATE"
    }
  ],
  "tasks": [
    {
      "id": "unique_id",
      "title": "Repair Hiboy Scooter",
      "description": "Fix inner tube",
      "workerId": "worker_id",
      "priority": "high",
      "status": "pending",
      "dueDate": "ISO_DATE",
      "createdAt": "ISO_DATE"
    }
  ],
  "timeEntries": [
    {
      "id": "unique_id",
      "workerId": "worker_id",
      "date": "ISO_DATE",
      "hours": "3.5",
      "taskDescription": "Local deliveries",
      "rate": "15.00",
      "createdAt": "ISO_DATE"
    }
  ]
}
```

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;    /* Main purple */
    --secondary-color: #8b5cf6;  /* Secondary purple */
    --success-color: #10b981;    /* Green */
    --warning-color: #f59e0b;    /* Orange */
    --danger-color: #ef4444;     /* Red */
}
```

### Modifying Business Settings
Update default values in `app.js`:
```javascript
settings: {
    businessName: 'Your Business Name',
    defaultHourlyRate: 20.00,
    currency: 'USD'
}
```

## 📦 Features Roadmap

### Planned Features
- [ ] Multiple business profiles
- [ ] Invoice generation
- [ ] Email notifications
- [ ] Cloud backup option
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Advanced analytics
- [ ] Calendar integration
- [ ] Expense tracking

### Future Enhancements
- Worker scheduling system
- Client management
- Payment tracking
- Tax calculations
- Team collaboration features
- API integration options

## 🔒 Privacy & Security

- **100% Local**: All data stored in browser's localStorage
- **No Tracking**: No analytics or third-party scripts
- **No Server**: Completely client-side application
- **Data Export**: Full control over your data
- **Open Source**: Transparent, auditable code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Designed for small business owners and solo entrepreneurs
- Built with modern web standards
- Inspired by the need for simple, effective workforce management
- Icons from Heroicons (embedded as SVGs)
- Font: Inter from Google Fonts

## 💬 Support

For support, please open an issue in the GitHub repository or contact the maintainer.

## 📸 Screenshots

### Dashboard View
The main dashboard showing today's statistics and recent activities.

### Workers Management
Comprehensive worker profiles with contact info and performance metrics.

### Task Tracking
Visual task management with priority indicators and status tracking.

### Reports & Analytics
Detailed reports with export capabilities for record keeping.

---

**Made with ❤️ for small business owners everywhere**

*Version 1.0.0 - Last Updated: 2024*
