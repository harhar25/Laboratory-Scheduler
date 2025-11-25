#!/usr/bin/env python3
"""
Debug dependency issues
"""

import sys
import subprocess

print("🔍 Debugging Python Environment...")
print(f"Python executable: {sys.executable}")
print(f"Python path: {sys.path}")

print("\n📦 Checking installed packages...")
try:
    result = subprocess.run([sys.executable, '-m', 'pip', 'list'], 
                          capture_output=True, text=True)
    print(result.stdout)
except Exception as e:
    print(f"Error checking packages: {e}")

print("\n🔧 Testing imports...")
try:
    import flask_wtf
    print("✅ flask_wtf imported successfully")
    print(f"flask_wtf location: {flask_wtf.__file__}")
except ImportError as e:
    print(f"❌ flask_wtf import failed: {e}")

try:
    import wtforms
    print("✅ wtforms imported successfully")
except ImportError as e:
    print(f"❌ wtforms import failed: {e}")

try:
    import email_validator
    print("✅ email_validator imported successfully")
except ImportError as e:
    print(f"❌ email_validator import failed: {e}")