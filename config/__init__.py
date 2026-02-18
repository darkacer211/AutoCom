# Export all config variables from config.py
from .config import (
    EMAIL_ADDRESS,
    EMAIL_PASSWORD,
    SMTP_SERVER,
    SMTP_PORT,
    IMAP_SERVER,
    IMAP_PORT,
    GEMINI_API_KEY,
    GROQ_API_KEY,
    CHROME_DRIVER_PATH,
    BRAVE_PATH,
    WHATSAPP_PROFILE_DIR
)

__all__ = [
    'EMAIL_ADDRESS',
    'EMAIL_PASSWORD',
    'SMTP_SERVER',
    'SMTP_PORT',
    'IMAP_SERVER',
    'IMAP_PORT',
    'GEMINI_API_KEY',
    'GROQ_API_KEY',
    'CHROME_DRIVER_PATH',
    'BRAVE_PATH',
    'WHATSAPP_PROFILE_DIR'
]
