/**
 * FinFlow - Chart & Visual Analytics Renderer
 * Supports CDN Chart.js or standalone HTML5 Canvas rendering for 100% offline reliability.
 */

class ChartRenderer {
  constructor() {
    this.chartInstances = {};
  }

  // Render Category Breakdown Donut
  renderCategoryDonut(canvasId, categoryData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // If Chart.js is loaded via CDN, use its polished engine
    if (typeof Chart !== 'undefined') {
      if (this.chartInstances[canvasId]) {
        this.chartInstances[canvasId].destroy();
      }

      const labels = categoryData.map(c => c.name);
      const data = categoryData.map(c => c.total);
      const colors = categoryData.map(c => c.color);

      if (data.length === 0) {
        this.drawEmptyCanvas(ctx, canvas, 'Belum ada data pengeluaran');
        return;
      }

      this.chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: document.body.dataset.theme === 'light' ? '#ffffff' : '#121824',
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
              bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                  return ` ${context.label}: Rp ${val.toLocaleString('id-ID')} (${pct}%)`;
                }
              }
            }
          }
        }
      });
      return;
    }

    // High Quality Standalone Canvas Fallback (Works 100% offline)
    this.renderCustomDonut(ctx, canvas, categoryData);
  }

  // Render Cash Flow Bar Chart (Income vs Expense)
  renderCashFlowBar(canvasId, monthlyTx) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Group last 7 days or weeks
    const daysMap = {};
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const past = new Date(d);
      past.setDate(d.getDate() - i);
      const key = past.toISOString().split('T')[0];
      const shortDay = past.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      daysMap[key] = { label: shortDay, income: 0, expense: 0 };
    }

    // Populate data
    monthlyTx.forEach(tx => {
      if (daysMap[tx.date]) {
        if (tx.type === 'income') daysMap[tx.date].income += tx.amount;
        if (tx.type === 'expense') daysMap[tx.date].expense += tx.amount;
      }
    });

    const labels = Object.values(daysMap).map(v => v.label);
    const incomeData = Object.values(daysMap).map(v => v.income);
    const expenseData = Object.values(daysMap).map(v => v.expense);

    if (typeof Chart !== 'undefined') {
      if (this.chartInstances[canvasId]) {
        this.chartInstances[canvasId].destroy();
      }

      this.chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Pemasukan',
              data: incomeData,
              backgroundColor: '#10b981',
              borderRadius: 6,
              barThickness: 16
            },
            {
              label: 'Pengeluaran',
              data: expenseData,
              backgroundColor: '#f43f5e',
              borderRadius: 6,
              barThickness: 16
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: document.body.dataset.theme === 'light' ? '#475569' : '#94a3b8',
                font: { family: 'Plus Jakarta Sans', weight: '600' }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return ` ${context.dataset.label}: Rp ${(context.raw || 0).toLocaleString('id-ID')}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: document.body.dataset.theme === 'light' ? '#64748b' : '#94a3b8' }
            },
            y: {
              grid: {
                color: document.body.dataset.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'
              },
              ticks: {
                color: document.body.dataset.theme === 'light' ? '#64748b' : '#94a3b8',
                callback: function(value) {
                  if (value >= 1000000) return (value / 1000000).toFixed(1) + ' jt';
                  if (value >= 1000) return (value / 1000).toFixed(0) + ' rb';
                  return value;
                }
              }
            }
          }
        }
      });
      return;
    }

    // Standalone Canvas fallback for bar chart
    this.renderCustomBar(ctx, canvas, labels, incomeData, expenseData);
  }

  // Fallback Donut Canvas Renderer
  renderCustomDonut(ctx, canvas, categoryData) {
    const width = canvas.width = canvas.parentElement.clientWidth || 300;
    const height = canvas.height = 260;
    ctx.clearRect(0, 0, width, height);

    const total = categoryData.reduce((sum, c) => sum + c.total, 0);
    if (total === 0) {
      this.drawEmptyCanvas(ctx, canvas, 'Belum ada data pengeluaran');
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 25;
    const innerRadius = radius * 0.7;

    let startAngle = -Math.PI / 2;

    categoryData.forEach(item => {
      const sliceAngle = (item.total / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center hole text
    ctx.fillStyle = document.body.dataset.theme === 'light' ? '#0f172a' : '#f8fafc';
    ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total', centerX, centerY - 10);
    ctx.font = '12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Rp ${(total / 1000000).toFixed(1)} jt`, centerX, centerY + 12);
  }

  // Fallback Bar Chart Canvas Renderer
  renderCustomBar(ctx, canvas, labels, incomeData, expenseData) {
    const width = canvas.width = canvas.parentElement.clientWidth || 400;
    const height = canvas.height = 260;
    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...incomeData, ...expenseData, 100000);
    const barWidth = Math.max(8, (width - 80) / (labels.length * 3));
    const startX = 50;
    const bottomY = height - 40;

    // Draw axes & bars
    labels.forEach((label, i) => {
      const groupX = startX + i * (barWidth * 3 + 12);

      // Income bar
      const incHeight = (incomeData[i] / maxVal) * (height - 80);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(groupX, bottomY - incHeight, barWidth, incHeight, [4, 4, 0, 0]);
      } else {
        ctx.rect(groupX, bottomY - incHeight, barWidth, incHeight);
      }
      ctx.fill();

      // Expense bar
      const expHeight = (expenseData[i] / maxVal) * (height - 80);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(groupX + barWidth + 3, bottomY - expHeight, barWidth, expHeight, [4, 4, 0, 0]);
      } else {
        ctx.rect(groupX + barWidth + 3, bottomY - expHeight, barWidth, expHeight);
      }
      ctx.fill();

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label.split(' ')[0], groupX + barWidth, bottomY + 18);
    });
  }

  drawEmptyCanvas(ctx, canvas, message) {
    const w = canvas.width = canvas.parentElement.clientWidth || 300;
    const h = canvas.height = 260;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, w / 2, h / 2);
  }
}

const chartRenderer = new ChartRenderer();
