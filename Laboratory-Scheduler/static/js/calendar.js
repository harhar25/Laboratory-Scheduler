// Calendar functionality for IT Lab Schedule System
class LabCalendar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentDate = new Date();
        this.selectedLab = 'all';
        this.events = [];
        this.timeSlots = this.generateTimeSlots();
        
        if (!this.container) {
            console.error('Calendar container not found:', containerId);
            return;
        }
        
        this.init();
    }

    init() {
        this.renderCalendar();
        this.loadEvents();
        this.setupEventListeners();
        this.setupFilters();
    }

    setupEventListeners() {
        // Date navigation
        const prevWeekBtn = document.getElementById('prevWeek');
        const nextWeekBtn = document.getElementById('nextWeek');
        const todayBtn = document.getElementById('todayBtn');

        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', () => this.navigateWeek(-1));
        }
        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', () => this.navigateWeek(1));
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', () => this.goToToday());
        }

        // Lab filter
        const labFilter = document.getElementById('labFilter');
        if (labFilter) {
            labFilter.addEventListener('change', (e) => {
                this.selectedLab = e.target.value;
                this.loadEvents();
            });
        }

        // Date picker
        const datePicker = document.getElementById('datePicker');
        if (datePicker) {
            datePicker.addEventListener('change', (e) => {
                this.currentDate = new Date(e.target.value);
                this.renderCalendar();
                this.loadEvents();
            });
        }

        // Instructor filter
        const instructorFilter = document.getElementById('instructorFilter');
        if (instructorFilter) {
            instructorFilter.addEventListener('change', () => {
                this.loadEvents();
            });
        }

        // Section filter
        const sectionFilter = document.getElementById('sectionFilter');
        if (sectionFilter) {
            sectionFilter.addEventListener('change', () => {
                this.loadEvents();
            });
        }
    }

    setupFilters() {
        // Set default values
        const datePicker = document.getElementById('datePicker');
        if (datePicker) {
            datePicker.value = this.currentDate.toISOString().split('T')[0];
        }
    }

    navigateWeek(direction) {
        this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        this.updateDatePicker();
        this.renderCalendar();
        this.loadEvents();
    }

    goToToday() {
        this.currentDate = new Date();
        this.updateDatePicker();
        this.renderCalendar();
        this.loadEvents();
    }

    updateDatePicker() {
        const datePicker = document.getElementById('datePicker');
        if (datePicker) {
            datePicker.value = this.currentDate.toISOString().split('T')[0];
        }
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 8; hour <= 19; hour++) {
            slots.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                hour: hour,
                minute: 0
            });
            if (hour < 19) {
                slots.push({
                    time: `${hour.toString().padStart(2, '0')}:30`,
                    hour: hour,
                    minute: 30
                });
            }
        }
        return slots;
    }

    renderCalendar() {
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const dates = this.getWeekDates(startOfWeek);

        this.updateCalendarHeader(dates);
        this.generateCalendarGrid(dates);
    }

    getStartOfWeek(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    getWeekDates(startDate) {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    updateCalendarHeader(dates) {
        const headerElement = document.getElementById('calendarHeader');
        if (!headerElement) return;

        const monthYear = dates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const weekRange = `${dates[0].toLocaleDateString()} - ${dates[6].toLocaleDateString()}`;

        headerElement.innerHTML = `
            <div class="d-flex align-items-center">
                <div>
                    <h4 class="mb-0">${monthYear}</h4>
                    <small class="text-muted">${weekRange}</small>
                </div>
            </div>
        `;
    }

    generateCalendarGrid(dates) {
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;

        let html = '';

        // Generate header with dates
        html += '<div class="calendar-row calendar-header sticky-top">';
        html += '<div class="time-column bg-light"></div>';
        dates.forEach(date => {
            const isToday = this.isToday(date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            html += `
                <div class="day-column text-center ${isToday ? 'today' : ''}">
                    <div class="fw-bold">${dayName}</div>
                    <div class="date-number ${isToday ? 'bg-primary text-white' : ''}">${dayNumber}</div>
                </div>
            `;
        });
        html += '</div>';

        // Generate time slots
        this.timeSlots.forEach(timeSlot => {
            html += '<div class="calendar-row">';
            html += `<div class="time-column">${timeSlot.time}</div>`;
            
            dates.forEach(date => {
                const slotEvents = this.getEventsInSlot(date, timeSlot);
                const statusClass = this.getSlotStatus(slotEvents);
                const eventDetails = this.getSlotEventDetails(slotEvents);
                
                html += `
                    <div class="day-column time-slot ${statusClass}" 
                         data-date="${date.toISOString().split('T')[0]}"
                         data-time="${timeSlot.time}"
                         data-bs-toggle="popover"
                         data-bs-html="true"
                         data-bs-content="${this.getSlotPopoverContent(slotEvents, date, timeSlot)}"
                         onclick="labCalendar.handleSlotClick(this)">
                        ${eventDetails}
                    </div>
                `;
            });
            
            html += '</div>';
        });

        calendarBody.innerHTML = html;
        this.initializePopovers();
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getEventsInSlot(date, timeSlot) {
        const slotStart = new Date(date);
        slotStart.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + 30);

        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return eventStart < slotEnd && eventEnd > slotStart;
        });
    }

    getSlotStatus(events) {
        if (events.length === 0) return 'available';
        if (events.length === 1) {
            return events[0].status === 'approved' ? 'reserved' : 'pending';
        }
        return 'conflict';
    }

    getSlotEventDetails(events) {
        if (events.length === 0) return '<div class="slot-content available"></div>';
        
        if (events.length === 1) {
            const event = events[0];
            return `
                <div class="slot-content reserved" style="border-left-color: ${event.color}">
                    <small class="event-title">${event.title.split(' - ')[0]}</small>
                    <small class="event-instructor">${event.instructor}</small>
                </div>
            `;
        }
        
        return `
            <div class="slot-content conflict">
                <small>${events.length} reservations</small>
            </div>
        `;
    }

    getSlotPopoverContent(events, date, timeSlot) {
        if (events.length === 0) {
            return `
                <div class="popover-content">
                    <div class="text-success mb-2">
                        <i class="fas fa-check-circle me-1"></i>Available
                    </div>
                    <small class="text-muted">
                        ${date.toLocaleDateString()} at ${timeSlot.time}
                    </small>
                </div>
            `;
        }

        let content = '';
        events.forEach((event, index) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const duration = (eventEnd - eventStart) / (1000 * 60 * 60); // hours
            
            content += `
                <div class="event-detail mb-3 p-2 border rounded ${index > 0 ? 'mt-2' : ''}">
                    <div class="fw-bold text-truncate">${event.title}</div>
                    <div class="small">
                        <div><i class="fas fa-user me-1"></i> ${event.instructor}</div>
                        <div><i class="fas fa-building me-1"></i> ${event.lab}</div>
                        <div><i class="fas fa-clock me-1"></i> ${eventStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${eventEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <div><i class="fas fa-hourglass me-1"></i> ${duration.toFixed(1)} hours</div>
                        <div>
                            <span class="badge bg-${event.status === 'approved' ? 'success' : 'warning'}">
                                ${event.status}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return `<div class="popover-content">${content}</div>`;
    }

    initializePopovers() {
        const popoverTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="popover"]')
        );
        popoverTriggerList.map(popoverTriggerEl => {
            return new bootstrap.Popover(popoverTriggerEl, {
                trigger: 'hover focus',
                placement: 'auto',
                container: 'body',
                html: true
            });
        });
    }

    handleSlotClick(slotElement) {
        const date = slotElement.getAttribute('data-date');
        const time = slotElement.getAttribute('data-time');
        
        // If user is instructor and slot is available, show reservation form
        if (slotElement.classList.contains('available') && window.currentUserType === 'instructor') {
            this.showReservationModal(date, time);
        } else {
            // Show slot details
            const popover = bootstrap.Popover.getInstance(slotElement);
            if (popover) {
                popover.show();
            }
        }
    }

    showReservationModal(date, time) {
        // This would open a modal for creating a new reservation
        // For now, redirect to reservation page with pre-filled data
        const reservationUrl = `/reservation/request?date=${date}&time=${time}`;
        window.location.href = reservationUrl;
    }

    loadEvents() {
        showLoading('Loading schedule...');
        
        const params = new URLSearchParams({
            lab_id: this.selectedLab,
            date: this.currentDate.toISOString().split('T')[0]
        });

        fetch(`/api/schedule?${params}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(events => {
                this.events = events;
                this.renderCalendar();
                hideLoading();
            })
            .catch(error => {
                console.error('Error loading events:', error);
                hideLoading();
                showToast('Error', 'Failed to load schedule data.', 'danger');
            });
    }

    // Mobile-specific methods
    generateMobileView() {
        if (!isMobile()) return;
        
        const mobileView = document.getElementById('mobileScheduleView');
        if (!mobileView) return;

        let html = '<div class="mobile-schedule">';
        
        const dates = this.getWeekDates(this.getStartOfWeek(this.currentDate));
        dates.forEach(date => {
            html += this.generateMobileDayView(date);
        });
        
        html += '</div>';
        mobileView.innerHTML = html;
    }

    generateMobileDayView(date) {
        const isToday = this.isToday(date);
        const dayEvents = this.getEventsForDay(date);
        
        let html = `
            <div class="mobile-day-card card mb-3 ${isToday ? 'border-primary' : ''}">
                <div class="card-header ${isToday ? 'bg-primary text-white' : 'bg-light'}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${date.toLocaleDateString('en-US', { weekday: 'long' })}</strong>
                            <div>${date.toLocaleDateString()}</div>
                        </div>
                        ${isToday ? '<span class="badge bg-light text-primary">Today</span>' : ''}
                    </div>
                </div>
                <div class="card-body">
        `;

        if (dayEvents.length === 0) {
            html += `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-calendar-times fa-2x mb-2"></i>
                    <p class="mb-0">No reservations</p>
                </div>
            `;
        } else {
            dayEvents.forEach(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                
                html += `
                    <div class="mobile-event-item border-start border-3 px-3 py-2 mb-2" 
                         style="border-left-color: ${event.color}">
                        <div class="fw-bold">${event.title}</div>
                        <small class="text-muted">
                            <i class="fas fa-building me-1"></i>${event.lab}<br>
                            <i class="fas fa-user me-1"></i>${event.instructor}<br>
                            <i class="fas fa-clock me-1"></i>${eventStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${eventEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </small>
                        <div class="mt-1">
                            <span class="badge bg-${event.status === 'approved' ? 'success' : 'warning'}">
                                ${event.status}
                            </span>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    getEventsForDay(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart >= startOfDay && eventStart <= endOfDay;
        });
    }

    // Export functionality
    exportSchedule(format = 'pdf') {
        const params = new URLSearchParams({
            lab_id: this.selectedLab,
            date: this.currentDate.toISOString().split('T')[0],
            format: format
        });

        showLoading('Generating export...');
        
        fetch(`/api/schedule/export?${params}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `lab-schedule-${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                hideLoading();
                showToast('Success', 'Schedule exported successfully!', 'success');
            })
            .catch(error => {
                hideLoading();
                showToast('Error', 'Failed to export schedule.', 'danger');
            });
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('calendarContainer')) {
        window.labCalendar = new LabCalendar('calendarContainer');
        
        // Set current user type for role-based features
        window.currentUserType = document.body.getAttribute('data-user-type') || 'student';
        
        // Initialize mobile view if needed
        if (isMobile()) {
            window.labCalendar.generateMobileView();
        }
    }
});

// Global calendar functions
function switchView(viewType) {
    const calendarView = document.getElementById('calendarView');
    const mobileView = document.getElementById('mobileScheduleView');
    
    if (viewType === 'mobile' && isMobile()) {
        if (calendarView) calendarView.style.display = 'none';
        if (mobileView) mobileView.style.display = 'block';
        window.labCalendar.generateMobileView();
    } else {
        if (calendarView) calendarView.style.display = 'block';
        if (mobileView) mobileView.style.display = 'none';
        window.labCalendar.renderCalendar();
    }
}

// Handle window resize for responsive design
window.addEventListener('resize', function() {
    if (window.labCalendar) {
        if (isMobile()) {
            switchView('mobile');
        } else {
            switchView('desktop');
        }
    }
});