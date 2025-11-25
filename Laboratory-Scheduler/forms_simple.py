from wtforms import StringField, PasswordField, SelectField, TextAreaField, DateTimeField, BooleanField, SubmitField, IntegerField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from datetime import datetime
from app.models import User

class LoginForm:
    def __init__(self):
        self.username = StringField('Username', validators=[DataRequired()])
        self.password = PasswordField('Password', validators=[DataRequired()])
        self.remember_me = BooleanField('Remember Me')
        self.submit = SubmitField('Login')

class ForgotPasswordForm:
    def __init__(self):
        self.email = StringField('Email', validators=[DataRequired(), Email()])
        self.submit = SubmitField('Send Reset Instructions')

class ResetPasswordForm:
    def __init__(self):
        self.password = PasswordField('New Password', validators=[DataRequired(), Length(min=6)])
        self.confirm_password = PasswordField('Confirm New Password', 
                                           validators=[DataRequired(), EqualTo('password')])
        self.submit = SubmitField('Reset Password')

class ReservationForm:
    def __init__(self):
        self.lab_id = SelectField('Laboratory', coerce=int, validators=[DataRequired()])
        self.course_name = StringField('Course/Subject', validators=[DataRequired(), Length(max=100)])
        self.section = StringField('Section', validators=[DataRequired(), Length(max=50)])
        self.start_time = DateTimeField('Start Time', format='%Y-%m-%d %H:%M', validators=[DataRequired()])
        self.end_time = DateTimeField('End Time', format='%Y-%m-%d %H:%M', validators=[DataRequired()])
        self.notes = TextAreaField('Notes')
        self.submit = SubmitField('Submit Request')
        self.reset = SubmitField('Reset')

class LaboratoryForm:
    def __init__(self):
        self.name = StringField('Laboratory Name', validators=[DataRequired(), Length(max=100)])
        self.room_number = StringField('Room Number', validators=[DataRequired(), Length(max=20)])
        self.capacity = IntegerField('Capacity', validators=[DataRequired()])
        self.equipment = TextAreaField('Equipment')
        self.is_active = BooleanField('Active', default=True)
        self.submit = SubmitField('Save Laboratory')

class InstructorForm:
    def __init__(self):
        self.full_name = StringField('Full Name', validators=[DataRequired(), Length(max=100)])
        self.email = StringField('Email', validators=[DataRequired(), Email()])
        self.department = StringField('Department', validators=[Length(max=100)])
        self.phone = StringField('Phone', validators=[Length(max=20)])
        self.username = StringField('Username', validators=[DataRequired(), Length(max=80)])
        self.password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
        self.submit = SubmitField('Add Instructor')

class ReportForm:
    def __init__(self):
        self.report_type = SelectField('Report Type', choices=[
            ('monthly_usage', 'Monthly Lab Usage'),
            ('instructor_usage', 'Instructor Usage Summary'),
            ('peak_hours', 'Peak Hours Analysis')
        ], validators=[DataRequired()])
        self.start_date = DateTimeField('Start Date', format='%Y-%m-%d')
        self.end_date = DateTimeField('End Date', format='%Y-%m-%d')
        self.submit = SubmitField('Generate Report')