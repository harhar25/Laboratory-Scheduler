#!/usr/bin/env python3
"""
IT Laboratory Utilization Schedule System - Simplified Runner
"""

import os
import sys
from app import create_app, db

def main():
    """Main application entry point"""
    
    # Set default configuration
    config_name = os.getenv('FLASK_ENV', 'development')
    
    print(f"🚀 Starting IT Laboratory Schedule System in {config_name} mode...")
    
    try:
        # Create app instance
        app = create_app(config_name)
        
        # Get host and port from environment or use defaults
        host = os.getenv('FLASK_HOST', '127.0.0.1')
        port = int(os.getenv('FLASK_PORT', 5000))
        debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        
        print(f"🌐 Server will start on: http://{host}:{port}")
        print(f"🐛 Debug mode: {debug}")
        print("📋 Available routes:")
        
        # Print available routes
        with app.app_context():
            for rule in app.url_map.iter_rules():
                if 'static' not in rule.endpoint:
                    methods = ','.join(rule.methods)
                    print(f"   {rule.endpoint:30} {methods:20} {rule.rule}")
        
        print("\n🎉 Application started successfully!")
        print("👤 Demo accounts:")
        print("   Admin:      username='admin'    password='admin123'")
        print("   Instructor: username='inst1'    password='inst123'")
        print("   Student:    username='student1' password='student123'")
        print("\n⏹️  Press Ctrl+C to stop the server")
        
        # Run application
        app.run(
            host=host,
            port=port,
            debug=debug,
            threaded=True
        )
        
    except Exception as e:
        print(f"❌ Failed to start application: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()