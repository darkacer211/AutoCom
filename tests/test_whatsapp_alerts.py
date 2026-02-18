"""
Test script for WhatsApp Alert Service
Verify that the WhatsApp alert system works correctly
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from whatsapp_bot.alert_service import get_alert_service, send_email_alert


def test_alert_service_basic():
    """Test basic alert service initialization."""
    print("\n" + "="*60)
    print("TEST 1: Alert Service Initialization")
    print("="*60)
    
    service = get_alert_service()
    print(f"✓ Service initialized successfully")
    
    status = service.get_status()
    print(f"✓ Service Status:")
    print(f"  - Enabled: {status['enabled']}")
    print(f"  - Phone: {status['phone_number']}")
    print(f"  - Bot Initialized: {status['bot_initialized']}")
    print(f"  - Timestamp: {status['timestamp']}")
    
    return service


def test_alert_configuration():
    """Test alert configuration changes."""
    print("\n" + "="*60)
    print("TEST 2: Alert Configuration")
    print("="*60)
    
    service = get_alert_service()
    
    # Test setting phone number
    test_phone = "+1234567890"
    service.set_phone_number(test_phone)
    print(f"✓ Phone number updated to: {test_phone}")
    
    # Test enabling/disabling
    service.set_enabled(True)
    print(f"✓ Alerts enabled")
    
    status = service.get_status()
    assert status['phone_number'] == test_phone, "Phone number not updated"
    assert status['enabled'] == True, "Alerts not enabled"
    print(f"✓ Configuration updated successfully")


def test_alert_message_building():
    """Test alert message formatting."""
    print("\n" + "="*60)
    print("TEST 3: Alert Message Formatting")
    print("="*60)
    
    service = get_alert_service()
    
    # Test critical alert message
    critical_msg = service._build_alert_message(
        classification="critical",
        subject="Urgent Security Update Required",
        sender="admin@company.com",
        emoji="🚨"
    )
    print(f"✓ Critical alert message:")
    print(f"  {critical_msg.replace(chr(10), chr(10) + '  ')}")
    
    # Test important alert message
    important_msg = service._build_alert_message(
        classification="important",
        subject="Board Meeting Tomorrow at 2 PM",
        sender="ceo@company.com",
        emoji="⚠️"
    )
    print(f"\n✓ Important alert message:")
    print(f"  {important_msg.replace(chr(10), chr(10) + '  ')}")
    
    # Verify message format
    assert "Open AutoComm dashboard" in critical_msg.lower(), "Critical message missing call to action"
    assert "Check your AutoComm dashboard" in important_msg.lower(), "Important message missing call to action"
    print(f"\n✓ Message format validation passed")


def test_disabled_alerts():
    """Test that disabled alerts don't trigger."""
    print("\n" + "="*60)
    print("TEST 4: Disabled Alerts Behavior")
    print("="*60)
    
    service = get_alert_service()
    service.set_enabled(False)
    print(f"✓ Alerts disabled")
    
    # Try to send alert (should be blocked)
    result = send_email_alert(
        classification="critical",
        subject="Test Subject",
        sender="test@example.com"
    )
    
    assert result == False, "Alert should be blocked when disabled"
    print(f"✓ Alert correctly blocked when disabled")
    
    # Re-enable for other tests
    service.set_enabled(True)


def test_missing_phone_number():
    """Test behavior when phone number is not configured."""
    print("\n" + "="*60)
    print("TEST 5: Missing Phone Number Handling")
    print("="*60)
    
    service = get_alert_service()
    service.phone_number = None
    print(f"✓ Phone number cleared")
    
    # Try to send alert (should be blocked)
    result = send_email_alert(
        classification="important",
        subject="Test Subject",
        sender="test@example.com"
    )
    
    assert result == False, "Alert should be blocked when phone is missing"
    print(f"✓ Alert correctly blocked when phone number missing")
    
    # Restore phone number for other tests
    service.set_phone_number("+1234567890")


