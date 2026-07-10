// ===================================
// StockVision - Dashboard JS
// myExpressApp / Azure Web App Service
// 学籍番号: 25G1135
// ===================================

const STOCKS = [
  { code: '7203', name: 'トヨタ自動車',   price: 3142,  change: 1.24,  color: '#3b82f6' },
  { code: '6758', name: 'ソニーグループ', price: 14250, change: -0.87, color: '#8b5cf6' },
  { code: '9984', name: 'ソフトバンクG',  price: 9120,  change: 2.15,  color: '#f59e0b' },
  { code: '9432', name: 'NTT',           price: 178.5, change: 0.34,  color: '#10b981' },
  { code: '6501', name: '日立製作所',     price: 15320, change: -1.43, color: '#f43f5e' },
  { code: '4063', name: '信越化学工業',   price: 7430,  change: 0.78,  color: '#06b6d4' },
  { code: '8306', name: '三菱UFJ FG',    price: 1524,  change: 1.02,  color: '#a78bfa' },
  { code: '6861', name: 'キーエンス',     price: 72800, change: -0.23, color: '#34d399' },
];

const NEWS = [
  { icon: '🏦', title: '日銀、政策金利を0.5%に据え置き決定 — 市場予想通り', src: '日経新聞', time: '12分前', tag: '金融政策' },
  { icon: '🚗', title: 'トヨタ、2025年度通期営業利益が過去最高を更新と発表', src: 'Bloomberg', time: '31分前', tag: 'トヨタ' },
  { icon: '📱', title: 'ソニー、AI搭載の次世代ゲーム機を2026年に投入予定', src: 'Reuters', time: '1時間前', tag: 'テクノロジー' },
  { icon: '📈', title: '日経平均が38,500円台を回復、円安進行が追い風に', src: 'NHK', time: '2時間前', tag: '市場動向' },
  { icon: '🌐', title: 'ソフトバンク、AIデータセンター向けに1兆円投資計画', src: 'Wall Street Journal', time: '3時間前', tag: 'AI' },
];

const PORTFOLIO = [
  { name: 'トヨタ',   pct: 28, color: '#3b82f6' },
  { name: 'ソニー',   pct: 22, color: '#8b5cf6' },
  { name: 'ソフトバンク', pct: 18, color: '#f59e0b' },
  { name: 'NTT',     pct: 15, color: '#10b981' },
  { name: 'その他',   pct: 17, color: '#4a5c7a' },
];

let mainChart = null;
let selectedStock = STOCKS[0];
let currentPeriod = '1D';

// --- Data generators ---
function genPrices(base, n, vol = 0.01) {
  const d = [];
  let p = base * 0.95;
  for (let i = 0; i < n; i++) {
    p *= 1 + (Math.random() - 0.48) * vol;
    d.push(parseFloat(p.toFixed(2)));
  }
  d[d.length - 1] = base;
  return d;
}

function genLabels(period) {
  const labels = [], now = new Date();
  let count;
  switch (period) {
    case '1D': count = 48; break;
    case '1W': count = 35; break;
    case '1M': count = 30; break;
    case '3M': count = 90; break;
    case '1Y': count = 52; break;
    default: count = 48;
  }
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (period === '1D') {
      d.setMinutes(d.getMinutes() - i * 15);
      labels.push(d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'));
    } else {
      const days = period === '1W' ? i : period === '1Y' ? i * 7 : i;
      d.setDate(d.getDate() - days);
      labels.push((d.getMonth() + 1) + '/' + d.getDate());
    }
  }
  return { labels, count };
}

// --- Main Chart ---
function drawMainChart(stock, period) {
  const ctx = document.getElementById('mainChart').getContext('2d');
  const { labels, count } = genLabels(period);
  const prices = genPrices(stock.price, count);
  const up = stock.change >= 0;
  const color = up ? '#10b981' : '#f43f5e';
  const grad = ctx.createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, up ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  if (mainChart) mainChart.destroy();
  mainChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data: prices, borderColor: color, borderWidth: 2, fill: true, backgroundColor: grad, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: color, pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(15,23,41,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#8899b4', bodyColor: '#e8edf5', padding: 12, callbacks: { label: c => ` ¥${c.raw.toLocaleString()}` } }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5c7a', font: { size: 10, family: 'JetBrains Mono' }, maxTicksLimit: 8, maxRotation: 0 }, border: { display: false } },
        y: { position: 'right', grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5c7a', font: { size: 10, family: 'JetBrains Mono' }, callback: v => '¥' + v.toLocaleString() }, border: { display: false } }
      }
    }
  });
}

