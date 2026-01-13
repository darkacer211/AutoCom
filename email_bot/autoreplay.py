from email_bot.sender import send_email

# ---------------------------
# SAFETY KEYWORDS
# ---------------------------

CRITICAL_KEYWORDS = [
    "urgent", "interview", "offer", "payment", "deadline", "exam", "invoice",
    "selection", "shortlisted", "hr", "resume", "joining", "appointment",
    "fee", "fees", "transaction", "bank", "account", "otp", "password",
    "verification", "security", "alert", "complaint", "legal", "notice",
    "court", "suspend", "termination", "result", "scholarship", "placement",
    "approval", "project submission", "assessment", "meeting", "schedule",
    "call", "zoom", "google meet", "interview link"
]

OFFICIAL_KEYWORDS = [
    "university", "college", "office", "company", "team", "admin", "support",
    "department", "regarding", "official", "circular", "announcement",
    "policy", "guidelines", "update"
]

SPAM_KEYWORDS = [
    "win", "free", "lottery", "prize", "congratulations", "click here",
    "limited offer", "buy now", "discount", "sale", "deal", "crypto",
    "investment", "profit", "earn", "bonus", "promo", "subscribe"
]

SAFE_KEYWORDS = [
    "hello", "hi", "thanks", "thank you", "query", "question", "information",
    "details", "feedback", "support", "help", "request"
]


# ---------------------------
# CORE PROCESSOR
# ---------------------------

def process_email(mail):
    sender = extract_email(mail["from"])
    subject = (mail["subject"] or "").lower()
    body = (mail["body"] or "").lower()
    content = subject + " " + body

    category = classify_email(content)
    action_taken = "NONE"

    if category == "CRITICAL":
        notify_user(mail, category)
        action_taken = "BLOCKED_ALERTED"

    elif category == "OFFICIAL":
        notify_user(mail, category)
        action_taken = "BLOCKED_ALERTED"

    elif category == "SPAM":
        action_taken = "IGNORED"

    elif category == "SAFE":
        send_safe_auto_reply(sender, mail["subject"])
        action_taken = "AUTO_REPLIED"

    else:
        notify_user(mail, "UNCERTAIN")
        action_taken = "BLOCKED_UNCERTAIN"

    log_action(sender, mail["subject"], category, action_taken)


# ---------------------------
# CLASSIFIER
# ---------------------------

def classify_email(content):

    for word in CRITICAL_KEYWORDS:
        if word in content:
            return "CRITICAL"

    for word in OFFICIAL_KEYWORDS:
        if word in content:
            return "OFFICIAL"

    for word in SPAM_KEYWORDS:
        if word in content:
            return "SPAM"

    for word in SAFE_KEYWORDS:
        if word in content:
            return "SAFE"

    return "UNCERTAIN"


# ---------------------------
# ACTIONS
# ---------------------------

def send_safe_auto_reply(receiver, original_subject):
    send_email(
        to_email=receiver,
        subject="Re: " + (original_subject or "Your email"),
        body="Hello,\n\nI have received your email. Thank you for reaching out. I will review it and respond personally if required.\n\nRegards,\nAutoComm Bot"
    )


def notify_user(mail, category):
    print("\n IMPORTANT EMAIL DETECTED ")
    print("Category:", category)
    print("From:", mail["from"])
    print("Subject:", mail["subject"])
    print("Body preview:", mail["body"][:200])
    print("No auto-reply was sent.\n")


# ---------------------------
# UTILITIES
# ---------------------------

def extract_email(sender_string):
    if not sender_string:
        return ""
    if "<" in sender_string:
        return sender_string.split("<")[1].replace(">", "").strip()
    return sender_string.strip()


def log_action(sender, subject, category, action):
    with open("logs/bot.log", "a") as f:
        f.write(f"TRIAGE | {sender} | {subject} | {category} | {action}\n")
