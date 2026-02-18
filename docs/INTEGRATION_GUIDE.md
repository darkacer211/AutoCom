# Frontend-Backend Integration Guide

## ✅ Completed Integration

### Backend API Endpoints Added

1. **POST `/api/email/send`** - Send email
   - Request body: `{ to, subject, body, cc?, bcc? }`
   - Response: `{ success, message, to, subject }` or `{ error }`

2. **GET `/api/email/inbox`** - Get inbox emails
   - Query params: `limit` (default: 50), `unread_only` (default: false)
   - Response: `{ emails: [...], total, limit }`
   - Emails include AI classification (category, risk_level)

3. **POST `/api/email/analyze`** - Analyze email content
   - Request body: `{ subject, sender, body }`
   - Response: `{ analysis: { category, risk_level, reason, suggested_reply } }`

4. **GET `/api/logs`** - Get activity logs (enhanced)
   - Query params: `limit` (default: 50)
   - Response: `{ logs: [...], total, limit }`
   - Reads from `logs/bot.log` file

### Frontend Updates

1. **Dashboard** (`frontend/src/pages/Dashboard.jsx`)
   - ✅ Fetches real stats from `/api/dashboard`
   - ✅ Fetches recent activity from `/api/logs`
   - ✅ Quick action buttons navigate to pages

2. **Send Email** (`frontend/src/pages/SendEmail.jsx`)
   - ✅ Sends emails via `/api/email/send`
   - ✅ Error handling and success notifications
   - ✅ Form reset on success

3. **Inbox** (`frontend/src/pages/Inbox.jsx`)
   - ✅ Fetches emails from `/api/email/inbox`
   - ✅ Supports filtering (all/unread/important)
   - ✅ Shows AI classification badges
   - ✅ Loading states

4. **Logs** (`frontend/src/pages/Logs.jsx`)
   - ✅ Fetches logs from `/api/logs`
   - ✅ Displays parsed log entries
   - ✅ Loading states

## 🚀 How to Run

### 1. Start Flask Backend

```bash
# From project root
cd web
python app.py
```

Backend runs on: `http://localhost:5000`

### 2. Start React Frontend

```bash
# From project root
cd frontend
npm install  # First time only
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 3. Access the App

Open `http://localhost:3000` in your browser.

The frontend will automatically proxy API requests to the backend.

## 🔌 API Integration Details

### API Client Setup

The frontend uses Axios with automatic proxy configuration:

```javascript
// frontend/src/utils/api.js
const api = axios.create({
  baseURL: '/api',  // Proxied to http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### Example API Calls

**Send Email:**
```javascript
const response = await api.post('/email/send', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Message body'
})
```

**Get Inbox:**
```javascript
const response = await api.get('/email/inbox?limit=50&unread_only=true')
const emails = response.data.emails
```

**Get Logs:**
```javascript
const response = await api.get('/logs?limit=100')
const logs = response.data.logs
```

## 📝 Notes

### Current Limitations

1. **Email Reading**: Currently only supports unread emails. To fetch all emails, you'll need to enhance `email_bot/reader.py`.

2. **Authentication**: No authentication implemented yet. All endpoints are publicly accessible.

3. **Error Handling**: Basic error handling is in place, but you may want to add more specific error messages.

4. **Log Parsing**: Log parsing is basic. You might want to improve the log format or add timestamps to log entries.

### Next Steps

1. **Add Authentication**
   - Implement JWT tokens
   - Add login/signup endpoints
   - Protect API routes

2. **Enhance Email Reading**
   - Support fetching all emails (not just unread)
   - Add pagination
   - Add email search

3. **Add More Features**
   - WhatsApp API endpoints
   - Template management API
   - Campaign management API

4. **Improve Error Handling**
   - Better error messages
   - Retry logic
   - Offline handling

5. **Add Real-time Updates**
   - WebSocket support
   - Real-time email notifications
   - Live dashboard updates

## 🐛 Troubleshooting

### CORS Issues
- Flask backend has CORS enabled via `Flask-CORS`
- If you still see CORS errors, check that the backend is running

### API Not Found
- Make sure Flask backend is running on port 5000
- Check browser console for errors
- Verify proxy settings in `vite.config.js`

### Email Not Sending
- Check Flask logs for errors
- Verify email credentials in `config/config.py`
- Check Gmail app password settings

### Emails Not Loading
- Check IMAP credentials
- Verify email account has unread emails
- Check Flask logs for errors

## 📚 Related Files

- Backend API: `web/app.py`
- Frontend API Client: `frontend/src/utils/api.js`
- Email Sender: `email_bot/sender.py`
- Email Reader: `email_bot/reader.py`
- AI Engine: `ai/gemini_engine.py`