// --- Donut Chart ---
function drawDonut() {
  const ctx = document.getElementById('donutChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: PORTFOLIO.map(p => p.name),
      datasets: [{ data: PORTFOLIO.map(p => p.pct), backgroundColor: PORTFOLIO.map(p => p.color), borderColor: '#0f1729', borderWidth: 3, hoverOffset: 6 }]
    },
    options: {
      responsive: false, cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(15,23,41,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, bodyColor: '#e8edf5', padding: 10, callbacks: { label: c => ` ${c.label}: ${c.raw}%` } }
      },
      animation: { animateRotate: true, duration: 800 }
    }
  });
}

// --- Render functions ---
function renderWatchlist() {
  const el = document.getElementById('watchlist-items');
  el.innerHTML = STOCKS.map((s, i) => `
    <div class="watchlist-item" onclick="selectStock(${i})">
      <div class="s-info">
        <span class="s-code">${s.code}</span>
        <span class="s-name">${s.name}</span>
      </div>
      <div class="s-prices">
        <span class="s-price" id="wp-${i}">¥${s.price.toLocaleString()}</span>
        <span class="s-chg ${s.change >= 0 ? 'up' : 'down'}" id="wc-${i}">${s.change >= 0 ? '▲' : '▼'} ${Math.abs(s.change)}%</span>
      </div>
    </div>
  `).join('');
}

function renderPortfolio() {
  document.getElementById('portfolio-legend').innerHTML = PORTFOLIO.map(p => `
    <div class="leg-item">
      <div class="leg-left">
        <div class="leg-dot" style="background:${p.color}"></div>
        <span class="leg-name">${p.name}</span>
      </div>
      <span class="leg-pct">${p.pct}%</span>
    </div>
  `).join('');
}

function renderNews() {
  document.getElementById('news-list').innerHTML = NEWS.map(n => `
    <div class="news-item">
      <div class="news-icon">${n.icon}</div>
      <div class="news-body">
        <div class="news-title">${n.title}</div>
        <div class="news-meta">
          <span class="news-src">${n.src}</span>
          <span class="news-time">${n.time}</span>
          <span class="news-tag">${n.tag}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Select Stock ---
window.selectStock = function(i) {
  selectedStock = STOCKS[i];
  document.getElementById('sel-name').textContent = `${selectedStock.name} (${selectedStock.code})`;
  document.getElementById('sel-price').textContent = `¥${selectedStock.price.toLocaleString()}`;
  const c = document.getElementById('sel-chg');
  c.textContent = `${selectedStock.change >= 0 ? '▲' : '▼'} ${Math.abs(selectedStock.change)}%`;
  c.className = `chg-badge ${selectedStock.change >= 0 ? 'up' : 'down'}`;
  drawMainChart(selectedStock, currentPeriod);
  document.querySelectorAll('.watchlist-item').forEach((el, j) => {
    el.style.background = j === i ? 'rgba(59,130,246,0.08)' : '';
  });
};

// --- Period buttons ---
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriod = btn.dataset.period;
    drawMainChart(selectedStock, currentPeriod);
  });
});

// --- Clock ---
function updateClock() {
  const now = new Date();
  const el = document.getElementById('clock');
  if (el) el.textContent = now.toLocaleTimeString('ja-JP');
}

// --- Real-time simulation ---
function simulatePrices() {
  STOCKS.forEach((s, i) => {
    s.price = parseFloat((s.price * (1 + (Math.random() - 0.49) * 0.003)).toFixed(s.price > 1000 ? 0 : 1));
    s.change = parseFloat((s.change + (Math.random() - 0.5) * 0.05).toFixed(2));
    const pe = document.getElementById(`wp-${i}`);
    const ce = document.getElementById(`wc-${i}`);
    if (pe) pe.textContent = `¥${s.price.toLocaleString()}`;
    if (ce) {
      ce.textContent = `${s.change >= 0 ? '▲' : '▼'} ${Math.abs(s.change)}%`;
      ce.className = `s-chg ${s.change >= 0 ? 'up' : 'down'}`;
    }
  });
}

// --- Init ---
(function init() {
  renderWatchlist();
  renderPortfolio();
  renderNews();
  drawMainChart(STOCKS[0], '1D');
  drawDonut();
  selectStock(0);
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(simulatePrices, 3000);
})();
