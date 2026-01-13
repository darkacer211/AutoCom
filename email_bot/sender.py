import sys
import os
import smtplib
from email.message import EmailMessage

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import EMAIL_ADDRESS, EMAIL_PASSWORD, SMTP_SERVER, SMTP_PORT

def send_email(to_email, subject, body):
    try:
        msg = EmailMessage()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(body)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        with open("logs/bot.log", "a") as f:
            f.write(f"Email sent to {to_email}\n")
            
        print("Email sent successfully")
        return True
    
    except Exception as e:
        with open("logs/bot.log", "a") as f:
            f.write(f"FAILED email to {to_email} : {str(e)}\n")
        print("Error sending email:", e)
        return False