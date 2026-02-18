# WhatsApp Alert System - Visual Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AutoComm System Architecture                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   Gmail Inbox    │
                              │   (Email Source) │
                              └────────┬─────────┘
                                       │
                                       ↓
                    ┌──────────────────────────────────┐
                    │  AutoComm Dashboard (Frontend)   │
                    │   - Email list view              │
                    │   - Click to fetch inbox         │
                    └──────────────┬───────────────────┘
                                   │
                 ┌─────────────────┴────────────────────┐
                 │ GET /api/email/inbox                 │
                 │ Backend Flask App                    │
                 └─────────────────┬────────────────────┘
                                   │
                ┌──────────────────↓──────────────────┐
                │  Step 1: Fetch Emails               │
                │  ├─ Connect IMAP (Gmail)            │
                │  ├─ Fetch latest N emails           │
                │  └─ Parse email data                │
                └──────────────────┬───────────────────┘
                                   │
                ┌──────────────────↓──────────────────┐
                │  Step 2: AI Classification           │
                │  ├─ Send to Gemini/Groq             │
                │  └─ Get: CRITICAL/OFFICIAL/SAFE     │
                └──────────────────┬───────────────────┘
                                   │
                ┌──────────────────↓──────────────────┐
                │  Step 3: Check Alert Trigger        │
                │  ├─ Is CRITICAL? YES → ALERT        │
                │  ├─ Is OFFICIAL? YES → ALERT        │
                │  └─ Other? NO → SKIP                │
                └──────────────────┬───────────────────┘
                                   │
            ╔══════════════════════↓═══════════════════════╗
            ║ Step 4: WhatsApp Alert Service ✨ NEW       ║
            ║                                               ║
            ║  ┌────────────────────────────────────┐     ║
            ║  │ alert_service.py                  │     ║
            ║  ├─ Check if alerts enabled         │     ║
            ║  ├─ Verify phone configured        │     ║
            ║  ├─ Build message                   │     ║
            ║  │   "🚨 CRITICAL EMAIL RECEIVED"  │     ║
            ║  │   From: sender                   │     ║
            ║  │   Subject: subject               │     ║
            ║  │   Check dashboard                │     ║
            ║  ├─ Log action                      │     ║
            ║  └─ Proceed to send                │     ║
            ║  └────────────────────────────────────┘     ║
            ╚══════════════════════╤═══════════════════════╝
                                   │
                ┌──────────────────↓──────────────────┐
                │  Step 5: WhatsApp Bot               │
                │  ├─ Initialize browser (Brave)      │
                │  ├─ Load WhatsApp Web               │
                │  ├─ Navigate to phone number        │
                │  ├─ Type message                    │
                │  └─ Send (Press Enter)              │
                └──────────────────┬───────────────────┘
                                   │
                ┌──────────────────↓──────────────────┐
                │  Step 6: Message Sent               │
                │  ├─ WhatsApp processes              │
                │  ├─ Server queues message           │
                │  └─ Delivers to phone               │
                └──────────────────┬───────────────────┘
                                   │
                ┌──────────────────↓──────────────────┐
                │  Step 7: User Receives Alert        │
                │                                      │
                │  📲 Phone Notification              │
                │                                      │
                │  🚨 CRITICAL EMAIL RECEIVED        │
                │                                      │
                │  From: Security Team                │
                │  Subject: Urgent Security Update    │
                │                                      │
                │  Open AutoComm immediately          │
                │                                      │
                └──────────────────────────────────────┘
```

---

## Request Flow with Alert

```
Time: 14:35:00
User clicks "Fetch Emails"
       ↓
[14:35:01] HTTP GET /api/email/inbox
       ↓
[14:35:02] Backend: Connect to Gmail
       ↓
[14:35:03] Backend: Fetch 2 emails
       ├─ Email 1: "Weekly Report" → SAFE
       └─ Email 2: "Security Breach" → CRITICAL ⚠️
       ↓
[14:35:04] Backend: Classify emails with AI
       ├─ Email 1: ✓ Process normally
       └─ Email 2: ✓ Trigger alert!
       ↓
[14:35:05] Backend: Call send_email_alert()
       ├─ Check: Alerts enabled? YES
       ├─ Check: Phone configured? YES
       ├─ Build message
       └─ Call WhatsApp bot
       ↓
