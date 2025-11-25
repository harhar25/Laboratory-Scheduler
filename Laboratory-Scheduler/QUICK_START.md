# IT Laboratory Utilization Schedule System - Quick Start

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation

### Option 1: Automated Setup (Recommended)
```bash
python setup.py

Manual setup

# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/Linux/Mac:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 5. Run the application
python run.py