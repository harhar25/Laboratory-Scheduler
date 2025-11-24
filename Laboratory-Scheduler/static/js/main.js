// Global JavaScript functions
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

function initializeApplication() {
    // Auto-dismiss alerts
    initializeAlerts();
    
    // Enable Bootstrap components
    initializeBootstrapComponents();
    
    // Form validation enhancement
    initializeFormValidation();
    
    // Notification system
    initializeNotificationSystem();
    
    // Mobile menu handler
    initializeMobileMenu();
}

function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

function initializeBootstrapComponents() {
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

    // Initialize modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        new bootstrap.Modal(modal);
    });
}

function initializeFormValidation() {
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
}

function initializeNotificationSystem() {
    // Mark notification as read when clicked
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            const notificationId = this.getAttribute('data-notification-id');
            if (notificationId) {
                markNotificationRead(notificationId);
            }
        });
    });
}

function initializeMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            const navbarCollapse = document.querySelector(target);
            navbarCollapse.classList.toggle('show');
        });
    }
}

// AJAX helper functions
const ajaxHelper = {
    get: function(url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => callback(data))
            .catch(error => {
                console.error('Error:', error);
                showToast('Error', 'An error occurred while fetching data.', 'danger');
            });
    },
    
    post: function(url, data, callback) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => callback(data))
        .catch(error => {
            console.error('Error:', error);
            showToast('Error', 'An error occurred while submitting data.', 'danger');
        });
    },
    
    put: function(url, data, callback) {
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error('Error:', error);
            showToast('Error', 'An error occurred while updating data.', 'danger');
        });
    },
    
    delete: function(url, callback) {
        fetch(url, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error('Error:', error);
            showToast('Error', 'An error occurred while deleting data.', 'danger');
        });
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
                        this.updateUnreadCount();
                    }
                }
            });
    },
    
    markAllAsRead: function() {
        fetch('/notifications/mark_all_read')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelectorAll('.notification-item.unread').forEach(item => {
                        item.classList.remove('unread');
                        item.classList.add('read');
                    });
                    this.updateUnreadCount();
                    showToast('Success', 'All notifications marked as read.', 'success');
                }
            });
    },
    
    updateUnreadCount: function() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    },
    
    getUnreadCount: function() {
        return document.querySelectorAll('.notification-item.unread').length;
    }
};

// Reservation management
const reservationManager = {
    approveRequest: function(requestId) {
        if (confirm('Are you sure you want to approve this reservation request?')) {
            showLoading('Approving request...');
            fetch(`/admin/approve_request/${requestId}`)
                .then(response => response.json())
                .then(data => {
                    hideLoading();
                    if (data.success) {
                        showToast('Success', 'Reservation approved successfully!', 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showToast('Error', data.message || 'Failed to approve request.', 'danger');
                    }
                })
                .catch(error => {
                    hideLoading();
                    showToast('Error', 'An error occurred while approving the request.', 'danger');
                });
        }
    },
    
    rejectRequest: function(requestId) {
        if (confirm('Are you sure you want to reject this reservation request?')) {
            showLoading('Rejecting request...');
            fetch(`/admin/reject_request/${requestId}`)
                .then(response => response.json())
                .then(data => {
                    hideLoading();
                    if (data.success) {
                        showToast('Success', 'Reservation rejected!', 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showToast('Error', data.message || 'Failed to reject request.', 'danger');
                    }
                })
                .catch(error => {
                    hideLoading();
                    showToast('Error', 'An error occurred while rejecting the request.', 'danger');
                });
        }
    },
    
    submitReservation: function(formData) {
        return new Promise((resolve, reject) => {
            showLoading('Submitting reservation request...');
            fetch('/reservation/request', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    return response.json();
                }
            })
            .then(data => {
                hideLoading();
                if (data && data.success) {
                    showToast('Success', 'Reservation request submitted successfully!', 'success');
                    resolve(data);
                } else if (data && data.errors) {
                    showFormErrors(data.errors);
                    reject(data);
                }
            })
            .catch(error => {
                hideLoading();
                showToast('Error', 'An error occurred while submitting the request.', 'danger');
                reject(error);
            });
        });
    }
};

// UI Helper functions
function showToast(title, message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-container');
    existingToasts.forEach(toast => toast.remove());
    
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.innerHTML = toastHtml;
    document.body.appendChild(toastContainer);
    
    const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toast.show();
    
    // Remove toast after it's hidden
    toastContainer.querySelector('.toast').addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}

function showLoading(message = 'Loading...') {
    // Remove existing loading overlays
    const existingOverlays = document.querySelectorAll('.loading-overlay');
    existingOverlays.forEach(overlay => overlay.remove());
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    
    const spinnerHtml = `
        <div class="text-center text-white">
            <div class="spinner-border mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mb-0">${message}</p>
        </div>
    `;
    
    overlay.innerHTML = spinnerHtml;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlays = document.querySelectorAll('.loading-overlay');
    overlays.forEach(overlay => overlay.remove());
}

function showFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
    });
    
    // Show new errors
    for (const field in errors) {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            input.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = errors[field].join(', ');
            input.parentNode.appendChild(feedback);
        }
    }
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Mobile responsive helpers
function isMobile() {
    return window.innerWidth <= 768;
}

function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isDesktop() {
    return window.innerWidth > 1024;
}

// Export functions for global use
window.ajaxHelper = ajaxHelper;
window.notificationSystem = notificationSystem;
window.reservationManager = reservationManager;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatDateTime = formatDateTime;
window.formatTime = formatTime;

// Global event listeners
document.addEventListener('click', function(e) {
    // Handle notification clicks
    if (e.target.closest('.notification-item')) {
        const notificationItem = e.target.closest('.notification-item');
        const notificationId = notificationItem.getAttribute('data-notification-id');
        if (notificationId) {
            notificationSystem.markAsRead(notificationId);
        }
    }
    
    // Handle mark all as read
    if (e.target.closest('#mark-all-read')) {
        e.preventDefault();
        notificationSystem.markAllAsRead();
    }
});

// Responsive layout adjustments
window.addEventListener('resize', function() {
    if (isMobile()) {
        document.body.classList.add('mobile-view');
        document.body.classList.remove('tablet-view', 'desktop-view');
    } else if (isTablet()) {
        document.body.classList.add('tablet-view');
        document.body.classList.remove('mobile-view', 'desktop-view');
    } else {
        document.body.classList.add('desktop-view');
        document.body.classList.remove('mobile-view', 'tablet-view');
    }
});

// Initialize responsive classes
window.dispatchEvent(new Event('resize'));