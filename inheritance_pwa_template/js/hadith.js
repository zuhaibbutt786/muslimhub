// Hadith Library App
class HadithLibrary {
    constructor() {
        this.currentCollection = 'all';
        this.currentCategory = 'all';
        this.currentNarrator = 'all';
        this.searchResults = [];
        this.favorites = this.loadFavorites();
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkOnlineStatus();
        this.loadFeaturedHadith();
        this.displayFavorites();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchBtn')?.addEventListener('click', () => this.searchHadith());
        document.getElementById('randomBtn')?.addEventListener('click', () => this.getRandomHadith());
        document.getElementById('dailyBtn')?.addEventListener('click', () => this.getDailyHadith());
        document.getElementById('shareBtn')?.addEventListener('click', () => this.shareHadith());
        
        // Search on Enter key
        document.getElementById('searchText')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchHadith();
        });
        
        // Filter changes
        document.getElementById('collectionSelect')?.addEventListener('change', (e) => {
            this.currentCollection = e.target.value;
            this.searchHadith();
        });
        
        document.getElementById('categorySelect')?.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.searchHadith();
        });
        
        document.getElementById('narratorSelect')?.addEventListener('change', (e) => {
            this.currentNarrator = e.target.value;
            this.searchHadith();
        });
        
        // Online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    async searchHadith() {
        const searchText = document.getElementById('searchText')?.value.trim();
        const collection = document.getElementById('collectionSelect')?.value || 'all';
        const category = document.getElementById('categorySelect')?.value || 'all';
        const narrator = document.getElementById('narratorSelect')?.value || 'all';
        
        try {
            this.showLoading();
            
            // In a real app, you would call a Hadith API
            // For demo, we'll use simulated data
            const results = await this.fetchHadithResults(searchText, collection, category, narrator);
            
            this.searchResults = results;
            this.displaySearchResults(results);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Error searching Hadith. Please try again.', 'error');
        }
    }

    async fetchHadithResults(searchText, collection, category, narrator) {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return simulated results
        return [
            {
                id: 1,
                collection: 'bukhari',
                collectionName: 'Sahih Bukhari',
                book: 1,
                hadith: 1,
                category: 'faith',
                narrator: 'umar',
                narratorName: 'Umar ibn Al-Khattab (RA)',
                text: 'Actions are judged by intentions, and every person will be rewarded according to what they intended.',
                fullText: 'Actions are judged by intentions, and every person will be rewarded according to what they intended. So whoever emigrated for Allah and His Messenger, his emigration was for Allah and His Messenger. And whoever emigrated for worldly gain or to marry a woman, his emigration was for that which he emigrated.',
                grade: 'Sahih',
                isFavorite: this.favorites.includes(1)
            },
            {
                id: 2,
                collection: 'muslim',
                collectionName: 'Sahih Muslim',
                book: 1,
                hadith: 1,
                category: 'faith',
                narrator: 'abuhuraira',
                narratorName: 'Abu Huraira (RA)',
                text: 'The Prophet ﷺ said: "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah."',
                fullText: 'The Prophet ﷺ said: "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing prayer, paying Zakat, making pilgrimage to the House, and fasting in Ramadan."',
                grade: 'Sahih',
                isFavorite: this.favorites.includes(2)
            },
            {
                id: 3,
                collection: 'abudawud',
                collectionName: 'Sunan Abu Dawood',
                book: 1,
                hadith: 1,
                category: 'prayer',
                narrator: 'aisha',
                narratorName: 'Aisha (RA)',
                text: 'The Prophet ﷺ said: "The prayer of a person in congregation is twenty-five times more superior to the prayer of a person alone."',
                fullText: 'The Prophet ﷺ said: "The prayer of a person in congregation is twenty-five times more superior to the prayer of a person alone. The angels of the night and the angels of the day gather at the time of Fajr prayer."',
                grade: 'Sahih',
                isFavorite: this.favorites.includes(3)
            }
        ];
    }

    displaySearchResults(results) {
        const resultsDiv = document.getElementById('searchResults');
        const resultsList = document.getElementById('resultsList');
        
        if (!resultsDiv || !resultsList) return;
        
        if (results.length === 0) {
            resultsDiv.classList.remove('hidden');
            resultsList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">🔍</div>
                    <p>No Hadith found matching your search criteria</p>
                    <p class="text-sm">Try adjusting your search terms or filters</p>
                </div>
            `;
            return;
        }
        
        resultsDiv.classList.remove('hidden');
        resultsList.innerHTML = results.map(hadith => `
            <div class="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="bg-${this.getCollectionColor(hadith.collection)} text-white px-3 py-1 rounded-full text-sm font-semibold">${hadith.collectionName}</span>
                        <span class="text-gray-600 text-sm ml-2">Book ${hadith.book}, Hadith ${hadith.hadith}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="hadithApp.toggleFavorite(${hadith.id})" class="text-${hadith.isFavorite ? 'red' : 'gray'}-500 hover:text-red-600 transition-colors">
                            ${hadith.isFavorite ? '❤️' : '🤍'}
                        </button>
                        <button onclick="hadithApp.shareHadith(${hadith.id})" class="text-blue-500 hover:text-blue-600 transition-colors">
                            📤
                        </button>
                    </div>
                </div>
                <div class="mb-4">
                    <p class="text-gray-700 leading-relaxed mb-3">${hadith.text}</p>
                    <p class="text-gray-500 text-sm italic">- Narrated by ${hadith.narratorName}</p>
                    <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-2">${hadith.grade}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="hadithApp.readFullHadith(${hadith.id})" class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-light transition-colors">
                        📖 Read Full
                    </button>
                    <button onclick="hadithApp.playAudio(${hadith.id})" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">
                        🔊 Audio
                    </button>
                    <button onclick="hadithApp.showTafsir(${hadith.id})" class="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors">
                        📚 Tafsir
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCollectionColor(collection) {
        const colors = {
            bukhari: 'green',
            muslim: 'blue',
            abudawud: 'purple',
            tirmidhi: 'orange',
            nasai: 'red',
            ibnmajah: 'indigo',
            malik: 'teal'
        };
        return colors[collection] || 'gray';
    }

    async getRandomHadith() {
        try {
            this.showLoading();
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const randomHadith = {
                id: Math.floor(Math.random() * 1000) + 1,
                collection: 'bukhari',
                collectionName: 'Sahih Bukhari',
                book: Math.floor(Math.random() * 100) + 1,
                hadith: Math.floor(Math.random() * 1000) + 1,
                category: 'faith',
                narrator: 'abuhuraira',
                narratorName: 'Abu Huraira (RA)',
                text: 'The Prophet ﷺ said: "Whoever believes in Allah and the Last Day, let him speak good or remain silent."',
                fullText: 'The Prophet ﷺ said: "Whoever believes in Allah and the Last Day, let him speak good or remain silent. And whoever believes in Allah and the Last Day, let him honor his neighbor. And whoever believes in Allah and the Last Day, let him honor his guest."',
                grade: 'Sahih',
                isFavorite: false
            };
            
            this.displayFeaturedHadith(randomHadith);
            
        } catch (error) {
            console.error('Error getting random Hadith:', error);
            this.showMessage('Error getting random Hadith.', 'error');
        }
    }

    async getDailyHadith() {
        try {
            this.showLoading();
            
            // Get today's date and use it to determine daily Hadith
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const dailyHadith = {
                id: dayOfYear,
                collection: 'muslim',
                collectionName: 'Sahih Muslim',
                book: Math.floor(dayOfYear / 30) + 1,
                hadith: dayOfYear,
                category: 'manners',
                narrator: 'aisha',
                narratorName: 'Aisha (RA)',
                text: 'The Prophet ﷺ said: "The most perfect believer in faith is the one who has the best character."',
                fullText: 'The Prophet ﷺ said: "The most perfect believer in faith is the one who has the best character, and the best of you are those who are best to their wives."',
                grade: 'Sahih',
                isFavorite: false
            };
            
            this.displayFeaturedHadith(dailyHadith);
            
        } catch (error) {
            console.error('Error getting daily Hadith:', error);
            this.showMessage('Error getting daily Hadith.', 'error');
        }
    }

    loadFeaturedHadith() {
        // Load today's featured Hadith
        this.getDailyHadith();
    }

    displayFeaturedHadith(hadith) {
        const featuredDiv = document.getElementById('featuredHadith');
        if (!featuredDiv) return;
        
        featuredDiv.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="bg-${this.getCollectionColor(hadith.collection)} text-white px-3 py-1 rounded-full text-sm font-semibold">${hadith.collectionName}</span>
                    <span class="text-gray-600 text-sm ml-2">Book ${hadith.book}, Hadith ${hadith.hadith}</span>
                </div>
                <button onclick="hadithApp.shareHadith(${hadith.id})" class="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors text-sm">
                    📤 Share
                </button>
            </div>
            <div class="mb-4">
                <p class="text-gray-700 leading-relaxed mb-3">${hadith.text}</p>
                <p class="text-gray-500 text-sm italic">- Narrated by ${hadith.narratorName}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="hadithApp.toggleFavorite(${hadith.id})" class="bg-${hadith.isFavorite ? 'red' : 'gray'}-500 text-white px-3 py-1 rounded text-sm hover:bg-${hadith.isFavorite ? 'red' : 'gray'}-600 transition-colors">
                    ${hadith.isFavorite ? '❤️' : '🤍'} Favorite
                </button>
                <button onclick="hadithApp.readFullHadith(${hadith.id})" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                    📖 Read Full
                </button>
                <button onclick="hadithApp.playAudio(${hadith.id})" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">
                    🔊 Audio
                </button>
            </div>
        `;
    }

    toggleFavorite(hadithId) {
        const index = this.favorites.indexOf(hadithId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(hadithId);
        }
        
        this.saveFavorites();
        this.displayFavorites();
        
        // Update UI if this Hadith is in search results
        this.updateHadithFavoriteStatus(hadithId);
        
        this.showMessage(
            index > -1 ? 'Removed from favorites' : 'Added to favorites',
            'success'
        );
    }

    updateHadithFavoriteStatus(hadithId) {
        // Update favorite status in search results
        this.searchResults.forEach(hadith => {
            if (hadith.id === hadithId) {
                hadith.isFavorite = this.favorites.includes(hadithId);
            }
        });
        
        // Re-render search results if they're visible
        if (document.getElementById('searchResults')?.classList.contains('hidden') === false) {
            this.displaySearchResults(this.searchResults);
        }
    }

    displayFavorites() {
        const favoritesList = document.getElementById('favoritesList');
        if (!favoritesList) return;
        
        if (this.favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">❤️</div>
                    <p>No favorite Hadith yet</p>
                    <p class="text-sm">Click the heart icon on any Hadith to add it to your favorites</p>
                </div>
            `;
            return;
        }
        
        // In a real app, you would fetch the favorite Hadith details
        favoritesList.innerHTML = `
            <div class="space-y-4">
                ${this.favorites.map(id => `
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-gray-800">Hadith #${id}</h4>
                                <p class="text-gray-600 text-sm">Sahih Bukhari • Book 1, Hadith ${id}</p>
                            </div>
                            <button onclick="hadithApp.toggleFavorite(${id})" class="text-red-500 hover:text-red-600 transition-colors">
                                ❤️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    loadCollection(collection) {
        document.getElementById('collectionSelect').value = collection;
        this.currentCollection = collection;
        this.searchHadith();
    }

    loadCategory(category) {
        document.getElementById('categorySelect').value = category;
        this.currentCategory = category;
        this.searchHadith();
    }

    readFullHadith(hadithId) {
        // In a real app, this would open a modal or navigate to a detailed view
        this.showMessage('Opening full Hadith view...', 'info');
    }

    playAudio(hadithId) {
        // In a real app, this would play audio recitation
        this.showMessage('Playing Hadith audio...', 'info');
    }

    showTafsir(hadithId) {
        // In a real app, this would show Hadith commentary
        this.showMessage('Loading Hadith commentary...', 'info');
    }

    shareHadith(hadithId) {
        if (navigator.share) {
            navigator.share({
                title: 'Hadith Share',
                text: 'Check out this beautiful Hadith from our Islamic app!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText('Check out this beautiful Hadith from our Islamic app!');
            this.showMessage('Link copied to clipboard!', 'success');
        }
    }

    showLoading() {
        const resultsDiv = document.getElementById('searchResults');
        const resultsList = document.getElementById('resultsList');
        
        if (resultsDiv && resultsList) {
            resultsDiv.classList.remove('hidden');
            resultsList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">⏳</div>
                    <p>Searching Hadith...</p>
                </div>
            `;
        }
    }

    saveFavorites() {
        localStorage.setItem('hadithFavorites', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('hadithFavorites');
        return saved ? JSON.parse(saved) : [];
    }

    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        this.updateOfflineStatus();
    }

    handleOnlineStatus(online) {
        this.isOnline = online;
        this.updateOfflineStatus();
        
        if (online) {
            this.showMessage('Back online!', 'success');
        } else {
            this.showMessage('You are offline. Using cached data.', 'warning');
        }
    }

    updateOfflineStatus() {
        const offlineDiv = document.getElementById('offlineStatus');
        if (offlineDiv) {
            offlineDiv.style.display = this.isOnline ? 'none' : 'block';
        }
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
let hadithApp;
document.addEventListener('DOMContentLoaded', function() {
    hadithApp = new HadithLibrary();
}); 