[14:35:06] WhatsApp Bot: Initialize
       ├─ Start Brave browser
       ├─ Open WhatsApp Web
       └─ Wait for login (or use saved session)
       ↓
[14:35:07] WhatsApp Bot: Send message
       ├─ Search for phone number
       ├─ Open chat
       ├─ Type message
       └─ Press Enter
       ↓
[14:35:08] Backend: Log success
       ├─ Write to logs/whatsapp_alerts.log
       └─ Continue processing
       ↓
[14:35:09] Backend: Return emails to frontend
       ├─ Email 1: "Weekly Report"
       ├─ Email 2: "Security Breach" [marked important]
       └─ HTTP 200 OK
       ↓
[14:35:10] Frontend: Display emails
       ├─ Show both emails in list
       └─ Highlight important one
       ↓
[14:35:11] 📲 Phone: WhatsApp message arrives!
       ├─ Notification sound/vibration
       ├─ User sees alert
       └─ Opens AutoComm to read email

Total time: ~10-15 seconds
Alert delivery: ~2-5 seconds after fetch
```

---

## Data Flow: Email → Classification → Alert

```
Email Object
├─ id: "12345"
├─ from: "security@company.com"
├─ subject: "URGENT: Security Vulnerability Found"
├─ body: "We detected unauthorized access..."
└─ date: "2026-01-20T14:35:00Z"
       ↓
AI Classifier (Gemini/Groq)
├─ Input: subject + sender + body (first 500 chars)
├─ Analysis: High risk keywords, urgent sender
└─ Output:
   ├─ category: "CRITICAL"
   ├─ risk_level: 0.95
   ├─ reason: "Urgent security incident"
   └─ suggested_reply: (none for critical)
       ↓
Alert Decision
├─ Is category in ['CRITICAL', 'OFFICIAL']?
├─ Result: YES → SEND ALERT
├─ Classification type: "critical"
└─ Pass to alert service
       ↓
WhatsApp Alert Service
├─ Check: WHATSAPP_ALERTS_ENABLED = True ✓
├─ Check: WHATSAPP_ALERT_PHONE = "+1234567890" ✓
├─ Build message:
│  ├─ Emoji: "🚨"
│  ├─ Classification: "CRITICAL EMAIL RECEIVED"
│  ├─ From: "Security Team" (extracted)
│  ├─ Subject: "URGENT: Security Vulnerability..."
│  └─ CTA: "Open AutoComm dashboard immediately"
├─ Initialize WhatsApp Bot
├─ Call: bot.send_message_to_number("+1234567890", message)
├─ Get result: True (success)
└─ Log: "WHATSAPP_ALERT | ... | Status: SUCCESS"
       ↓
WhatsApp Web (Selenium Browser)
├─ Navigate to chat with +1234567890
├─ Type message
├─ Send (press Enter)
└─ Return: True
       ↓
WhatsApp Servers
├─ Receive message
├─ Queue for delivery
├─ Deliver to phone
└─ Send notification
       ↓
📲 User's Phone
├─ WhatsApp notification received
├─ Sound/vibration alert
├─ Preview: "🚨 CRITICAL EMAIL RECEIVED..."
└─ User opens AutoComm dashboard
```

---

## Component Interaction Diagram

```
┌─────────────────────┐
│  Flask Web App      │
│  (web/app.py)       │
│                     │
│  GET /api/email/    │
│  inbox              │
└──────────┬──────────┘
           │ calls
           ↓
┌─────────────────────────────┐
│  Email Reader               │
│  (email_bot/reader.py)      │
│                             │
│  fetch_emails()             │
│  → returns email list       │
└──────────┬──────────────────┘
           │ each email
           ↓
┌─────────────────────────────┐
│  AI Classifier              │
│  (ai/gemini_engine.py)      │
│                             │
│  analyze_email()            │
│  → category + risk          │
└──────────┬──────────────────┘
           │ if critical/official
           ↓
┌──────────────────────────────────────┐
│  Alert Service ✨ NEW                │
│  (whatsapp_bot/alert_service.py)     │
│                                      │
│  send_email_alert()                 │
│  ├─ Check config                    │
│  ├─ Build message                   │
│  └─ Call bot.send_message_to_number │
└──────────┬───────────────────────────┘
           │ calls
           ↓
