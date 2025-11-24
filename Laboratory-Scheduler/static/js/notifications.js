// Notifications System for IT Lab Schedule System
class NotificationSystem {
    constructor() {
        this.notificationCheckInterval = 30000; // Check every 30 seconds
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Mark all as read
        const markAllReadBtn = document.getElementById('markAllRead');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }

        // Refresh notifications
        const refreshBtn = document.getElementById('refreshNotifications');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadNotifications());
        }

        // Notification dropdown events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notificationItem = e.target.closest('.notification-item');
                const notificationId = notificationItem.dataset.notificationId;
                if (notificationId) {
                    this.markAsRead(notificationId);
                }
            }
        });

        // Real-time updates with EventSource if supported
        this.setupRealTimeUpdates();
    }

    setupRealTimeUpdates() {
        if (typeof EventSource !== 'undefined') {
            const eventSource = new EventSource('/api/notifications/stream');
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'new_notification') {
                    this.showNewNotification(data.notification);
                    this.updateUnreadCount(1);
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource failed:', error);
                eventSource.close();
            };
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            this.loadNotifications();
        }, this.notificationCheckInterval);
    }

    loadNotifications() {
        fetch('/api/notifications')
            .then(response => response.json())
            .then(data => {
                this.renderNotifications(data.notifications);
                this.updateUnreadCount(data.unread_count);
            })
            .catch(error => {
                console.error('Error loading notifications:', error);
            });
    }

    renderNotifications(notifications) {
        const notificationList = document.getElementById('notificationList');
        const dropdownList = document.querySelector('.notification-dropdown .notification-list');
        
        if (!notificationList && !dropdownList) return;

        const renderToElement = (element, notifications, isDropdown = false) => {
            if (notifications.length === 0) {
                element.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-bell-slash fa-2x mb-2"></i>
                        <p class="mb-0">No notifications</p>
                    </div>
                `;
                return;
            }

            let html = '';
            notifications.forEach((notification, index) => {
                const timeAgo = this.getTimeAgo(notification.created_at);
                const isUnread = !notification.is_read;
                
                html += `
                    <div class="notification-item ${isUnread ? 'unread' : 'read'} 
                         ${isDropdown ? 'dropdown-item' : 'list-group-item'}"
                         data-notification-id="${notification.id}">
                        <div class="d-flex w-100 justify-content-between">
                            <div class="flex-grow-1">
                                <h6 class="mb-1 ${isUnread ? 'fw-bold' : ''}">${notification.title}</h6>
                                <p class="mb-1">${notification.message}</p>
                                <small class="text-muted">${timeAgo}</small>
                            </div>
                            ${isUnread ? '<span class="badge bg-primary ms-2">New</span>' : ''}
                        </div>
                        ${!isDropdown ? `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="notificationSystem.markAsRead(${notification.id})">
                                Mark as Read
                            </button>
                            ${notification.reservation_id ? `
                            <a href="/reservation/details/${notification.reservation_id}" class="btn btn-sm btn-outline-secondary">
                                View Details
                            </a>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                    ${!isDropdown && index < notifications.length - 1 ? '<hr class="my-2">' : ''}
                `;
            });

            element.innerHTML = html;
        };

        if (notificationList) {
            renderToElement(notificationList, notifications, false);
        }

        if (dropdownList) {
            const dropdownNotifications = notifications.slice(0, 5); // Show only 5 in dropdown
            renderToElement(dropdownList, dropdownNotifications, true);
        }
    }

    markAsRead(notificationId) {
        fetch(`/notifications/mark_read/${notificationId}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.updateNotificationUI(notificationId);
                this.updateUnreadCount(-1);
                showToast('Success', 'Notification marked as read', 'success');
            }
        })
        .catch(error => {
            console.error('Error marking notification as read:', error);
            showToast('Error', 'Failed to mark notification as read', 'danger');
        });
    }

    markAllAsRead() {
        if (this.unreadCount === 0) {
            showToast('Info', 'No unread notifications', 'info');
            return;
        }

        if (!confirm('Mark all notifications as read?')) {
            return;
        }

        fetch('/notifications/mark_all_read', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                    item.classList.add('read');
                    item.querySelector('.fw-bold')?.classList.remove('fw-bold');
                    item.querySelector('.badge')?.remove();
                });
                
                this.unreadCount = 0;
                this.updateUnreadBadge();
                showToast('Success', 'All notifications marked as read', 'success');
            }
        })
        .catch(error => {
            console.error('Error marking all notifications as read:', error);
            showToast('Error', 'Failed to mark all notifications as read', 'danger');
        });
    }

    updateNotificationUI(notificationId) {
        const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationElement) {
            notificationElement.classList.remove('unread');
            notificationElement.classList.add('read');
            
            const badge = notificationElement.querySelector('.badge');
            if (badge) {
                badge.remove();
            }
            
            const title = notificationElement.querySelector('h6');
            if (title) {
                title.classList.remove('fw-bold');
            }
        }
    }

    updateUnreadCount(change = 0) {
        this.unreadCount = Math.max(0, this.unreadCount + change);
        this.updateUnreadBadge();
    }

    updateUnreadBadge() {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    showNewNotification(notification) {
        // Show desktop notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/static/images/logo.png',
                tag: 'lab-notification'
            });
        }

        // Show toast notification
        showToast(notification.title, notification.message, 'info');

        // Play sound if available
        this.playNotificationSound();

        // Update UI
        this.loadNotifications(); // Reload to get the latest
    }

    playNotificationSound() {
        // Create a simple notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                }
            });
        }
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Filter notifications by type
    filterNotifications(type) {
        const notifications = document.querySelectorAll('.notification-item');
        notifications.forEach(notification => {
            if (type === 'all') {
                notification.style.display = 'block';
            } else if (type === 'unread') {
                notification.style.display = notification.classList.contains('unread') ? 'block' : 'none';
            } else if (type === 'read') {
                notification.style.display = notification.classList.contains('read') ? 'block' : 'none';
            }
        });
    }

    // Search notifications
    searchNotifications(query) {
        const notifications = document.querySelectorAll('.notification-item');
        const searchTerm = query.toLowerCase();
        
        notifications.forEach(notification => {
            const text = notification.textContent.toLowerCase();
            notification.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    }

    // Export notifications
    exportNotifications(format = 'json') {
        fetch(`/api/notifications/export?format=${format}`)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `notifications-${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                showToast('Success', 'Notifications exported successfully', 'success');
            })
            .catch(error => {
                console.error('Error exporting notifications:', error);
                showToast('Error', 'Failed to export notifications', 'danger');
            });
    }
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', function() {
    window.notificationSystem = new NotificationSystem();
    
    // Request notification permission on user interaction
    document.addEventListener('click', function() {
        if ('Notification' in window && Notification.permission === 'default') {
            window.notificationSystem.requestNotificationPermission();
        }
    });
});

// Global notification functions
function markNotificationRead(notificationId) {
    if (window.notificationSystem) {
        window.notificationSystem.markAsRead(notificationId);
    }
}

function refreshNotifications() {
    if (window.notificationSystem) {
        window.notificationSystem.loadNotifications();
    }
}

function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
        fetch('/notifications/clear_all', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('notificationList').innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-bell-slash fa-2x mb-2"></i>
                        <p class="mb-0">No notifications</p>
                    </div>
                `;
                window.notificationSystem.updateUnreadCount(-window.notificationSystem.unreadCount);
                showToast('Success', 'All notifications cleared', 'success');
            }
        })
        .catch(error => {
            console.error('Error clearing notifications:', error);
            showToast('Error', 'Failed to clear notifications', 'danger');
        });
    }
}