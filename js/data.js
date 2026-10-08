/**
 * FinFlow - Data Management & Local Storage Engine
 */

const STORAGE_KEY = 'finflow_financial_data_v1';
const THEME_KEY = 'finflow_theme_preference';

// Default Category Definitions
const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'cat_exp_food', name: 'Makanan & Minuman', icon: '🍔', color: '#f43f5e' },
    { id: 'cat_exp_transport', name: 'Transportasi & Bensin', icon: '🚗', color: '#f59e0b' },
    { id: 'cat_exp_shopping', name: 'Belanja & Kebutuhan', icon: '🛍️', color: '#8b5cf6' },
    { id: 'cat_exp_bills', name: 'Tagihan & Utilitas', icon: '⚡', color: '#06b6d4' },
    { id: 'cat_exp_entertainment', name: 'Hiburan & Hobi', icon: '🎮', color: '#ec4899' },
    { id: 'cat_exp_health', name: 'Kesehatan & Obat', icon: '💊', color: '#10b981' },
    { id: 'cat_exp_education', name: 'Pendidikan & Buku', icon: '📚', color: '#3b82f6' },
    { id: 'cat_exp_other', name: 'Pengeluaran Lainnya', icon: '📦', color: '#64748b' }
  ],
  income: [
    { id: 'cat_inc_salary', name: 'Gaji Pokok Bulanan', icon: '💼', color: '#10b981' },
    { id: 'cat_inc_bonus', name: 'Bonus & Insentif', icon: '🎁', color: '#14b8a6' },
    { id: 'cat_inc_invest', name: 'Investasi & Dividen', icon: '📈', color: '#6366f1' },
    { id: 'cat_inc_freelance', name: 'Proyek / Freelance', icon: '💻', color: '#f59e0b' },
    { id: 'cat_inc_other', name: 'Pemasukan Lainnya', icon: '✨', color: '#8b5cf6' }
  ]
};

// Default Wallets / Accounts
const DEFAULT_WALLETS = [
  { id: 'w_cash', name: 'Uang Tunai (Cash)', initialBalance: 750000, type: 'cash', color: '#10b981', icon: '💵' },
  { id: 'w_bca', name: 'Bank BCA', initialBalance: 6500000, type: 'bank', color: '#00569f', icon: '🏦' },
  { id: 'w_mandiri', name: 'Bank Mandiri', initialBalance: 3200000, type: 'bank', color: '#003087', icon: '💳' },
  { id: 'w_gopay', name: 'GoPay', initialBalance: 350000, type: 'ewallet', color: '#00aad2', icon: '📱' },
  { id: 'w_dana', name: 'DANA', initialBalance: 200000, type: 'ewallet', color: '#118eea', icon: '🪙' }
];

// Default Category Budgets (Monthly Limit)
const DEFAULT_BUDGETS = [
  { categoryId: 'cat_exp_food', limit: 2500000 },
  { categoryId: 'cat_exp_transport', limit: 800000 },
  { categoryId: 'cat_exp_shopping', limit: 1500000 },
  { categoryId: 'cat_exp_bills', limit: 1200000 },
  { categoryId: 'cat_exp_entertainment', limit: 600000 },
  { categoryId: 'cat_exp_health', limit: 500000 }
];

// Helper to generate IDs
function generateUniqueId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Format Date YYYY-MM-DD
function getFormattedCurrentDate(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return d.toISOString().split('T')[0];
}

