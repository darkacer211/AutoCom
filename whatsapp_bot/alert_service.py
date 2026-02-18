"""
WhatsApp Alert Service - Sends critical/important email alerts via WhatsApp
This service is isolated from the UI and designed for notification-only use.
"""

import sys
import os
import logging
from datetime import datetime
from typing import Optional, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from whatsapp_bot.sender import WhatsAppBot

# Configure logging
LOGS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
os.makedirs(LOGS_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOGS_DIR, "whatsapp_alerts.log")

logger = logging.getLogger(__name__)
handler = logging.FileHandler(LOG_FILE)
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Also log to console
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
logger.addHandler(console_handler)


class WhatsAppAlertService:
    """
    Service for sending email alerts via WhatsApp.
    Strictly for notifications - not a chat system.
    """
    
    def __init__(self, phone_number: Optional[str] = None, enabled: bool = True):
        """
        Initialize WhatsApp Alert Service.
        
        Args:
            phone_number: Target phone number for alerts (format: +country_code without spaces)
            enabled: Whether alerts are enabled globally
        """
        self.phone_number = phone_number
        self.enabled = enabled
        self.bot = None
        self._initialized = False
        
        logger.info(f"WhatsAppAlertService initialized. Enabled: {enabled}, Phone: {phone_number}")
    
    def _ensure_bot_initialized(self) -> bool:
        """
        Lazily initialize the WhatsApp bot only when needed.
        Returns True if initialization successful, False otherwise.
        """
        if self._initialized:
            return self.bot is not None
        
        try:
            if self.bot is None:
                logger.info("Initializing WhatsApp bot for alerts...")
                self.bot = WhatsAppBot()
                logger.info("WhatsApp bot initialized successfully")
            self._initialized = True
            return True
        except Exception as e:
            logger.error(f"Failed to initialize WhatsApp bot: {str(e)}")
            self._initialized = True
            return False
    
    def send_important_alert(self, subject: str, sender: str) -> bool:
        """
        Send alert for important email.
        
        Args:
            subject: Email subject
            sender: Email sender
            
        Returns:
            True if sent successfully, False otherwise
        """
        return self._send_alert(
            classification="important",
            subject=subject,
            sender=sender,
            emoji="⚠️"
        )
    
    def send_critical_alert(self, subject: str, sender: str) -> bool:
        """
        Send alert for critical email.
        
        Args:
            subject: Email subject
            sender: Email sender
            
        Returns:
            True if sent successfully, False otherwise
        """
        return self._send_alert(
            classification="critical",
            subject=subject,
            sender=sender,
            emoji="🚨"
        )
    
    def _send_alert(self, classification: str, subject: str, sender: str, emoji: str) -> bool:
        """
        Internal method to send alert.
        
        Args:
            classification: "important" or "critical"
            subject: Email subject
            sender: Email sender
            emoji: Emoji to use in message
            
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            # Validate preconditions
            if not self.enabled:
                logger.info(f"WhatsApp alerts disabled. Skipping {classification} alert.")
                return False
            
            if not self.phone_number:
                logger.warning(f"No phone number configured. Cannot send {classification} alert.")
                return False
            
            # Build alert message
            message = self._build_alert_message(classification, subject, sender, emoji)
            
            logger.info(f"Preparing to send {classification.upper()} alert to {self.phone_number}")
            logger.info(f"Alert message: {message}")
            
            # Initialize bot if needed
            if not self._ensure_bot_initialized():
                logger.error("Failed to initialize WhatsApp bot. Alert not sent.")
                return False
            
            # Send message
            if self.bot.send_message_to_number(self.phone_number, message):
                logger.info(f"✓ {classification.upper()} alert sent successfully to {self.phone_number}")
                self._log_alert_event(classification, subject, sender, "SUCCESS")
                return True
            else:
                logger.error(f"Failed to send {classification} alert to {self.phone_number}")
                self._log_alert_event(classification, subject, sender, "FAILED")
                return False
                
        except Exception as e:
            logger.error(f"Error sending {classification} alert: {str(e)}", exc_info=True)
            self._log_alert_event(classification, subject, sender, f"ERROR: {str(e)}")
            return False
    
    def _build_alert_message(self, classification: str, subject: str, 
                             sender: str, emoji: str) -> str:
        """
        Build the WhatsApp alert message.
        Does NOT include email body or full details.
        
        Args:
            classification: "important" or "critical"
            subject: Email subject (first 50 chars)
            sender: Email sender (name only)
            emoji: Emoji for the message
            
        Returns:
            Formatted alert message
        """
        # Clean subject (max 50 chars)
        clean_subject = subject[:50] if subject else "No subject"
        
        # Extract sender name (remove email address)
        sender_name = sender
        if '<' in sender and '>' in sender:
            sender_name = sender.split('<')[0].strip()
        elif '@' in sender:
            sender_name = sender.split('@')[0]
        
        sender_name = sender_name[:30] if sender_name else "Unknown"
        
        if classification == "critical":
            message = (
                f"{emoji} CRITICAL EMAIL RECEIVED\n\n"
                f"From: {sender_name}\n"
                f"Subject: {clean_subject}\n\n"
                f"Open AutoComm dashboard immediately to view details."
            )
        else:  # important
            message = (
                f"{emoji} Important email detected\n\n"
                f"From: {sender_name}\n"
                f"Subject: {clean_subject}\n\n"
                f"Check your AutoComm dashboard for details."
            )
        
        return message
    
    def _log_alert_event(self, classification: str, subject: str, 
                        sender: str, status: str) -> None:
        """
        Log alert event for audit trail.
        
        Args:
            classification: "important" or "critical"
            subject: Email subject
            sender: Email sender
            status: "SUCCESS", "FAILED", or error message
        """
        try:
            log_entry = (
                f"WHATSAPP_ALERT | {datetime.now().isoformat()} | "
                f"Classification: {classification} | Status: {status} | "
                f"From: {sender} | Subject: {subject}\n"
            )
            with open(LOG_FILE, "a") as f:
                f.write(log_entry)
        except Exception as e:
            logger.error(f"Failed to write alert log: {str(e)}")
    
    def set_enabled(self, enabled: bool) -> None:
        """Enable or disable alerts globally."""
        self.enabled = enabled
        logger.info(f"WhatsApp alerts {'ENABLED' if enabled else 'DISABLED'}")
    
    def set_phone_number(self, phone_number: str) -> None:
        """Update target phone number."""
        self.phone_number = phone_number
        logger.info(f"WhatsApp alert phone number updated to: {phone_number}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current service status."""
        return {
            'enabled': self.enabled,
            'phone_number': self.phone_number,
            'bot_initialized': self._initialized and self.bot is not None,
            'timestamp': datetime.now().isoformat()
        }


