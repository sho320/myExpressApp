// ===================================
// StockVision - Dashboard JS
// myExpressApp / Azure Web App Service
// 学籍番号: 25G1135
// ===================================

const DEFAULT_STOCKS = [
  { code: '7203', name: 'トヨタ自動車',   price: 3142,  change: 1.24,  color: '#3b82f6' },
  { code: '6758', name: 'ソニーグループ', price: 14250, change: -0.87, color: '#8b5cf6' },
  { code: '9984', name: 'ソフトバンクG',  price: 9120,  change: 2.15,  color: '#f59e0b' },
  { code: '9432', name: 'NTT',           price: 178.5, change: 0.34,  color: '#10b981' },
  { code: '6501', name: '日立製作所',     price: 15320, change: -1.43, color: '#f43f5e' },
  { code: '4063', name: '信越化学工業',   price: 7430,  change: 0.78,  color: '#06b6d4' },
  { code: '8306', name: '三菱UFJ FG',    price: 1524,  change: 1.02,  color: '#a78bfa' },
  { code: '6861', name: 'キーエンス',     price: 72800, change: -0.23, color: '#34d399' },
];

const COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#f43f5e','#06b6d4','#a78bfa','#34d399','#fb923c','#e879f9'];

// localStorage から読み込み（なければデフォルト）
let STOCKS = JSON.parse(localStorage.getItem('sv_stocks') || 'null') || DEFAULT_STOCKS;

const NEWS = [
  { icon: '🏦', title: '日銀、政策金利を0.5%に据え置き決定 — 市場予想通り', src: '日経新聞', time: '12分前', tag: '金融政策' },
  { icon: '🚗', title: 'トヨタ、2025年度通期営業利益が過去最高を更新と発表', src: 'Bloomberg', time: '31分前', tag: 'トヨタ' },
  { icon: '📱', title: 'ソニー、AI搭載の次世代ゲーム機を2026年に投入予定', src: 'Reuters', time: '1時間前', tag: 'テクノロジー' },
  { icon: '📈', title: '日経平均が38,500円台を回復、円安進行が追い風に', src: 'NHK', time: '2時間前', tag: '市場動向' },
  { icon: '🌐', title: 'ソフトバンク、AIデータセンター向けに1兆円投資計画', src: 'Wall Street Journal', time: '3時間前', tag: 'AI' },
];

function buildPortfolioFromStocks() {
  const total = STOCKS.reduce((s, st) => s + st.price, 0);
  return STOCKS.slice(0, 5).map((s, i) => ({
    name: s.name.length > 6 ? s.name.slice(0, 6) : s.name,
    pct: Math.round((s.price / total) * 100),
    color: COLORS[i % COLORS.length]
  }));
}

let PORTFOLIO = buildPortfolioFromStocks();

