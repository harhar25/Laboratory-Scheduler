// Calendar functionality
class LabCalendar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentDate = new Date();
        this.selectedLab = 'all';
        this.events = [];
    }

    init() {
        this.renderCalendar();
        this.loadEvents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Lab filter
        const labFilter = document.getElementById('labFilter');
        if (labFilter) {
            labFilter.addEventListener('change', (e) => {
                this.selectedLab = e.target.value;
                this.loadEvents();
            });
        }

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
    }

    navigateWeek(direction) {
        this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        this.renderCalendar();
        this.loadEvents();
    }

    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
        this.loadEvents();
    }

    renderCalendar() {
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const dates = this.getWeekDates(startOfWeek);

        // Update calendar header
        this.updateCalendarHeader(dates);

        // Generate time slots
        this.generateTimeSlots(dates);
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
            <h4 class="mb-0">${monthYear}</h4>
            <small class="text-muted">${weekRange}</small>
        `;
    }

    generateTimeSlots(dates) {
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;

        let html = '';
        const timeSlots = this.generateTimeSlotArray();

        // Generate header with dates
        html += '<div class="calendar-row calendar-header">';
        html += '<div class="time-column"></div>';
        dates.forEach(date => {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            html += `<div class="day-column text-center">
                <div class="fw-bold">${dayName}</div>
                <div class="fs-5">${dayNumber}</div>
            </div>`;
        });
        html += '</div>';

        // Generate time slots
        timeSlots.forEach(timeSlot => {
            html += '<div class="calendar-row">';
            html += `<div class="time-column">${timeSlot}</div>`;
            
            dates.forEach(date => {
                const slotId = this.getSlotId(date, timeSlot);
                const eventsInSlot = this.getEventsInSlot(date, timeSlot);
                const statusClass = this.getSlotStatus(eventsInSlot);
                
                html += `<div class="day-column time-slot ${statusClass}" 
                            data-slot="${slotId}"
                            data-bs-toggle="popover"
                            data-bs-html="true"
                            data-bs-content="${this.getSlotPopoverContent(eventsInSlot)}">
                    ${this.getSlotContent(eventsInSlot)}
                </div>`;
            });
            
            html += '</div>';
        });

        calendarBody.innerHTML = html;
        this.initializePopovers();
    }

    generateTimeSlotArray() {
        const slots = [];
        for (let hour = 8; hour <= 19; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < 19) {
                slots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        return slots;
    }

    getSlotId(date, timeSlot) {
        return `${date.toISOString().split('T')[0]}-${timeSlot}`;
    }

    getEventsInSlot(date, timeSlot) {
        const [hour, minute] = timeSlot.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
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
        if (events.length === 1) return 'reserved';
        return 'conflict';
    }

    getSlotContent(events) {
        if (events.length === 0) return '';
        if (events.length === 1) {
            return `<small>${events[0].title.split(' - ')[0]}</small>`;
        }
        return `<small>${events.length} reservations</small>`;
    }

    getSlotPopoverContent(events) {
        if (events.length === 0) {
            return '<div class="text-success"><i class="fas fa-check-circle"></i> Available</div>';
        }

        let content = '';
        events.forEach(event => {
            content += `
                <div class="event-detail mb-2 p-2 border rounded">
                    <div class="fw-bold">${event.title}</div>
                    <div class="small">
                        <i class="fas fa-user"></i> ${event.instructor}<br>
                        <i class="fas fa-clock"></i> ${new Date(event.start).toLocaleTimeString()} - ${new Date(event.end).toLocaleTimeString()}<br>
                        <i class="fas fa-map-marker-alt"></i> ${event.lab}
                    </div>
                </div>
            `;
        });
        return content;
    }

    initializePopovers() {
        const popoverTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="popover"]')
        );
        popoverTriggerList.map(popoverTriggerEl => {
            return new bootstrap.Popover(popoverTriggerEl, {
                trigger: 'hover focus'
            });
        });
    }

    loadEvents() {
        const params = new URLSearchParams({
            lab_id: this.selectedLab,
            date: this.currentDate.toISOString().split('T')[0]
        });

        fetch(`/api/schedule?${params}`)
            .then(response => response.json())
            .then(events => {
                this.events = events;
                this.renderCalendar();
            })
            .catch(error => console.error('Error loading events:', error));
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('calendarBody')) {
        window.labCalendar = new LabCalendar('calendarContainer');
        window.labCalendar.init();
    }
});