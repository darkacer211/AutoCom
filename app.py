from ai.gemini_engine import analyze_email

result = analyze_email(
    subject="Interview update for tomorrow",
    sender="hr@company.com",
    body="Your interview is scheduled tomorrow at 10 AM."
)

print(result)
