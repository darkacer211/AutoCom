from whatsapp_bot.sender import WhatsAppBot
import sys
import time

try:
    bot = WhatsAppBot(
        driver_path=r"C:\WebDrivers\chromedriver-win64\chromedriver.exe",
        brave_path=r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
    )

    success = bot.send_message("Ketan", "AutoComm WhatsApp alert test ")
    
    if success:
        print("\n" + "="*50)
        print("✓ WhatsApp message delivered successfully!")
        print("✓ Check your Ketan chat to verify the message")
        print("="*50)
        time.sleep(5)  # Keep browser open for 5 more seconds
        print("Closing browser...")
        sys.exit(0)
    else:
        print("\n✗ Failed to send WhatsApp message")
        sys.exit(1)
    
except KeyboardInterrupt:
    print("\n✓ Process interrupted by user")
    sys.exit(0)
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
