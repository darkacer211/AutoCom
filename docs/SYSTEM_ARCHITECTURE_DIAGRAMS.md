# WhatsApp Alert System - Architecture & Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WHATSAPP ALERT SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   FRONTEND LAYER         │
│  (React - WhatsApp.jsx)  │
│                          │
│  • Phone input field     │
│  • Enable/disable toggle │
│  • Alert examples        │
│  • Save button           │
└──────────────┬───────────┘
               │
        HTTP API Calls
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
GET /alerts/status   POST /alerts/configure
    │                     │
    └──────────┬──────────┘
               │
┌──────────────▼──────────────┐
│   BACKEND LAYER (Flask)     │
│                             │
│  • Status endpoint          │
│  • Configure endpoint       │
│  • Phone validation         │
│  • Config file updates      │
│  • Module reloading         │
└──────────────┬──────────────┘
               │
        Read/Write Files
               │
    ┌──────────┴───────────┐
    │                      │
    ▼                      ▼
config.py            whatsapp_bot/
                     alert_service.py
                             │
                      WhatsAppBot
                      (Selenium)
                             │
                             ▼
                      WhatsApp Web API
                             │
                             ▼
                     User's Phone (WhatsApp)
```

---

## 2. Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│              USER CONFIGURATION FLOW                          │
└─────────────────────────────────────────────────────────────┘

Step 1: Page Load
┌────────────────────────┐
│  User opens WhatsApp   │
│  tab in dashboard      │
└────────────┬───────────┘
             │
             ▼
        loadAlertConfig()
             │
             ▼
    GET /api/whatsapp/alerts/status
             │
             ▼
┌────────────────────────────────────┐
│  Backend reads config.py           │
│  Returns:                          │
│  • phone_number                    │
│  • enabled status                  │
│  • bot_initialized                 │
│  • timestamp                       │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Frontend displays:                │
│  • Phone field with current value  │
│  • Toggle showing current status   │
│  • Alert examples                  │
└────────────┬───────────────────────┘
             │
             ▼
Step 2: User Input
┌────────────────────────┐
│  User enters phone     │
│  number:              │
│  +1234567890          │
│                       │
│  User toggles alerts  │
│  to ON                │
│                       │
│  User clicks SAVE     │
└────────────┬───────────┘
             │
             ▼
Step 3: Validation
┌────────────────────────────────────┐
│  Frontend validates:               │
│  • Phone regex: ^\+\d{10,15}$     │
│  • Check: Not empty               │
│  • Result: VALID ✓                │
└────────────┬───────────────────────┘
             │
             ▼
Step 4: Backend Update
POST /api/whatsapp/alerts/configure
{
  "phone_number": "+1234567890",
  "enabled": true
}
             │
             ▼
┌────────────────────────────────────┐
│  Backend validates phone format    │
│  • Pattern check                   │
│  • Result: VALID ✓                │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Backend reads config.py           │
│  • Load entire file as text        │
│  • Find current values             │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Backend updates config.py         │
│  • Replace WHATSAPP_ALERT_PHONE    │
│  • Replace WHATSAPP_ALERTS_ENABLED │
│  • Write back to file              │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Backend reloads config module     │
│  • importlib.reload(config)        │
│  • Changes take effect immediately │
└────────────┬───────────────────────┘
             │
             ▼
Step 5: Response
┌────────────────────────────────────┐
│  Backend returns success:          │
│  • success: true                   │
│  • phone_number: "+1234567890"     │
│  • enabled: true                   │
│  • timestamp: 2024-01-15...        │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Frontend shows success:           │
│  • Toast: "Configuration saved!"   │
│  • Update UI to show saved state   │
│  • Clear unsaved changes indicator │
└────────────────────────────────────┘
```

---

## 3. Alert Triggering Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ALERT TRIGGERING FLOW                            │
└─────────────────────────────────────────────────────────────┘

Step 1: Email Arrives
┌─────────────────────────┐
│  Email arrives in       │
│  Gmail inbox            │
└────────────┬────────────┘
             │
             ▼
Step 2: Fetch Email
┌─────────────────────────────────────┐
│  fetch_emails() called              │
│  • Connect to IMAP                  │
│  • Get recent emails                │
│  • Fetch email details              │
└────────────┬────────────────────────┘
             │
             ▼
Step 3: Classify Email
┌─────────────────────────────────────┐
│  analyze_email() called             │
│  • Send to Gemini/Groq API          │
│  • Analyze subject, sender, body    │
│  • Return category:                 │
│    - CRITICAL                       │
│    - IMPORTANT/OFFICIAL             │
│    - NORMAL                         │
│    - UNCERTAIN                      │
└────────────┬────────────────────────┘
             │
             ▼
Step 4: Check Alert Trigger
┌──────────────────────────────────────┐
│  Is category CRITICAL or IMPORTANT?  │
│                                      │
│  ✓ YES → Continue to step 5          │
│  ✗ NO  → Skip to step 7 (no alert)   │
└──────────────┬───────────────────────┘
               │ YES
               ▼
