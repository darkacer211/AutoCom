import sys
import traceback
import os
print("Reading sender.py...")
file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'whatsapp_bot', 'sender.py')
with open(file_path, 'r') as f:
    code = f.read()

print(f"File size: {len(code)} bytes")
print("First 300 chars:")
print(code[:300])
print("\n" + "="*50)
print("Trying to execute code...")

try:
    namespace = {'__name__': '__main__'}
    exec(code, namespace)
    print("✓ Execution successful")
    
    if 'WhatsAppBot' in namespace:
        print("✓ WhatsAppBot is defined!")
        print("WhatsAppBot:", namespace['WhatsAppBot'])
    else:
        print("✗ WhatsAppBot NOT defined in namespace")
        print("Defined names:", [k for k in namespace.keys() if not k.startswith('_')])
except Exception as e:
    print("✗ Error during execution:")
    traceback.print_exc()
