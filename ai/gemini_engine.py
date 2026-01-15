import sys
import os

##sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from groq import Groq
from google import genai
import json
from config import GROQ_API_KEY
print("USING NEW GEMINI ENGINE:", __file__)

client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """
You are an intelligent email triage system.

Your task:
1. Classify the email into exactly one category:
   CRITICAL, OFFICIAL, SAFE, SPAM, UNCERTAIN

2. Assign a risk_level between 0.0 and 1.0

3. Give a short reason (max 15 words)

4. Only suggest a reply if and only if the email is SAFE.
   Replies must be polite, neutral, and only acknowledgements.

Return ONLY valid JSON in this exact format:

{
  "category": "...",
  "risk_level": 0.0,
  "reason": "...",
  "suggested_reply": "..."
}

Never include explanations outside JSON.
"""

def analyze_email(subject, sender, body):

    prompt = f"""
EMAIL DETAILS:
Sender: {sender}
Subject: {subject}

Body:
{body}

{SYSTEM_PROMPT}
"""

    try:
        
        completion = client.chat.completions.create ( 
            
            model="openai/gpt-oss-120b",
            contents=prompt,
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            reasoning_effort="medium",
            stream=True,
            stop=None   
        )

        raw_text = response.text.strip()
        return json.loads(raw_text)

    except Exception as e:
        print("Gemini API error:", e)
        return {
            "category": "UNCERTAIN",
            "risk_level": 0.5,
            "reason": "Gemini API failure",
            "suggested_reply": ""
        }
