"""
WhatsApp Alert Service - Configuration Examples
This file shows how to configure the WhatsApp alert system for different scenarios.
"""

# ============================================================================
# EXAMPLE 1: Basic Configuration (Getting Started)
# ============================================================================

# In config/config.py:
"""
# Enable WhatsApp alerts
WHATSAPP_ALERTS_ENABLED = True

# Your phone number (with WhatsApp installed)
WHATSAPP_ALERT_PHONE = "+1234567890"

# Alert on all important/critical emails
WHATSAPP_ALERT_ON_IMPORTANT = True
WHATSAPP_ALERT_ON_CRITICAL = True
"""


# ============================================================================
# EXAMPLE 2: Alerts Disabled for Testing
# ============================================================================

# In config/config.py:
"""
# Disable alerts during development
WHATSAPP_ALERTS_ENABLED = False

# Phone number (not used but configured for when enabled)
WHATSAPP_ALERT_PHONE = "+1234567890"
"""


# ============================================================================
# EXAMPLE 3: Only Critical Alerts
# ============================================================================

# In config/config.py:
"""
WHATSAPP_ALERTS_ENABLED = True
WHATSAPP_ALERT_PHONE = "+1234567890"

# Only send alerts for CRITICAL emails, not important ones
WHATSAPP_ALERT_ON_IMPORTANT = False
WHATSAPP_ALERT_ON_CRITICAL = True
"""


# ============================================================================
# EXAMPLE 4: Using Environment Variables (Recommended for Production)
# ============================================================================

# In config/config.py:
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Load alert configuration from environment variables
WHATSAPP_ALERTS_ENABLED = os.getenv('WHATSAPP_ALERTS_ENABLED', 'True').lower() == 'true'
WHATSAPP_ALERT_PHONE = os.getenv('WHATSAPP_ALERT_PHONE', '+1234567890')
WHATSAPP_ALERT_ON_IMPORTANT = os.getenv('WHATSAPP_ALERT_ON_IMPORTANT', 'True').lower() == 'true'
WHATSAPP_ALERT_ON_CRITICAL = os.getenv('WHATSAPP_ALERT_ON_CRITICAL', 'True').lower() == 'true'
"""

# In .env file:
"""
WHATSAPP_ALERTS_ENABLED=True
WHATSAPP_ALERT_PHONE=+1234567890
WHATSAPP_ALERT_ON_IMPORTANT=True
WHATSAPP_ALERT_ON_CRITICAL=True
"""


# ============================================================================
# EXAMPLE 5: Programmatic Configuration at Runtime
# ============================================================================

"""
from whatsapp_bot.alert_service import get_alert_service

# Get service instance
service = get_alert_service()

# Update phone number
service.set_phone_number("+91-98765-43210")

# Enable/disable alerts
service.set_enabled(True)

# Get current status
status = service.get_status()
print(f"Alerts enabled: {status['enabled']}")
print(f"Target phone: {status['phone_number']}")
"""


# ============================================================================
# EXAMPLE 6: Sending Alerts Manually
# ============================================================================

"""
from whatsapp_bot.alert_service import send_email_alert

# Send a critical alert
result = send_email_alert(
    classification="critical",
    subject="Database Connection Failed - Immediate Action Required",
    sender="System Administrator"
)

print(f"Alert sent successfully: {result}")

# Send an important alert
result = send_email_alert(
    classification="important",
    subject="Monthly Report is Due Today",
    sender="Finance Department"
)
"""


# ============================================================================
# EXAMPLE 7: Testing Before Production
# ============================================================================

"""
# In a test file or script:

from whatsapp_bot.alert_service import get_alert_service

def test_alert_setup():
    service = get_alert_service()
    
    # Check configuration
    status = service.get_status()
    assert status['enabled'], "Alerts should be enabled"
    assert status['phone_number'], "Phone number should be configured"
    
    # Test message building (doesn't send anything)
    msg = service._build_alert_message(
        classification="critical",
        subject="Test Subject",
        sender="test@example.com",
        emoji="🚨"
    )
    
    assert "Test Subject" in msg
    assert "test@example.com" in msg or "test" in msg.lower()
    assert "AutoComm dashboard" in msg
    
    print("✓ Alert setup verified")

test_alert_setup()
"""


# ============================================================================
# EXAMPLE 8: Different Phone Numbers for Different Users
# ============================================================================

"""
# In config/config.py:

import os

# Get phone number from environment or use default
WHATSAPP_ALERTS_ENABLED = True

# Different configs per environment
if os.getenv('ENVIRONMENT') == 'production':
    WHATSAPP_ALERT_PHONE = os.getenv('PROD_ALERT_PHONE', '+1234567890')
elif os.getenv('ENVIRONMENT') == 'staging':
    WHATSAPP_ALERT_PHONE = os.getenv('STAGING_ALERT_PHONE', '+0987654321')
else:  # development
    WHATSAPP_ALERT_PHONE = os.getenv('DEV_ALERT_PHONE', '+1111111111')
"""


# ============================================================================
# EXAMPLE 9: Logging Configuration
# ============================================================================

"""
# View alert logs:

import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Get alert service logger
from whatsapp_bot.alert_service import logger
logger.setLevel(logging.DEBUG)

# Now all alert operations are logged to:
# - logs/whatsapp_alerts.log (detailed)
# - Console output (summary)
"""


# ============================================================================
# EXAMPLE 10: Integration with Custom Email Processing
# ============================================================================

"""
# In a custom email processor:

from whatsapp_bot.alert_service import send_email_alert
from ai.gemini_engine import analyze_email

