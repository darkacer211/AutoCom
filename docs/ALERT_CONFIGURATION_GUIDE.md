# WhatsApp Alert Configuration System - Verification Guide

## 1. System Overview

The WhatsApp alert system now consists of three integrated layers:

### Backend Layer
- **Flask Endpoints**: `/api/whatsapp/alerts/status` and `/api/whatsapp/alerts/configure`
- **Alert Service**: `whatsapp_bot/alert_service.py` handles alert sending logic
- **Configuration**: `config/config.py` stores `WHATSAPP_ALERTS_ENABLED` and `WHATSAPP_ALERT_PHONE`

### Frontend Layer
- **React Component**: `frontend/src/pages/WhatsApp.jsx` for alert configuration UI
- **Phone Input**: Validates format `+\d{10,15}`
- **Toggle Switch**: Enable/disable alerts
- **Examples**: Shows critical (🚨) and important (⚠️) alert formats

### Integration Point
- **Email Pipeline**: When emails are fetched and classified as CRITICAL or OFFICIAL, `send_email_alert()` is called
- **Configuration Persistence**: Settings saved to `config.py` and reloaded by Flask

---

## 2. API Endpoints

### GET `/api/whatsapp/alerts/status`
**Purpose**: Retrieve current alert configuration

**Response Example**:
```json
{
  "phone_number": "+1234567890",
  "enabled": true,
  "bot_initialized": false,
  "timestamp": "2024-01-15T10:30:00.123456",
  "message": "Alert configuration retrieved successfully"
}
```

**Status Codes**:
- `200`: Success
- `500`: Server error retrieving configuration

---

### POST `/api/whatsapp/alerts/configure`
**Purpose**: Update alert configuration

**Request Body**:
```json
{
  "phone_number": "+1234567890",
  "enabled": true
}
```

**Response Example (Success)**:
```json
{
  "success": true,
  "message": "Alert configuration updated successfully",
  "phone_number": "+1234567890",
  "enabled": true,
  "timestamp": "2024-01-15T10:30:00.123456"
}
```

**Response Example (Invalid Phone)**:
```json
{
  "success": false,
  "error": "Invalid phone number format. Expected format: +countrycode (10-15 digits). Example: +1234567890"
}
```

**Validation Rules**:
- Phone format: `^\+\d{10,15}$`
- Must start with `+`
- Must contain 10-15 digits
- Country code included in the digit count

**Status Codes**:
- `200`: Configuration updated
- `400`: Invalid request format or phone number
- `500`: Server error updating configuration

---

## 3. Configuration Persistence

### How Configuration is Saved

1. Frontend sends POST request to `/api/whatsapp/alerts/configure`
2. Backend validates phone number format
3. Backend updates `config/config.py` using regex replacement:
   - Replaces `WHATSAPP_ALERTS_ENABLED = True|False`
   - Replaces `WHATSAPP_ALERT_PHONE = "..."`
4. Backend reloads config module using `importlib.reload()`
5. Frontend receives success response

### Loading Configuration

1. Frontend loads on WhatsApp page
2. Calls `loadAlertConfig()` → GET `/api/whatsapp/alerts/status`
3. Backend reads `config/config.py` using imports
4. Frontend displays current settings
5. localStorage fallback if endpoint unavailable

### Configuration Example (config.py)
```python
# WhatsApp Alert Service Configuration
WHATSAPP_ALERTS_ENABLED = True
WHATSAPP_ALERT_PHONE = "+1234567890"

# Alert behavior configuration
WHATSAPP_ALERT_ON_IMPORTANT = True
WHATSAPP_ALERT_ON_CRITICAL = True
```

---

## 4. Phone Number Format Guide

### Valid Formats

**United States**
- Format: +1 + 10 digits
- Example: `+12025551234`
- Example: `+13105551234`

**India**
- Format: +91 + 10 digits
- Example: `+919876543210`
- Example: `+918765432109`

**United Kingdom**
- Format: +44 + 10 digits
- Example: `+442071838750`
- Example: `+441632960123`

**Germany**
- Format: +49 + 10 digits
- Example: `+491234567890`
- Example: `+491753111111`

**France**
- Format: +33 + 9 digits (note: 33 = 2 digits, so 10-11 total)
- Example: `+33123456789`
- Example: `+33791234567`

### Invalid Formats (Will Be Rejected)

```
1234567890        ✗ Missing +
+123              ✗ Too few digits
+12345678901234567890  ✗ Too many digits
+1234567890a      ✗ Contains non-digit
test@phone        ✗ Invalid characters
```

---

## 5. Frontend Features

### WhatsApp.jsx Component

#### State Management
```javascript
const [phoneNumber, setPhoneNumber] = useState('')
const [alertsEnabled, setAlertsEnabled] = useState(true)
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [alertStatus, setAlertStatus] = useState(null)
const [hasChanges, setHasChanges] = useState(false)
```

#### Key Functions
- `loadAlertConfig()`: Fetch current configuration from backend
- `validatePhoneNumber()`: Validate format using regex
- `handlePhoneChange()`: Update phone number input
- `handleToggleAlerts()`: Toggle alerts on/off
- `handleSaveConfig()`: Save configuration to backend
- `handleCopyPhone()`: Copy phone to clipboard

