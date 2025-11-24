from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import db, login_manager
from app.models import User, Instructor, Student
from app.forms import LoginForm, ForgotPasswordForm, ResetPasswordForm

auth_bp = Blueprint('auth', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect_user_by_type()
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            flash('Login successful!', 'success')
            return redirect_user_by_type()
        else:
            flash('Invalid username or password', 'danger')
    
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
    form = ForgotPasswordForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            # In a real application, you would send an email with reset instructions
            # For now, we'll just show a message
            flash('If that email exists in our system, we have sent password reset instructions.', 'info')
        else:
            # Still show the same message for security
            flash('If that email exists in our system, we have sent password reset instructions.', 'info')
        return redirect(url_for('auth.login'))
    
    return render_template('forgot_password.html', form=form)

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    # In a real application, you would verify the token
    form = ResetPasswordForm()
    if form.validate_on_submit():
        # Here you would find the user by token and update their password
        flash('Your password has been reset successfully!', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('reset_password.html', form=form)