# Singleton instance for application-wide use
_alert_service: Optional[WhatsAppAlertService] = None


def get_alert_service() -> WhatsAppAlertService:
    """Get or create the global WhatsApp alert service instance."""
    global _alert_service
    if _alert_service is None:
        # Import config for alert settings
        try:
            from config.config import (
                WHATSAPP_ALERTS_ENABLED,
                WHATSAPP_ALERT_PHONE,
            )
            _alert_service = WhatsAppAlertService(
                phone_number=WHATSAPP_ALERT_PHONE,
                enabled=WHATSAPP_ALERTS_ENABLED
            )
        except ImportError:
            logger.warning("Config not found. Creating alert service with defaults.")
            _alert_service = WhatsAppAlertService(enabled=True)
    
    return _alert_service


def send_email_alert(classification: str, subject: str, sender: str) -> bool:
    """
    Send an email alert via WhatsApp.
    
    This is the main function to call when an important/critical email is detected.
    
    Args:
        classification: "important" or "critical"
        subject: Email subject
        sender: Email sender
        
    Returns:
        True if alert sent successfully, False otherwise
    """
    service = get_alert_service()
    
    if classification == "critical":
        return service.send_critical_alert(subject, sender)
    elif classification == "important":
        return service.send_important_alert(subject, sender)
    else:
        logger.warning(f"Unexpected classification: {classification}. No alert sent.")
        return False


if __name__ == "__main__":
    # Simple test
    print("WhatsApp Alert Service Test")
    print("=" * 50)
    
    service = get_alert_service()
    print(f"Service Status: {service.get_status()}")
