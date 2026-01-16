import sys
import os
import json

## ensure repo root is on sys.path if needed
## sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from groq import Groq

from config.config import GROQ_API_KEY
print("USING NEW GEMINI ENGINE:", __file__)

# Initialize client (will raise/print on failure; analyze_email handles runtime errors)
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
        # Use non-streaming call for simplicity and predictable response structure
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            reasoning_effort="medium",
            stream=False,
            stop=None,
        )

        # Try several ways to extract text from the returned object
        raw_text = ""
        # common attribute used by some SDKs
        if hasattr(completion, "text") and completion.text:
            raw_text = completion.text
        # groq SDK returns choices with message.content
        elif hasattr(completion, "choices"):
            try:
                choice = completion.choices[0]
                # message may be an object or dict
                msg = getattr(choice, "message", None) or (choice.get("message") if isinstance(choice, dict) else None)
                if msg is not None:
                    raw_text = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else None) or ""
                else:
                    raw_text = str(choice)
            except Exception:
                raw_text = str(completion)
        # some SDKs return a dict-like structure
        elif isinstance(completion, dict):
            # try common OpenAI-style shape
            try:
                raw_text = completion.get("choices", [])[0].get("message", {}).get("content", "")
            except Exception:
                raw_text = str(completion)
        else:
            # fallback to stringifying the object
            raw_text = str(completion)

        raw_text = raw_text.strip()
        # If response is empty, raise to go to fallback
        if not raw_text:
            # log the full completion for debugging
            print('Completion repr (empty text):', repr(completion))
            raise ValueError("Empty response from model")

        try:
            return json.loads(raw_text)
        except Exception as parse_err:
            print('Failed to parse model output as JSON. Raw output repr: ', repr(raw_text))
            raise parse_err

    except Exception as e:
        print("Gemini API error:", e)
        return {
            "category": "UNCERTAIN",
            "risk_level": 0.5,
            "reason": "Gemini API failure",
            "suggested_reply": ""
        }