┌──────────────────────────────────────┐
│  WhatsApp Bot                        │
│  (whatsapp_bot/sender.py)            │
│                                      │
│  send_message_to_number()            │
│  ├─ Initialize Selenium               │
│  ├─ Open WhatsApp Web                │
│  ├─ Type message                     │
│  └─ Send                             │
└──────────┬───────────────────────────┘
           │ opens
           ↓
┌──────────────────────────────────────┐
│  Selenium WebDriver                  │
│  (Chrome/Brave Browser)              │
│                                      │
│  ├─ Navigate to whatsapp web         │
│  ├─ Find chat window                 │
│  ├─ Type message                     │
│  └─ Click send                       │
└──────────┬───────────────────────────┘
           │ communicates
           ↓
┌──────────────────────────────────────┐
│  WhatsApp Web                        │
│  (Browser App)                       │
│                                      │
│  ├─ Connect to WhatsApp servers      │
│  ├─ Send message                     │
│  └─ Confirm delivery                 │
└──────────┬───────────────────────────┘
           │ delivers
           ↓
┌──────────────────────────────────────┐
│  User's Phone 📱                     │
│  (WhatsApp Mobile App)               │
│                                      │
│  ├─ Receive message                  │
│  ├─ Show notification                │
│  └─ User opens dashboard             │
└──────────────────────────────────────┘
```

---

## Message Lifecycle

```
Message Creation
├─ Classification: "critical"
├─ Subject: "Urgent Security Update Required"
├─ Sender: "admin@company.com"
├─ Emoji: "🚨"
└─ Phone: "+1234567890"
     ↓
Message Formatting
├─ Extract sender name: "Admin"
├─ Truncate subject: "Urgent Security Update..."
├─ Build full message:
│  "🚨 CRITICAL EMAIL RECEIVED
│   From: Admin
│   Subject: Urgent Security Update...
│   Open AutoComm dashboard immediately..."
└─ Save to memory
     ↓
Bot Initialization
├─ Create Selenium WebDriver
├─ Set Brave browser options
├─ Load WhatsApp Web
├─ Wait for login (use cached session)
└─ Ready to send
     ↓
Message Sending
├─ Find search box
├─ Clear search
├─ Type phone number "+1234567890"
├─ Wait 2 seconds
├─ Find or create chat
├─ Click message input
├─ Type full message
├─ Press Enter
└─ Wait for confirmation
     ↓
Logging
├─ Write to logs/whatsapp_alerts.log
├─ Include: timestamp, classification, status
├─ Also log to console
└─ Mark as success/failure
     ↓
Return Status
├─ Return True (success)
└─ Or False (failure) + error details
     ↓
Email Processing Continues
├─ Message sent status logged
├─ Original email processing completes
├─ Response returned to frontend
└─ User sees both: email + alert sent indicator
```

---

## Alert Configuration Hierarchy

```
Default Values (in code)
├─ WHATSAPP_ALERTS_ENABLED: Not set → False
└─ WHATSAPP_ALERT_PHONE: Not set → None
        ↓ (if config.py exists)
config/config.py
├─ WHATSAPP_ALERTS_ENABLED: True
├─ WHATSAPP_ALERT_PHONE: "+1234567890"
└─ WHATSAPP_ALERT_ON_IMPORTANT: True
        ↓ (if .env file exists)
.env Environment Variables (highest priority)
├─ WHATSAPP_ALERTS_ENABLED=True
├─ WHATSAPP_ALERT_PHONE=+1234567890
└─ WHATSAPP_ALERT_ON_IMPORTANT=True
        ↓ (runtime changes if needed)
Runtime Configuration
├─ service.set_phone_number("+9876543210")
├─ service.set_enabled(False)
└─ service.get_status() → current config
```

---

## Error Handling Flow

```
send_email_alert() called
     ↓
Check: Alerts enabled?
├─ NO → Log info, return False
├─ YES ↓
Check: Phone configured?
├─ NO → Log warning, return False
├─ YES ↓
Try to initialize bot
├─ SUCCESS ↓
├─ FAILURE → Log error, return False
Try to send message
├─ SUCCESS → Log success, return True
├─ FAILURE ↓
     │
     ├─ Network error → Log error, return False
     ├─ Browser error → Log error, return False
     ├─ WhatsApp error → Log error, return False
     └─ Other error → Log error, return False
     ↓
Important: All failures are non-blocking
├─ Email processing continues
├─ User gets email in dashboard
├─ Alert failure logged but not fatal
└─ System stays operational
```

---

## Log Entry Structure

```
Alert Log Entry (logs/whatsapp_alerts.log):

