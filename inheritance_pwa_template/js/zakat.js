// Zakat Calculator App
class ZakatCalculator {
    constructor() {
        this.goldRate = 0;
        this.silverRate = 0;
        this.nisabValue = 0;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.fetchLiveRates();
        this.checkOnlineStatus();
        this.loadCachedData();
    }

    setupEventListeners() {
        const form = document.getElementById('zakat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateZakat();
            });
        }

        // Auto-calculate when inputs change
        const inputs = form?.querySelectorAll('input[type="number"]');
        inputs?.forEach(input => {
            input.addEventListener('input', () => {
                if (this.nisabValue > 0) {
                    this.updateRealTimeCalculation();
                }
            });
        });

        // Online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    async fetchLiveRates() {
        try {
            // In a real app, you would fetch from a live API
            // For demo purposes, using simulated rates
            this.goldRate = 220000; // PKR per tola (11.66 grams)
            this.silverRate = 2500; // PKR per tola (11.66 grams)
            
            // Convert to per gram
            this.goldRatePerGram = this.goldRate / 11.66;
            this.silverRatePerGram = this.silverRate / 11.66;
            
            // Calculate nisab (87.48 grams of gold)
            this.nisabValue = this.goldRatePerGram * 87.48;
            
            this.updateRatesDisplay();
            this.cacheRates();
            
        } catch (error) {
            console.error('Error fetching rates:', error);
            this.loadCachedRates();
        }
    }

    updateRatesDisplay() {
        const goldRateDiv = document.getElementById('goldRate');
        const silverRateDiv = document.getElementById('silverRate');
        const nisabValueDiv = document.getElementById('nisabValue');
        
        if (goldRateDiv) {
            goldRateDiv.textContent = `PKR ${this.goldRatePerGram.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        }
        
        if (silverRateDiv) {
            silverRateDiv.textContent = `PKR ${this.silverRatePerGram.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        }
        
        if (nisabValueDiv) {
            nisabValueDiv.textContent = `PKR ${this.nisabValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        }
    }

    calculateZakat() {
        const wealth = this.calculateTotalWealth();
        const liabilities = this.calculateTotalLiabilities();
        const netWealth = wealth - liabilities;
        
        let zakatAmount = 0;
        let isZakatable = false;
        let message = '';
        
        if (netWealth >= this.nisabValue) {
            zakatAmount = netWealth * 0.025; // 2.5%
            isZakatable = true;
            message = 'You are required to pay Zakat.';
        } else {
            message = `You are not required to pay Zakat. Your wealth (PKR ${netWealth.toLocaleString()}) is below the nisab threshold (PKR ${this.nisabValue.toLocaleString()}).`;
        }
        
        this.displayResults({
            totalWealth: wealth,
            totalLiabilities: liabilities,
            netWealth: netWealth,
            zakatAmount: zakatAmount,
            isZakatable: isZakatable,
            message: message,
            breakdown: this.getWealthBreakdown()
        });
    }

    calculateTotalWealth() {
        const cash = parseFloat(document.getElementById('cashAmount')?.value || 0);
        const bankAccounts = parseFloat(document.getElementById('bankAccounts')?.value || 0);
        const goldWeight = parseFloat(document.getElementById('goldWeight')?.value || 0);
        const silverWeight = parseFloat(document.getElementById('silverWeight')?.value || 0);
        const stocksValue = parseFloat(document.getElementById('stocksValue')?.value || 0);
        const mutualFunds = parseFloat(document.getElementById('mutualFunds')?.value || 0);
        const cryptoValue = parseFloat(document.getElementById('cryptoValue')?.value || 0);
        const otherInvestments = parseFloat(document.getElementById('otherInvestments')?.value || 0);
        const businessInventory = parseFloat(document.getElementById('businessInventory')?.value || 0);
        const businessCash = parseFloat(document.getElementById('businessCash')?.value || 0);
        const businessReceivables = parseFloat(document.getElementById('businessReceivables')?.value || 0);
        const businessEquipment = parseFloat(document.getElementById('businessEquipment')?.value || 0);
        
        // Calculate precious metals value
        const goldValue = goldWeight * this.goldRatePerGram;
        const silverValue = silverWeight * this.silverRatePerGram;
        
        return cash + bankAccounts + goldValue + silverValue + stocksValue + mutualFunds + 
               cryptoValue + otherInvestments + businessInventory + businessCash + 
               businessReceivables + businessEquipment;
    }

    calculateTotalLiabilities() {
        const personalDebts = parseFloat(document.getElementById('personalDebts')?.value || 0);
        const businessDebts = parseFloat(document.getElementById('businessDebts')?.value || 0);
        const creditCards = parseFloat(document.getElementById('creditCards')?.value || 0);
        const otherLiabilities = parseFloat(document.getElementById('otherLiabilities')?.value || 0);
        
        return personalDebts + businessDebts + creditCards + otherLiabilities;
    }

    getWealthBreakdown() {
        const cash = parseFloat(document.getElementById('cashAmount')?.value || 0);
        const bankAccounts = parseFloat(document.getElementById('bankAccounts')?.value || 0);
        const goldWeight = parseFloat(document.getElementById('goldWeight')?.value || 0);
        const silverWeight = parseFloat(document.getElementById('silverWeight')?.value || 0);
        const stocksValue = parseFloat(document.getElementById('stocksValue')?.value || 0);
        const mutualFunds = parseFloat(document.getElementById('mutualFunds')?.value || 0);
        const cryptoValue = parseFloat(document.getElementById('cryptoValue')?.value || 0);
        const otherInvestments = parseFloat(document.getElementById('otherInvestments')?.value || 0);
        const businessInventory = parseFloat(document.getElementById('businessInventory')?.value || 0);
        const businessCash = parseFloat(document.getElementById('businessCash')?.value || 0);
        const businessReceivables = parseFloat(document.getElementById('businessReceivables')?.value || 0);
        const businessEquipment = parseFloat(document.getElementById('businessEquipment')?.value || 0);
        
        const goldValue = goldWeight * this.goldRatePerGram;
        const silverValue = silverWeight * this.silverRatePerGram;
        
        return {
            cash: cash,
            bankAccounts: bankAccounts,
            gold: { weight: goldWeight, value: goldValue },
            silver: { weight: silverWeight, value: silverValue },
            stocks: stocksValue,
            mutualFunds: mutualFunds,
            crypto: cryptoValue,
            otherInvestments: otherInvestments,
            businessInventory: businessInventory,
            businessCash: businessCash,
            businessReceivables: businessReceivables,
            businessEquipment: businessEquipment
        };
    }

    displayResults(results) {
        const resultDiv = document.getElementById('zakat-result');
        const contentDiv = document.getElementById('result-content');
        
        if (!resultDiv || !contentDiv) return;
        
        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white p-4 rounded-lg">
                    <h4 class="font-bold text-gray-800 mb-3">💰 Wealth Summary</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span>Total Assets:</span>
                            <span class="font-semibold">PKR ${results.totalWealth.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Total Liabilities:</span>
                            <span class="font-semibold">PKR ${results.totalLiabilities.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span class="font-bold">Net Wealth:</span>
                            <span class="font-bold text-primary">PKR ${results.netWealth.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg">
                    <h4 class="font-bold text-gray-800 mb-3">⚖️ Zakat Calculation</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span>Nisab Threshold:</span>
                            <span class="font-semibold">PKR ${this.nisabValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Zakat Rate:</span>
                            <span class="font-semibold">2.5%</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span class="font-bold">Zakat Amount:</span>
                            <span class="font-bold ${results.isZakatable ? 'text-green-600' : 'text-gray-500'}">PKR ${results.zakatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add wealth breakdown
        if (results.breakdown) {
            html += `
                <div class="bg-white p-4 rounded-lg mb-4">
                    <h4 class="font-bold text-gray-800 mb-3">📊 Wealth Breakdown</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            `;
            
            const breakdown = results.breakdown;
            const items = [
                { label: 'Cash', value: breakdown.cash },
                { label: 'Bank Accounts', value: breakdown.bankAccounts },
                { label: 'Gold', value: breakdown.gold.value, detail: breakdown.gold.weight > 0 ? `(${breakdown.gold.weight}g)` : '' },
                { label: 'Silver', value: breakdown.silver.value, detail: breakdown.silver.weight > 0 ? `(${breakdown.silver.weight}g)` : '' },
                { label: 'Stocks & Shares', value: breakdown.stocks },
                { label: 'Mutual Funds', value: breakdown.mutualFunds },
                { label: 'Cryptocurrency', value: breakdown.crypto },
                { label: 'Other Investments', value: breakdown.otherInvestments },
                { label: 'Business Inventory', value: breakdown.businessInventory },
                { label: 'Business Cash', value: breakdown.businessCash },
                { label: 'Business Receivables', value: breakdown.businessReceivables },
                { label: 'Business Equipment', value: breakdown.businessEquipment }
            ];
            
            items.forEach(item => {
                if (item.value > 0) {
                    html += `
                        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span class="text-sm">${item.label} ${item.detail || ''}</span>
                            <span class="font-semibold text-sm">PKR ${item.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    `;
                }
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        // Add status message
        html += `
            <div class="bg-${results.isZakatable ? 'green' : 'yellow'}-50 border border-${results.isZakatable ? 'green' : 'yellow'}-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                    <div class="text-${results.isZakatable ? 'green' : 'yellow'}-600 text-xl">${results.isZakatable ? '✅' : 'ℹ️'}</div>
                    <div>
                        <h4 class="font-semibold text-${results.isZakatable ? 'green' : 'yellow'}-800">${results.isZakatable ? 'Zakat Required' : 'Zakat Not Required'}</h4>
                        <p class="text-sm text-${results.isZakatable ? 'green' : 'yellow'}-700">${results.message}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add charity recommendations if Zakat is required
        if (results.isZakatable) {
            html += `
                <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="font-bold text-blue-800 mb-3">🤝 Recommended Zakat Recipients</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white p-3 rounded border">
                            <h5 class="font-semibold text-gray-800">🏥 Islamic Relief</h5>
                            <p class="text-sm text-gray-600 mb-2">Global humanitarian aid and development</p>
                            <a href="https://islamic-relief.org" target="_blank" class="text-blue-600 text-sm hover:underline">Donate Now →</a>
                        </div>
                        <div class="bg-white p-3 rounded border">
                            <h5 class="font-semibold text-gray-800">🏫 Muslim Aid</h5>
                            <p class="text-sm text-gray-600 mb-2">Education and community development</p>
                            <a href="https://muslimaid.org" target="_blank" class="text-blue-600 text-sm hover:underline">Donate Now →</a>
                        </div>
                    </div>
                </div>
            `;
        }
        
        contentDiv.innerHTML = html;
        resultDiv.classList.remove('hidden');
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    updateRealTimeCalculation() {
        // This could show a real-time preview of the calculation
        // For now, we'll just show a subtle indicator
        const submitBtn = document.querySelector('#zakat-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '🧮 Calculate Zakat (Updated)';
            setTimeout(() => {
                submitBtn.textContent = '🧮 Calculate Zakat';
            }, 2000);
        }
    }

    cacheRates() {
        localStorage.setItem('zakatRates', JSON.stringify({
            goldRate: this.goldRate,
            silverRate: this.silverRate,
            nisabValue: this.nisabValue,
            timestamp: Date.now()
        }));
    }

    loadCachedRates() {
        const cached = localStorage.getItem('zakatRates');
        if (cached) {
            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            
            // Use cached data if less than 24 hours old
            if (age < 24 * 60 * 60 * 1000) {
                this.goldRate = data.goldRate;
                this.silverRate = data.silverRate;
                this.nisabValue = data.nisabValue;
                this.goldRatePerGram = this.goldRate / 11.66;
                this.silverRatePerGram = this.silverRate / 11.66;
                this.updateRatesDisplay();
            }
        }
    }

    loadCachedData() {
        this.loadCachedRates();
    }

    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        this.updateOfflineStatus();
    }

    handleOnlineStatus(online) {
        this.isOnline = online;
        this.updateOfflineStatus();
        
        if (online) {
            this.showMessage('Back online! Updating rates...', 'success');
            this.fetchLiveRates();
        } else {
            this.showMessage('You are offline. Using cached rates.', 'warning');
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
document.addEventListener('DOMContentLoaded', function() {
    new ZakatCalculator();
}); 