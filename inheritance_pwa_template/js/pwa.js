// PWA (Progressive Web App) functionality
class PWA {
    constructor() {
        this.deferredPrompt = null;
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.dismissBtn = document.getElementById('dismissBtn');
        
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.checkForUpdates();
    }
    
    // Register service worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
    
    // Setup install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show install prompt after a delay
            setTimeout(() => {
                this.showInstallPrompt();
            }, 3000);
        });
        
        // Handle install button click
        if (this.installBtn) {
            this.installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }
        
        // Handle dismiss button click
        if (this.dismissBtn) {
            this.dismissBtn.addEventListener('click', () => {
                this.hideInstallPrompt();
            });
        }
    }
    
    // Show install prompt
    showInstallPrompt() {
        if (this.installPrompt && this.deferredPrompt) {
            this.installPrompt.style.display = 'block';
        }
    }
    
    // Hide install prompt
    hideInstallPrompt() {
        if (this.installPrompt) {
            this.installPrompt.style.display = 'none';
        }
    }
    
    // Install app
    installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                this.deferredPrompt = null;
                this.hideInstallPrompt();
            });
        }
    }
    
    // Show update notification
    showUpdateNotification() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Update Available', {
                    body: 'A new version of Islamic Inheritance Calculator is available.',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png',
                    tag: 'update-notification',
                    actions: [
                        {
                            action: 'update',
                            title: 'Update Now'
                        },
                        {
                            action: 'dismiss',
                            title: 'Later'
                        }
                    ]
                });
            });
        }
    }
    
    // Check for updates
    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
            });
        }
    }
    
    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                }
            });
        }
    }
    
    // Send notification
    sendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png'
            });
        }
    }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PWA();
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('App is online');
    // You can show a notification or update UI
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    // You can show a notification or update UI
});

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App is in background');
    } else {
        console.log('App is in foreground');
    }
}); 