// Generate Realistic Seed Transactions for a complete, live experience
function generateSeedTransactions() {
  const today = getFormattedCurrentDate(0);
  const dMinus1 = getFormattedCurrentDate(-1);
  const dMinus2 = getFormattedCurrentDate(-2);
  const dMinus4 = getFormattedCurrentDate(-4);
  const dMinus6 = getFormattedCurrentDate(-6);

  return [
    {
      id: generateUniqueId('tx'),
      type: 'income',
      title: 'Gaji Bulan Ini',
      amount: 8500000,
      walletId: 'w_bca',
      categoryId: 'cat_inc_salary',
      date: dMinus6,
      note: 'Transfer gaji kantor PT Utama Sentosa'
    },
    {
      id: generateUniqueId('tx'),
      type: 'income',
      title: 'Proyek UI/UX Freelance',
      amount: 2400000,
      walletId: 'w_mandiri',
      categoryId: 'cat_inc_freelance',
      date: dMinus4,
      note: 'Pembayaran DP desain aplikasi'
    },
    {
      id: generateUniqueId('tx'),
      type: 'transfer',
      title: 'Top Up GoPay dari BCA',
      amount: 300000,
      walletId: 'w_bca',
      targetWalletId: 'w_gopay',
      categoryId: '',
      date: dMinus4,
      note: 'Saldo bulanan Gojek'
    },
    {
      id: generateUniqueId('tx'),
      type: 'expense',
      title: 'Belanja Mingguan Supermarket',
      amount: 485000,
      walletId: 'w_bca',
      categoryId: 'cat_exp_shopping',
      date: dMinus2,
      note: 'Sayur, daging, buah & perlengkapan mandi'
    },
    {
      id: generateUniqueId('tx'),
      type: 'expense',
      title: 'Makan Siang & Kopi Teman Kantor',
      amount: 78000,
      walletId: 'w_gopay',
      categoryId: 'cat_exp_food',
      date: dMinus1,
      note: 'Resto Padang + Es Kopi Susu'
    },
    {
      id: generateUniqueId('tx'),
      type: 'expense',
      title: 'Isi Bensin Pertamax',
      amount: 150000,
      walletId: 'w_cash',
      categoryId: 'cat_exp_transport',
      date: dMinus1,
      note: 'Isi full tangki motor/mobil'
    },
    {
      id: generateUniqueId('tx'),
      type: 'expense',
      title: 'Bayar Listrik PLN & Internet Wi-Fi',
      amount: 620000,
      walletId: 'w_bca',
      categoryId: 'cat_exp_bills',
      date: today,
      note: 'Token listrik 200rb + IndiHome 420rb'
    },
    {
      id: generateUniqueId('tx'),
      type: 'expense',
      title: 'Nonton Bioskop & Snack',
      amount: 125000,
      walletId: 'w_dana',
      categoryId: 'cat_exp_entertainment',
      date: today,
      note: 'Tiket XXI + Popcorn karamel'
    }
  ];
}

