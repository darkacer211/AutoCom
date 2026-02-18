#!/usr/bin/env python3
"""
Test suite for WhatsApp alert configuration endpoints.
Tests the new /api/whatsapp/alerts/status and /api/whatsapp/alerts/configure endpoints.
"""

import sys
import os
import json
import requests

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

BASE_URL = 'http://localhost:5000'

def test_get_alert_status():
    """Test GET /api/whatsapp/alerts/status endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Get Alert Status")
    print("="*60)
    
    try:
        response = requests.get(f'{BASE_URL}/api/whatsapp/alerts/status')
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response structure
        assert 'phone_number' in data, "Missing phone_number field"
        assert 'enabled' in data, "Missing enabled field"
        assert 'bot_initialized' in data, "Missing bot_initialized field"
        assert 'timestamp' in data, "Missing timestamp field"
        
        print("✓ Alert status endpoint working correctly")
        return True
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_configure_alert_valid():
    """Test POST /api/whatsapp/alerts/configure with valid phone number"""
    print("\n" + "="*60)
    print("TEST 2: Configure Alert with Valid Phone Number")
    print("="*60)
    
    try:
        payload = {
            'phone_number': '+1234567890',
            'enabled': True
        }
        print(f"Sending payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f'{BASE_URL}/api/whatsapp/alerts/configure',
            json=payload
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('success') == True, "Success should be True"
        assert data.get('phone_number') == '+1234567890', "Phone number not set correctly"
        assert data.get('enabled') == True, "Enabled flag not set correctly"
        
        print("✓ Configuration saved successfully")
        return True
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_configure_alert_invalid_phone():
    """Test POST /api/whatsapp/alerts/configure with invalid phone format"""
    print("\n" + "="*60)
    print("TEST 3: Configure Alert with Invalid Phone Format")
    print("="*60)
    
    try:
        # Test various invalid formats
        invalid_phones = [
            '1234567890',        # Missing +
            '+123',              # Too short
            '+12345678901234567',  # Too long
            '+1234567890a',      # Contains letter
            'invalid',           # Not a number
        ]
        
        all_rejected = True
        for invalid_phone in invalid_phones:
            payload = {
                'phone_number': invalid_phone,
                'enabled': True
            }
            print(f"\nTesting invalid format: {invalid_phone}")
            
            response = requests.post(
                f'{BASE_URL}/api/whatsapp/alerts/configure',
                json=payload
            )
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == False and 'Invalid phone' in data.get('error', ''):
                    print(f"  ✓ Correctly rejected: {data.get('error')}")
                else:
                    print(f"  ✗ Should have rejected this format")
                    all_rejected = False
            else:
                print(f"  ✓ Rejected with status {response.status_code}")
        
        if all_rejected:
            print("\n✓ All invalid phone formats correctly rejected")
            return True
        else:
            print("\n✗ Some invalid formats were not rejected")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_configure_alert_disabled():
    """Test disabling alerts"""
    print("\n" + "="*60)
    print("TEST 4: Disable Alerts")
    print("="*60)
    
    try:
        payload = {
            'phone_number': '+919876543210',
            'enabled': False
        }
        print(f"Sending payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f'{BASE_URL}/api/whatsapp/alerts/configure',
            json=payload
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('success') == True, "Success should be True"
        assert data.get('enabled') == False, "Enabled flag should be False"
        
        print("✓ Alerts successfully disabled")
        return True
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_configure_alert_various_countries():
    """Test phone numbers from different countries"""
    print("\n" + "="*60)
    print("TEST 5: Configure Alerts for Various Countries")
    print("="*60)
    
    test_cases = [
        ('+1234567890', 'Test Country 1'),
        ('+919876543210', 'India'),
        ('+442071838750', 'UK'),
        ('+491234567890', 'Germany'),
        ('+33123456789', 'France'),
    ]
    
    all_passed = True
    for phone, country in test_cases:
        try:
            payload = {
                'phone_number': phone,
                'enabled': True
            }
            print(f"\nConfiguring for {country}: {phone}")
            
            response = requests.post(
                f'{BASE_URL}/api/whatsapp/alerts/configure',
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    print(f"  ✓ Successfully configured")
                else:
                    print(f"  ✗ Configuration failed: {data.get('error')}")
                    all_passed = False
            else:
                print(f"  ✗ Server returned status {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            all_passed = False
    
    if all_passed:
        print("\n✓ All country phone numbers configured successfully")
        return True
    else:
        print("\n✗ Some country configurations failed")
        return False

def test_alert_status_after_config():
    """Test that status reflects the configuration"""
    print("\n" + "="*60)
    print("TEST 6: Verify Status After Configuration")
    print("="*60)
    
    try:
        # Configure alerts
        config_payload = {
            'phone_number': '+1555123456',
            'enabled': True
        }
        print(f"Setting config: {json.dumps(config_payload, indent=2)}")
        
        response = requests.post(
            f'{BASE_URL}/api/whatsapp/alerts/configure',
            json=config_payload
        )
        assert response.status_code == 200, "Configuration failed"
        
        # Check status
        print("\nFetching updated status...")
        response = requests.get(f'{BASE_URL}/api/whatsapp/alerts/status')
        data = response.json()
        print(f"Status: {json.dumps(data, indent=2)}")
        
        # Verify configuration persisted
        assert data.get('phone_number') == '+1555123456', "Phone number not persisted"
        assert data.get('enabled') == True, "Enabled flag not persisted"
        
        print("✓ Configuration correctly persisted in status")
        return True
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("WhatsApp Alert Configuration Endpoints Test Suite")
    print("="*60)
    print(f"Testing against: {BASE_URL}")
    
    # Check if server is running
    try:
        response = requests.get(f'{BASE_URL}/api/health')
        if response.status_code == 200:
            print("✓ Server is online")
        else:
            print("✗ Server returned non-200 status")
            return
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure Flask server is running on port 5000")
        print("  Run: python web/app.py")
        return
    
    # Run all tests
    tests = [
        test_get_alert_status,
        test_configure_alert_valid,
        test_configure_alert_invalid_phone,
        test_configure_alert_disabled,
        test_configure_alert_various_countries,
        test_alert_status_after_config,
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"\n✗ Test failed with exception: {str(e)}")
            results.append(False)
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("✓ All tests passed!")
    else:
        print(f"✗ {total - passed} test(s) failed")
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
