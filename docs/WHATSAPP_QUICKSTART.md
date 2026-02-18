# WhatsApp Alert Service - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Update Configuration (1 minute)

Edit `config/config.py` and update these two lines:

```python
# Set to True to enable alerts
WHATSAPP_ALERTS_ENABLED = True

# Your phone number with country code (no spaces or dashes)
WHATSAPP_ALERT_PHONE = "+1234567890"  # Change this!
```

**Your phone number should:**
- Have `+` prefix
- Include country code (e.g., `1` for US, `91` for India)
- Have no spaces, dashes, or parentheses
- Be 10-15 digits total

**Examples:**
- 🇺🇸 US: `+12125551234`
- 🇮🇳 India: `+919876543210`
- 🇬🇧 UK: `+441632960123`
- 🇩🇪 Germany: `+491234567890`

### Step 2: Ensure WhatsApp Setup (1 minute)

Make sure:
- ✓ WhatsApp Web is accessible from your browser
- ✓ WhatsApp account is active on your phone
- ✓ Browser profile is saved in `whatsapp_profile/` (auto-created)

### Step 3: Test the System (2 minutes)

Run the test suite:

```bash
cd c:\Users\athar\MScheduler
python test_whatsapp_alerts.py
```

Expected output:
```
╔══════════════════════════════════════════════════════════╗
║   WhatsApp Alert Service - Comprehensive Test Suite   ║
╚══════════════════════════════════════════════════════════╝

TEST 1: Alert Service Initialization
✓ Service initialized successfully
✓ Service Status:
  - Enabled: True
  - Phone: +1234567890
  - Bot Initialized: False
  - Timestamp: 2026-01-20T14:35:22.000Z

[... more tests ...]

TEST SUMMARY
Total Tests: 8
Passed: 8
Failed: 0
```

### Step 4: Monitor Logs (1 minute)

Watch for alerts being sent:

```bash
# View recent alerts (Windows PowerShell)
Get-Content logs\whatsapp_alerts.log -Tail 10

# Or tail -f on Git Bash
tail -f logs/whatsapp_alerts.log
```

### Done! 🎉

Alerts are now active. When an important or critical email arrives, you'll get a WhatsApp message.

---

## How It Works

### When Email Arrives

```
Email received
    ↓
AI classifier analyzes content
    ↓
Classification: CRITICAL or OFFICIAL?
    ↓
YES → Send WhatsApp alert
NO → Skip (normal email)
    ↓
Message sent to: +1234567890
```

### What You'll See

**WhatsApp message on your phone:**

```
🚨 CRITICAL EMAIL RECEIVED

From: John Smith
Subject: Urgent Security Update

Open AutoComm dashboard immediately to view details.
```

The message:
- ✅ Tells you there's an important email
- ✅ Shows who it's from
- ✅ Shows email subject
- ✅ ❌ Does NOT include email body
- ✅ Instructs you to check the dashboard

---

## Common Issues & Solutions

### "Alert not sending?"

**Checklist:**

1. ✓ Is `WHATSAPP_ALERTS_ENABLED = True`?
   ```python
   # config.py
   WHATSAPP_ALERTS_ENABLED = True  # Should be True
   ```

2. ✓ Is phone number correct?
   ```python
   WHATSAPP_ALERT_PHONE = "+1234567890"  # Should have + and country code
   ```

3. ✓ Is email classified as CRITICAL?
   - Emails classified as "SAFE", "SPAM", or "UNCERTAIN" won't trigger alerts
   - Only "CRITICAL" and "OFFICIAL" send alerts

4. ✓ Check logs:
   ```bash
   type logs\whatsapp_alerts.log
   ```

5. ✓ Is WhatsApp Web accessible?
   - Open `https://web.whatsapp.com` in browser
   - Should show chat list (not login screen)

### "Phone number format is wrong"

**Fix it:**

```python
# ❌ Wrong
WHATSAPP_ALERT_PHONE = "+1 (201) 555-1234"
WHATSAPP_ALERT_PHONE = "2015551234"

# ✅ Correct
WHATSAPP_ALERT_PHONE = "+12015551234"
```

Remove: spaces, dashes, parentheses
Keep: `+` and country code

### "WhatsApp bot initialization error"

This is normal during first test. The bot initializes when first alert is sent.

**First alert process:**
1. Email arrives
2. System tries to initialize bot
3. Browser opens WhatsApp Web
4. You may see QR code (scan if needed)
5. Alert sends after login

### "Too many alerts?"

**Rate limit alerts:**

```python
# In config.py, add:
MAX_ALERTS_PER_HOUR = 20

# Or disable alerts for testing:
WHATSAPP_ALERTS_ENABLED = False
```

---

## Customization

### Change Alert Message Format

Edit `whatsapp_bot/alert_service.py`, function `_build_alert_message()`:

```python
def _build_alert_message(self, classification, subject, sender, emoji):
    # Customize message here
    message = f"{emoji} Custom Message\n..."
    return message
```

### Only Alert on Critical (Not Important)

```python
# config.py
WHATSAPP_ALERT_ON_CRITICAL = True
WHATSAPP_ALERT_ON_IMPORTANT = False
```

### Temporarily Disable Alerts

```python
# config.py
WHATSAPP_ALERTS_ENABLED = False  # Alerts off

# Later, turn back on
WHATSAPP_ALERTS_ENABLED = True
```

### Update Phone Number at Runtime

```python
from whatsapp_bot.alert_service import get_alert_service

service = get_alert_service()
service.set_phone_number("+19876543210")  # New number
```

---

## Next Steps

1. ✅ Complete **Quick Start** above
2. 📖 Read [WHATSAPP_ALERT_SERVICE.md](WHATSAPP_ALERT_SERVICE.md) for full docs
3. 🔧 Check [WHATSAPP_ALERT_EXAMPLES.md](WHATSAPP_ALERT_EXAMPLES.md) for advanced configs
4. 📊 Monitor dashboard to see alerts in action

---

## Key Files

| File | Purpose |
|------|---------|
| `config/config.py` | ⚙️ Configuration (update phone here) |
| `whatsapp_bot/alert_service.py` | 📨 Alert service code |
| `whatsapp_bot/sender.py` | 🤖 WhatsApp bot (updated) |
| `test_whatsapp_alerts.py` | ✅ Test suite |
| `web/app.py` | 🌐 Dashboard (integration point) |
| `logs/whatsapp_alerts.log` | 📝 Alert logs |

---

## Support

**For detailed documentation:**
- [Full Implementation Guide](WHATSAPP_ALERT_SERVICE.md)
- [Configuration Examples](WHATSAPP_ALERT_EXAMPLES.md)

**For code examples:**
- Check `test_whatsapp_alerts.py` for usage patterns
- Look at `WHATSAPP_ALERT_EXAMPLES.md` for more scenarios

---

## Summary

You now have a **production-ready WhatsApp alert system** that:

✅ Sends alerts for important/critical emails
✅ Doesn't send full email content
✅ Is configurable (enable/disable, phone number)
✅ Has proper error handling and logging
✅ Integrates seamlessly with email pipeline
✅ Is tested and documented

**Status: Ready to deploy! 🚀**
