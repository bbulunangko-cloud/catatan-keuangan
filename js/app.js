/**
 * FinFlow - Application Logic & UI Controller
 */

// Application State
const AppState = {
  currentTab: 'dashboard',
  isBalanceHidden: false,
  transactionFilter: {
    type: 'all',
    walletId: 'all',
    categoryId: 'all',
    search: '',
    startDate: '',
    endDate: ''
  },
  editingTransactionId: null
};

// UI Notification Toast
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconSvg = {
    success: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
    error: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
    warning: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
    info: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  }[type] || '';

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Format number with dots for input fields
function formatInputNumber(value) {
  const clean = value.replace(/\D/g, '');
  return clean ? Number(clean).toLocaleString('id-ID') : '';
}

function parseInputNumber(value) {
  return parseFloat(value.replace(/\./g, '')) || 0;
}

// Format Currency or hide if privacy mode active
function displayMoney(amount, showSymbol = true) {
  if (AppState.isBalanceHidden) return 'Rp ••••••••';
  return formatRupiah(amount, showSymbol);
}

// Format Human Date (Indonesian)
function formatHumanDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ==========================================================================
// RENDERERS
// ==========================================================================

// Render Dashboard View
function renderDashboard() {
  const summary = store.getSummary();
  const wallets = store.getWallets();

  // Balance & Totals
  document.getElementById('dashTotalBalance').innerText = displayMoney(summary.totalBalance);
  document.getElementById('dashTotalIncome').innerText = displayMoney(summary.totalIncome);
  document.getElementById('dashTotalExpense').innerText = displayMoney(summary.totalExpense);
  
  const netSavingsEl = document.getElementById('dashNetSavings');
  if (netSavingsEl) {
    netSavingsEl.innerText = displayMoney(summary.netSavings);
    netSavingsEl.className = `card-value ${summary.netSavings >= 0 ? 'income-val' : 'expense-val'}`;
  }

  // Savings Rate & Health Badge
  const healthBadge = document.getElementById('dashHealthBadge');
  if (healthBadge) {
    if (summary.savingsRate >= 30) {
      healthBadge.innerHTML = `⭐ Rasio Tabungan Sehat: ${summary.savingsRate}%`;
      healthBadge.className = 'badge-trend up';
    } else if (summary.savingsRate > 0) {
      healthBadge.innerHTML = `⚠️ Rasio Tabungan: ${summary.savingsRate}%`;
      healthBadge.className = 'badge-trend warning';
    } else {
      healthBadge.innerHTML = `🚨 Pengeluaran Melebihi Pemasukan`;
      healthBadge.className = 'badge-trend down';
    }
  }

  // Wallets mini strip
  const walletsContainer = document.getElementById('dashWalletsList');
  if (walletsContainer) {
    walletsContainer.innerHTML = wallets.map(w => `
      <div class="wallet-chip-card" onclick="switchTab('wallets')">
        <div class="wallet-chip-top">
          <div class="wallet-chip-icon" style="background:${w.color}20; color:${w.color};">
            ${w.icon}
          </div>
          <span class="tx-meta-badge">${w.type.toUpperCase()}</span>
        </div>
        <div class="wallet-chip-name">${w.name}</div>
        <div class="wallet-chip-balance">${displayMoney(w.currentBalance)}</div>
      </div>
    `).join('');
  }

  // Recent 5 Transactions
  const recentTx = store.getTransactions().slice(0, 5);
  const recentListEl = document.getElementById('dashRecentTransactions');
  if (recentListEl) {
    if (recentTx.length === 0) {
      recentListEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>Belum ada transaksi tercatat</p>
          <button class="btn btn-primary btn-sm" onclick="openTransactionModal()">+ Tambah Transaksi Pertama</button>
        </div>
      `;
    } else {
      recentListEl.innerHTML = recentTx.map(t => renderTransactionItemHTML(t)).join('');
    }
  }

  // Charts
  chartRenderer.renderCategoryDonut('dashCategoryChart', summary.categorySpending);
  chartRenderer.renderCashFlowBar('dashCashFlowChart', store.data.transactions);

  // Category legend on Dashboard
  const legendEl = document.getElementById('dashCategoryLegend');
  if (legendEl) {
    if (summary.categorySpending.length === 0) {
      legendEl.innerHTML = '<p class="text-muted" style="text-align:center; padding: 1rem 0;">Belum ada data pengeluaran bulan ini.</p>';
    } else {
      legendEl.innerHTML = summary.categorySpending.slice(0, 4).map(c => `
        <div class="cat-legend-item">
          <div class="cat-legend-color-label">
            <span class="cat-dot" style="background-color: ${c.color};"></span>
            <span>${c.icon} ${c.name}</span>
          </div>
          <strong>${displayMoney(c.total)}</strong>
        </div>
      `).join('');
    }
  }

  // Budget alert on dashboard
  renderDashboardBudgetAlerts();
}

// Render Dashboard Budget Alerts
function renderDashboardBudgetAlerts() {
  const container = document.getElementById('dashBudgetAlerts');
  if (!container) return;

  const budgets = store.getBudgets();
  const warningOrDanger = budgets.filter(b => b.percent >= 75);

  if (warningOrDanger.length === 0) {
    container.innerHTML = `
      <div style="padding: 1rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">🎉</span>
        <div>
          <strong style="color: var(--income); display: block; font-size: 0.9rem;">Anggaran Terkendali!</strong>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Semua kategori pengeluaran Anda masih dalam batas aman bulan ini.</span>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = warningOrDanger.slice(0, 2).map(b => `
    <div style="padding: 0.9rem 1rem; background: ${b.status === 'danger' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; border: 1px solid ${b.status === 'danger' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}; border-radius: var(--radius-md); margin-bottom: 0.6rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.4rem;">
        <strong style="font-size: 0.88rem; color: ${b.status === 'danger' ? 'var(--danger)' : 'var(--warning)'};">
          ${b.status === 'danger' ? '🚨 Anggaran Melebihi Batas!' : '⚠️ Waspada Anggaran!'}
        </strong>
        <span class="budget-alert-badge ${b.status}">${b.percent}%</span>
      </div>
      <p style="font-size: 0.8rem; margin: 0; color: var(--text-primary);">
        Kategori <strong>${b.category.name}</strong> telah terpakai ${displayMoney(b.spent)} dari batas ${displayMoney(b.limit)}.
      </p>
    </div>
  `).join('');
}

// Render Transaction Item HTML
function renderTransactionItemHTML(t) {
  const cat = t.categoryId ? store.getCategoryById(t.categoryId) : { name: 'Transfer Antar Akun', icon: '🔁', color: '#06b6d4' };
  const wallet = store.data.wallets.find(w => w.id === t.walletId);
  const targetWallet = t.targetWalletId ? store.data.wallets.find(w => w.id === t.targetWalletId) : null;

  let sign = '-';
  let amountClass = 'expense';
  let badgeType = 'Pengeluaran';

  if (t.type === 'income') {
    sign = '+';
    amountClass = 'income';
    badgeType = 'Pemasukan';
  } else if (t.type === 'transfer') {
    sign = '↔';
    amountClass = 'transfer';
    badgeType = 'Transfer';
  }

  const walletDisplay = targetWallet 
    ? `${wallet ? wallet.name : ''} → ${targetWallet.name}`
    : (wallet ? wallet.name : '-');

  return `
    <div class="tx-item" id="tx-item-${t.id}">
      <div class="tx-left">
        <div class="tx-icon-box" style="background:${cat.color}15; color:${cat.color}">
          ${cat.icon}
        </div>
        <div class="tx-info">
          <span class="tx-title">${escapeHtml(t.title)}</span>
          <div class="tx-meta">
            <span>${formatHumanDate(t.date)}</span>
            <span>•</span>
            <span class="tx-meta-badge">${escapeHtml(walletDisplay)}</span>
            ${t.note ? `<span>•</span><span style="font-style:italic; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(t.note)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${amountClass}">
          ${sign} ${displayMoney(t.amount)}
        </div>
        <div class="tx-actions">
          <button class="btn btn-ghost btn-icon btn-sm" title="Edit Transaksi" onclick="editTransaction('${t.id}')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" title="Hapus Transaksi" onclick="confirmDeleteTransaction('${t.id}')" style="color:var(--danger);">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Render Transactions Tab View
function renderTransactions() {
  const listEl = document.getElementById('fullTransactionsList');
  if (!listEl) return;

  const transactions = store.getTransactions(AppState.transactionFilter);
  const countBadge = document.getElementById('txFilteredCount');
  if (countBadge) {
    countBadge.innerText = `${transactions.length} Transaksi Ditemukan`;
  }

  if (transactions.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Tidak Ada Transaksi</h3>
        <p>Tidak ditemukan data transaksi yang sesuai dengan filter atau kata kunci pencarian Anda.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetTxFilters()">Reset Filter</button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = transactions.map(t => renderTransactionItemHTML(t)).join('');
}

// Render Wallets Tab View
function renderWallets() {
  const container = document.getElementById('walletsGrid');
  if (!container) return;

  const wallets = store.getWallets();
  const totalBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);

  const totalEl = document.getElementById('walletsTotalBalance');
  if (totalEl) totalEl.innerText = displayMoney(totalBalance);

  container.innerHTML = wallets.map(w => {
    // Count transactions on this wallet
    const txCount = store.data.transactions.filter(t => t.walletId === w.id || t.targetWalletId === w.id).length;

    return `
      <div class="card" style="border-left: 4px solid ${w.color};">
        <div class="card-header-flex">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="wallet-chip-icon" style="background:${w.color}25; color:${w.color}; font-size:1.3rem;">
              ${w.icon}
            </div>
            <div>
              <h3 style="font-size:1.05rem;">${escapeHtml(w.name)}</h3>
              <span class="tx-meta-badge">${w.type.toUpperCase()}</span>
            </div>
          </div>
          <div class="tx-actions">
            <button class="btn btn-ghost btn-icon btn-sm" onclick="editWallet('${w.id}')" title="Edit Dompet">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            ${wallets.length > 1 ? `
              <button class="btn btn-ghost btn-icon btn-sm" onclick="confirmDeleteWallet('${w.id}')" style="color:var(--danger);" title="Hapus Dompet">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            ` : ''}
          </div>
        </div>

        <div style="margin: 1.25rem 0;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Saldo Saat Ini</div>
          <div class="card-value" style="font-size: 1.6rem; color: ${w.currentBalance < 0 ? 'var(--danger)' : 'var(--text-primary)'};">
            ${displayMoney(w.currentBalance)}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.75rem; font-size:0.8rem; color:var(--text-secondary);">
          <span>${txCount} Transaksi</span>
          <button class="btn btn-secondary btn-sm" onclick="openTransferModal('${w.id}')">Transfer Saldo</button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Budgets Tab View
function renderBudgets() {
  const container = document.getElementById('budgetsGrid');
  if (!container) return;

  const budgets = store.getBudgets();
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  const totalLimitEl = document.getElementById('totalBudgetLimit');
  if (totalLimitEl) totalLimitEl.innerText = displayMoney(totalLimit);

  const totalSpentEl = document.getElementById('totalBudgetSpent');
  if (totalSpentEl) totalSpentEl.innerText = displayMoney(totalSpent);

  const totalRemainEl = document.getElementById('totalBudgetRemaining');
  if (totalRemainEl) totalRemainEl.innerText = displayMoney(Math.max(0, totalLimit - totalSpent));

  container.innerHTML = budgets.map(b => {
    let statusBadgeText = 'Aman';
    let progressClass = 'progress-safe';

    if (b.status === 'warning') {
      statusBadgeText = 'Waspada (≥ 75%)';
      progressClass = 'progress-warning';
    } else if (b.status === 'danger') {
      statusBadgeText = 'Batas Terlampaui!';
      progressClass = 'progress-danger';
    }

    return `
      <div class="budget-card">
        <div class="budget-card-header">
          <div class="budget-category-info">
            <div class="budget-cat-icon" style="background:${b.category.color}20; color:${b.category.color};">
              ${b.category.icon}
            </div>
            <div>
              <h3 style="font-size:1rem;">${escapeHtml(b.category.name)}</h3>
              <span class="budget-alert-badge ${b.status}">${statusBadgeText}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openEditBudgetModal('${b.categoryId}', ${b.limit})" title="Ubah Batas Anggaran">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
        </div>

        <div style="margin: 0.5rem 0;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 0.35rem; font-size:0.85rem;">
            <span>Terpakai: <strong>${displayMoney(b.spent)}</strong></span>
            <span>Batas: <strong>${displayMoney(b.limit)}</strong></span>
          </div>
          <div class="budget-progress-container">
            <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(b.percent, 100)}%;"></div>
          </div>
        </div>

        <div class="budget-stats-row">
          <span>Persentase: <strong>${b.percent}%</strong></span>
          <span>Sisa: <strong style="color: ${b.remaining === 0 ? 'var(--danger)' : 'var(--income)'};">${displayMoney(b.remaining)}</strong></span>
        </div>
      </div>
    `;
  }).join('');
}

// Render Reports & Analytics View
function renderReports() {
  const summary = store.getSummary();

  const reportTotalIncome = document.getElementById('reportTotalIncome');
  if (reportTotalIncome) reportTotalIncome.innerText = displayMoney(summary.totalIncome);

  const reportTotalExpense = document.getElementById('reportTotalExpense');
  if (reportTotalExpense) reportTotalExpense.innerText = displayMoney(summary.totalExpense);

  const reportNet = document.getElementById('reportNetBalance');
  if (reportNet) reportNet.innerText = displayMoney(summary.netSavings);

  // Big Charts
  chartRenderer.renderCategoryDonut('reportCategoryChart', summary.categorySpending);
  chartRenderer.renderCashFlowBar('reportCashFlowChart', store.data.transactions);

  // Breakdown Table
  const tableBody = document.getElementById('reportCategoryTableBody');
  if (tableBody) {
    const totalExp = summary.totalExpense;
    if (summary.categorySpending.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem;">Belum ada transaksi pengeluaran bulan ini</td></tr>`;
    } else {
      tableBody.innerHTML = summary.categorySpending.map(c => {
        const pct = totalExp > 0 ? ((c.total / totalExp) * 100).toFixed(1) : 0;
        return `
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
              <span class="cat-dot" style="background:${c.color};"></span>
              <span>${c.icon} ${escapeHtml(c.name)}</span>
            </td>
            <td style="padding: 0.85rem 1rem; font-weight:700; color:var(--text-primary);">${displayMoney(c.total)}</td>
            <td style="padding: 0.85rem 1rem;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <div style="width:70px; height:6px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden;">
                  <div style="width:${pct}%; height:100%; background:${c.color};"></div>
                </div>
                <span>${pct}%</span>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// Render Savings Goals & Settings View
function renderGoalsAndSettings() {
  const container = document.getElementById('savingsGoalsGrid');
  if (!container) return;

  const goals = store.getSavingsGoals();
  if (goals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Belum ada target tabungan yang dibuat.</p>
        <button class="btn btn-primary btn-sm" onclick="openAddGoalModal()">+ Buat Target Tabungan</button>
      </div>
    `;
    return;
  }

  container.innerHTML = goals.map(g => {
    const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
    return `
      <div class="card" style="border-top: 4px solid ${g.color};">
        <div class="card-header-flex">
          <h3 style="font-size:1.05rem;">🎯 ${escapeHtml(g.title)}</h3>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="confirmDeleteGoal('${g.id}')" style="color:var(--danger);">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div style="margin: 0.75rem 0;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
            <span>Terkumpul: <strong>${displayMoney(g.current)}</strong></span>
            <span>Target: <strong>${displayMoney(g.target)}</strong></span>
          </div>
          <div class="budget-progress-container">
            <div class="budget-progress-bar" style="width: ${pct}%; background: ${g.color};"></div>
          </div>
          <div style="text-align:right; font-size:0.8rem; font-weight:700; margin-top:0.3rem; color:${g.color};">${pct}% Tercapai</div>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="addFundsToGoal('${g.id}')">+ Tambah Tabungan</button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// NAVIGATION & VIEW SWITCHER
// ==========================================================================
function switchTab(tabName) {
  AppState.currentTab = tabName;

  // Update nav buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update views
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });

  const activeView = document.getElementById(`view-${tabName}`);
  if (activeView) activeView.classList.add('active');

  // Close mobile sidebar if open
  document.getElementById('sidebar')?.classList.remove('mobile-open');

  // Trigger relevant renderers
  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'transactions') renderTransactions();
  if (tabName === 'wallets') renderWallets();
  if (tabName === 'budgets') renderBudgets();
  if (tabName === 'reports') renderReports();
  if (tabName === 'settings') renderGoalsAndSettings();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle Balance Privacy Visibility
function toggleBalancePrivacy() {
  AppState.isBalanceHidden = !AppState.isBalanceHidden;
  
  const eyeIcons = document.querySelectorAll('.eye-toggle-icon');
  eyeIcons.forEach(icon => {
    if (AppState.isBalanceHidden) {
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />`;
    } else {
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    }
  });

  // Re-render current tab
  switchTab(AppState.currentTab);
  showToast(AppState.isBalanceHidden ? 'Saldo disembunyikan' : 'Saldo ditampilkan', 'info');
}

// Toggle Theme Dark / Light
function toggleTheme() {
  const current = document.body.dataset.theme || 'dark';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = newTheme;
  localStorage.setItem(THEME_KEY, newTheme);

  const themeLabel = document.getElementById('themeStatusLabel');
  if (themeLabel) themeLabel.innerText = newTheme === 'dark' ? 'Mode Gelap' : 'Mode Terang';

  // Redraw charts with adapted colors
  renderDashboard();
  if (AppState.currentTab === 'reports') renderReports();
}

// ==========================================================================
// MODAL CONTROLLERS & FORM HANDLERS
// ==========================================================================

// Populate Category & Wallet dropdowns
function populateDropdowns(selectedType = 'expense', selectedCategory = null, selectedWallet = null, selectedTargetWallet = null) {
  const catSelect = document.getElementById('txCategorySelect');
  const walletSelect = document.getElementById('txWalletSelect');
  const targetWalletSelect = document.getElementById('txTargetWalletSelect');

  // Wallets
  const wallets = store.data.wallets;
  const walletOptions = wallets.map(w => `<option value="${w.id}">${w.icon} ${escapeHtml(w.name)}</option>`).join('');
  if (walletSelect) walletSelect.innerHTML = walletOptions;
  if (targetWalletSelect) targetWalletSelect.innerHTML = walletOptions;

  if (selectedWallet && walletSelect) walletSelect.value = selectedWallet;
  if (selectedTargetWallet && targetWalletSelect) targetWalletSelect.value = selectedTargetWallet;

  // Categories
  if (catSelect) {
    if (selectedType === 'transfer') {
      catSelect.innerHTML = '<option value="">(Tidak diperlukan untuk transfer)</option>';
      catSelect.disabled = true;
    } else {
      catSelect.disabled = false;
      const categories = store.getCategories(selectedType);
      catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${escapeHtml(c.name)}</option>`).join('');
      if (selectedCategory) catSelect.value = selectedCategory;
    }
  }

  // Populate Filter Dropdowns
  const filterCat = document.getElementById('filterCategory');
  if (filterCat) {
    filterCat.innerHTML = '<option value="all">Semua Kategori</option>' + 
      store.getCategories().map(c => `<option value="${c.id}">${c.icon} ${escapeHtml(c.name)}</option>`).join('');
  }

  const filterWallet = document.getElementById('filterWallet');
  if (filterWallet) {
    filterWallet.innerHTML = '<option value="all">Semua Dompet / Rekening</option>' + 
      wallets.map(w => `<option value="${w.id}">${w.icon} ${escapeHtml(w.name)}</option>`).join('');
  }
}

// Open Transaction Modal
function openTransactionModal(editTxId = null) {
  AppState.editingTransactionId = editTxId;
  const modal = document.getElementById('txModal');
  const modalTitle = document.getElementById('txModalTitle');
  const form = document.getElementById('txForm');
  form.reset();

  let activeType = 'expense';

  if (editTxId) {
    const tx = store.data.transactions.find(t => t.id === editTxId);
    if (tx) {
      modalTitle.innerText = 'Edit Transaksi';
      activeType = tx.type;
      document.getElementById('txTitle').value = tx.title;
      document.getElementById('txAmount').value = Number(tx.amount).toLocaleString('id-ID');
      document.getElementById('txDate').value = tx.date;
      document.getElementById('txNote').value = tx.note || '';

      populateDropdowns(activeType, tx.categoryId, tx.walletId, tx.targetWalletId);
    }
  } else {
    modalTitle.innerText = 'Catat Transaksi Baru';
    document.getElementById('txDate').value = getFormattedCurrentDate();
    populateDropdowns(activeType);
  }

  setTransactionTypePill(activeType);
  modal.classList.add('active');
  document.getElementById('txAmount').focus();
}

function closeTransactionModal() {
  document.getElementById('txModal').classList.remove('active');
  AppState.editingTransactionId = null;
}

function setTransactionTypePill(type) {
  document.querySelectorAll('.type-pill-btn').forEach(btn => {
    btn.className = `type-pill-btn ${btn.dataset.type === type ? `active ${type}` : ''}`;
  });

  const targetWalletGroup = document.getElementById('targetWalletGroup');
  const categoryGroup = document.getElementById('categoryGroup');
  const walletSelectLabel = document.getElementById('walletSelectLabel');

  if (walletSelectLabel) {
    walletSelectLabel.innerText = type === 'transfer' ? 'Dompet Asal (Sumber)*' : 'Dompet / Rekening*';
  }

  if (type === 'transfer') {
    if (targetWalletGroup) targetWalletGroup.style.display = 'block';
    if (categoryGroup) categoryGroup.style.display = 'none';
  } else {
    if (targetWalletGroup) targetWalletGroup.style.display = 'none';
    if (categoryGroup) categoryGroup.style.display = 'block';
  }

  populateDropdowns(type);
}

// Save Transaction (Add / Edit)
function handleSaveTransaction(e) {
  e.preventDefault();

  const activePill = document.querySelector('.type-pill-btn.active');
  const type = activePill ? activePill.dataset.type : 'expense';

  const title = document.getElementById('txTitle').value.trim();
  const rawAmount = document.getElementById('txAmount').value;
  const amount = parseInputNumber(rawAmount);
  const date = document.getElementById('txDate').value;
  const walletId = document.getElementById('txWalletSelect').value;
  const categoryId = document.getElementById('txCategorySelect').value;
  const targetWalletId = document.getElementById('txTargetWalletSelect')?.value;
  const note = document.getElementById('txNote').value.trim();

  if (!title) {
    showToast('Silakan masukkan judul transaksi', 'warning');
    return;
  }
  if (amount <= 0) {
    showToast('Nominal transaksi harus lebih dari Rp 0', 'warning');
    return;
  }
  if (type === 'transfer' && walletId === targetWalletId) {
    showToast('Dompet asal dan tujuan tidak boleh sama!', 'warning');
    return;
  }

  const payload = {
    type,
    title,
    amount,
    date,
    walletId,
    targetWalletId: type === 'transfer' ? targetWalletId : null,
    categoryId: type === 'transfer' ? null : categoryId,
    note
  };

  if (AppState.editingTransactionId) {
    store.updateTransaction(AppState.editingTransactionId, payload);
    showToast('Transaksi berhasil diperbarui', 'success');
  } else {
    store.addTransaction(payload);
    showToast('Transaksi baru berhasil disimpan', 'success');
  }

  closeTransactionModal();
  renderDashboard();
  if (AppState.currentTab === 'transactions') renderTransactions();
  if (AppState.currentTab === 'wallets') renderWallets();
  if (AppState.currentTab === 'budgets') renderBudgets();
  if (AppState.currentTab === 'reports') renderReports();
}

function editTransaction(id) {
  openTransactionModal(id);
}

function confirmDeleteTransaction(id) {
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    store.deleteTransaction(id);
    showToast('Transaksi telah dihapus', 'info');
    renderDashboard();
    if (AppState.currentTab === 'transactions') renderTransactions();
    if (AppState.currentTab === 'wallets') renderWallets();
    if (AppState.currentTab === 'budgets') renderBudgets();
    if (AppState.currentTab === 'reports') renderReports();
  }
}

// --- Wallets Modal & Actions ---
function openAddWalletModal() {
  document.getElementById('walletModalTitle').innerText = 'Tambah Dompet / Rekening Baru';
  document.getElementById('walletForm').reset();
  document.getElementById('walletIdInput').value = '';
  document.getElementById('walletModal').classList.add('active');
}

function editWallet(id) {
  const w = store.data.wallets.find(item => item.id === id);
  if (!w) return;

  document.getElementById('walletModalTitle').innerText = 'Edit Dompet / Rekening';
  document.getElementById('walletIdInput').value = w.id;
  document.getElementById('walletName').value = w.name;
  document.getElementById('walletType').value = w.type;
  document.getElementById('walletIcon').value = w.icon;
  document.getElementById('walletColor').value = w.color;
  document.getElementById('walletInitialBalance').value = Number(w.initialBalance).toLocaleString('id-ID');
  document.getElementById('walletModal').classList.add('active');
}

function closeWalletModal() {
  document.getElementById('walletModal').classList.remove('active');
}

function handleSaveWallet(e) {
  e.preventDefault();
  const id = document.getElementById('walletIdInput').value;
  const name = document.getElementById('walletName').value.trim();
  const type = document.getElementById('walletType').value;
  const icon = document.getElementById('walletIcon').value.trim() || '💳';
  const color = document.getElementById('walletColor').value;
  const initialBalance = parseInputNumber(document.getElementById('walletInitialBalance').value);

  if (!name) {
    showToast('Nama dompet/rekening harus diisi', 'warning');
    return;
  }

  if (id) {
    store.updateWallet(id, { name, type, icon, color, initialBalance });
    showToast('Dompet berhasil diperbarui', 'success');
  } else {
    store.addWallet({ name, type, icon, color, initialBalance });
    showToast('Dompet baru berhasil ditambahkan', 'success');
  }

  closeWalletModal();
  renderWallets();
  renderDashboard();
}

function confirmDeleteWallet(id) {
  try {
    if (confirm('Hapus dompet ini? Semua data saldo terkait akan diperbarui.')) {
      store.deleteWallet(id);
      showToast('Dompet berhasil dihapus', 'info');
      renderWallets();
      renderDashboard();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Transfer Quick Modal
function openTransferModal(fromWalletId = null) {
  openTransactionModal();
  setTransactionTypePill('transfer');
  if (fromWalletId) {
    document.getElementById('txWalletSelect').value = fromWalletId;
  }
}

// --- Budgets Modal & Actions ---
function openEditBudgetModal(categoryId, currentLimit) {
  const category = store.getCategoryById(categoryId);
  document.getElementById('budgetCategoryTitle').innerText = `Atur Limit: ${category.name}`;
  document.getElementById('budgetCategoryId').value = categoryId;
  document.getElementById('budgetLimitInput').value = Number(currentLimit).toLocaleString('id-ID');
  document.getElementById('budgetModal').classList.add('active');
}

function closeBudgetModal() {
  document.getElementById('budgetModal').classList.remove('active');
}

function handleSaveBudget(e) {
  e.preventDefault();
  const categoryId = document.getElementById('budgetCategoryId').value;
  const limit = parseInputNumber(document.getElementById('budgetLimitInput').value);

  store.setBudget(categoryId, limit);
  showToast('Limit anggaran berhasil diperbarui', 'success');
  closeBudgetModal();
  renderBudgets();
  renderDashboard();
}

// --- Savings Goals Actions ---
function openAddGoalModal() {
  const title = prompt('Masukkan nama impian / target tabungan:\n(Contoh: Dana Darurat, Liburan ke Jepang, Beli iPhone)');
  if (!title) return;
  const targetStr = prompt('Masukkan target nominal (Rp):\n(Contoh: 10000000)');
  const target = parseFloat(targetStr) || 0;

  if (target <= 0) {
    showToast('Target nominal harus valid', 'warning');
    return;
  }

  store.addSavingsGoal({ title, target, current: 0 });
  showToast('Target tabungan baru dibuat!', 'success');
  renderGoalsAndSettings();
}

function addFundsToGoal(goalId) {
  const amountStr = prompt('Masukkan jumlah uang yang ingin disisihkan ke target ini (Rp):');
  const amount = parseFloat(amountStr) || 0;
  if (amount <= 0) return;

  store.updateSavingsGoal(goalId, amount);
  showToast(`Berhasil menambah Rp ${amount.toLocaleString('id-ID')} ke target!`, 'success');
  renderGoalsAndSettings();
}

function confirmDeleteGoal(goalId) {
  if (confirm('Hapus target tabungan ini?')) {
    store.deleteSavingsGoal(goalId);
    showToast('Target tabungan dihapus', 'info');
    renderGoalsAndSettings();
  }
}

// --- Data Export & Import ---
function downloadCSV() {
  const csvContent = store.exportToCSV();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Catatan_Keuangan_${getFormattedCurrentDate()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File CSV berhasil diunduh untuk Excel!', 'success');
}

function downloadJSONBackup() {
  const jsonContent = store.exportToJSON();
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinFlow_Backup_${getFormattedCurrentDate()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Backup database JSON berhasil diunduh!', 'success');
}

function handleJSONRestore(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      store.importFromJSON(e.target.result);
      showToast('Data berhasil dipulihkan dari file backup!', 'success');
      switchTab('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function handleResetData() {
  if (confirm('PERINGATAN: Semua transaksi yang Anda masukkan akan direset ke data sampel awal. Apakah Anda yakin?')) {
    store.resetToDefault();
    showToast('Data berhasil direset ke sampel awal', 'info');
    switchTab('dashboard');
  }
}

// Reset Transactions Filters
function resetTxFilters() {
  AppState.transactionFilter = {
    type: 'all',
    walletId: 'all',
    categoryId: 'all',
    search: '',
    startDate: '',
    endDate: ''
  };
  const searchInput = document.getElementById('searchTxInput');
  if (searchInput) searchInput.value = '';
  const filterType = document.getElementById('filterType');
  if (filterType) filterType.value = 'all';
  const filterCat = document.getElementById('filterCategory');
  if (filterCat) filterCat.value = 'all';
  const filterWallet = document.getElementById('filterWallet');
  if (filterWallet) filterWallet.value = 'all';
  renderTransactions();
}

// Helper: Escape HTML string
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Restore theme preference
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  document.body.dataset.theme = savedTheme;
  const themeLabel = document.getElementById('themeStatusLabel');
  if (themeLabel) themeLabel.innerText = savedTheme === 'dark' ? 'Mode Gelap' : 'Mode Terang';

  // Navigation Links
  document.querySelectorAll('[data-tab]').forEach(elem => {
    elem.addEventListener('click', () => {
      switchTab(elem.dataset.tab);
    });
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Live Auto-formatting for Amount input fields
  const amountInputs = document.querySelectorAll('.amount-input');
  amountInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      e.target.value = formatInputNumber(val);
    });
  });

  // Type pill switcher clicks
  document.querySelectorAll('.type-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTransactionTypePill(btn.dataset.type);
    });
  });

  // Transaction Search & Filter Listeners
  const searchTxInput = document.getElementById('searchTxInput');
  if (searchTxInput) {
    searchTxInput.addEventListener('input', (e) => {
      AppState.transactionFilter.search = e.target.value;
      renderTransactions();
    });
  }

  const filterType = document.getElementById('filterType');
  if (filterType) {
    filterType.addEventListener('change', (e) => {
      AppState.transactionFilter.type = e.target.value;
      renderTransactions();
    });
  }

  const filterCat = document.getElementById('filterCategory');
  if (filterCat) {
    filterCat.addEventListener('change', (e) => {
      AppState.transactionFilter.categoryId = e.target.value;
      renderTransactions();
    });
  }

  const filterWallet = document.getElementById('filterWallet');
  if (filterWallet) {
    filterWallet.addEventListener('change', (e) => {
      AppState.transactionFilter.walletId = e.target.value;
      renderTransactions();
    });
  }

  // Form Submissions
  const txForm = document.getElementById('txForm');
  if (txForm) txForm.addEventListener('submit', handleSaveTransaction);

  const walletForm = document.getElementById('walletForm');
  if (walletForm) walletForm.addEventListener('submit', handleSaveWallet);

  const budgetForm = document.getElementById('budgetForm');
  if (budgetForm) budgetForm.addEventListener('submit', handleSaveBudget);

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Initial populate & render
  populateDropdowns('expense');
  renderDashboard();
});
