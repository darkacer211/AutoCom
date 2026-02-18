import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import traceback

try:
    import email_bot.autoreplay
    print("Module imported successfully")
    print("Has process_email:", hasattr(email_bot.autoreplay, 'process_email'))
    print("Dir:", [x for x in dir(email_bot.autoreplay) if not x.startswith('_')])
except Exception as e:
    print("ERROR:")
    traceback.print_exc()