// Storage Manager
class DataStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate core keys
        if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.wallets)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca data dari LocalStorage, memuat template awal.', e);
    }

    // Default structure with realistic initial data
    const initialData = {
      transactions: generateSeedTransactions(),
      wallets: DEFAULT_WALLETS,
      categories: DEFAULT_CATEGORIES,
      budgets: DEFAULT_BUDGETS,
      savingsGoals: [
        { id: 'goal_emergency', title: 'Dana Darurat 6 Bulan', target: 20000000, current: 8500000, color: '#10b981' },
        { id: 'goal_vacation', title: 'Liburan Akhir Tahun ke Bali', target: 6000000, current: 3400000, color: '#6366f1' },
        { id: 'goal_laptop', title: 'Upgrade Laptop Baru', target: 15000000, current: 5200000, color: '#f59e0b' }
      ],
      userSettings: {
        currencySymbol: 'Rp',
        hideBalance: false,
        name: 'Pengguna FinFlow'
      }
    };

    this.saveData(initialData);
    return initialData;
  }

  saveData(customData = null) {
    const toSave = customData || this.data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Gagal menyimpan data ke LocalStorage:', e);
    }
  }

  // --- Transactions ---
  getTransactions(filter = {}) {
    let list = [...this.data.transactions];

    if (filter.type && filter.type !== 'all') {
      list = list.filter(t => t.type === filter.type);
    }
    if (filter.walletId && filter.walletId !== 'all') {
      list = list.filter(t => t.walletId === filter.walletId || t.targetWalletId === filter.walletId);
    }
    if (filter.categoryId && filter.categoryId !== 'all') {
      list = list.filter(t => t.categoryId === filter.categoryId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.note && t.note.toLowerCase().includes(q))
      );
    }
    if (filter.startDate) {
      list = list.filter(t => t.date >= filter.startDate);
    }
    if (filter.endDate) {
      list = list.filter(t => t.date <= filter.endDate);
    }

    // Sort by date descending, then id
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  addTransaction(tx) {
    const newTx = {
      id: generateUniqueId('tx'),
      type: tx.type, // 'expense', 'income', 'transfer'
      title: tx.title.trim(),
      amount: parseFloat(tx.amount) || 0,
      walletId: tx.walletId,
      targetWalletId: tx.targetWalletId || null,
      categoryId: tx.categoryId || null,
      date: tx.date || getFormattedCurrentDate(),
      note: tx.note ? tx.note.trim() : ''
    };
    this.data.transactions.unshift(newTx);
    this.saveData();
    return newTx;
  }

  updateTransaction(id, updatedFields) {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.transactions[index] = {
        ...this.data.transactions[index],
        ...updatedFields,
        amount: parseFloat(updatedFields.amount) || this.data.transactions[index].amount
      };
      this.saveData();
      return this.data.transactions[index];
    }
    return null;
  }

  deleteTransaction(id) {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.transactions.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Wallets & Calculated Balances ---
  getWallets() {
    return this.data.wallets.map(w => {
      const balance = this.calculateWalletBalance(w.id, w.initialBalance || 0);
      return {
        ...w,
        currentBalance: balance
      };
    });
  }

  calculateWalletBalance(walletId, initialBalance = 0) {
    let balance = initialBalance;
    for (const tx of this.data.transactions) {
      if (tx.type === 'income' && tx.walletId === walletId) {
        balance += tx.amount;
      } else if (tx.type === 'expense' && tx.walletId === walletId) {
        balance -= tx.amount;
      } else if (tx.type === 'transfer') {
        if (tx.walletId === walletId) {
          balance -= tx.amount; // Outflow from source wallet
        }
        if (tx.targetWalletId === walletId) {
          balance += tx.amount; // Inflow into destination wallet
        }
      }
    }
    return balance;
  }

  addWallet(wallet) {
    const newWallet = {
      id: generateUniqueId('w'),
      name: wallet.name.trim(),
      initialBalance: parseFloat(wallet.initialBalance) || 0,
      type: wallet.type || 'bank',
      color: wallet.color || '#6366f1',
      icon: wallet.icon || '💳'
    };
    this.data.wallets.push(newWallet);
    this.saveData();
    return newWallet;
  }

  updateWallet(id, updatedFields) {
    const index = this.data.wallets.findIndex(w => w.id === id);
    if (index !== -1) {
      this.data.wallets[index] = { ...this.data.wallets[index], ...updatedFields };
      this.saveData();
      return this.data.wallets[index];
    }
    return null;
  }

  deleteWallet(id) {
    if (this.data.wallets.length <= 1) {
      throw new Error('Minimal harus ada 1 dompet/rekening.');
    }
    this.data.wallets = this.data.wallets.filter(w => w.id !== id);
    // Also remove or clean up associated transactions
    this.saveData();
    return true;
  }

  // --- Categories ---
  getCategories(type = null) {
    if (type === 'expense') return this.data.categories.expense;
    if (type === 'income') return this.data.categories.income;
    return [...this.data.categories.expense, ...this.data.categories.income];
  }

  getCategoryById(id) {
    const all = this.getCategories();
    return all.find(c => c.id === id) || { id: 'unknown', name: 'Tanpa Kategori', icon: '🏷️', color: '#94a3b8' };
  }

  // --- Budgets ---
  getBudgets() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return this.data.budgets.map(b => {
      const category = this.getCategoryById(b.categoryId);
      // Calculate spent this current month
      const spent = this.data.transactions
        .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = b.limit > 0 ? Math.min(Math.round((spent / b.limit) * 100), 200) : 0;
      
      let status = 'safe'; // < 75%
      if (percent >= 100) status = 'danger';
      else if (percent >= 75) status = 'warning';

      return {
        ...b,
        category,
        spent,
        remaining: Math.max(0, b.limit - spent),
        percent,
        status
      };
    });
  }

  setBudget(categoryId, limit) {
    const index = this.data.budgets.findIndex(b => b.categoryId === categoryId);
    if (index !== -1) {
      this.data.budgets[index].limit = parseFloat(limit) || 0;
    } else {
      this.data.budgets.push({ categoryId, limit: parseFloat(limit) || 0 });
    }
    this.saveData();
  }

  // --- Savings Goals ---
  getSavingsGoals() {
    return this.data.savingsGoals || [];
  }

  addSavingsGoal(goal) {
    const newGoal = {
      id: generateUniqueId('goal'),
      title: goal.title.trim(),
      target: parseFloat(goal.target) || 0,
      current: parseFloat(goal.current) || 0,
      color: goal.color || '#6366f1'
    };
    if (!this.data.savingsGoals) this.data.savingsGoals = [];
    this.data.savingsGoals.push(newGoal);
    this.saveData();
    return newGoal;
  }

  updateSavingsGoal(id, amountToAdd) {
    const goal = (this.data.savingsGoals || []).find(g => g.id === id);
    if (goal) {
      goal.current = Math.max(0, goal.current + amountToAdd);
      this.saveData();
      return goal;
    }
    return null;
  }

  deleteSavingsGoal(id) {
    if (this.data.savingsGoals) {
      this.data.savingsGoals = this.data.savingsGoals.filter(g => g.id !== id);
      this.saveData();
    }
  }

  // --- Financial Summary Statistics ---
  getSummary(monthFilter = null) {
    const currentMonth = monthFilter || new Date().toISOString().slice(0, 7);
    
    // Wallets total net balance (Current Total across all accounts)
    const wallets = this.getWallets();
    const totalBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);

    // This month's transactions
    const monthTx = this.data.transactions.filter(t => t.date.startsWith(currentMonth));
    const totalIncome = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, netSavings) / totalIncome) * 100) : 0;

    // Expenses grouped by Category
    const categorySpending = {};
    for (const tx of monthTx) {
      if (tx.type === 'expense') {
        const cat = this.getCategoryById(tx.categoryId);
        if (!categorySpending[cat.id]) {
          categorySpending[cat.id] = {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            total: 0
          };
        }
        categorySpending[cat.id].total += tx.amount;
      }
    }

    const sortedCategorySpending = Object.values(categorySpending).sort((a, b) => b.total - a.total);

    return {
      currentMonth,
      totalBalance,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      categorySpending: sortedCategorySpending,
      transactionCount: monthTx.length
    };
  }

  // --- Data Export & Import ---
  exportToJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  exportToCSV() {
    const transactions = this.getTransactions();
    const headers = ['ID', 'Tanggal', 'Tipe', 'Judul Transaksi', 'Kategori', 'Dompet/Sumber', 'Dompet Tujuan', 'Nominal (Rp)', 'Catatan'];
    
    const rows = transactions.map(t => {
      const cat = t.categoryId ? this.getCategoryById(t.categoryId).name : '-';
      const wallet = this.data.wallets.find(w => w.id === t.walletId)?.name || '-';
      const targetWallet = t.targetWalletId ? (this.data.wallets.find(w => w.id === t.targetWalletId)?.name || '-') : '-';
      
      const typeLabel = t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer';
      
      return [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${typeLabel}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${wallet}"`,
        `"${targetWallet}"`,
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    // Add BOM for Microsoft Excel UTF-8 Indonesian compatibility
    return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  }

  importFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.transactions || !parsed.wallets) {
        throw new Error('Format data backup tidak valid. File harus memiliki data transaksi dan dompet.');
      }
      this.data = parsed;
      this.saveData();
      return true;
    } catch (e) {
      throw new Error('Gagal mengimpor file: ' + e.message);
    }
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadData();
  }
}

// Utility: Format Currency to Indonesian Rupiah
function formatRupiah(amount, showSymbol = true) {
  const num = Math.round(Number(amount) || 0);
  const formatted = num.toLocaleString('id-ID');
  return showSymbol ? `Rp ${formatted}` : formatted;
}

// Global store instance
const store = new DataStore();
