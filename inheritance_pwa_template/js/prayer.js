// Prayer Times & Qibla Direction App
class PrayerTimesApp {
    constructor() {
        this.currentLocation = null;
        this.prayerTimes = null;
        this.nextPrayer = null;
        this.qiblaDirection = null;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkOnlineStatus();
        this.loadCachedData();
        this.startPrayerTimer();
        
        // Try to get user's location on load
        this.getUserLocation();
    }

    setupEventListeners() {
        // Location buttons
        document.getElementById('getLocation')?.addEventListener('click', () => this.getUserLocation());
        document.getElementById('updateTimes')?.addEventListener('click', () => this.updatePrayerTimes());
        
        // Qibla calibration
        document.getElementById('calibrateQibla')?.addEventListener('click', () => this.calibrateQibla());
        
        // Settings changes
        document.getElementById('calculationMethod')?.addEventListener('change', () => this.updatePrayerTimes());
        document.getElementById('asrMethod')?.addEventListener('change', () => this.updatePrayerTimes());
        
        // Reminder settings
        document.getElementById('enableReminders')?.addEventListener('change', (e) => this.toggleReminders(e.target.checked));
        
        // Online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    async getUserLocation() {
        const statusDiv = document.getElementById('locationStatus');
        
        if (!navigator.geolocation) {
            this.showStatus('Geolocation is not supported by this browser.', 'error');
            return;
        }

        this.showStatus('Getting your location...', 'loading');

        try {
            const position = await this.getCurrentPosition();
            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            this.showStatus('Location obtained successfully!', 'success');
            this.updatePrayerTimes();
            this.calculateQiblaDirection();
            
        } catch (error) {
            console.error('Error getting location:', error);
            this.showStatus('Could not get your location. Please enter manually.', 'error');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    async updatePrayerTimes() {
        if (!this.currentLocation) {
            const city = document.getElementById('city')?.value;
            const country = document.getElementById('country')?.value;
            
            if (!city || !country) {
                this.showStatus('Please enter your location or use GPS.', 'error');
                return;
            }
            
            // For demo purposes, use default coordinates
            this.currentLocation = { latitude: 33.6844, longitude: 73.0479 }; // Islamabad
        }

        try {
            const method = document.getElementById('calculationMethod')?.value || 'MWL';
            const asrMethod = document.getElementById('asrMethod')?.value || 'Standard';
            
            // In a real app, you would call a prayer times API
            // For demo, we'll use simulated data
            this.prayerTimes = await this.fetchPrayerTimes(
                this.currentLocation.latitude,
                this.currentLocation.longitude,
                method,
                asrMethod
            );
            
            this.displayPrayerTimes();
            this.calculateNextPrayer();
            this.cachePrayerTimes();
            
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            this.showStatus('Could not fetch prayer times. Using cached data.', 'error');
            this.loadCachedData();
        }
    }

    async fetchPrayerTimes(lat, lng, method, asrMethod) {
        // Simulated prayer times API call
        // In production, use a real API like:
        // https://aladhan.com/prayer-times-api
        // or https://api.aladhan.com/v1/timingsByCity
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return simulated prayer times
        return {
            date: dateStr,
            fajr: '05:30',
            sunrise: '07:15',
            dhuhr: '12:30',
            asr: '15:45',
            maghrib: '18:20',
            isha: '19:45',
            method: method,
            asrMethod: asrMethod
        };
    }

    displayPrayerTimes() {
        if (!this.prayerTimes) return;
        
        document.getElementById('fajr').textContent = this.prayerTimes.fajr;
        document.getElementById('sunrise').textContent = this.prayerTimes.sunrise;
        document.getElementById('dhuhr').textContent = this.prayerTimes.dhuhr;
        document.getElementById('asr').textContent = this.prayerTimes.asr;
        document.getElementById('maghrib').textContent = this.prayerTimes.maghrib;
        document.getElementById('isha').textContent = this.prayerTimes.isha;
    }

    calculateNextPrayer() {
        if (!this.prayerTimes) return;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayers = [
            { name: 'Fajr', time: this.prayerTimes.fajr },
            { name: 'Sunrise', time: this.prayerTimes.sunrise },
            { name: 'Dhuhr', time: this.prayerTimes.dhuhr },
            { name: 'Asr', time: this.prayerTimes.asr },
            { name: 'Maghrib', time: this.prayerTimes.maghrib },
            { name: 'Isha', time: this.prayerTimes.isha }
        ];
        
        let nextPrayer = null;
        let minDiff = Infinity;
        
        prayers.forEach(prayer => {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;
            let diff = prayerMinutes - currentTime;
            
            if (diff <= 0) {
                diff += 24 * 60; // Next day
            }
            
            if (diff < minDiff) {
                minDiff = diff;
                nextPrayer = prayer;
            }
        });
        
        this.nextPrayer = nextPrayer;
        this.updateNextPrayerDisplay();
    }

    updateNextPrayerDisplay() {
        if (!this.nextPrayer) return;
        
        const nextPrayerDiv = document.getElementById('nextPrayer');
        const timeUntilDiv = document.getElementById('timeUntil');
        
        if (nextPrayerDiv && timeUntilDiv) {
            nextPrayerDiv.textContent = this.nextPrayer.name;
            
            const now = new Date();
            const [hours, minutes] = this.nextPrayer.time.split(':').map(Number);
            const prayerTime = new Date(now);
            prayerTime.setHours(hours, minutes, 0, 0);
            
            if (prayerTime <= now) {
                prayerTime.setDate(prayerTime.getDate() + 1);
            }
            
            const diff = prayerTime - now;
            const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
            const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            timeUntilDiv.textContent = `${hoursLeft}h ${minutesLeft}m`;
        }
    }

    calculateQiblaDirection() {
        if (!this.currentLocation) return;
        
        // Qibla coordinates (Kaaba in Makkah)
        const qiblaLat = 21.4225;
        const qiblaLng = 39.8262;
        
        const lat1 = this.currentLocation.latitude * Math.PI / 180;
        const lat2 = qiblaLat * Math.PI / 180;
        const lng1 = this.currentLocation.longitude * Math.PI / 180;
        const lng2 = qiblaLng * Math.PI / 180;
        
        const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
        
        let qiblaAngle = Math.atan2(y, x) * 180 / Math.PI;
        qiblaAngle = (qiblaAngle + 360) % 360;
        
        this.qiblaDirection = qiblaAngle;
        this.updateQiblaDisplay();
    }

    updateQiblaDisplay() {
        if (!this.qiblaDirection) return;
        
        const arrow = document.getElementById('qiblaArrow');
        const directionText = document.getElementById('qiblaDirection');
        const distanceText = document.getElementById('qiblaDistance');
        
        if (arrow) {
            arrow.style.transform = `rotate(${this.qiblaDirection}deg)`;
        }
        
        if (directionText) {
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const index = Math.round(this.qiblaDirection / 45) % 8;
            directionText.textContent = `${Math.round(this.qiblaDirection)}° ${directions[index]}`;
        }
        
        if (distanceText && this.currentLocation) {
            const distance = this.calculateDistance(
                this.currentLocation.latitude,
                this.currentLocation.longitude,
                21.4225, // Qibla lat
                39.8262  // Qibla lng
            );
            distanceText.textContent = `${Math.round(distance)} km`;
        }
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    calibrateQibla() {
        if ('DeviceOrientationEvent' in window) {
            this.showStatus('Please rotate your device to calibrate the compass.', 'info');
            
            const handleOrientation = (event) => {
                if (event.webkitCompassHeading) {
                    const heading = event.webkitCompassHeading;
                    this.updateQiblaWithCompass(heading);
                }
            };
            
            window.addEventListener('deviceorientation', handleOrientation, true);
            
            // Remove listener after 10 seconds
            setTimeout(() => {
                window.removeEventListener('deviceorientation', handleOrientation, true);
                this.showStatus('Compass calibration complete.', 'success');
            }, 10000);
        } else {
            this.showStatus('Compass not available on this device.', 'error');
        }
    }

    updateQiblaWithCompass(heading) {
        if (this.qiblaDirection) {
            const adjustedAngle = this.qiblaDirection - heading;
            const arrow = document.getElementById('qiblaArrow');
            if (arrow) {
                arrow.style.transform = `rotate(${adjustedAngle}deg)`;
            }
        }
    }

    toggleReminders(enabled) {
        if (enabled) {
            this.requestNotificationPermission();
        } else {
            // Clear existing reminders
            if ('serviceWorker' in navigator && 'Notification' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.getNotifications().then(notifications => {
                        notifications.forEach(notification => notification.close());
                    });
                });
            }
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showStatus('Prayer reminders enabled!', 'success');
                this.schedulePrayerReminders();
            } else {
                this.showStatus('Notification permission denied.', 'error');
                document.getElementById('enableReminders').checked = false;
            }
        }
    }

