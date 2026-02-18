import sys
import os
import imaplib
import email
import email.utils

# Make sure project root is in path
#sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.config import EMAIL_ADDRESS, EMAIL_PASSWORD, IMAP_SERVER, IMAP_PORT


def fetch_unread_emails(limit=2):
    """
    Fetch only the latest `limit` unread emails.
    Default = 2 (testing mode)
    """
    return fetch_emails(limit=limit, unread_only=True)


def fetch_emails(limit=50, unread_only=False):
    """
    Fetch emails from inbox.
    
    Args:
        limit: Maximum number of emails to fetch
        unread_only: If True, only fetch unread emails
    
    Returns:
        List of email dictionaries
    """
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        mail.select("inbox")

        # Search for emails
        if unread_only:
            status, messages = mail.search(None, 'UNSEEN')
        else:
            status, messages = mail.search(None, 'ALL')
        
        if status != 'OK' or not messages[0]:
            mail.logout()
            return []
        
        email_ids = messages[0].split()
        
        if not email_ids:
            mail.logout()
            return []

        # Get latest N emails
        email_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids

        emails = []

        for e_id in email_ids:
            try:
                status, msg_data = mail.fetch(e_id, "(RFC822)")
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)

                sender = msg.get("From")
                subject = msg.get("Subject")
                
                # Get date
                date_tuple = email.utils.parsedate_tz(msg.get("Date"))
                if date_tuple:
                    import time
                    date = email.utils.mktime_tz(date_tuple)
                    date_str = email.utils.formatdate(date)
                else:
                    date_str = None

                body = ""

                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body = part.get_payload(decode=True).decode(errors="ignore")
                            break
                else:
                    body = msg.get_payload(decode=True).decode(errors="ignore")

                emails.append({
                    "id": e_id.decode() if isinstance(e_id, bytes) else str(e_id),
                    "from": sender,
                    "subject": subject,
                    "body": body,
                    "date": date_str
                })
            except Exception as e:
                print(f"Error processing email {e_id}: {str(e)}")
                continue

        mail.logout()
        return emails
    except imaplib.IMAP4.error as e:
        print(f"IMAP error: {str(e)}")
        raise Exception(f"IMAP connection error: {str(e)}")
    except Exception as e:
        print(f"Error fetching emails: {str(e)}")
        raise Exception(f"Failed to fetch emails: {str(e)}")
