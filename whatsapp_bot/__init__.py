"""
WhatsApp Bot Module

This module provides WhatsApp integration for AutoComm:

1. Sender (sender.py)
   - WhatsAppBot class for browser-based WhatsApp Web
   - send_message() - Send message to contact by name
   - send_message_to_number() - Send message to phone number

2. Alert Service (alert_service.py) - NEW
   - WhatsAppAlertService class for email alerts
   - send_email_alert() - Send alert when critical/important emails arrive
   - get_alert_service() - Get service instance

Usage:

For sending manual messages:
    from whatsapp_bot.sender import WhatsAppBot
    bot = WhatsAppBot()
    bot.send_message("Contact Name", "Hello!")

For email alerts (automatic):
    from whatsapp_bot.alert_service import send_email_alert
    send_email_alert("critical", "Subject", "sender@example.com")
"""

__version__ = "1.0.0"
__author__ = "AutoComm"

from .alert_service import (
    WhatsAppAlertService,
    send_email_alert,
    get_alert_service,
)

__all__ = [
    'WhatsAppAlertService',
    'send_email_alert',
    'get_alert_service',
]
