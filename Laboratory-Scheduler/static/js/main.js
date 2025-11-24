// Global JavaScript functions
document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Enable tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Enable popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Form validation enhancement
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
});

// AJAX helper functions
const ajaxHelper = {
    get: function(url, callback) {
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => console.error('Error:', error));
    },
    
    post: function(url, data, callback) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Error:', error));
    }
};

// Notification system
const notificationSystem = {
    markAsRead: function(notificationId) {
        fetch(`/notifications/mark_read/${notificationId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const notificationElement = document.getElementById(`notification-${notificationId}`);
                    if (notificationElement) {
                        notificationElement.classList.remove('unread');
                        notificationElement.classList.add('read');
                    }
                }
            });
    },
    
    getUnreadCount: function() {
        return document.querySelectorAll('.notification-item.unread').length;
    }
};

// Reservation management
const reservationManager = {
    approveRequest: function(requestId) {
        if (confirm('Are you sure you want to approve this request?')) {
            fetch(`/admin/approve_request/${requestId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error approving request: ' + data.message);
                    }
                });
        }
    },
    
    rejectRequest: function(requestId) {
        if (confirm('Are you sure you want to reject this request?')) {
            fetch(`/admin/reject_request/${requestId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error rejecting request: ' + data.message);
                    }
                });
        }
    }
};

// Responsive menu handler
function toggleMobileMenu() {
    const navbarCollapse = document.getElementById('navbarCollapse');
    navbarCollapse.classList.toggle('show');
}