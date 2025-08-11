// Halal Food Finder with Google Maps Integration
// Note: Requires Google Maps API key for full functionality

class HalalFoodFinder {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentLocation = null;
        this.isOnline = navigator.onLine;
        this.googleMapsApiKey = null; // Set your API key here
        this.placesService = null;
        this.geocoder = null;

        // Sample halal restaurants data (for demo/offline use)
        this.sampleRestaurants = [
            {
                name: "Halal Palace",
                address: "123 Main St, City",
                rating: 4.5,
                types: ["restaurant", "halal"],
                geometry: { location: { lat: 40.7128, lng: -74.0060 } },
                place_id: "sample_1"
            },
            {
                name: "Islamic Cuisine",
                address: "456 Oak Ave, City",
                rating: 4.2,
                types: ["restaurant", "halal"],
                geometry: { location: { lat: 40.7130, lng: -74.0050 } },
                place_id: "sample_2"
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateOfflineStatus();
        this.loadGoogleMapsAPI();
    }

    setupEventListeners() {
        document.getElementById('searchBtn')?.addEventListener('click', () => this.searchHalalFood());
        document.getElementById('useLocationBtn')?.addEventListener('click', () => this.useCurrentLocation());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearResults());

        // Enter key on location input
        document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchHalalFood();
            }
        });

        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    async loadGoogleMapsAPI() {
        if (!this.googleMapsApiKey) {
            this.showMessage('Google Maps API key not configured. Using demo mode.', 'warning');
            this.initDemoMode();
            return;
        }

        try {
            // Load Google Maps API
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => this.initMap();
            script.onerror = () => {
                this.showMessage('Failed to load Google Maps. Using demo mode.', 'warning');
                this.initDemoMode();
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error loading Google Maps API:', error);
            this.initDemoMode();
        }
    }

    initMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // Initialize map with default location (New York)
        this.map = new google.maps.Map(mapElement, {
            center: { lat: 40.7128, lng: -74.0060 },
            zoom: 12,
            styles: this.getMapStyles()
        });

        this.placesService = new google.maps.places.PlacesService(this.map);
        this.geocoder = new google.maps.Geocoder();

        // Add map click listener
        this.map.addListener('click', (event) => {
            this.reverseGeocode(event.latLng);
        });
    }

    initDemoMode() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        mapElement.innerHTML = `
            <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                <div class="text-center text-gray-500">
                    <div class="text-4xl mb-2">🗺️</div>
                    <p class="font-semibold">Demo Mode</p>
                    <p class="text-sm">Google Maps API key required for full functionality</p>
                    <div class="mt-4">
                        <button onclick="foodFinder.showDemoResults()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">
                            Show Demo Results
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async searchHalalFood() {
        const locationInput = document.getElementById('locationInput');
        const searchRadius = document.getElementById('searchRadius');
        const foodType = document.getElementById('foodType');

        if (!locationInput.value.trim()) {
            this.showMessage('Please enter a location or use your current location.', 'error');
            return;
        }

        this.showLoading();

        try {
            let location;
            if (this.currentLocation) {
                location = this.currentLocation;
            } else {
                location = await this.geocodeAddress(locationInput.value);
            }

            if (!location) {
                this.showMessage('Could not find the specified location.', 'error');
                return;
            }

            await this.searchNearbyPlaces(location, searchRadius.value, foodType.value);
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Error searching for restaurants. Please try again.', 'error');
        }
    }

    async useCurrentLocation() {
        if (!navigator.geolocation) {
            this.showMessage('Geolocation is not supported by your browser.', 'error');
            return;
        }

        this.showMessage('Getting your location...', 'info');

        try {
            const position = await this.getCurrentPosition();
            this.currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Update map
            if (this.map) {
                this.map.setCenter(this.currentLocation);
                this.map.setZoom(14);
            }

            // Update location input
            const address = await this.reverseGeocode(this.currentLocation);
            document.getElementById('locationInput').value = address || 'Current Location';

            // Search for restaurants
            const searchRadius = document.getElementById('searchRadius').value;
            const foodType = document.getElementById('foodType').value;
            await this.searchNearbyPlaces(this.currentLocation, searchRadius, foodType);
        } catch (error) {
            console.error('Geolocation error:', error);
            this.showMessage('Could not get your location. Please enter an address manually.', 'error');
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

    async geocodeAddress(address) {
        if (!this.geocoder) {
            this.showMessage('Geocoding service not available.', 'error');
            return null;
        }

        return new Promise((resolve) => {
            this.geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    resolve({ lat: location.lat(), lng: location.lng() });
                } else {
                    resolve(null);
                }
            });
        });
    }

    async reverseGeocode(latLng) {
        if (!this.geocoder) return null;

        return new Promise((resolve) => {
            this.geocoder.geocode({ location: latLng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    resolve(null);
                }
            });
        });
    }

    async searchNearbyPlaces(location, radius, type) {
        if (!this.placesService) {
            this.showDemoResults();
            return;
        }

        const request = {
            location: location,
            radius: parseInt(radius),
            type: type || 'restaurant',
            keyword: 'halal'
        };

        return new Promise((resolve) => {
            this.placesService.nearbySearch(request, (results, status) => {
                if (status === 'OK' && results) {
                    this.displayResults(results);
                    this.addMarkersToMap(results);
                } else {
                    this.showMessage('No halal restaurants found in this area.', 'info');
                }
                resolve();
            });
        });
    }

    displayResults(restaurants) {
        const resultsList = document.getElementById('resultsList');
        if (!resultsList) return;

        if (restaurants.length === 0) {
            resultsList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">🍽️</div>
                    <p>No restaurants found</p>
                    <p class="text-sm">Try expanding your search radius</p>
                </div>
            `;
            return;
        }

        resultsList.innerHTML = restaurants.map(restaurant => `
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer" onclick="foodFinder.showRestaurantDetails('${restaurant.place_id}')">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-gray-800">${restaurant.name}</h4>
                    <div class="flex items-center gap-1">
                        <span class="text-yellow-500">⭐</span>
                        <span class="text-sm font-medium">${restaurant.rating || 'N/A'}</span>
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-2">${restaurant.vicinity || restaurant.formatted_address || 'Address not available'}</p>
                <div class="flex items-center gap-2">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Halal</span>
                    ${restaurant.price_level ? `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">${'$'.repeat(restaurant.price_level)}</span>` : ''}
                    ${restaurant.opening_hours?.open_now ? '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Open</span>' : ''}
                </div>
            </div>
        `).join('');
    }

    addMarkersToMap(restaurants) {
        // Clear existing markers
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        restaurants.forEach(restaurant => {
            const marker = new google.maps.Marker({
                position: restaurant.geometry.location,
                map: this.map,
                title: restaurant.name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#2E8B57" stroke="white" stroke-width="2"/>
                            <path d="M8 10h8M8 14h8M8 18h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(24, 24)
                }
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="p-2">
                        <h3 class="font-bold">${restaurant.name}</h3>
                        <p class="text-sm text-gray-600">${restaurant.vicinity || restaurant.formatted_address}</p>
                        <p class="text-sm">Rating: ${restaurant.rating || 'N/A'} ⭐</p>
                        <button onclick="foodFinder.showRestaurantDetails('${restaurant.place_id}')" class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm">
                            View Details
                        </button>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            this.markers.push(marker);
        });
    }

    showRestaurantDetails(placeId) {
        if (!this.placesService) {
            this.showMessage('Restaurant details not available in demo mode.', 'info');
            return;
        }

        const request = { placeId };
        this.placesService.getDetails(request, (place, status) => {
            if (status === 'OK' && place) {
                this.showRestaurantModal(place);
            } else {
                this.showMessage('Could not load restaurant details.', 'error');
            }
        });
    }

    showRestaurantModal(place) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-md w-11/12 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-primary">${place.name}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <div class="space-y-3">
                    <p class="text-gray-600">${place.formatted_address}</p>
                    ${place.rating ? `<p>Rating: ${place.rating} ⭐ (${place.user_ratings_total || 0} reviews)</p>` : ''}
                    ${place.formatted_phone_number ? `<p>Phone: <a href="tel:${place.formatted_phone_number}" class="text-primary">${place.formatted_phone_number}</a></p>` : ''}
                    ${place.website ? `<p>Website: <a href="${place.website}" target="_blank" class="text-primary">Visit Website</a></p>` : ''}
                    ${place.opening_hours ? `
                        <div>
                            <p class="font-semibold">Hours:</p>
                            <ul class="text-sm text-gray-600">
                                ${place.opening_hours.weekday_text.map(day => `<li>${day}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showDemoResults() {
        this.displayResults(this.sampleRestaurants);
        this.showMessage('Showing demo results. Get a Google Maps API key for real data.', 'info');
    }

    clearResults() {
        document.getElementById('locationInput').value = '';
        document.getElementById('resultsList').innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <div class="text-4xl mb-2">🍽️</div>
                <p>No results yet</p>
                <p class="text-sm">Search for halal food to see results</p>
            </div>
        `;
        
        // Clear markers
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        
        this.currentLocation = null;
    }

    showLoading() {
        const resultsList = document.getElementById('resultsList');
        if (resultsList) {
            resultsList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">🔍</div>
                    <p>Searching for halal restaurants...</p>
                </div>
            `;
        }
    }

    getMapStyles() {
        return [
            {
                featureType: 'poi.business',
                stylers: [{ visibility: 'on' }]
            },
            {
                featureType: 'poi.restaurant',
                stylers: [{ visibility: 'on' }]
            }
        ];
    }

    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        this.updateOfflineStatus();
    }

    handleOnlineStatus(online) {
        this.isOnline = online;
        this.updateOfflineStatus();
    }

    updateOfflineStatus() {
        const offlineDiv = document.getElementById('offlineStatus');
        if (offlineDiv) {
            offlineDiv.style.display = this.isOnline ? 'none' : 'block';
        }
    }

    showMessage(message, type = 'info') {
        const colors = {
            info: 'bg-blue-100 text-blue-700',
            success: 'bg-green-100 text-green-700',
            warning: 'bg-yellow-100 text-yellow-700',
            error: 'bg-red-100 text-red-700'
        };

        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${colors[type]}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize on DOM ready
let foodFinder;
document.addEventListener('DOMContentLoaded', () => {
    foodFinder = new HalalFoodFinder();
}); 