Format:
WHATSAPP_ALERT | Timestamp | Classification | Status | From | Subject

Example Success:
WHATSAPP_ALERT | 2026-01-20T14:35:45.000Z | Classification: critical | Status: SUCCESS | From: Security Team | Subject: Urgent Security Update

Example Failure:
WHATSAPP_ALERT | 2026-01-20T14:36:00.000Z | Classification: critical | Status: FAILED | From: Manager | Subject: Quarterly Review

Example Error:
WHATSAPP_ALERT | 2026-01-20T14:37:15.000Z | Classification: important | Status: ERROR: Bot initialization failed | From: Admin | Subject: System Notification

Console Log:
2026-01-20 14:35:22,123 - whatsapp_bot.alert_service - INFO - Preparing to send CRITICAL alert to +1234567890
2026-01-20 14:35:45,456 - whatsapp_bot.alert_service - INFO - ✓ CRITICAL alert sent successfully to +1234567890
2026-01-20 14:36:00,789 - whatsapp_bot.alert_service - ERROR - Failed to send critical alert: Connection timeout
```

---

## Performance Timeline

```
Time | Event | Duration
─────┼────────────────────────────────────────────────
0ms  | GET /api/email/inbox starts
10ms | Connect to Gmail IMAP
50ms | Fetch 2 emails from IMAP
100ms| Parse emails (extract subject, sender, body)
150ms| Send Email 1 to AI classifier
200ms| AI response for Email 1 (SAFE) - skip alert
200ms| Send Email 2 to AI classifier
250ms| AI response for Email 2 (CRITICAL) - send alert
260ms| Call send_email_alert()
270ms| Check config (alerts enabled? YES)
280ms| Build message
290ms| Initialize WhatsApp bot ← SLOWEST
     | ├─ Start Brave browser (1500ms first time)
     | ├─ Open WhatsApp Web (2000ms)
     | └─ Wait for login/cache (500ms)
    2290ms|
    2300ms| Find and click search box
    2310ms| Type phone number
    2320ms| Wait for results (2000ms)
    4320ms| Click chat
    4330ms| Click message input
    4340ms| Type message
    4350ms| Press Enter to send
    4360ms| Confirm sent
    4370ms| Log result
    4380ms| Continue email processing
    4390ms| Return response to frontend
    4400ms| Total for this request

Legend:
- First alert: ~4.4 seconds (includes bot initialization)
- Subsequent alerts: ~500-1000ms (bot already running)
- Alert added time to email fetch: ~4-5 seconds first, ~0.5-1 second after
```

---

## Deployment Checklist

```
PRE-DEPLOYMENT
├─ [ ] Read WHATSAPP_QUICKSTART.md
├─ [ ] Read WHATSAPP_ALERT_SERVICE.md
├─ [ ] Run test suite (test_whatsapp_alerts.py)
├─ [ ] All 8 tests pass ✓

CONFIGURATION
├─ [ ] Update config/config.py
│       ├─ [ ] Set WHATSAPP_ALERTS_ENABLED = True
│       ├─ [ ] Set WHATSAPP_ALERT_PHONE = "+..."
│       └─ [ ] Verify phone format (no spaces)
├─ [ ] Or set environment variables (.env)

TESTING
├─ [ ] Test manual alert: send_email_alert()
├─ [ ] Check logs/whatsapp_alerts.log
├─ [ ] Receive test message on phone
├─ [ ] Verify message format

DEPLOYMENT
├─ [ ] Restart Flask app
├─ [ ] Monitor logs for first real alert
├─ [ ] Verify alert delivery speed
├─ [ ] Document alert phone number (secure)

POST-DEPLOYMENT
├─ [ ] Set up monitoring
├─ [ ] Alert team of changes
├─ [ ] Document escalation procedures
├─ [ ] Test every 2 hours for first day
```

---

## Summary

The WhatsApp Alert System provides:

✅ **Automatic** - Triggers on critical/important emails
✅ **Configurable** - Enable/disable, set phone number
✅ **Reliable** - Error handling, logging, monitoring
✅ **Fast** - 500-1000ms per alert (after initialization)
✅ **Secure** - No sensitive email content in messages
✅ **Production-Ready** - Well-documented, tested, scalable

See documentation files for more details!
