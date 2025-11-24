from flask import Blueprint, render_template, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from app import db
from app.models import Reservation, Laboratory, Instructor
from sqlalchemy import func, extract

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports')
@login_required
def reports():
    if current_user.user_type != 'admin':
        flash('Access denied.', 'danger')
        return redirect(url_for('main.dashboard'))
    
    return render_template('reports/generate.html')

@reports_bp.route('/api/reports/monthly-usage')
@login_required
def monthly_usage_report():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    # Get data for the last 6 months
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    
    monthly_data = db.session.query(
        func.strftime('%Y-%m', Reservation.start_time).label('month'),
        func.count(Reservation.id).label('reservation_count')
    ).filter(
        Reservation.start_time >= start_date,
        Reservation.status == 'approved'
    ).group_by('month').all()
    
    return jsonify([{'month': data.month, 'count': data.reservation_count} for data in monthly_data])

@reports_bp.route('/api/reports/instructor-usage')
@login_required
def instructor_usage_report():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    instructor_data = db.session.query(
        Instructor.full_name,
        func.count(Reservation.id).label('reservation_count')
    ).join(Reservation).filter(
        Reservation.status == 'approved'
    ).group_by(Instructor.id).all()
    
    return jsonify([{'instructor': data.full_name, 'count': data.reservation_count} for data in instructor_data])

@reports_bp.route('/api/reports/peak-hours')
@login_required
def peak_hours_report():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    peak_data = db.session.query(
        extract('hour', Reservation.start_time).label('hour'),
        func.count(Reservation.id).label('reservation_count')
    ).filter(
        Reservation.status == 'approved'
    ).group_by('hour').all()
    
    return jsonify([{'hour': int(data.hour), 'count': data.reservation_count} for data in peak_data])