def process_email(email_dict):
    # Analyze email
    analysis = analyze_email(
        subject=email_dict['subject'],
        sender=email_dict['from'],
        body=email_dict['body']
    )
    
    category = analysis.get('category')
    
    # Send WhatsApp alert for critical emails
    if category == 'CRITICAL':
        alert_sent = send_email_alert(
            classification='critical',
            subject=email_dict['subject'],
            sender=email_dict['from']
        )
        
        print(f"Email processed. Alert sent: {alert_sent}")
    
    return analysis
"""


# ============================================================================
# EXAMPLE 11: Testing with Mock WhatsApp
# ============================================================================

"""
# For unit testing without actual WhatsApp:

from unittest.mock import patch, MagicMock
from whatsapp_bot.alert_service import send_email_alert

def test_alert_sent():
    # Mock the WhatsApp bot
    with patch('whatsapp_bot.alert_service.WhatsAppBot') as MockBot:
        mock_bot = MagicMock()
        mock_bot.send_message_to_number.return_value = True
        MockBot.return_value = mock_bot
        
        # Test alert
        result = send_email_alert(
            classification='critical',
            subject='Test Subject',
            sender='test@example.com'
        )
        
        assert result == True
        mock_bot.send_message_to_number.assert_called()
        
        # Check what message was sent
        call_args = mock_bot.send_message_to_number.call_args
        sent_message = call_args[0][1]
        assert 'AutoComm dashboard' in sent_message
        
        print("✓ Mock test passed")

test_alert_sent()
"""


# ============================================================================
# EXAMPLE 12: Advanced - Multiple Alert Channels
# ============================================================================

"""
# Future enhancement: Send alerts via multiple channels

from whatsapp_bot.alert_service import send_email_alert
from email_bot.sender import send_email

def send_multi_channel_alert(email_dict, channels=['whatsapp', 'email']):
    '''Send alert via multiple channels'''
    
    results = {}
    
    if 'whatsapp' in channels:
        results['whatsapp'] = send_email_alert(
            classification='critical',
            subject=email_dict['subject'],
            sender=email_dict['from']
        )
    
    if 'email' in channels:
        results['email'] = send_email(
            to_email='alert@company.com',
            subject=f"ALERT: Critical email from {email_dict['from']}",
            body=f"Subject: {email_dict['subject']}"
        )
    
    return results
"""


# ============================================================================
# EXAMPLE 13: Phone Number Formats by Country
# ============================================================================

"""
# Common phone number formats with country codes:

PHONE_NUMBERS = {
    'us_office': '+12025551234',           # Washington DC
    'us_mobile': '+14155552671',           # California
    'india': '+919876543210',              # India
    'uk': '+441632960123',                 # UK
    'eu_france': '+33612345678',           # France
    'eu_germany': '+491234567890',         # Germany
    'australia': '+61491570156',           # Australia
    'brazil': '+5511912345678',            # Brazil
    'mexico': '+5255555555',               # Mexico
}

# Use like this:
import os
from config.config import WHATSAPP_ALERT_PHONE

# config.py
WHATSAPP_ALERT_PHONE = os.getenv('WHATSAPP_ALERT_PHONE', PHONE_NUMBERS['us_office'])
"""


# ============================================================================
# EXAMPLE 14: Disable Alerts for Specific Senders
# ============================================================================

"""
# Custom logic to disable alerts for certain senders:

from whatsapp_bot.alert_service import send_email_alert

# Whitelist of senders to alert
ALERT_WHITELIST = [
    'ceo@company.com',
    'admin@company.com',
    'security@company.com',
    'devops@company.com',
]

def process_email_with_whitelist(email_dict):
    sender = email_dict.get('from', '')
    
    # Only send alert if sender is in whitelist
    if sender in ALERT_WHITELIST:
        send_email_alert(
            classification='critical',
            subject=email_dict['subject'],
            sender=sender
        )
    else:
        print(f"Sender {sender} not in alert whitelist")
"""


# ============================================================================
# EXAMPLE 15: Rate Limiting Alerts
# ============================================================================

"""
# Prevent alert spam:

from datetime import datetime, timedelta
from whatsapp_bot.alert_service import send_email_alert

class AlertRateLimiter:
    def __init__(self, max_per_hour=20):
        self.max_per_hour = max_per_hour
        self.alert_times = []
    
    def should_send_alert(self):
        now = datetime.now()
        # Remove alerts older than 1 hour
        self.alert_times = [t for t in self.alert_times if now - t < timedelta(hours=1)]
        
        if len(self.alert_times) < self.max_per_hour:
            self.alert_times.append(now)
            return True
        else:
            print(f"Alert rate limit exceeded ({self.max_per_hour} per hour)")
            return False

limiter = AlertRateLimiter(max_per_hour=20)

def process_email_with_rate_limit(email_dict):
    if limiter.should_send_alert():
        send_email_alert(
            classification='critical',
            subject=email_dict['subject'],
            sender=email_dict['from']
        )
"""


# ============================================================================
# Summary: Configuration Checklist
# ============================================================================

"""
Before deploying WhatsApp alerts:

□ Update WHATSAPP_ALERT_PHONE in config.py
□ Set WHATSAPP_ALERTS_ENABLED = True
□ Test with: python test_whatsapp_alerts.py
□ Check logs in logs/whatsapp_alerts.log
□ Verify WhatsApp Web is accessible
□ Monitor first 10 alerts for issues
□ Set up alert whitelist (optional)
□ Configure rate limiting (optional)
□ Document your configuration

Ready to go!
"""
