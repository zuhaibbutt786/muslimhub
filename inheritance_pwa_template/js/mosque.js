// Mosque Finder with Google Maps
class MosqueFinder {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentLocation = null;
        this.isOnline = navigator.onLine;
        this.googleMapsApiKey = null; // Set your API key here
        this.placesService = null;
        this.geocoder = null;

        // Demo mosques for offline/demo mode
        this.demoMosques = [
            { name: 'Central Masjid', geometry: { location: { lat: 40.7125, lng: -74.0059 } }, rating: 4.8, place_id: 'demo_1', formatted_address: '123 Masjid Rd' },
            { name: 'Al Noor Mosque', geometry: { location: { lat: 40.7135, lng: -74.0065 } }, rating: 4.6, place_id: 'demo_2', formatted_address: '456 Noor St' }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateOfflineStatus();
        this.loadGoogleMapsAPI();
    }

    setupEventListeners() {
        document.getElementById('searchBtn')?.addEventListener('click', () => this.search());
        document.getElementById('useLocationBtn')?.addEventListener('click', () => this.useCurrentLocation());
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    async loadGoogleMapsAPI() {
        if (!this.googleMapsApiKey) {
            this.initDemoMode();
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => this.initMap();
        script.onerror = () => this.initDemoMode();
        document.head.appendChild(script);
    }

    initMap() {
        const el = document.getElementById('map');
        if (!el) return;
        this.map = new google.maps.Map(el, {
            center: { lat: 40.7128, lng: -74.0060 },
            zoom: 12
        });
        this.placesService = new google.maps.places.PlacesService(this.map);
        this.geocoder = new google.maps.Geocoder();
    }

    initDemoMode() {
        const mapEl = document.getElementById('map');
        if (!mapEl) return;
        mapEl.innerHTML = `
            <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                <div class="text-center text-gray-500">
                    <div class="text-4xl mb-2">🗺️</div>
                    <p class="font-semibold">Demo Mode</p>
                    <p class="text-sm">Add a Google Maps API key in js/mosque.js for live data</p>
                    <div class="mt-4">
                        <button onclick="mosqueFinder.showDemoResults()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light">Show Demo Results</button>
                    </div>
                </div>
            </div>
        `;
    }

    async useCurrentLocation() {
        if (!navigator.geolocation) return;
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        this.currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (this.map) {
            this.map.setCenter(this.currentLocation);
            this.map.setZoom(14);
        }
        await this.search();
    }

    async search() {
        const radius = parseInt(document.getElementById('searchRadius').value) || 2000;
        const locationInput = document.getElementById('locationInput').value.trim();

        let location = this.currentLocation;
        if (!location && locationInput && this.geocoder) {
            location = await this.geocode(locationInput);
        }
        if (!location) {
            this.showMessage('Enter a location or use current location');
            return;
        }

        if (!this.placesService) {
            this.showDemoResults();
            return;
        }

        const request = { location, radius, type: 'mosque', keyword: 'mosque|masjid|islamic center' };
        this.placesService.nearbySearch(request, (results, status) => {
            if (status === 'OK' && results) {
                this.renderResults(results);
                this.addMarkers(results);
            } else {
                this.showMessage('No mosques found. Try increasing radius.', 'warning');
            }
        });
    }

    geocode(address) {
        return new Promise((resolve) => {
            this.geocoder.geocode({ address }, (res, status) => {
                if (status === 'OK' && res[0]) {
                    const loc = res[0].geometry.location;
                    resolve({ lat: loc.lat(), lng: loc.lng() });
                } else resolve(null);
            });
        });
    }

    addMarkers(results) {
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
        results.forEach(r => {
            const marker = new google.maps.Marker({ position: r.geometry.location, map: this.map, title: r.name });
            const info = new google.maps.InfoWindow({ content: `<div class="p-2"><strong>${r.name}</strong><br>${r.vicinity || r.formatted_address || ''}</div>` });
            marker.addListener('click', () => info.open(this.map, marker));
            this.markers.push(marker);
        });
    }

    renderResults(results) {
        const list = document.getElementById('resultsList');
        list.innerHTML = results.map(r => `
            <div class="bg-gray-50 p-4 rounded border hover:shadow cursor-pointer">
                <div class="flex items-start justify-between">
                    <div>
                        <h4 class="font-bold text-gray-800">${r.name}</h4>
                        <p class="text-sm text-gray-600">${r.vicinity || r.formatted_address || ''}</p>
                    </div>
                    <div class="text-yellow-600">${r.rating ? `⭐ ${r.rating}` : ''}</div>
                </div>
            </div>
        `).join('');
    }

    showDemoResults() {
        this.renderResults(this.demoMosques);
        this.showMessage('Showing demo mosques. Add API key for live results.', 'info');
    }

    handleOnlineStatus(online) { this.isOnline = online; this.updateOfflineStatus(); }
    updateOfflineStatus() {
        const offlineDiv = document.getElementById('offlineStatus');
        if (offlineDiv) offlineDiv.style.display = this.isOnline ? 'none' : 'block';
    }

    showMessage(msg, type = 'info') {
        const colors = { info: 'bg-blue-100 text-blue-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700' };
        const div = document.createElement('div');
        div.className = `fixed top-4 right-4 p-3 rounded shadow ${colors[type]} z-50`;
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

let mosqueFinder;
document.addEventListener('DOMContentLoaded', () => { mosqueFinder = new MosqueFinder(); }); 