Step 5: Check Alert Settings
┌────────────────────────────────────────┐
│  Load from config.py:                 │
│  • WHATSAPP_ALERTS_ENABLED?           │
│  • WHATSAPP_ALERT_PHONE set?          │
│                                       │
│  ✓ YES (both true) → Continue to 6    │
│  ✗ NO  → Skip (alerts disabled)       │
└────────────┬───────────────────────────┘
             │ YES
             ▼
Step 6: Send WhatsApp Alert
┌────────────────────────────────────────┐
│  send_email_alert() called            │
│                                       │
│  • Build message:                     │
│    - Emoji (🚨 or ⚠️)                 │
│    - Sender name                      │
│    - Subject line                     │
│    - Link to dashboard                │
│                                       │
│  • Initialize WhatsAppBot             │
│  • Send to configured phone number    │
│  • Log alert event                    │
└────────────┬───────────────────────────┘
             │
             ▼
Step 7: Completion
┌──────────────────────────────────────┐
│  ✓ Alert sent successfully           │
│  Log: Sent CRITICAL email alert to   │
│        +1234567890 from Security...  │
│                                      │
│  OR                                  │
│                                      │
│  ✗ Alert skipped                     │
│  Log: Alert skipped - alerts         │
│       disabled or not configured     │
└──────────────────────────────────────┘
```

---

## 4. Phone Validation Flow

```
┌────────────────────────────────────────────────────────────┐
│            PHONE VALIDATION FLOW                            │
└────────────────────────────────────────────────────────────┘

User enters phone number
          │
          ▼
Frontend validates (client-side)
Regex: ^\+\d{10,15}$
          │
    ┌─────┴──────┐
    │            │
  VALID        INVALID
    │            │
    ▼            ▼
Continue      Show error
    │          "Invalid phone format.
    │           Use +countrycode"
    │
    ▼
Backend receives
POST request
    │
    ▼
Backend validates (server-side)
Regex: ^\+\d{10,15}$
    │
    ┌─────┴──────┐
    │            │
  VALID        INVALID
    │            │
    ▼            ▼
Update        Return 400
config.py     "Invalid phone
              number format"
    │
    ▼
Reload module
    │
    ▼
Return 200 OK
+ updated config

Examples:
─────────
Input: +12025551234
Size: 11 chars
✓ VALID (matches pattern)

Input: +919876543210
Size: 12 chars
✓ VALID (matches pattern)

Input: 12025551234
Size: 10 chars
✗ INVALID (missing +)

Input: +123
Size: 4 chars
✗ INVALID (too short)

Input: +12345678901234567
Size: 18 chars
✗ INVALID (too long)
```

---

## 5. Component Structure

```
┌──────────────────────────────────────────────────────────────┐
│         WHATSAPP.JSX COMPONENT STRUCTURE                     │
└──────────────────────────────────────────────────────────────┘

WhatsApp Component
  │
  ├─ State Management
  │   ├─ phoneNumber: string
  │   ├─ alertsEnabled: boolean
  │   ├─ isLoading: boolean
  │   ├─ isSaving: boolean
  │   ├─ alertStatus: object
  │   └─ hasChanges: boolean
  │
  ├─ Effects
  │   └─ useEffect(() => loadAlertConfig())
  │
  ├─ Functions
  │   ├─ loadAlertConfig()
  │   ├─ validatePhoneNumber()
  │   ├─ handlePhoneChange()
  │   ├─ handleToggleAlerts()
  │   ├─ handleSaveConfig()
  │   └─ handleCopyPhone()
  │
  └─ Render
      ├─ Header
      │   ├─ Title: "WhatsApp Alerts"
      │   └─ Description
      │
      ├─ Main Configuration Card
      │   ├─ Alert Info Box
      │   │   └─ How it works section
      │   ├─ Phone Input Section
      │   │   ├─ Input field
      │   │   └─ Format examples
      │   ├─ Alert Toggle Section
      │   │   ├─ Toggle switch
      │   │   └─ Status text
      │   └─ Action Buttons
      │       ├─ Save button
      │       └─ Unsaved changes warning
      │
      └─ Examples Card
          ├─ Critical Alert Example
          │   └─ 🚨 Red background
          ├─ Important Alert Example
          │   └─ ⚠️ Yellow background
          └─ Privacy Info Box
              └─ What's NOT included
```

---

## 6. API Endpoint Map

```
┌──────────────────────────────────────────────────────────────┐
│              API ENDPOINT STRUCTURE                           │
└──────────────────────────────────────────────────────────────┘

GET /api/whatsapp/alerts/status
  │
  ├─ Input: None
  ├─ Process: Read config.py
  ├─ Validation: None (just read)
  │
  └─ Output (200 OK):
      {
        "phone_number": "+1234567890",
        "enabled": true,
        "bot_initialized": false,
        "timestamp": "2024-01-15T10:30:00",
        "message": "Alert configuration retrieved"
      }

