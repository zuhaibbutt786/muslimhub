// Islamic (Hijri) Calendar Script
// Works offline using tabular Hijri calculation (Kuwaiti algorithm approximation)

class IslamicCalendar {
    constructor() {
        this.today = new Date();
        this.viewDate = new Date(this.today);
        this.isOnline = navigator.onLine;

        // Key Islamic events (approximate, for tabular calendar)
        this.events = [
            { hMonth: 9, hDay: 1, name: 'Start of Ramadan' },
            { hMonth: 9, hDay: 27, name: 'Laylat al-Qadr (approx.)' },
            { hMonth: 10, hDay: 1, name: 'Eid al-Fitr' },
            { hMonth: 12, hDay: 8, name: 'Yawm at-Tarwiyah' },
            { hMonth: 12, hDay: 9, name: 'Day of Arafah' },
            { hMonth: 12, hDay: 10, name: 'Eid al-Adha' },
            { hMonth: 1, hDay: 10, name: 'Ashura' },
        ];

        this.hijriMonthNames = [
            'Muharram', 'Safar', 'Rabiʿ al-Awwal', 'Rabiʿ ath-Thani', 'Jumada al-Ula', 'Jumada ath-Thaniyah',
            'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhul-Qaʿdah', 'Dhul-Hijjah'
        ];

        this.weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateOfflineStatus();
        this.renderTodaySummary();
        this.renderCalendar();
        this.renderEventsList();
    }

