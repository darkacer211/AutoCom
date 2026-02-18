from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import os

from config import BRAVE_PATH, WHATSAPP_PROFILE_DIR

# Ensure profile directory exists
os.makedirs(WHATSAPP_PROFILE_DIR, exist_ok=True)


class WhatsAppBot:
    def __init__(self):
        """Initialize WhatsApp bot with Brave browser and persistent profile."""
        options = Options()
        options.binary_location = BRAVE_PATH
        
        # Use persistent profile to save WhatsApp login
        options.add_argument(f"--user-data-dir={WHATSAPP_PROFILE_DIR}")
        options.add_argument("--profile-directory=Default")
        
        # Prevent detection
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Use webdriver-manager to automatically download correct ChromeDriver version
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        self.driver.get("https://web.whatsapp.com")
        print("Opening WhatsApp Web...")
        print("If this is your first time, scan the QR code with your phone.")
        print("Your login will be saved for future sessions.")
        
        # Wait for WhatsApp to load (either QR code or chats)
        self._wait_for_load()
    
    def _wait_for_load(self, timeout=60):
        """Wait for WhatsApp Web to fully load."""
        print("Waiting for WhatsApp to load...")
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda d: d.find_elements(By.XPATH, "//div[@contenteditable='true']") or 
                          d.find_elements(By.XPATH, "//canvas[@aria-label='Scan this QR code to link a device!']")
            )
            
            # Check if we need to scan QR
            qr_elements = self.driver.find_elements(By.XPATH, "//canvas[@aria-label='Scan this QR code to link a device!']")
            if qr_elements:
                print("\n" + "="*50)
                print("QR CODE DETECTED!")
                print("Please scan the QR code with your WhatsApp mobile app.")
                print("Go to: WhatsApp > Settings > Linked Devices > Link a Device")
                print("="*50 + "\n")
                
                # Wait for login (up to 2 minutes)
                WebDriverWait(self.driver, 120).until(
                    EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true'][@data-tab='3']"))
                )
                print("Successfully logged in! Your session is saved.")
            else:
                print("Already logged in from previous session!")
                
        except Exception as e:
            print(f"Error waiting for WhatsApp: {e}")
            raise

    def send_message(self, contact_name, message):
        """Send a message to a contact by name."""
        try:
            print(f"\nSending message to: {contact_name}")
            
            # Find and click search box
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true'][@data-tab='3']"))
            )
            search_box.click()
            time.sleep(0.5)
            
            # Clear and type contact name
            search_box.send_keys(Keys.CONTROL + "a")
            search_box.send_keys(Keys.DELETE)
            search_box.send_keys(contact_name)
            print(f"Searching for: {contact_name}")
            time.sleep(2)
            
            # Click on the contact
            try:
                contact = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, f"//span[@title='{contact_name}']"))
                )
                contact.click()
            except:
                # Try clicking first result
                search_box.send_keys(Keys.ENTER)
            
            time.sleep(1)
            
            # Find message input box
            message_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true'][@data-tab='10']"))
            )
            message_box.click()
            time.sleep(0.5)
            
            # Type and send message
            message_box.send_keys(message)
            print(f"Typed message: {message[:50]}...")
            time.sleep(0.5)
            
            # Send message
            message_box.send_keys(Keys.ENTER)
            print(f"Message sent to {contact_name}!")
            
            time.sleep(1)
            return True

        except Exception as e:
            print(f"Error sending message: {e}")
            import traceback
            traceback.print_exc()
            return False

    def send_message_to_number(self, phone_number: str, message: str) -> bool:
        """
        Send a message to a phone number.
        Phone number should be in format: +countrycode (e.g., +1234567890)
        
        Args:
            phone_number: Phone number with country code
            message: Message text
            
        Returns:
            True if successful, False otherwise
        """
        try:
            print(f"\nSending message to phone number: {phone_number}")
            
            # Find and click search box
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true'][@data-tab='3']"))
            )
            search_box.click()
            time.sleep(0.5)
            
            # Clear and type phone number
            search_box.send_keys(Keys.CONTROL + "a")
            search_box.send_keys(Keys.DELETE)
            search_box.send_keys(phone_number)
            print(f"Searching for phone number: {phone_number}")
            time.sleep(2)
            
            # Click on the contact result or create new chat
            try:
                # Try to find exact match first
                contact = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, f"//span[@title='{phone_number}']"))
                )
                contact.click()
            except:
                # Try clicking first result or press Enter to create new chat
                try:
                    first_result = self.driver.find_element(By.XPATH, "//div[@data-testid='cell-frame-container']")
                    first_result.click()
                except:
                    # If no results, press Enter to open new chat with this number
                    search_box.send_keys(Keys.ENTER)
            
            time.sleep(1)
            
            # Find message input box
            message_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true'][@data-tab='10']"))
            )
            message_box.click()
            time.sleep(0.5)
            
            # Type and send message
            message_box.send_keys(message)
            print(f"Typed message: {message[:50]}...")
            time.sleep(0.5)
            
            # Send message
            message_box.send_keys(Keys.ENTER)
            print(f"Message sent to {phone_number}!")
            
            time.sleep(1)
            return True

        except Exception as e:
            print(f"Error sending message to {phone_number}: {e}")
            import traceback
            traceback.print_exc()
            return False

    def get_contacts(self):
        """Get list of recent contacts."""
        try:
            contacts = []
            contact_elements = self.driver.find_elements(By.XPATH, "//div[@data-testid='cell-frame-container']//span[@title]")
            
            for elem in contact_elements[:20]:  # Get first 20 contacts
                name = elem.get_attribute("title")
                if name and not name.startswith("+"):  # Skip group chats with numbers
                    contacts.append({"name": name})
            
            return contacts
        except Exception as e:
            print(f"Error getting contacts: {e}")
            return []

    def close(self):
        """Close the browser."""
        if self.driver:
            self.driver.quit()
            print("Browser closed.")


# Singleton instance for the API to use
_bot_instance = None

def get_whatsapp_bot():
    """Get or create WhatsApp bot instance."""
    global _bot_instance
    if _bot_instance is None:
        _bot_instance = WhatsAppBot()
    return _bot_instance

def close_whatsapp_bot():
    """Close the WhatsApp bot."""
    global _bot_instance
    if _bot_instance:
        _bot_instance.close()
        _bot_instance = None


# For testing
if __name__ == "__main__":
    bot = WhatsAppBot()
    print("\nWhatsApp bot is ready!")
    print("Test sending a message:")
    
    contact = input("Enter contact name: ")
    message = input("Enter message: ")
    
    if contact and message:
        bot.send_message(contact, message)
    
    input("\nPress Enter to close...")
    bot.close()
