import sys
import os
import imaplib
import email

# Make sure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import EMAIL_ADDRESS, EMAIL_PASSWORD, IMAP_SERVER, IMAP_PORT


def fetch_unread_emails(limit=2):
    """
    Fetch only the latest `limit` unread emails.
    Default = 2 (testing mode)
    """

    mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
    mail.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
    mail.select("inbox")

    status, messages = mail.search(None, 'UNSEEN')
    email_ids = messages[0].split()

    # 🔥 LIMIT FETCH COUNT (take latest unread mails only)
    email_ids = email_ids[-limit:]

    unread_emails = []

    for e_id in email_ids:
        status, msg_data = mail.fetch(e_id, "(RFC822)")
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)

        sender = msg.get("From")
        subject = msg.get("Subject")

        body = ""

        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode(errors="ignore")
                    break
        else:
            body = msg.get_payload(decode=True).decode(errors="ignore")

        unread_emails.append({
            "id": e_id,
            "from": sender,
            "subject": subject,
            "body": body
        })

    mail.logout()
    return unread_emails
