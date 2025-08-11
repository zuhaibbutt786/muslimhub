// Quran with Tafsir & Audio App
class QuranApp {
    constructor() {
        this.currentSurah = null;
        this.currentAyah = 1;
        this.audioPlayer = null;
        this.isPlaying = false;
        this.bookmarks = this.loadBookmarks();
        this.notes = this.loadNotes();
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkOnlineStatus();
        this.loadLastPosition();
        this.setupAudioPlayer();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('surahSelect')?.addEventListener('change', (e) => this.loadSurah(e.target.value));
        document.getElementById('ayahSelect')?.addEventListener('change', (e) => this.loadAyah(e.target.value));
        document.getElementById('juzSelect')?.addEventListener('change', (e) => this.loadJuz(e.target.value));
        
        // Audio controls
        document.getElementById('playPause')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prevAyah')?.addEventListener('click', () => this.previousAyah());
        document.getElementById('nextAyah')?.addEventListener('click', () => this.nextAyah());
        document.getElementById('reciterSelect')?.addEventListener('change', () => this.changeReciter());
        document.getElementById('audioSpeed')?.addEventListener('change', (e) => this.changeSpeed(e.target.value));
        
        // Translation and Tafsir
        document.getElementById('translationSelect')?.addEventListener('change', () => this.loadTranslation());
        document.getElementById('tafsirSelect')?.addEventListener('change', () => this.loadTafsir());
        
        // Bookmarks and Notes
        document.getElementById('addBookmark')?.addEventListener('click', () => this.addBookmark());
        document.getElementById('addNote')?.addEventListener('click', () => this.addNote());
        
        // Search
        document.getElementById('searchBtn')?.addEventListener('click', () => this.searchQuran());
        document.getElementById('searchText')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchQuran();
        });
        
        // Online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    setupAudioPlayer() {
        this.audioPlayer = new Audio();
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateAudioInfo());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.nextAyah());
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
    }

    async loadSurah(surahNumber) {
        if (!surahNumber) return;
        
        this.currentSurah = parseInt(surahNumber);
        this.currentAyah = 1;
        
        try {
            // Load surah data
            const surahData = await this.fetchSurahData(this.currentSurah);
            this.populateAyahSelect(surahData.ayahs.length);
            
            // Load content
            await Promise.all([
                this.loadArabicText(),
                this.loadTranslation(),
                this.loadTafsir()
            ]);
            
            // Update audio
            this.loadAudio();
            
            // Save position
            this.savePosition();
            
        } catch (error) {
            console.error('Error loading surah:', error);
            this.showMessage('Error loading surah. Please try again.', 'error');
        }
    }

    async loadAyah(ayahNumber) {
        if (!ayahNumber || !this.currentSurah) return;
        
        this.currentAyah = parseInt(ayahNumber);
        
        try {
            // Load specific ayah content
            await Promise.all([
                this.loadArabicText(),
                this.loadTranslation(),
                this.loadTafsir()
            ]);
            
            // Update audio
            this.loadAudio();
            
            // Save position
            this.savePosition();
            
        } catch (error) {
            console.error('Error loading ayah:', error);
            this.showMessage('Error loading ayah. Please try again.', 'error');
        }
    }

    async loadJuz(juzNumber) {
        if (!juzNumber) return;
        
        try {
            // Load juz data and find first surah/ayah
            const juzData = await this.fetchJuzData(juzNumber);
            this.currentSurah = juzData.startSurah;
            this.currentAyah = juzData.startAyah;
            
            await this.loadSurah(this.currentSurah);
            
        } catch (error) {
            console.error('Error loading juz:', error);
            this.showMessage('Error loading juz. Please try again.', 'error');
        }
    }

    async fetchSurahData(surahNumber) {
        // In a real app, you would fetch from a Quran API
        // For demo, return simulated data
        return {
            number: surahNumber,
            name: this.getSurahName(surahNumber),
            ayahs: Array.from({length: this.getSurahLength(surahNumber)}, (_, i) => ({
                number: i + 1,
                text: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ${i + 1}`,
                translation: `In the name of Allah, the Entirely Merciful, the Especially Merciful. (${i + 1})`
            }))
        };
    }

    async fetchJuzData(juzNumber) {
        // Simulated juz data
        const juzMap = {
            1: { startSurah: 1, startAyah: 1 },
            2: { startSurah: 2, startAyah: 142 },
            3: { startSurah: 2, startAyah: 253 },
            // ... more juz mappings
        };
        return juzMap[juzNumber] || { startSurah: 1, startAyah: 1 };
    }

    getSurahName(number) {
        const names = {
            1: 'Al-Fatiha',
            2: 'Al-Baqarah',
            3: 'Aal-Imran',
            4: 'An-Nisa',
            5: 'Al-Ma\'idah',
            6: 'Al-An\'am',
            7: 'Al-A\'raf',
            8: 'Al-Anfal',
            9: 'At-Tawbah',
            10: 'Yunus',
            36: 'Ya-Sin',
            55: 'Ar-Rahman',
            67: 'Al-Mulk',
            112: 'Al-Ikhlas',
            113: 'Al-Falaq',
            114: 'An-Nas'
        };
        return names[number] || `Surah ${number}`;
    }

    getSurahLength(number) {
        const lengths = {
            1: 7,
            2: 286,
            3: 200,
            4: 176,
            5: 120,
            6: 165,
            7: 206,
            8: 75,
            9: 129,
            10: 109,
            36: 83,
            55: 78,
            67: 30,
            112: 4,
            113: 5,
            114: 6
        };
        return lengths[number] || 10;
    }

    populateAyahSelect(ayahCount) {
        const ayahSelect = document.getElementById('ayahSelect');
        if (!ayahSelect) return;
        
        ayahSelect.innerHTML = '<option value="">Select Ayah</option>';
        
        for (let i = 1; i <= ayahCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Ayah ${i}`;
            ayahSelect.appendChild(option);
        }
    }

    async loadArabicText() {
        if (!this.currentSurah) return;
        
        const arabicDiv = document.getElementById('arabicText');
        if (!arabicDiv) return;
        
        try {
            // In a real app, fetch Arabic text from API
            const arabicText = await this.fetchArabicText(this.currentSurah, this.currentAyah);
            
            arabicDiv.innerHTML = `
                <div class="text-center mb-4">
                    <h4 class="text-xl font-bold text-green-800">${this.getSurahName(this.currentSurah)}</h4>
                    <p class="text-green-600">Ayah ${this.currentAyah}</p>
                </div>
                <div class="text-right text-2xl leading-loose font-amiri mb-4 p-4 bg-green-50 rounded-lg">
                    ${arabicText}
                </div>
                <div class="text-center text-sm text-gray-500">
                    ﴿${this.currentAyah}﴾
                </div>
            `;
            
        } catch (error) {
            arabicDiv.innerHTML = '<div class="text-center text-red-500">Error loading Arabic text</div>';
        }
    }

    async loadTranslation() {
        if (!this.currentSurah) return;
        
        const translationDiv = document.getElementById('translationText');
        if (!translationDiv) return;
        
        try {
            const translationLang = document.getElementById('translationSelect')?.value || 'english';
            const translation = await this.fetchTranslation(this.currentSurah, this.currentAyah, translationLang);
            
            translationDiv.innerHTML = `
                <div class="text-center mb-4">
                    <h4 class="text-xl font-bold text-blue-800">Translation</h4>
                    <p class="text-blue-600">${translationLang.charAt(0).toUpperCase() + translationLang.slice(1)}</p>
                </div>
                <div class="text-lg leading-relaxed p-4 bg-blue-50 rounded-lg">
                    ${translation}
                </div>
            `;
            
        } catch (error) {
            translationDiv.innerHTML = '<div class="text-center text-red-500">Error loading translation</div>';
        }
    }

    async loadTafsir() {
        if (!this.currentSurah) return;
        
        const tafsirDiv = document.getElementById('tafsirText');
        if (!tafsirDiv) return;
        
        try {
            const tafsirSource = document.getElementById('tafsirSelect')?.value || 'ibn-kathir';
            const tafsir = await this.fetchTafsir(this.currentSurah, this.currentAyah, tafsirSource);
            
            tafsirDiv.innerHTML = `
                <div class="text-center mb-4">
                    <h4 class="text-xl font-bold text-purple-800">Tafsir</h4>
                    <p class="text-purple-600">${this.getTafsirSourceName(tafsirSource)}</p>
                </div>
                <div class="text-sm leading-relaxed">
                    ${tafsir}
                </div>
            `;
            
        } catch (error) {
            tafsirDiv.innerHTML = '<div class="text-center text-red-500">Error loading Tafsir</div>';
        }
    }

    getTafsirSourceName(source) {
        const names = {
            'ibn-kathir': 'Ibn Kathir',
            'tabari': 'At-Tabari',
            'qurtubi': 'Al-Qurtubi',
            'baghawi': 'Al-Baghawi',
            'wahidi': 'Al-Wahidi',
            'maududi': 'Maududi'
        };
        return names[source] || source;
    }

    async fetchArabicText(surah, ayah) {
        // Simulated Arabic text fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        return `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ`;
    }

    async fetchTranslation(surah, ayah, language) {
        // Simulated translation fetch
        await new Promise(resolve => setTimeout(resolve, 300));
        return `In the name of Allah, the Entirely Merciful, the Especially Merciful. [1:1] All praise is due to Allah, Lord of the worlds - [1:2] The Entirely Merciful, the Especially Merciful, [1:3] Sovereign of the Day of Recompense. [1:4] It is You we worship and You we ask for help. [1:5] Guide us to the straight path - [1:6] The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. [1:7]`;
    }

    async fetchTafsir(surah, ayah, source) {
        // Simulated Tafsir fetch
        await new Promise(resolve => setTimeout(resolve, 400));
        return `This is the Tafsir (exegesis) of Surah ${surah}, Ayah ${ayah} according to ${this.getTafsirSourceName(source)}. The meaning and interpretation of this verse will be explained here with historical context and scholarly commentary. This includes the circumstances of revelation, linguistic analysis, and practical applications for daily life.`;
    }

    loadAudio() {
        if (!this.currentSurah || !this.audioPlayer) return;
        
        const reciter = document.getElementById('reciterSelect')?.value || 'mishary';
        const audioUrl = this.getAudioUrl(this.currentSurah, this.currentAyah, reciter);
        
        this.audioPlayer.src = audioUrl;
        this.audioPlayer.load();
        
        // Update display
        const currentSurahDiv = document.getElementById('currentSurah');
        const currentAyahDiv = document.getElementById('currentAyah');
        
        if (currentSurahDiv) {
            currentSurahDiv.textContent = `${this.getSurahName(this.currentSurah)} - Ayah ${this.currentAyah}`;
        }
        if (currentAyahDiv) {
            currentAyahDiv.textContent = `${this.currentSurah}:${this.currentAyah}`;
        }
    }

    getAudioUrl(surah, ayah, reciter) {
        // In a real app, this would be a real audio URL
        // For demo, return a placeholder
        return `https://audio.example.com/quran/${reciter}/${surah.toString().padStart(3, '0')}_${ayah.toString().padStart(3, '0')}.mp3`;
    }

    togglePlayPause() {
        if (!this.audioPlayer) return;
        
        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.isPlaying = false;
            document.getElementById('playPause').textContent = '▶️';
        } else {
            this.audioPlayer.play();
            this.isPlaying = true;
            document.getElementById('playPause').textContent = '⏸️';
        }
    }

    previousAyah() {
        if (this.currentAyah > 1) {
            this.currentAyah--;
            this.loadAyah(this.currentAyah);
        } else if (this.currentSurah > 1) {
            // Go to previous surah
            this.currentSurah--;
            this.currentAyah = this.getSurahLength(this.currentSurah);
            this.loadSurah(this.currentSurah);
        }
    }

    nextAyah() {
        const maxAyahs = this.getSurahLength(this.currentSurah);
        if (this.currentAyah < maxAyahs) {
            this.currentAyah++;
            this.loadAyah(this.currentAyah);
        } else if (this.currentSurah < 114) {
            // Go to next surah
            this.currentSurah++;
            this.currentAyah = 1;
            this.loadSurah(this.currentSurah);
        }
    }

    changeReciter() {
        this.loadAudio();
    }

    changeSpeed(speed) {
        if (this.audioPlayer) {
            this.audioPlayer.playbackRate = parseFloat(speed);
        }
    }

    updateAudioInfo() {
        const totalTimeDiv = document.getElementById('totalTime');
        if (totalTimeDiv && this.audioPlayer) {
            totalTimeDiv.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }

    updateProgress() {
        if (!this.audioPlayer) return;
        
        const progressBar = document.getElementById('progressBar');
        const currentTimeDiv = document.getElementById('currentTime');
        
        if (progressBar) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        if (currentTimeDiv) {
            currentTimeDiv.textContent = this.formatTime(this.audioPlayer.currentTime);
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    handleAudioError(error) {
        console.error('Audio error:', error);
        this.showMessage('Error playing audio. Please try again.', 'error');
    }

    addBookmark() {
        if (!this.currentSurah) {
            this.showMessage('Please select a surah first.', 'warning');
            return;
        }
        
        const bookmark = {
            id: Date.now(),
            surah: this.currentSurah,
            ayah: this.currentAyah,
            surahName: this.getSurahName(this.currentSurah),
            timestamp: new Date().toISOString()
        };
        
        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.displayBookmarks();
        
        this.showMessage('Bookmark added successfully!', 'success');
    }

    addNote() {
        if (!this.currentSurah) {
            this.showMessage('Please select a surah first.', 'warning');
            return;
        }
        
        const noteText = prompt('Enter your note:');
        if (!noteText) return;
        
        const note = {
            id: Date.now(),
            surah: this.currentSurah,
            ayah: this.currentAyah,
            surahName: this.getSurahName(this.currentSurah),
            text: noteText,
            timestamp: new Date().toISOString()
        };
        
        this.notes.push(note);
        this.saveNotes();
        this.displayNotes();
        
        this.showMessage('Note added successfully!', 'success');
    }

    displayBookmarks() {
        const bookmarksList = document.getElementById('bookmarksList');
        if (!bookmarksList) return;
        
        if (this.bookmarks.length === 0) {
            bookmarksList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">🔖</div>
                    <p>No bookmarks yet</p>
                </div>
            `;
            return;
        }
        
        bookmarksList.innerHTML = this.bookmarks.map(bookmark => `
            <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg mb-2">
                <div>
                    <div class="font-semibold text-yellow-800">${bookmark.surahName}</div>
                    <div class="text-sm text-yellow-600">Ayah ${bookmark.ayah}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick="quranApp.goToBookmark(${bookmark.id})" class="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600 transition-colors">
                        Go
                    </button>
                    <button onclick="quranApp.removeBookmark(${bookmark.id})" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                        ×
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayNotes() {
        const notesList = document.getElementById('notesList');
        if (!notesList) return;
        
        if (this.notes.length === 0) {
            notesList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">📝</div>
                    <p>No notes yet</p>
                </div>
            `;
            return;
        }
        
        notesList.innerHTML = this.notes.map(note => `
            <div class="p-3 bg-orange-50 rounded-lg mb-2">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="font-semibold text-orange-800">${note.surahName} ${note.ayah}</div>
                        <div class="text-xs text-orange-600">${new Date(note.timestamp).toLocaleDateString()}</div>
                    </div>
                    <button onclick="quranApp.removeNote(${note.id})" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                        ×
                    </button>
                </div>
                <div class="text-sm text-gray-700">${note.text}</div>
            </div>
        `).join('');
    }

    goToBookmark(bookmarkId) {
        const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
        if (bookmark) {
            this.currentSurah = bookmark.surah;
            this.currentAyah = bookmark.ayah;
            this.loadSurah(this.currentSurah);
        }
    }

    removeBookmark(bookmarkId) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId);
        this.saveBookmarks();
        this.displayBookmarks();
    }

    removeNote(noteId) {
        this.notes = this.notes.filter(n => n.id !== noteId);
        this.saveNotes();
        this.displayNotes();
    }

    async searchQuran() {
        const searchText = document.getElementById('searchText')?.value.trim();
        const searchType = document.getElementById('searchType')?.value || 'all';
        
        if (!searchText) {
            this.showMessage('Please enter search text.', 'warning');
            return;
        }
        
        try {
            const results = await this.performSearch(searchText, searchType);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Error performing search. Please try again.', 'error');
        }
    }

    async performSearch(query, type) {
        // Simulated search
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return [
            { surah: 1, ayah: 1, text: `Found "${query}" in Al-Fatiha, Ayah 1` },
            { surah: 2, ayah: 255, text: `Found "${query}" in Al-Baqarah, Ayah 255` },
            { surah: 36, ayah: 1, text: `Found "${query}" in Ya-Sin, Ayah 1` }
        ];
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        const resultsList = document.getElementById('resultsList');
        
        if (!searchResults || !resultsList) return;
        
        if (results.length === 0) {
            searchResults.classList.remove('hidden');
            resultsList.innerHTML = '<div class="text-center text-gray-500 py-4">No results found</div>';
            return;
        }
        
        searchResults.classList.remove('hidden');
        resultsList.innerHTML = results.map(result => `
            <div class="p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors" onclick="quranApp.goToSearchResult(${result.surah}, ${result.ayah})">
                <div class="font-semibold text-primary">${this.getSurahName(result.surah)} ${result.ayah}</div>
                <div class="text-sm text-gray-600">${result.text}</div>
            </div>
        `).join('');
    }

    goToSearchResult(surah, ayah) {
        this.currentSurah = surah;
        this.currentAyah = ayah;
        this.loadSurah(surah);
        
        // Hide search results
        document.getElementById('searchResults')?.classList.add('hidden');
    }

    savePosition() {
        if (this.currentSurah) {
            localStorage.setItem('quranPosition', JSON.stringify({
                surah: this.currentSurah,
                ayah: this.currentAyah,
                timestamp: Date.now()
            }));
        }
    }

    loadLastPosition() {
        const saved = localStorage.getItem('quranPosition');
        if (saved) {
            const position = JSON.parse(saved);
            const age = Date.now() - position.timestamp;
            
            // Load if less than 24 hours old
            if (age < 24 * 60 * 60 * 1000) {
                this.currentSurah = position.surah;
                this.currentAyah = position.ayah;
                this.loadSurah(this.currentSurah);
            }
        }
    }

    saveBookmarks() {
        localStorage.setItem('quranBookmarks', JSON.stringify(this.bookmarks));
    }

    loadBookmarks() {
        const saved = localStorage.getItem('quranBookmarks');
        return saved ? JSON.parse(saved) : [];
    }

    saveNotes() {
        localStorage.setItem('quranNotes', JSON.stringify(this.notes));
    }

    loadNotes() {
        const saved = localStorage.getItem('quranNotes');
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
            this.showMessage('You are offline. Some features may be limited.', 'warning');
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
let quranApp;
document.addEventListener('DOMContentLoaded', function() {
    quranApp = new QuranApp();
    quranApp.displayBookmarks();
    quranApp.displayNotes();
}); 