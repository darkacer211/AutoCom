# WhatsApp Alert Configuration - Quick Reference

## 🚀 Quick Start

### Start the System
```bash
# Terminal 1: Start Flask Backend
cd web
python app.py

# Terminal 2: Start React Frontend
cd frontend
npm run dev

# Terminal 3 (Optional): Run tests
python test_alert_endpoints.py
```

### Configure Alerts
1. Open `http://localhost:5173/dashboard/whatsapp`
2. Enter phone number in format: `+1234567890`
3. Toggle alerts to ON
4. Click "Save Configuration"
5. Done! ✓

---

## 📱 Phone Number Format

| Country | Example |
|---------|---------|
| 🇺🇸 USA | `+12025551234` |
| 🇮🇳 India | `+919876543210` |
| 🇬🇧 UK | `+442071838750` |
| 🇩🇪 Germany | `+491234567890` |
| 🇫🇷 France | `+33123456789` |

**Format Rule**: `+` followed by 10-15 digits (includes country code)

---

## 🔌 API Endpoints

### Get Current Configuration
```bash
curl http://localhost:5000/api/whatsapp/alerts/status
```

**Response**:
```json
{
  "phone_number": "+1234567890",
  "enabled": true,
  "bot_initialized": false,
  "timestamp": "2024-01-15T10:30:00"
}
```

### Save Configuration
```bash
curl -X POST http://localhost:5000/api/whatsapp/alerts/configure \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "enabled": true}'
```

**Response**:
```json
{
  "success": true,
  "message": "Alert configuration updated successfully",
  "phone_number": "+1234567890",
  "enabled": true
}
```

---

## ⚙️ Configuration File

Edit `config/config.py`:

```python
WHATSAPP_ALERTS_ENABLED = True          # Enable/disable globally
WHATSAPP_ALERT_PHONE = "+1234567890"    # Phone to receive alerts
WHATSAPP_ALERT_ON_IMPORTANT = True      # Alert on "important" emails
WHATSAPP_ALERT_ON_CRITICAL = True       # Alert on "critical" emails
```

---

## 🔔 When Alerts are Sent

Alerts trigger when:
- ✅ Email arrives in inbox
- ✅ Classified as **CRITICAL** or **IMPORTANT**
- ✅ `WHATSAPP_ALERTS_ENABLED = True`
- ✅ Valid phone number configured
- ✅ Bot is initialized

---

## 📝 Alert Examples

### 🚨 Critical Alert
```
🚨 CRITICAL EMAIL RECEIVED
From: Security Team
Subject: Urgent Security Alert...
Open AutoComm dashboard immediately
```

### ⚠️ Important Alert
```
⚠️ Important email detected
From: CEO
Subject: Q4 Board Meeting...
Check your AutoComm dashboard
```

### ✅ Privacy
- ❌ Email body NOT sent
- ❌ Attachments NOT sent
- ❌ Full details NOT sent
- ✅ Only sender, subject, and link included

---

## 🧪 Testing

### Run Full Test Suite
```bash
python test_alert_endpoints.py
```

### Test Individual Endpoints
```bash
# Test 1: Get status
curl http://localhost:5000/api/whatsapp/alerts/status

# Test 2: Configure with valid phone
curl -X POST http://localhost:5000/api/whatsapp/alerts/configure \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "enabled": true}'

# Test 3: Try invalid phone (should fail)
curl -X POST http://localhost:5000/api/whatsapp/alerts/configure \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "invalid", "enabled": true}'

# Test 4: Disable alerts
curl -X POST http://localhost:5000/api/whatsapp/alerts/configure \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "enabled": false}'
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Phone required" | Enter a phone number |
| "Invalid phone format" | Use +countrycode format (e.g., +1234567890) |
| "Configuration saved locally" | Flask server not running - start it with `python web/app.py` |
| Alerts not triggering | Check logs: `tail -f logs/whatsapp_alerts.log` |
| Can't save config | Ensure `config/config.py` is writable |

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `web/app.py` | Flask API endpoints |
| `frontend/src/pages/WhatsApp.jsx` | React UI component |
| `config/config.py` | Configuration settings |
| `whatsapp_bot/alert_service.py` | Alert sending service |
| `test_alert_endpoints.py` | API tests |

---

## 🔗 Documentation

- [ALERT_CONFIGURATION_GUIDE.md](ALERT_CONFIGURATION_GUIDE.md) - Complete API reference
- [WHATSAPP_ALERT_SERVICE.md](WHATSAPP_ALERT_SERVICE.md) - Service architecture
- [WHATSAPP_QUICKSTART.md](WHATSAPP_QUICKSTART.md) - Setup guide
- [WHATSAPP_ALERT_EXAMPLES.md](WHATSAPP_ALERT_EXAMPLES.md) - Message examples

---

## ✨ Features

✅ Auto-detect critical/important emails  
✅ Send WhatsApp alerts immediately  
✅ Configure via clean UI  
✅ Phone format validation  
✅ Enable/disable toggle  
✅ Privacy-first (minimal data sent)  
✅ Error handling & logging  
✅ API endpoints for automation  
✅ Test suite included  
✅ Full documentation  

---

## 🎯 User Flow

```
1. User enters phone number
   Example: +1234567890
   
2. User clicks "Save Configuration"
   ↓
3. Frontend validates phone format
   ✓ Valid: Continue
   ✗ Invalid: Show error message
   
4. Backend saves to config.py
   ↓
5. Backend reloads config module
   ↓
6. Success! Configuration is live
   ↓
7. Next critical email triggers alert
```

---

## 🚀 System Status

| Component | Status |
|-----------|--------|
| Backend Endpoints | ✅ Ready |
| Frontend UI | ✅ Ready |
| Configuration System | ✅ Ready |
| Alert Service | ✅ Ready |
| Test Suite | ✅ Ready |
| Documentation | ✅ Ready |

**Overall Status**: 🟢 **PRODUCTION READY**

---

*Quick Reference for WhatsApp Alert Configuration System*  
*Last Updated: January 15, 2024*
