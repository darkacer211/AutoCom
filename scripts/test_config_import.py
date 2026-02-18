import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("Attempting to import config package...")
    import config
    print(f"Config package imported: {config}")
    
    print("Attempting to access EMAIL_ADDRESS from config package...")
    try:
        print(f"EMAIL_ADDRESS: {config.EMAIL_ADDRESS}")
    except AttributeError:
        print("EMAIL_ADDRESS not found in config package")

    print("\nAttempting to import directly from config.config...")
    from config import config as config_module
    print(f"Config module imported: {config_module}")
    print(f"EMAIL_ADDRESS in module: {getattr(config_module, 'EMAIL_ADDRESS', 'NOT FOUND')}")

except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