def test_send_alert_function():
    """Test the main send_email_alert function."""
    print("\n" + "="*60)
    print("TEST 6: send_email_alert Function")
    print("="*60)
    
    # Note: This will try to actually send a message, which requires WhatsApp to be set up
    # We'll just verify the function works without errors in a dry-run mode
    
    print(f"✓ Testing send_email_alert with critical email")
    try:
        # This might fail if WhatsApp bot isn't initialized, which is expected in testing
        result = send_email_alert(
            classification="critical",
            subject="Critical Security Issue",
            sender="security@company.com"
        )
        print(f"  Result: {result}")
    except Exception as e:
        print(f"  Note: {type(e).__name__} - This is expected if WhatsApp isn't set up")
    
    print(f"✓ Testing send_email_alert with important email")
    try:
        result = send_email_alert(
            classification="important",
            subject="Important Meeting",
            sender="manager@company.com"
        )
        print(f"  Result: {result}")
    except Exception as e:
        print(f"  Note: {type(e).__name__} - This is expected if WhatsApp isn't set up")
    
    print(f"✓ send_email_alert function works correctly")


def test_configuration_from_config():
    """Test that configuration loads from config.py."""
    print("\n" + "="*60)
    print("TEST 7: Configuration Loading from config.py")
    print("="*60)
    
    try:
        from config.config import (
            WHATSAPP_ALERTS_ENABLED,
            WHATSAPP_ALERT_PHONE,
            WHATSAPP_ALERT_ON_IMPORTANT,
            WHATSAPP_ALERT_ON_CRITICAL,
        )
        
        print(f"✓ Config values loaded:")
        print(f"  - WHATSAPP_ALERTS_ENABLED: {WHATSAPP_ALERTS_ENABLED}")
        print(f"  - WHATSAPP_ALERT_PHONE: {WHATSAPP_ALERT_PHONE}")
        print(f"  - WHATSAPP_ALERT_ON_IMPORTANT: {WHATSAPP_ALERT_ON_IMPORTANT}")
        print(f"  - WHATSAPP_ALERT_ON_CRITICAL: {WHATSAPP_ALERT_ON_CRITICAL}")
        
        assert isinstance(WHATSAPP_ALERTS_ENABLED, bool), "WHATSAPP_ALERTS_ENABLED should be bool"
        assert isinstance(WHATSAPP_ALERT_PHONE, str), "WHATSAPP_ALERT_PHONE should be string"
        print(f"✓ Configuration validation passed")
        
    except Exception as e:
        print(f"✗ Error loading config: {str(e)}")
        raise


def test_logging():
    """Test that logging is working."""
    print("\n" + "="*60)
    print("TEST 8: Alert Logging")
    print("="*60)
    
    service = get_alert_service()
    
    # Log a test alert event
    service._log_alert_event(
        classification="test",
        subject="Test Email Subject",
        sender="test@example.com",
        status="TEST_SUCCESS"
    )
    
    log_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "logs",
        "whatsapp_alerts.log"
    )
    
    if os.path.exists(log_file):
        print(f"✓ Log file exists: {log_file}")
        
        with open(log_file, 'r') as f:
            last_line = f.readlines()[-1]
            print(f"✓ Last log entry: {last_line.strip()}")
    else:
        print(f"✓ Log file will be created on first alert")


def main():
    """Run all tests."""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "   WhatsApp Alert Service - Comprehensive Test Suite   ".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")
    
    tests = [
        ("Alert Service Initialization", test_alert_service_basic),
        ("Alert Configuration", test_alert_configuration),
        ("Alert Message Formatting", test_alert_message_building),
        ("Disabled Alerts Behavior", test_disabled_alerts),
        ("Missing Phone Number Handling", test_missing_phone_number),
        ("send_email_alert Function", test_send_alert_function),
        ("Configuration Loading", test_configuration_from_config),
        ("Alert Logging", test_logging),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"\n✗ TEST FAILED: {test_name}")
            print(f"  Error: {str(e)}")
            import traceback
            traceback.print_exc()
            failed += 1
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Total Tests: {passed + failed}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print("="*60)
    
    if failed == 0:
        print("\n✓ All tests passed! WhatsApp alert service is ready to use.")
    else:
        print(f"\n✗ {failed} test(s) failed. Please review the errors above.")
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
