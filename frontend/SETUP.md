# AutoComm Frontend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000 (make sure Flask server is running)

## First Time Setup

### Prerequisites
- Node.js 18+ and npm installed
- Flask backend running on port 5000

### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Development Workflow

### Making Changes
- All React components are in `src/`
- Styles use Tailwind CSS (configured in `tailwind.config.js`)
- API calls are proxied through Vite (configured in `vite.config.js`)

### Hot Reload
The dev server supports hot module replacement (HMR), so changes will reflect immediately.

### Building for Production
```bash
npm run build
```

Output will be in the `dist/` folder.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # Base UI components
│   │   └── layout/     # Layout components
│   ├── pages/          # Page components
│   ├── context/        # React contexts
│   ├── utils/          # Utilities
│   ├── App.jsx         # Main app
│   └── main.jsx        # Entry point
├── public/             # Static files
├── index.html          # HTML template
└── package.json        # Dependencies
```

## Features Implemented

✅ Modern React + Vite setup
✅ Tailwind CSS styling
✅ Dark mode support
✅ Responsive design
✅ Smooth animations (Framer Motion)
✅ Toast notifications
✅ Protected routes
✅ Component library
✅ All main pages:
   - Dashboard
   - Send Email
   - Inbox
   - WhatsApp Automation
   - Templates
   - Campaigns
   - Logs
   - Settings

## Next Steps

1. **Connect to Backend**
   - Replace mock API calls in pages with actual API endpoints
   - Update `src/utils/api.js` if needed

2. **Add Authentication**
   - Implement proper JWT handling
   - Add refresh token logic
   - Secure routes properly

3. **Add Features**
   - Form validation
   - Error boundaries
   - Loading states
   - Unit tests

4. **Deploy**
   - Build the app: `npm run build`
   - Serve the `dist/` folder
   - Or deploy to Vercel/Netlify

## Troubleshooting

### Port Already in Use
If port 3000 is taken, Vite will automatically use the next available port.

### API Connection Issues
- Ensure Flask backend is running on port 5000
- Check CORS settings in Flask app
- Verify proxy settings in `vite.config.js`

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Need Help?

Check the main README.md or the codebase analysis document for more details.
