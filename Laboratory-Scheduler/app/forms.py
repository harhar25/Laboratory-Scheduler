from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, TextAreaField, DateTimeField, BooleanField
from wtforms.validators import DataRequired, Email, Length, EqualTo
from datetime import datetime

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')

class ForgotPasswordForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])

class ReservationForm(FlaskForm):
    lab_id = SelectField('Laboratory', coerce=int, validators=[DataRequired()])
    course_name = StringField('Course/Subject', validators=[DataRequired(), Length(max=100)])
    section = StringField('Section', validators=[DataRequired(), Length(max=50)])
    start_time = DateTimeField('Start Time', format='%Y-%m-%d %H:%M', validators=[DataRequired()])
    end_time = DateTimeField('End Time', format='%Y-%m-%d %H:%M', validators=[DataRequired()])
    notes = TextAreaField('Notes')

class LaboratoryForm(FlaskForm):
    name = StringField('Laboratory Name', validators=[DataRequired(), Length(max=100)])
    room_number = StringField('Room Number', validators=[DataRequired(), Length(max=20)])
    capacity = StringField('Capacity', validators=[DataRequired()])
    equipment = TextAreaField('Equipment')

class InstructorForm(FlaskForm):
    full_name = StringField('Full Name', validators=[DataRequired(), Length(max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    department = StringField('Department', validators=[Length(max=100)])
    phone = StringField('Phone', validators=[Length(max=20)])