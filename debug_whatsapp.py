import sys
import traceback

print("Python path:", sys.path[:3])

try:
    print("1. Importing selenium...")
    from selenium import webdriver
    print("✓ selenium imported")
except Exception as e:
    print("✗ selenium failed:", e)
    traceback.print_exc()
    sys.exit(1)

try:
    print("2. Importing whatsapp_bot.sender...")
    import whatsapp_bot.sender
    print("✓ whatsapp_bot.sender imported")
    
    print("3. Checking for WhatsAppBot...")
    if hasattr(whatsapp_bot.sender, 'WhatsAppBot'):
        print("✓ WhatsAppBot found")
    else:
        print("✗ WhatsAppBot NOT found")
        print("Available:", dir(whatsapp_bot.sender))
        
except Exception as e:
    print("✗ Error:", e)
    traceback.print_exc()
