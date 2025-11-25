#!/usr/bin/env python3
"""
Manual database setup for IT Laboratory Utilization Schedule System
"""

import os
import sys
from app import create_app, db
from app.models import User, Instructor, Student, Laboratory, Reservation, Notification

def create_database():
    """Create database tables and sample data"""
    
    print("🚀 Setting up database...")
    
    # Create app instance
    app = create_app('development')
    
    with app.app_context():
        try:
            # Create all tables
            print("📁 Creating database tables...")
            db.create_all()
            print("✅ Tables created successfully!")
            
            # Create sample data
            print("📝 Creating sample data...")
            create_sample_data()
            print("✅ Sample data created successfully!")
            
            print("\n🎉 Database setup completed!")
            print("\n📋 Sample accounts created:")
            print("   Admin: username='admin' password='admin123'")
            print("   Instructor: username='inst1' password='inst123'")
            print("   Student: username='student1' password='student123'")
            
        except Exception as e:
            print(f"❌ Error during database setup: {str(e)}")
            sys.exit(1)

def create_sample_data():
    """Create sample data for testing"""
    
    # Check if admin already exists
    if User.query.filter_by(username='admin').first():
        print("⚠️  Sample data already exists. Skipping...")
        return
    
    # Create admin user
    admin = User(
        username='admin',
        email='admin@university.edu',
        user_type='admin'
    )
    admin.set_password('admin123')
    db.session.add(admin)
    
    # Create instructor user
    instructor_user = User(
        username='inst1',
        email='instructor@university.edu',
        user_type='instructor'
    )
    instructor_user.set_password('inst123')
    db.session.add(instructor_user)
    
    # Create instructor profile
    instructor = Instructor(
        user=instructor_user,
        full_name='Dr. John Smith',
        department='Computer Science',
        phone='+1-555-0101'
    )
    db.session.add(instructor)
    
    # Create student user
    student_user = User(
        username='student1',
        email='student@university.edu',
        user_type='student'
    )
    student_user.set_password('student123')
    db.session.add(student_user)
    
    # Create student profile
    student = Student(
        user=student_user,
        full_name='Jane Doe',
        student_id='20240001',
        course_section='CS-101-A'
    )
    db.session.add(student)
    
    # Create laboratories
    labs = [
        Laboratory(
            name='Computer Lab 1',
            room_number='CL-101',
            capacity=30,
            equipment='30 PCs, Projector, Whiteboard',
            is_active=True
        ),
        Laboratory(
            name='Networking Lab',
            room_number='NL-201',
            capacity=20,
            equipment='Cisco Routers, Switches, Patch Panels',
            is_active=True
        ),
        Laboratory(
            name='Software Development Lab',
            room_number='SL-301',
            capacity=25,
            equipment='25 PCs, Development Tools, IDEs',
            is_active=True
        ),
        Laboratory(
            name='Hardware Lab',
            room_number='HL-401',
            capacity=15,
            equipment='Electronic Components, Oscilloscopes',
            is_active=True
        )
    ]
    
    for lab in labs:
        db.session.add(lab)
    
    # Commit all changes
    db.session.commit()

if __name__ == '__main__':
    create_database()