    schedulePrayerReminders() {
        if (!this.prayerTimes || !this.nextPrayer) return;
        
        const reminderTime = parseInt(document.getElementById('reminderTime')?.value || '10');
        const [hours, minutes] = this.nextPrayer.time.split(':').map(Number);
        const reminderDate = new Date();
        reminderDate.setHours(hours, minutes - reminderTime, 0, 0);
        
        if (reminderDate <= new Date()) {
            reminderDate.setDate(reminderDate.getDate() + 1);
        }
        
        const timeUntilReminder = reminderDate.getTime() - Date.now();
        
        setTimeout(() => {
            this.showPrayerReminder();
        }, timeUntilReminder);
    }

    showPrayerReminder() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const adhanSound = document.getElementById('adhanSound')?.value || 'notification';
            const vibration = document.getElementById('vibration')?.value || 'off';
            
            const notification = new Notification('Prayer Time Reminder', {
                body: `It's time for ${this.nextPrayer.name} prayer`,
                icon: '/icons/icon-192x192.png',
                tag: 'prayer-reminder',
                requireInteraction: true
            });
            
            if (vibration === 'on' && 'vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
            
            // Play adhan sound if selected
            if (adhanSound !== 'notification') {
                this.playAdhanSound(adhanSound);
            }
        }
    }

    playAdhanSound(type) {
        // In a real app, you would have audio files for different adhan types
        console.log(`Playing ${type} adhan sound`);
    }

    startPrayerTimer() {
        // Update next prayer countdown every minute
        setInterval(() => {
            this.calculateNextPrayer();
        }, 60000);
    }

    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        this.updateOfflineStatus();
    }

    handleOnlineStatus(online) {
        this.isOnline = online;
        this.updateOfflineStatus();
        
        if (online) {
            this.showStatus('Back online! Updating prayer times...', 'success');
            this.updatePrayerTimes();
        } else {
            this.showStatus('You are offline. Using cached data.', 'warning');
        }
    }

    updateOfflineStatus() {
        const offlineDiv = document.getElementById('offlineStatus');
        if (offlineDiv) {
            offlineDiv.style.display = this.isOnline ? 'none' : 'block';
        }
    }

    cachePrayerTimes() {
        if (this.prayerTimes) {
            localStorage.setItem('cachedPrayerTimes', JSON.stringify({
                data: this.prayerTimes,
                timestamp: Date.now()
            }));
        }
    }

    loadCachedData() {
        const cached = localStorage.getItem('cachedPrayerTimes');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            
            // Use cached data if less than 24 hours old
            if (age < 24 * 60 * 60 * 1000) {
                this.prayerTimes = data;
                this.displayPrayerTimes();
                this.calculateNextPrayer();
            }
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('locationStatus');
        if (!statusDiv) return;
        
        const colors = {
            success: 'text-green-600',
            error: 'text-red-600',
            warning: 'text-yellow-600',
            info: 'text-blue-600',
            loading: 'text-gray-600'
        };
        
        statusDiv.className = `mt-3 text-sm ${colors[type] || colors.info}`;
        statusDiv.textContent = message;
        
        // Auto-clear success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 5000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new PrayerTimesApp();
}); 