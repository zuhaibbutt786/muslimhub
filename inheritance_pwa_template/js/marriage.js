// Islamic Marriage Matchmaker
class MarriageMatchmaker {
    constructor() {
        this.sampleProfiles = this.getSampleProfiles();
        this.favorites = this.loadFavorites();
        this.init();
    }

    init() {
        document.getElementById('saveProfileBtn')?.addEventListener('click', () => this.saveProfile());
        document.getElementById('findMatchesBtn')?.addEventListener('click', () => this.findMatches());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearAll());
        this.renderFavorites();
        this.loadProfile();
    }

    getSampleProfiles() {
        return [
            { id: 1, name: 'Ayesha', gender: 'female', age: 24, status: 'single', education: 'bachelors', profession: 'Teacher', city: 'Lahore', country: 'Pakistan', religiosity: 'practicing', bio: 'Loves teaching and community work.' },
            { id: 2, name: 'Fatima', gender: 'female', age: 28, status: 'single', education: 'masters', profession: 'Doctor', city: 'Karachi', country: 'Pakistan', religiosity: 'practicing', bio: 'Compassionate and family-oriented.' },
            { id: 3, name: 'Maryam', gender: 'female', age: 30, status: 'divorced', education: 'bachelors', profession: 'Designer', city: 'Islamabad', country: 'Pakistan', religiosity: 'moderate', bio: 'Creative and thoughtful.' },
            { id: 4, name: 'Ahmed', gender: 'male', age: 29, status: 'single', education: 'masters', profession: 'Engineer', city: 'Lahore', country: 'Pakistan', religiosity: 'practicing', bio: 'Engineer with a passion for learning.' },
            { id: 5, name: 'Bilal', gender: 'male', age: 32, status: 'single', education: 'bachelors', profession: 'Businessman', city: 'Karachi', country: 'Pakistan', religiosity: 'moderate', bio: 'Entrepreneurial mindset and family values.' },
            { id: 6, name: 'Usman', gender: 'male', age: 26, status: 'single', education: 'phd', profession: 'Researcher', city: 'Rawalpindi', country: 'Pakistan', religiosity: 'practicing', bio: 'Researcher, enjoys reading and volunteering.' }
        ];
    }

    saveProfile() {
        const profile = this.collectProfile();
        localStorage.setItem('marriageProfile', JSON.stringify(profile));
        this.toast('Profile saved!', 'success');
    }

    loadProfile() {
        const saved = localStorage.getItem('marriageProfile');
        if (!saved) return;
        const p = JSON.parse(saved);
        document.getElementById('profileName').value = p.name || '';
        document.getElementById('profileGender').value = p.gender || 'male';
        document.getElementById('profileAge').value = p.age || '';
        document.getElementById('profileStatus').value = p.status || 'single';
        document.getElementById('profileEducation').value = p.education || 'bachelors';
        document.getElementById('profileProfession').value = p.profession || '';
        document.getElementById('profileCity').value = p.city || '';
        document.getElementById('profileCountry').value = p.country || '';
        document.getElementById('profileReligiosity').value = p.religiosity || 'practicing';
    }

    collectProfile() {
        return {
            name: document.getElementById('profileName').value.trim(),
            gender: document.getElementById('profileGender').value,
            age: parseInt(document.getElementById('profileAge').value) || null,
            status: document.getElementById('profileStatus').value,
            education: document.getElementById('profileEducation').value,
            profession: document.getElementById('profileProfession').value.trim(),
            city: document.getElementById('profileCity').value.trim(),
            country: document.getElementById('profileCountry').value.trim(),
            religiosity: document.getElementById('profileReligiosity').value
        };
    }

    findMatches() {
        const prefGender = document.getElementById('prefGender').value;
        const minAge = parseInt(document.getElementById('prefMinAge').value) || 18;
        const maxAge = parseInt(document.getElementById('prefMaxAge').value) || 80;
        const prefLocation = document.getElementById('prefLocation').value.trim().toLowerCase();
        const prefEducation = document.getElementById('prefEducation').value;

        const candidates = this.sampleProfiles.filter(p => {
            if (p.gender !== prefGender) return false;
            if (p.age < minAge || p.age > maxAge) return false;
            if (prefEducation !== 'any') {
                const order = { high_school: 1, bachelors: 2, masters: 3, phd: 4, other: 1 };
                if (order[p.education] < order[prefEducation]) return false;
            }
            if (prefLocation) {
                const loc = `${p.city} ${p.country}`.toLowerCase();
                if (!loc.includes(prefLocation)) return false;
            }
            return true;
        });

        // Score candidates by closeness (education, city match, religiosity)
        const scored = candidates.map(p => ({
            profile: p,
            score: this.scoreProfile(p, prefLocation, prefEducation)
        }))
        .sort((a, b) => b.score - a.score)
        .map(s => s.profile);

        this.renderResults(scored);
    }

    scoreProfile(p, prefLocation, prefEducation) {
        let score = 0;
        const order = { high_school: 1, bachelors: 2, masters: 3, phd: 4, other: 1 };
        if (prefEducation !== 'any') {
            score += Math.min(order[p.education], order[prefEducation]);
        } else {
            score += order[p.education];
        }
        if (prefLocation) {
            const loc = `${p.city} ${p.country}`.toLowerCase();
            if (loc.includes(prefLocation)) score += 2;
        }
        if (p.religiosity === 'practicing') score += 2;
        if (p.religiosity === 'moderate') score += 1;
        return score;
    }

    renderResults(list) {
        const container = document.getElementById('resultsList');
        if (!container) return;

        if (!list || list.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">💍</div>
                    <p>No matches found</p>
                    <p class="text-sm">Try widening your preferences</p>
                </div>`;
            return;
        }

        container.innerHTML = list.map(p => `
            <div class="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-lg font-bold text-gray-800">${p.name} • ${p.age}</h4>
                        <p class="text-gray-600 text-sm">${p.profession} • ${p.education.replace('_',' ')} • ${p.city}, ${p.country}</p>
                        <p class="text-gray-500 text-sm mt-1">${p.bio}</p>
                        <div class="mt-2 flex gap-2 text-xs">
                            <span class="bg-green-100 text-green-700 px-2 py-1 rounded">${p.religiosity}</span>
                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">${p.status}</span>
                        </div>
                    </div>
                    <button class="text-red-500 hover:text-red-600 text-xl" title="Favorite" onclick="matchmaker.toggleFavorite(${p.id})">${this.favorites.includes(p.id) ? '❤️' : '🤍'}</button>
                </div>
            </div>
        `).join('');
    }

    toggleFavorite(id) {
        const idx = this.favorites.indexOf(id);
        if (idx >= 0) this.favorites.splice(idx, 1); else this.favorites.push(id);
        this.saveFavorites();
        this.renderFavorites();
        // Recompute results to update hearts
        this.findMatches();
        this.toast(idx >= 0 ? 'Removed from favorites' : 'Added to favorites', 'info');
    }

    renderFavorites() {
        const container = document.getElementById('favoritesList');
        if (!container) return;
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-2xl mb-2">❤️</div>
                    <p>No favorites yet</p>
                    <p class="text-sm">Click the heart icon on any profile</p>
                </div>`;
            return;
        }
        const items = this.sampleProfiles.filter(p => this.favorites.includes(p.id));
        container.innerHTML = items.map(p => `
            <div class="flex items-start justify-between bg-gray-50 p-3 rounded border border-gray-200">
                <div>
                    <h4 class="font-semibold text-gray-800">${p.name} • ${p.age}</h4>
                    <p class="text-sm text-gray-600">${p.city}, ${p.country}</p>
                </div>
                <button class="text-red-500 hover:text-red-600" onclick="matchmaker.toggleFavorite(${p.id})">❤️</button>
            </div>`).join('');
    }

    saveFavorites() {
        localStorage.setItem('marriageFavorites', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('marriageFavorites');
        return saved ? JSON.parse(saved) : [];
    }

    clearAll() {
        ['profileName','profileAge','profileProfession','profileCity','profileCountry','prefLocation'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('profileGender').value = 'male';
        document.getElementById('profileStatus').value = 'single';
        document.getElementById('profileEducation').value = 'bachelors';
        document.getElementById('profileReligiosity').value = 'practicing';
        document.getElementById('prefGender').value = 'female';
        document.getElementById('prefMinAge').value = 20;
        document.getElementById('prefMaxAge').value = 35;
        document.getElementById('prefEducation').value = 'any';
        document.getElementById('resultsList').innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <div class="text-4xl mb-2">💍</div>
                <p>No matches yet</p>
                <p class="text-sm">Set your preferences and click Find Matches</p>
            </div>`;
    }

    toast(message, type = 'info') {
        const colors = {
            info: 'bg-blue-100 text-blue-700',
            success: 'bg-green-100 text-green-700',
            warning: 'bg-yellow-100 text-yellow-700',
            error: 'bg-red-100 text-red-700'
        };
        const div = document.createElement('div');
        div.className = `fixed top-4 right-4 p-3 rounded shadow ${colors[type]} z-50`;
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

let matchmaker;
document.addEventListener('DOMContentLoaded', () => {
    matchmaker = new MarriageMatchmaker();
}); 