#### UI Sections
1. **Header**: Explains WhatsApp Alerts purpose
2. **How It Works**: Shows when alerts trigger
3. **Phone Configuration**: Input with format examples
4. **Alert Toggle**: Enable/disable switch with visual status
5. **Alert Examples**: Shows critical and important formats
6. **Privacy Info**: Shows what's NOT included in alerts

---

## 6. Testing Guide

### Run Alert Configuration Endpoint Tests
```bash
python test_alert_endpoints.py
```

**Tests Included**:
1. Get Alert Status
2. Configure Alert with Valid Phone
3. Reject Invalid Phone Formats
4. Disable Alerts
5. Configure Various Country Numbers
6. Verify Status After Configuration

### Manual Testing

**Step 1: Start Flask Server**
```bash
cd web
python app.py
```

**Step 2: Start Frontend**
```bash
cd frontend
npm run dev
```

**Step 3: Navigate to WhatsApp Page**
- Visit `http://localhost:5173/dashboard/whatsapp`

**Step 4: Configure Alert Phone**
- Enter phone number: `+1234567890`
- Click "Save Configuration"
- Should see success toast

**Step 5: Verify Configuration Persisted**
- Reload page
- Phone number should still be displayed
- Settings should match what was saved

---

## 7. Alert Triggering

### When Alerts Are Sent

Alerts are sent when:
1. Email is fetched from inbox
2. Email is classified as "CRITICAL" or "OFFICIAL"
3. `WHATSAPP_ALERTS_ENABLED = True` in config
4. Valid phone number configured
5. WhatsApp bot is initialized

### Alert Flow

```
Email Received
    ↓
Classify Email (AI/Gemini)
    ↓
Category = CRITICAL or OFFICIAL?
    ↓ YES
Check WHATSAPP_ALERTS_ENABLED?
    ↓ YES
Get WHATSAPP_ALERT_PHONE from config
    ↓
Send WhatsApp Alert via WhatsAppBot
    ↓
Log alert event to whatsapp_alerts.log
```

### Alert Message Format

**Critical Alert**:
```
🚨 CRITICAL EMAIL RECEIVED
From: Security Team
Subject: Urgent Security Alert...
Open AutoComm dashboard immediately
```

**Important Alert**:
```
⚠️ Important email detected
From: CEO
Subject: Q4 Board Meeting...
Check your AutoComm dashboard
```

---

## 8. Configuration Changes in This Session

### Files Modified

1. **web/app.py**
   - Added `GET /api/whatsapp/alerts/status` endpoint
   - Added `POST /api/whatsapp/alerts/configure` endpoint
   - Phone validation using regex
   - Config file update using `importlib.reload()`

2. **frontend/src/pages/WhatsApp.jsx**
   - Completely refactored from messaging UI to alert configuration UI
   - Changed state management (chat → config)
   - Changed functions (messaging → configuration)
   - Changed UI layout (contacts/messages → phone/toggle)

3. **config/config.py** (Already configured)
   - `WHATSAPP_ALERTS_ENABLED = True`
   - `WHATSAPP_ALERT_PHONE = "+1234567890"`

---

## 9. Troubleshooting

### Issue: "Phone number is required"
- **Cause**: Empty phone field
- **Solution**: Enter a valid phone number

### Issue: "Invalid phone format"
- **Cause**: Phone doesn't match `+\d{10,15}`
- **Solution**: Use format +countrycode...digits (e.g., +1234567890)

### Issue: "Configuration saved locally"
- **Cause**: Backend endpoint not responding
- **Solution**: Make sure Flask server is running (`python web/app.py`)

### Issue: Alerts not triggering
- **Cause**: Multiple possible reasons
- **Check**:
  1. `WHATSAPP_ALERTS_ENABLED = True` in config.py
  2. Valid phone number configured
  3. Email classified as CRITICAL or OFFICIAL
  4. WhatsApp bot is initialized
  5. Check logs: `tail -f logs/whatsapp_alerts.log`

### Issue: Can't save configuration
- **Cause**: Permission issue writing to config.py
- **Solution**: Ensure `config/config.py` is writable

---

## 10. Next Steps (Future Enhancements)

1. **Database Persistence**: Store configuration in database instead of config.py
2. **Multiple Phone Numbers**: Support multiple recipients
3. **Alert Scheduling**: Set time windows for alerts
4. **Alert History**: Show log of sent alerts in UI
5. **Two-Way Verification**: Reply to alerts via WhatsApp
6. **Alert Templates**: Customize alert message format
7. **Rate Limiting**: Prevent spam alerts
8. **Webhook Support**: Integrate with other services

---

## 11. Support Resources

- **Alert Service Docs**: [WHATSAPP_ALERT_SERVICE.md](WHATSAPP_ALERT_SERVICE.md)
- **Quickstart Guide**: [WHATSAPP_QUICKSTART.md](WHATSAPP_QUICKSTART.md)
- **Examples**: [WHATSAPP_ALERT_EXAMPLES.md](WHATSAPP_ALERT_EXAMPLES.md)
- **Test Suite**: `test_alert_endpoints.py`

---

**Last Updated**: January 15, 2024
**System Status**: ✅ Production Ready
