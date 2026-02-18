import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
# Try to find .env file in parent directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    # Fallback/Try default load
    load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = "smtp.gmail.com"   #sends an email
SMTP_PORT = 587
IMAP_SERVER = "imap.gmail.com"   #reads an email
IMAP_PORT = 993

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# WhatsApp Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME_DRIVER_PATH = os.path.join(BASE_DIR, "drivers", "chromedriver.exe")
BRAVE_PATH = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
WHATSAPP_PROFILE_DIR = os.path.join(BASE_DIR, "whatsapp_profile")

# WhatsApp Alert Service Configuration
WHATSAPP_ALERTS_ENABLED = True  # Set to False to disable WhatsApp alerts globally
WHATSAPP_ALERT_PHONE = "+919699295191"  # Phone number to send alerts to (with country code, no spaces)

# Alert behavior configuration
WHATSAPP_ALERT_ON_IMPORTANT = True  # Send alerts for "important" emails
WHATSAPP_ALERT_ON_CRITICAL = True   # Send alerts for "critical" emails