let mainChart = null;
let donutChart = null;
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
  PORTFOLIO = buildPortfolioFromStocks();
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctx, {
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
  PORTFOLIO = buildPortfolioFromStocks();
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

// =============================================
// 編集モーダル
// =============================================
function buildEditModal() {
  const existing = document.getElementById('edit-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeEditModal()"></div>
    <div class="modal-box">
      <div class="modal-header">
        <span class="modal-title">保有株の編集</span>
        <button class="modal-close" onclick="closeEditModal()">×</button>
      </div>
      <div class="modal-body">
        <table class="edit-table">
          <thead>
            <tr>
              <th>証券コード</th>
              <th>銘柄名</th>
              <th>現在値 (¥)</th>
              <th>騰落率 (%)</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="edit-tbody">
          </tbody>
        </table>
        <button class="btn-add-row" onclick="addEditRow()">+ 銘柄を追加</button>
      </div>
      <div class="modal-footer">
        <button class="btn-reset" onclick="resetStocks()">リセット</button>
        <div>
          <button class="btn-cancel" onclick="closeEditModal()">キャンセル</button>
          <button class="btn-save" onclick="saveStocks()">保存</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  renderEditRows();
}

function renderEditRows() {
  const tbody = document.getElementById('edit-tbody');
  tbody.innerHTML = STOCKS.map((s, i) => `
    <tr id="edit-row-${i}">
      <td><input class="edit-input" value="${s.code}" id="ec-${i}" placeholder="7203" maxlength="6"></td>
      <td><input class="edit-input" value="${s.name}" id="en-${i}" placeholder="銘柄名"></td>
      <td><input class="edit-input num" value="${s.price}" id="ep-${i}" type="number" min="0"></td>
      <td><input class="edit-input num" value="${s.change}" id="ech-${i}" type="number" step="0.01"></td>
      <td><button class="btn-del" onclick="deleteRow(${i})">削除</button></td>
    </tr>
  `).join('');
}

window.addEditRow = function() {
  const newStock = { code: '', name: '', price: 1000, change: 0, color: COLORS[STOCKS.length % COLORS.length] };
  STOCKS.push(newStock);
  renderEditRows();
  // 最後の行にフォーカス
  const lastIdx = STOCKS.length - 1;
  setTimeout(() => document.getElementById(`ec-${lastIdx}`)?.focus(), 50);
};

window.deleteRow = function(i) {
  if (STOCKS.length <= 1) { alert('最低1銘柄は必要です'); return; }
  STOCKS.splice(i, 1);
  renderEditRows();
};

window.saveStocks = function() {
  const newStocks = [];
  for (let i = 0; i < STOCKS.length; i++) {
    const code  = document.getElementById(`ec-${i}`)?.value.trim();
    const name  = document.getElementById(`en-${i}`)?.value.trim();
    const price = parseFloat(document.getElementById(`ep-${i}`)?.value) || 0;
    const change = parseFloat(document.getElementById(`ech-${i}`)?.value) || 0;
    if (!code || !name) { alert(`${i+1}行目: コードと銘柄名を入力してください`); return; }
    newStocks.push({ code, name, price, change, color: COLORS[i % COLORS.length] });
  }
  STOCKS = newStocks;
  localStorage.setItem('sv_stocks', JSON.stringify(STOCKS));
  selectedStock = STOCKS[0];
  renderWatchlist();
  renderPortfolio();
  drawDonut();
  drawMainChart(selectedStock, currentPeriod);
  selectStock(0);
  closeEditModal();
};

window.resetStocks = function() {
  if (!confirm('デフォルト銘柄に戻しますか？')) return;
  STOCKS = JSON.parse(JSON.stringify(DEFAULT_STOCKS));
  renderEditRows();
};

window.closeEditModal = function() {
  const m = document.getElementById('edit-modal');
  if (m) m.remove();
  // リセット（保存してなければ元に戻す）
  STOCKS = JSON.parse(localStorage.getItem('sv_stocks') || 'null') || DEFAULT_STOCKS;
  renderWatchlist();
};

window.openEditModal = function() {
  buildEditModal();
};

// モーダル用CSS
function injectModalCSS() {
  const style = document.createElement('style');
  style.textContent = `
    #edit-modal {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-backdrop {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    }
    .modal-box {
      position: relative; z-index: 1;
      background: #0f1729; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; width: min(700px, 95vw);
      max-height: 85vh; display: flex; flex-direction: column;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      animation: modalIn .2s ease;
    }
    @keyframes modalIn {
      from { opacity:0; transform: scale(.96) translateY(8px); }
      to   { opacity:1; transform: scale(1) translateY(0); }
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .modal-title { font-size: 1.05rem; font-weight: 600; color: #e8edf5; }
    .modal-close {
      background: none; border: none; color: #8899b4; font-size: 1.1rem;
      cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: .15s;
    }
    .modal-close:hover { background: rgba(255,255,255,0.08); color: #e8edf5; }
    .modal-body {
      padding: 20px 24px; overflow-y: auto; flex: 1;
    }
    .edit-table { width: 100%; border-collapse: collapse; }
    .edit-table th {
      text-align: left; padding: 8px 10px; font-size: .75rem;
      color: #4a5c7a; border-bottom: 1px solid rgba(255,255,255,0.06);
      font-weight: 500; letter-spacing: .04em;
    }
    .edit-table td { padding: 6px 6px; }
    .edit-input {
      width: 100%; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
      color: #e8edf5; padding: 8px 10px; font-size: .85rem;
      outline: none; transition: .15s; box-sizing: border-box;
    }
    .edit-input.num { font-family: 'JetBrains Mono', monospace; }
    .edit-input:focus { border-color: #3b82f6; background: rgba(59,130,246,0.08); }
    .btn-del {
      background: none; border: 1px solid rgba(244,63,94,0.3); color: #f43f5e;
      border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: .9rem;
      transition: .15s;
    }
    .btn-del:hover { background: rgba(244,63,94,0.15); }
    .btn-add-row {
      margin-top: 12px; width: 100%;
      background: rgba(59,130,246,0.1); border: 1px dashed rgba(59,130,246,0.4);
      color: #3b82f6; border-radius: 8px; padding: 10px;
      cursor: pointer; font-size: .9rem; transition: .15s;
    }
    .btn-add-row:hover { background: rgba(59,130,246,0.2); }
    .modal-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.08); gap: 10px;
    }
    .btn-reset {
      background: none; border: 1px solid rgba(255,255,255,0.15);
      color: #8899b4; border-radius: 8px; padding: 9px 16px;
      cursor: pointer; font-size: .85rem; transition: .15s;
    }
    .btn-reset:hover { border-color: rgba(255,255,255,0.3); color: #e8edf5; }
    .btn-cancel {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: #8899b4; border-radius: 8px; padding: 9px 18px;
      cursor: pointer; font-size: .85rem; transition: .15s; margin-right: 8px;
    }
    .btn-cancel:hover { color: #e8edf5; }
    .btn-save {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border: none; color: #fff; border-radius: 8px; padding: 9px 22px;
      cursor: pointer; font-size: .85rem; font-weight: 600;
      box-shadow: 0 4px 16px rgba(59,130,246,0.4); transition: .15s;
    }
    .btn-save:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .edit-btn {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: #8899b4; border-radius: 8px; padding: 5px 10px;
      cursor: pointer; font-size: .78rem; transition: .15s; margin-left: 8px;
    }
    .edit-btn:hover { color: #e8edf5; border-color: rgba(255,255,255,0.25); }
  `;
  document.head.appendChild(style);
}

// ウォッチリストのヘッダーに編集ボタンを追加
function addEditButton() {
  const header = document.querySelector('.watchlist h2, .section-title, .watchlist-header');
  if (header) {
    const btn = document.createElement('button');
    btn.className = 'edit-btn';
    btn.textContent = '編集';
    btn.onclick = openEditModal;
    header.appendChild(btn);
    return;
  }
  // ウォッチリストの親要素を探してボタンを挿入
  const watchlistEl = document.getElementById('watchlist-items');
  if (watchlistEl) {
    const btn = document.createElement('button');
    btn.className = 'edit-btn';
    btn.style.cssText = 'display:block;width:100%;margin-bottom:8px;background:rgba(59,130,246,0.1);border:1px dashed rgba(59,130,246,0.4);color:#3b82f6;border-radius:8px;padding:8px;cursor:pointer;font-size:.85rem;';
    btn.textContent = '保有株を編集';
    btn.onclick = openEditModal;
    watchlistEl.parentNode.insertBefore(btn, watchlistEl);
  }
}

// --- Init ---
(function init() {
  injectModalCSS();
  renderWatchlist();
  renderPortfolio();
  renderNews();
  drawMainChart(STOCKS[0], '1D');
  drawDonut();
  selectStock(0);
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(simulatePrices, 3000);
  // DOM描画後にボタンを挿入
  setTimeout(addEditButton, 100);
})();
