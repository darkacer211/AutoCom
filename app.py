from email_bot.reader import fetch_unread_emails
from email_bot.autoreplay import process_email

print("AutoComm bot started...")

emails = fetch_unread_emails(limit=2)

if not emails:
    print("No unread emails found.")

for mail in emails:
    print("\n--- New Email ---")
    print("From:", mail["from"])
    print("Subject:", mail["subject"])

    with open("logs/bot.log", "a") as f:
        f.write(f"INBOX | {mail['from']} | {mail['subject']}\n")

    process_email(mail)

print("\nAutoComm automation cycle complete.")
