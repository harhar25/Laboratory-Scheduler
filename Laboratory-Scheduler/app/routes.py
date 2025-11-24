from flask import Blueprint, render_template, jsonify, request, flash, redirect, url_for
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from app import db
from app.models import User, Laboratory, Reservation, Instructor, Student, Notification
from app.forms import ReservationForm, LaboratoryForm, InstructorForm

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/dashboard')
@login_required
def dashboard():
    if current_user.user_type == 'admin':
        total_labs = Laboratory.query.count()
        total_sessions = Reservation.query.filter_by(status='approved').count()
        pending_requests = Reservation.query.filter_by(status='pending').count()
        
        return render_template('dashboard/admin.html',
                             total_labs=total_labs,
                             total_sessions=total_sessions,
                             pending_requests=pending_requests)
    
    elif current_user.user_type == 'instructor':
        upcoming_sessions = Reservation.query.filter_by(
            instructor_id=current_user.instructor_profile.id,
            status='approved'
        ).filter(Reservation.start_time >= datetime.now()).order_by(Reservation.start_time).limit(5).all()
        
        return render_template('dashboard/instructor.html',
                             upcoming_sessions=upcoming_sessions)
    
    elif current_user.user_type == 'student':
        return render_template('dashboard/student.html')

@main_bp.route('/schedule')
@login_required
def schedule():
    labs = Laboratory.query.filter_by(is_active=True).all()
    return render_template('schedule/calendar.html', labs=labs)

@main_bp.route('/api/schedule')
@login_required
def api_schedule():
    lab_id = request.args.get('lab_id')
    date_str = request.args.get('date')
    
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d') if date_str else datetime.now()
    except:
        date = datetime.now()
    
    start_of_week = date - timedelta(days=date.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    query = Reservation.query.filter(
        Reservation.start_time >= start_of_week,
        Reservation.end_time <= end_of_week,
        Reservation.status == 'approved'
    )
    
    if lab_id and lab_id != 'all':
        query = query.filter_by(lab_id=lab_id)
    
    reservations = query.all()
    
    schedule_data = []
    for res in reservations:
        schedule_data.append({
            'id': res.id,
            'title': f"{res.course_name} - {res.section}",
            'start': res.start_time.isoformat(),
            'end': res.end_time.isoformat(),
            'instructor': res.instructor.full_name,
            'lab': res.laboratory.name,
            'status': res.status
        })
    
    return jsonify(schedule_data)

@main_bp.route('/reservation/request', methods=['GET', 'POST'])
@login_required
def reservation_request():
    if current_user.user_type != 'instructor':
        flash('Only instructors can make reservations.', 'warning')
        return redirect(url_for('main.dashboard'))
    
    form = ReservationForm()
    form.lab_id.choices = [(lab.id, f"{lab.name} ({lab.room_number})") 
                           for lab in Laboratory.query.filter_by(is_active=True).all()]
    
    if form.validate_on_submit():
        # Check for conflicts
        conflict = Reservation.query.filter(
            Reservation.lab_id == form.lab_id.data,
            Reservation.status.in_(['pending', 'approved']),
            Reservation.start_time < form.end_time.data,
            Reservation.end_time > form.start_time.data
        ).first()
        
        if conflict:
            flash('There is a scheduling conflict with an existing reservation.', 'danger')
            return render_template('reservation/request.html', form=form)
        
        reservation = Reservation(
            instructor_id=current_user.instructor_profile.id,
            lab_id=form.lab_id.data,
            course_name=form.course_name.data,
            section=form.section.data,
            start_time=form.start_time.data,
            end_time=form.end_time.data,
            notes=form.notes.data
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        flash('Reservation request submitted successfully!', 'success')
        return redirect(url_for('main.dashboard'))
    
    return render_template('reservation/request.html', form=form)

@main_bp.route('/admin/requests')
@login_required
def admin_requests():
    if current_user.user_type != 'admin':
        flash('Access denied.', 'danger')
        return redirect(url_for('main.dashboard'))
    
    pending_requests = Reservation.query.filter_by(status='pending').all()
    return render_template('management/requests.html', requests=pending_requests)

@main_bp.route('/admin/approve_request/<int:request_id>')
@login_required
def approve_request(request_id):
    if current_user.user_type != 'admin':
        return jsonify({'success': False, 'message': 'Access denied'})
    
    reservation = Reservation.query.get_or_404(request_id)
    reservation.status = 'approved'
    
    # Create notification for instructor
    notification = Notification(
        user_id=reservation.instructor.user_id,
        reservation_id=reservation.id,
        title='Reservation Approved',
        message=f'Your reservation for {reservation.laboratory.name} has been approved.'
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'success': True})

@main_bp.route('/admin/reject_request/<int:request_id>')
@login_required
def reject_request(request_id):
    if current_user.user_type != 'admin':
        return jsonify({'success': False, 'message': 'Access denied'})
    
    reservation = Reservation.query.get_or_404(request_id)
    reservation.status = 'rejected'
    
    # Create notification for instructor
    notification = Notification(
        user_id=reservation.instructor.user_id,
        reservation_id=reservation.id,
        title='Reservation Rejected',
        message=f'Your reservation for {reservation.laboratory.name} has been rejected.'
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'success': True})

@main_bp.route('/notifications')
@login_required
def notifications():
    user_notifications = Notification.query.filter_by(
        user_id=current_user.id
    ).order_by(Notification.created_at.desc()).limit(10).all()
    
    return render_template('components/notifications.html', notifications=user_notifications)

@main_bp.route('/notifications/mark_read/<int:notification_id>')
@login_required
def mark_notification_read(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    if notification.user_id != current_user.id:
        return jsonify({'success': False})
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'success': True})