    setupEventListeners() {
        document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));
        document.getElementById('goToday')?.addEventListener('click', () => this.goToToday());

        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    changeMonth(delta) {
        this.viewDate.setMonth(this.viewDate.getMonth() + delta);
        this.renderCalendar();
    }

    goToToday() {
        this.viewDate = new Date(this.today);
        this.renderCalendar();
        this.renderTodaySummary();
    }

    renderTodaySummary() {
        const g = this.today;
        const { hYear, hMonth, hDay } = this.gregorianToHijri(g);
        const gregorianStr = g.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const hijriStr = `${this.hijriMonthNames[hMonth - 1]} ${hDay}, ${hYear} AH`;

        const todayGregorian = document.getElementById('todayGregorian');
        const todayHijri = document.getElementById('todayHijri');
        const nextEvent = document.getElementById('nextEvent');

        if (todayGregorian) todayGregorian.textContent = gregorianStr;
        if (todayHijri) todayHijri.textContent = hijriStr;

        if (nextEvent) {
            const upcoming = this.getNextEvent(g);
            if (upcoming) {
                nextEvent.textContent = `${upcoming.name} on ${upcoming.hijri} (${upcoming.gregorian})`;
            } else {
                nextEvent.textContent = 'No major event soon';
            }
        }
    }

    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const title = document.getElementById('monthTitle');
        if (!grid || !title) return;

        // Build month grid based on viewDate (Gregorian), but display Hijri numbers
        const firstOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
        const startWeekday = firstOfMonth.getDay();
        const daysInMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).getDate();

        // Title shows both Gregorian and dominant Hijri month(s)
        const middleDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 15);
        const { hYear: tYear, hMonth: tMonth } = this.gregorianToHijri(middleDate);
        title.textContent = `${this.viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })} • ${this.hijriMonthNames[tMonth - 1]} ${tYear} AH`;

        grid.innerHTML = '';

        // Leading blanks
        for (let i = 0; i < startWeekday; i++) {
            const cell = document.createElement('div');
            cell.className = 'bg-white h-20';
            grid.appendChild(cell);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const gDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
            const { hYear, hMonth, hDay } = this.gregorianToHijri(gDate);

            const cell = document.createElement('div');
            cell.className = 'bg-white h-24 p-2 flex flex-col justify-between';

            const isToday = this.isSameDate(gDate, this.today);
            const isFriday = gDate.getDay() === 5;
            const event = this.getEventForHijri(hMonth, hDay);

            const header = document.createElement('div');
            header.className = 'flex items-center justify-between text-sm';
            header.innerHTML = `
                <span class="font-semibold ${isToday ? 'text-primary' : 'text-gray-800'}">${day}</span>
                <span class="text-gray-500">${hDay}</span>
            `;

            const footer = document.createElement('div');
            footer.className = 'text-xs';

            if (event) {
                const badge = document.createElement('div');
                badge.className = 'inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded';
                badge.textContent = event.name;
                footer.appendChild(badge);
            } else if (isFriday) {
                const badge = document.createElement('div');
                badge.className = 'inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded';
                badge.textContent = 'Jumuʿah';
                footer.appendChild(badge);
            }

            if (isToday) {
                cell.classList.add('ring-2', 'ring-primary');
            }

            cell.appendChild(header);
            cell.appendChild(footer);
            grid.appendChild(cell);
        }
    }

    renderEventsList() {
        const list = document.getElementById('eventsList');
        if (!list) return;

        const base = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
        const items = [];
        for (let d = 0; d < 45; d++) {
            const g = new Date(base);
            g.setDate(base.getDate() + d);
            const { hYear, hMonth, hDay } = this.gregorianToHijri(g);
            const evt = this.getEventForHijri(hMonth, hDay);
            if (evt) {
                items.push({
                    name: evt.name,
                    hijri: `${this.hijriMonthNames[hMonth - 1]} ${hDay}, ${hYear} AH`,
                    gregorian: g.toLocaleDateString()
                });
            }
        }

        if (items.length === 0) {
            list.innerHTML = '<li class="text-gray-500">No highlighted events this month.</li>';
            return;
        }

        list.innerHTML = items.map(i => `
            <li class="flex items-center justify-between">
                <span class="text-gray-700">${i.name}</span>
                <span class="text-gray-500">${i.hijri} • ${i.gregorian}</span>
            </li>
        `).join('');
    }

    getNextEvent(fromDate) {
        for (let i = 0; i < 365; i++) {
            const g = new Date(fromDate);
            g.setDate(fromDate.getDate() + i);
            const { hYear, hMonth, hDay } = this.gregorianToHijri(g);
            const evt = this.getEventForHijri(hMonth, hDay);
            if (evt) {
                return {
                    name: evt.name,
                    hijri: `${this.hijriMonthNames[hMonth - 1]} ${hDay}, ${hYear} AH`,
                    gregorian: g.toLocaleDateString()
                };
            }
        }
        return null;
    }

    getEventForHijri(hMonth, hDay) {
        return this.events.find(e => e.hMonth === hMonth && e.hDay === hDay) || null;
    }

    // Kuwaiti algorithm approximation for Hijri conversion
    gregorianToHijri(date) {
        const jd = this.gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
        return this.jdToHijri(jd);
    }

    gregorianToJD(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        const A = Math.floor(year / 100);
        const B = 2 - A + Math.floor(A / 4);
        const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
        return JD;
    }

    jdToHijri(jd) {
        jd = Math.floor(jd) + 0.5;
        const epoch = 1948439.5; // Islamic epoch (Julian Day)
        const days = jd - epoch;
        const hYear = Math.floor((30 * days + 10646) / 10631);
        const yearStart = this.hijriToJD(hYear, 1, 1);
        let month = Math.ceil((jd - yearStart) / 29.5);
        if (month < 1) month = 1;
        if (month > 12) month = 12;
        const monthStart = this.hijriToJD(hYear, month, 1);
        const hDay = Math.floor(jd - monthStart) + 1;
        return { hYear, hMonth: month, hDay };
    }

    hijriToJD(hYear, hMonth, hDay) {
        const epoch = 1948439.5;
        return hDay + Math.ceil(29.5 * (hMonth - 1)) + (hYear - 1) * 354 + Math.floor((3 + 11 * hYear) / 30) + epoch - 1;
    }

    isSameDate(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new IslamicCalendar();
}); 