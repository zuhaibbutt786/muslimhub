// Boycott List – With Halal Alternatives
class BoycottList {
    constructor() {
        this.data = this.getData();
        this.bindEvents();
        this.render(this.data);
    }

    getData() {
        return [
            { brand: 'BrandX Soda', category: 'food', reason: 'Political support concerns', alternatives: ['HalalFizz', 'PureCola'] },
            { brand: 'CosmoGlow', category: 'cosmetics', reason: 'Animal testing', alternatives: ['Noor Beauty', 'HalalCare'] },
            { brand: 'TechNova', category: 'tech', reason: 'Data privacy issues', alternatives: ['AmanTech', 'HalalBits'] },
            { brand: 'FastStyle', category: 'fashion', reason: 'Unethical labor', alternatives: ['Sadaf Wear', 'ModestLine'] },
            { brand: 'CleanMax', category: 'household', reason: 'Environmental concerns', alternatives: ['PureHome', 'EcoHalal'] },
        ];
    }

    bindEvents() {
        document.getElementById('applyFilters')?.addEventListener('click', () => this.apply());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clear());
        document.getElementById('searchInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.apply(); });
    }

    apply() {
        const query = (document.getElementById('searchInput').value || '').toLowerCase();
        const category = document.getElementById('categorySelect').value;
        const altFilter = document.getElementById('altFilter').value;

        let list = this.data.filter(item => item.brand.toLowerCase().includes(query) || item.reason.toLowerCase().includes(query));
        if (category !== 'all') list = list.filter(item => item.category === category);
        if (altFilter === 'has_alternative') list = list.filter(item => item.alternatives && item.alternatives.length > 0);

        this.render(list);
    }

    clear() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categorySelect').value = 'all';
        document.getElementById('altFilter').value = 'all';
        this.render(this.data);
    }

    render(list) {
        const container = document.getElementById('resultsList');
        if (!container) return;
        if (!list || list.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">🚫</div>
                    <p>No results found</p>
                    <p class="text-sm">Try different keywords or categories</p>
                </div>`;
            return;
        }
        container.innerHTML = list.map(item => `
            <div class="p-4 rounded-lg border border-gray-200 bg-white">
                <div class="flex items-start justify-between">
                    <div>
                        <h4 class="font-bold text-gray-800">${item.brand}</h4>
                        <p class="text-sm text-gray-600 capitalize">Category: ${item.category}</p>
                        <p class="text-sm text-red-600 mt-1">Reason: ${item.reason}</p>
                    </div>
                    ${item.alternatives?.length ? `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">${item.alternatives.length} alternatives</span>` : ''}
                </div>
                ${item.alternatives?.length ? `
                <div class="mt-3">
                    <p class="font-semibold text-gray-700 mb-1">Halal Alternatives:</p>
                    <div class="flex flex-wrap gap-2">
                        ${item.alternatives.map(a => `<span class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded text-xs">${a}</span>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => { new BoycottList(); }); 