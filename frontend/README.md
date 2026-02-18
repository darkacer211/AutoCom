# AutoComm Frontend

Modern React + Vite frontend for AutoComm - Email & WhatsApp Automation Platform.

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📦 Installation

```bash
cd frontend
npm install
```

## 🏃 Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

Make sure the Flask backend is running on `http://localhost:5000` for API calls.

## 🏗️ Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base components (Button, Card, Input, etc.)
│   │   └── layout/       # Layout components (Sidebar, TopBar)
│   ├── pages/            # Page components
│   │   ├── auth/         # Login/Signup pages
│   │   └── ...           # Other pages
│   ├── context/          # React contexts (Theme, Toast)
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component with routing
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies
```

## 🎨 Features

- **Dark Mode First** - Beautiful dark theme with light mode support
- **Responsive Design** - Works on all screen sizes
- **Smooth Animations** - Framer Motion powered transitions
- **Component Library** - Reusable UI components
- **Toast Notifications** - User feedback system
- **Protected Routes** - Authentication handling

## 🔌 API Integration

The frontend expects the Flask backend to be running on `http://localhost:5000`.

API endpoints are proxied through Vite's dev server (configured in `vite.config.js`).

### Example API Call

```javascript
import api from '@/utils/api'

// GET request
const response = await api.get('/dashboard')

// POST request
const response = await api.post('/email/send', { to, subject, body })
```

## 🎯 Pages

- **Dashboard** - Overview and stats
- **Send Email** - Compose and send emails
- **Inbox** - View and manage emails
- **WhatsApp** - WhatsApp automation
- **Templates** - Email/WhatsApp templates
- **Campaigns** - Bulk messaging campaigns
- **Logs** - Activity history
- **Settings** - Configuration and preferences

## 🔐 Authentication

Currently uses localStorage for token storage. In production, implement proper JWT handling and refresh tokens.

## 📝 Notes

- All API calls are currently mocked with dummy data
- Replace mock implementations with actual API calls
- Add proper error handling and loading states
- Implement form validation
- Add unit tests
