from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import os


class WhatsAppBot:
    def __init__(self, driver_path, brave_path):
        options = Options()
        options.binary_location = brave_path
        service = Service(driver_path)
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.get("https://web.whatsapp.com")
        print("Scan the QR code in Brave to login...")
        time.sleep(25)

    def send_message(self, contact_name, message):
        try:
            time.sleep(5)
            print("1. Searching for contact...")
            
            search_box = self.driver.find_element(By.XPATH, "//div[@contenteditable='true']")
            search_box.click()
            time.sleep(1)
            search_box.clear()
            search_box.send_keys(contact_name)
            print(f"2. Typed contact name: {contact_name}")
            time.sleep(3)
            search_box.send_keys(Keys.ENTER)

            print("3. Opening chat window...")
            time.sleep(5)

            print("4. Finding message input box...")
            message_box = self.driver.find_elements(By.XPATH, "//div[@contenteditable='true']")[-1]
            message_box.click()
            time.sleep(1)

            message_box.send_keys(message)
            print(f"5. Typed message: {message}")
            time.sleep(2)
            
            # Take screenshot before sending
            os.makedirs("screenshots", exist_ok=True)
            self.driver.save_screenshot("screenshots/before_send.png")
            print("6. Screenshot saved: screenshots/before_send.png")
            
            # Try to find and click the send button
            try:
                send_button = self.driver.find_element(By.XPATH, "//button[@aria-label='Send']")
                print("7. Found SEND button with aria-label")
                send_button.click()
            except:
                try:
                    send_button = self.driver.find_element(By.CSS_SELECTOR, "button[data-testid='compose-btn-send']")
                    print("7. Found SEND button with data-testid")
                    send_button.click()
                except:
                    print("7. No send button found, pressing ENTER instead...")
                    message_box.send_keys(Keys.ENTER)
            
            time.sleep(3)
            self.driver.save_screenshot("screenshots/after_send.png")
            print("8. Screenshot saved: screenshots/after_send.png")
            print(f" Message sent to {contact_name}")
            return True

        except Exception as e:
            print(f" Error: {e}")
            import traceback
            traceback.print_exc()
            return False