POST /api/whatsapp/alerts/configure
  │
  ├─ Input:
  │   {
  │     "phone_number": "+1234567890",
  │     "enabled": true
  │   }
  │
  ├─ Process:
  │   1. Validate phone format: ^\+\d{10,15}$
  │   2. Read config.py file
  │   3. Replace settings
  │   4. Write back file
  │   5. Reload config module
  │
  ├─ Validation:
  │   • Phone format regex
  │   • Data not null
  │
  └─ Output:
      Success (200 OK):
      {
        "success": true,
        "message": "Updated successfully",
        "phone_number": "+1234567890",
        "enabled": true,
        "timestamp": "2024-01-15T10:30:00"
      }

      Invalid Phone (400 Bad Request):
      {
        "success": false,
        "error": "Invalid phone format..."
      }

      Error (500 Server Error):
      {
        "success": false,
        "error": "Failed to update config"
      }
```

---

## 7. Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW                          │
└────────────────────────────────────────────────────────────────┘

User Interface (React)
┌────────────────────────────┐
│  Phone Number Input        │
│  +1234567890               │
│                            │
│  [ Toggle: ON ]            │
│                            │
│  [ Save Configuration ]    │
└────────────┬───────────────┘
             │ HTTP POST
             │ {
             │   phone_number: "+1234567890",
             │   enabled: true
             │ }
             │
             ▼
    Flask API Layer
    ┌──────────────────────┐
    │  /api/whatsapp/      │
    │  alerts/configure    │
    │                      │
    │  1. Validate format  │
    │  2. Read config.py   │
    │  3. Update values    │
    │  4. Reload module    │
    └──────────┬───────────┘
               │
               ▼
        Config File (config.py)
        ┌────────────────────────────────┐
        │ WHATSAPP_ALERTS_ENABLED = True │
        │ WHATSAPP_ALERT_PHONE =         │
        │   "+1234567890"                │
        └────────────┬───────────────────┘
                     │
                     ▼
            Python Module in Memory
            ┌────────────────────────────┐
            │  import config.config      │
            │                            │
            │  config.WHATSAPP_ALERTS_   │
            │    ENABLED = True          │
            │                            │
            │  config.WHATSAPP_ALERT_    │
            │    PHONE = "+1234567890"   │
            └────────────┬───────────────┘
                         │
                         ▼
            When Email Arrives
            ┌────────────────────────────┐
            │ Check config values        │
            │ • ALERTS_ENABLED? YES      │
            │ • ALERT_PHONE? SET         │
            │                            │
            │ → Send WhatsApp alert      │
            └────────────┬───────────────┘
                         │
                         ▼
            WhatsApp Message
            ┌────────────────────────────┐
            │ 🚨 CRITICAL EMAIL...       │
            │ From: Security Team        │
            │ Subject: Urgent...         │
            │ Open dashboard immediately │
            └────────────┬───────────────┘
                         │
                         ▼
            User's Phone Notification
            ┌────────────────────────────┐
            │ WhatsApp Notification      │
            │ New Message from Bot       │
            │ 🚨 CRITICAL EMAIL...       │
            └────────────────────────────┘
```

---

## 8. Error Handling Flow

```
┌───────────────────────────────────────────────────────────────┐
│              ERROR HANDLING FLOW                              │
└───────────────────────────────────────────────────────────────┘

User submits configuration
          │
          ▼
    ┌─────────────────┐
    │ Validation      │
    └─────┬───────────┘
          │
    ┌─────┴─────────────────────────────┐
    │                                   │
  PASS                                 FAIL
    │                                   │
    ▼                                   ▼
Continue               ┌────────────────────────────┐
    │                  │ Error Type?                │
    │                  │                            │
    │                  ├─ No phone entered         │
    │                  │  → "Phone required"       │
    │                  │                            │
    │                  ├─ Invalid format           │
    │                  │  → "Invalid phone format" │
    │                  │                            │
    │                  ├─ Too short/long           │
    │                  │  → Show format example    │
    │                  │                            │
    │                  └─ Other validation error   │
    │                     → Show error message     │
    │
    ▼
Server Processing
    │
    ┌─────┴───────────────────────────────┐
    │                                     │
  SUCCESS                                FAILURE
    │                                     │
    ▼                                     ▼
Update config.py          ┌─────────────────────────────┐
    │                     │ Error Type?                 │
    ▼                     │                             │
Reload module             ├─ File permission denied    │
    │                     │  → "Cannot write config"   │
    │                     │                             │
    ▼                     ├─ Config file missing       │
Return 200 OK             │  → "Config not found"      │
    │                     │                             │
    ▼                     ├─ Module reload failed      │
Frontend receives         │  → "Failed to apply config"│
success response          │                             │
    │                     └─ Other error               │
    ▼                        → "Failed to save"        │
Show success toast
    │
    ▼
Configuration saved ✓
```

---

## Summary

These diagrams show:

1. **System Architecture**: How all layers connect
2. **Configuration Flow**: Step-by-step configuration process
3. **Alert Triggering**: When and how alerts are sent
4. **Phone Validation**: Validation logic at both ends
5. **Component Structure**: React component organization
6. **API Endpoints**: Request/response structure
7. **Data Flow**: Complete end-to-end data journey
8. **Error Handling**: How errors are caught and handled

All systems work together to provide a reliable, user-friendly alert configuration experience.
