#!/usr/bin/env python3
"""
Setup script for IT Laboratory Utilization Schedule System
"""

import os
import sys
import subprocess
import logging

def run_command(command, description):
    """Run a shell command with error handling"""
    print(f"🚀 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def setup_environment():
    """Setup the development environment"""
    
    print("=" * 60)
    print("IT Laboratory Utilization Schedule System - Setup")
    print("=" * 60)
    
    # Check Python version
    if not run_command("python --version", "Checking Python version"):
        return False
    
    # Create virtual environment
    if not run_command("python -m venv venv", "Creating virtual environment"):
        return False
    
    # Install dependencies
    if sys.platform == "win32":
        # Windows
        pip_cmd = "venv\\Scripts\\pip"
        activate_cmd = "venv\\Scripts\\activate"
    else:
        # Unix/Linux/Mac
        pip_cmd = "venv/bin/pip"
        activate_cmd = "source venv/bin/activate"
    
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Initialize database
    if not run_command(f"{pip_cmd} install flask-migrate", "Installing Flask-Migrate"):
        return False
    
    # Set Flask app environment variable
    os.environ['FLASK_APP'] = 'run.py'
    
    # Initialize database migrations
    if not run_command("flask db init", "Initializing database migrations"):
        return False
    
    if not run_command("flask db migrate -m \"Initial migration\"", "Creating initial migration"):
        return False
    
    if not run_command("flask db upgrade", "Applying database migration"):
        return False
    
    print("\n" + "=" * 60)
    print("✅ Setup completed successfully!")
    print("=" * 60)
    print("\nTo start the application:")
    print(f"1. Activate virtual environment: {activate_cmd}")
    print("2. Run: python run.py")
    print("\nThe application will be available at: http://localhost:5000")
    print("\nDefault login credentials:")
    print("Admin: admin / admin123")
    print("Instructor: inst1 / inst123")
    print("Student: student1 / student123")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    if setup_environment():
        sys.exit(0)
    else:
        sys.exit(1)