// Pregnancy Calculator
class PregnancyCalculator {
    constructor() {
        this.form = document.getElementById('pregnancyForm');
        this.resultsDiv = document.getElementById('results');
        this.bindEvents();
    }

    bindEvents() {
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clear());
    }

    calculate() {
        const lmpStr = document.getElementById('lmp').value;
        const cycle = parseInt(document.getElementById('cycle').value) || 28;
        if (!lmpStr) return;

        const lmp = new Date(lmpStr);
        // Naegele's rule: EDD = LMP + 280 days (for 28-day cycle)
        // Adjust for different cycle lengths: add (cycle - 28) days
        const edd = new Date(lmp);
        edd.setDate(edd.getDate() + 280 + (cycle - 28));

        // Gestational age
        const now = new Date();
        const diffMs = now - lmp;
        const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays % 7;

        // Conception approx = LMP + (cycle - 14)
        const conception = new Date(lmp);
        conception.setDate(conception.getDate() + (cycle - 14));

        // Trimester determination
        const trimester = this.getTrimester(weeks);

        // Milestones
        const milestones = this.getMilestones(lmp, cycle);

        // Render
        document.getElementById('edd').textContent = edd.toDateString();
        document.getElementById('ga').textContent = `${weeks} weeks ${days} days`;
        document.getElementById('trimester').textContent = trimester;
        document.getElementById('conception').textContent = conception.toDateString();

        const list = document.getElementById('milestones');
        list.innerHTML = milestones.map(m => `<li><span class="font-semibold">${m.label}:</span> ${m.date.toDateString()}</li>`).join('');

        this.resultsDiv.classList.remove('hidden');
        this.resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    getTrimester(weeks) {
        if (weeks < 13) return 'First Trimester (0-12 weeks)';
        if (weeks < 28) return 'Second Trimester (13-27 weeks)';
        return 'Third Trimester (28-40+ weeks)';
    }

    getMilestones(lmp, cycle) {
        const addDays = (d, days) => { const nd = new Date(d); nd.setDate(nd.getDate() + days); return nd; };
        return [
            { label: 'Heartbeat detectable (approx.)', date: addDays(lmp, 42 + (cycle - 28)) },
            { label: 'End of First Trimester', date: addDays(lmp, 84) },
            { label: 'Anatomy scan (18-22 weeks)', date: addDays(lmp, 140) },
            { label: 'Viability (approx. 24 weeks)', date: addDays(lmp, 168) },
            { label: 'Third Trimester starts', date: addDays(lmp, 196) },
            { label: 'Due Date (EDD)', date: addDays(lmp, 280 + (cycle - 28)) }
        ];
    }

    clear() {
        this.form.reset();
        this.resultsDiv.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PregnancyCalculator();
}); 