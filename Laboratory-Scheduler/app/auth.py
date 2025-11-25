from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import db, login_manager
from app.models import User, Instructor, Student
# Remove Flask-WTF forms import and use manual form handling
# from app.forms import LoginForm, ForgotPasswordForm, ResetPasswordForm

auth_bp = Blueprint('auth', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect_user_by_type()
    
    # Use manual form handling instead of Flask-WTF
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        remember_me = bool(request.form.get('remember_me'))
        
        # Basic validation
        if not username or not password:
            flash('Please enter both username and password', 'danger')
        else:
            user = User.query.filter_by(username=username).first()
            
            if user and user.check_password(password):
                login_user(user, remember=remember_me)
                flash('Login successful!', 'success')
                return redirect_user_by_type()
            else:
                flash('Invalid username or password', 'danger')
    
    # For GET requests or failed POST, render the template
    # Create a simple form-like object for template compatibility
    class SimpleForm:
        def __init__(self):
            self.username = type('Field', (), {'data': ''})()
            self.password = type('Field', (), {'data': ''})()
            self.remember_me = type('Field', (), {'data': False})()
    
    form = SimpleForm()
    return render_template('login.html', form=form)

def redirect_user_by_type():
    next_page = request.args.get('next')
    if next_page:
        return redirect(next_page)
    
    if current_user.user_type == 'admin':
        return redirect(url_for('main.dashboard'))
    elif current_user.user_type == 'instructor':
        return redirect(url_for('main.dashboard'))
    elif current_user.user_type == 'student':
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('main.dashboard'))

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    # Manual form handling for forgot password
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        
        # Basic email validation
        if not email or '@' not in email:
            flash('Please enter a valid email address', 'danger')
        else:
            user = User.query.filter_by(email=email).first()
            if user:
                # In a real application, you would send an email with reset instructions
                # For now, we'll just show a message
                flash('If that email exists in our system, we have sent password reset instructions.', 'info')
            else:
                # Still show the same message for security
                flash('If that email exists in our system, we have sent password reset instructions.', 'info')
            return redirect(url_for('auth.login'))
    
    # For GET requests, render the template
    class SimpleForgotForm:
        def __init__(self):
            self.email = type('Field', (), {'data': ''})()
    
    form = SimpleForgotForm()
    return render_template('forgot_password.html', form=form)

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    # Manual form handling for reset password
    if request.method == 'POST':
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Basic validation
        if not password or not confirm_password:
            flash('Please fill in all fields', 'danger')
        elif len(password) < 6:
            flash('Password must be at least 6 characters long', 'danger')
        elif password != confirm_password:
            flash('Passwords do not match', 'danger')
        else:
            # In a real application, you would verify the token and update the user's password
            # For now, we'll just show a success message
            flash('Your password has been reset successfully!', 'success')
            return redirect(url_for('auth.login'))
    
    # For GET requests, render the template
    class SimpleResetForm:
        def __init__(self):
            self.password = type('Field', (), {'data': ''})()
            self.confirm_password = type('Field', (), {'data': ''})()
    
    form = SimpleResetForm()
    return render_template('reset_password.html', form=form)

# Additional authentication routes for API if needed
@auth_bp.route('/api/check-auth')
@login_required
def check_auth():
    """API endpoint to check if user is authenticated"""
    return jsonify({
        'authenticated': True,
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'user_type': current_user.user_type
        }
    })

@auth_bp.route('/api/user-info')
@login_required
def user_info():
    """API endpoint to get current user information"""
    user_data = {
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'user_type': current_user.user_type
    }
    
    # Add profile-specific information
    if current_user.user_type == 'instructor' and hasattr(current_user, 'instructor_profile'):
        user_data['full_name'] = current_user.instructor_profile.full_name
        user_data['department'] = current_user.instructor_profile.department
    elif current_user.user_type == 'student' and hasattr(current_user, 'student_profile'):
        user_data['full_name'] = current_user.student_profile.full_name
        user_data['student_id'] = current_user.student_profile.student_id
        user_data['course_section'] = current_user.student_profile.course_section
    
    return jsonify(user_data)