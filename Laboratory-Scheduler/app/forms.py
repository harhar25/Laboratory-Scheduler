from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, TextAreaField, DateTimeField, BooleanField, SubmitField, IntegerField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from datetime import datetime, time
from app.models import User

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(max=80)])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Login')

class ForgotPasswordForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Send Reset Instructions')

class ResetPasswordForm(FlaskForm):
    password = PasswordField('New Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm New Password', 
                                   validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Reset Password')

class ReservationForm(FlaskForm):
    lab_id = SelectField('Laboratory', coerce=int, validators=[DataRequired()])
    course_name = StringField('Course/Subject', validators=[DataRequired(), Length(max=100)])
    section = StringField('Section', validators=[DataRequired(), Length(max=50)])
    start_time = DateTimeField('Start Time', format='%Y-%m-%d %H:%M', validators=[DataRequired()])
    end_time = DateTimeField('End Time', format='%Y-%m-%d %H:%M', validators=[DataRequired()])
    notes = TextAreaField('Notes')
    submit = SubmitField('Submit Request')
    reset = SubmitField('Reset')

    def validate_end_time(self, field):
        if self.start_time.data and field.data:
            if field.data <= self.start_time.data:
                raise ValidationError('End time must be after start time.')
            
            duration = field.data - self.start_time.data
            if duration.total_seconds() < 1800:  # 30 minutes
                raise ValidationError('Minimum reservation duration is 30 minutes.')
            if duration.total_seconds() > 86400:  # 24 hours
                raise ValidationError('Maximum reservation duration is 24 hours.')

class LaboratoryForm(FlaskForm):
    name = StringField('Laboratory Name', validators=[DataRequired(), Length(max=100)])
    room_number = StringField('Room Number', validators=[DataRequired(), Length(max=20)])
    capacity = IntegerField('Capacity', validators=[DataRequired()])
    equipment = TextAreaField('Equipment')
    is_active = BooleanField('Active', default=True)
    submit = SubmitField('Save Laboratory')

class InstructorForm(FlaskForm):
    full_name = StringField('Full Name', validators=[DataRequired(), Length(max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    department = StringField('Department', validators=[Length(max=100)])
    phone = StringField('Phone', validators=[Length(max=20)])
    username = StringField('Username', validators=[DataRequired(), Length(max=80)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Add Instructor')

    def validate_username(self, field):
        user = User.query.filter_by(username=field.data).first()
        if user:
            raise ValidationError('Username already exists. Please choose a different one.')

    def validate_email(self, field):
        user = User.query.filter_by(email=field.data).first()
        if user:
            raise ValidationError('Email already exists. Please use a different one.')

class ReportForm(FlaskForm):
    report_type = SelectField('Report Type', choices=[
        ('monthly_usage', 'Monthly Lab Usage'),
        ('instructor_usage', 'Instructor Usage Summary'),
        ('peak_hours', 'Peak Hours Analysis')
    ], validators=[DataRequired()])
    start_date = DateTimeField('Start Date', format='%Y-%m-%d')
    end_date = DateTimeField('End Date', format='%Y-%m-%d')
    submit = SubmitField('Generate Report')