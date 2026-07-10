// ===================================
// Stock Manager JS
// ===================================

const DEFAULT_STOCKS = [
  { code: '7203', name: 'トヨタ自動車', price: 3142, shares: 100 },
  { code: '6758', name: 'ソニーグループ', price: 14250, shares: 200 },
  { code: '9984', name: 'ソフトバンクG', price: 9120, shares: 100 },
  { code: '6861', name: 'キーエンス', price: 72800, shares: 10 },
];

let STOCKS = JSON.parse(localStorage.getItem('sm_stocks') || 'null') || DEFAULT_STOCKS;
let editIndex = -1;

function render() {
  const tbody = document.getElementById('stock-tbody');
  let totalVal = 0;
  
  if (STOCKS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8899b4;">登録されている銘柄はありません。</td></tr>`;
    document.getElementById('total-val').textContent = `¥0`;
    document.getElementById('total-count').textContent = 0;
    return;
  }

  tbody.innerHTML = STOCKS.map((s, i) => {
    const val = s.price * s.shares;
    totalVal += val;
    return `
      <tr>
        <td style="font-family:'JetBrains Mono', monospace;color:#8899b4;">${s.code}</td>
        <td style="font-weight:500;">${s.name}</td>
        <td style="font-family:'JetBrains Mono', monospace;">¥${s.price.toLocaleString()}</td>
        <td>${s.shares.toLocaleString()} 株</td>
        <td style="font-family:'JetBrains Mono', monospace;color:#10b981;">¥${val.toLocaleString()}</td>
        <td>
          <button class="btn-edit" onclick="openEditModal(${i})">編集</button>
          <button class="btn-del" onclick="delStock(${i})">削除</button>
        </td>
      </tr>
    `;
  }).join('');
  
  document.getElementById('total-val').textContent = `¥${totalVal.toLocaleString()}`;
  document.getElementById('total-count').textContent = STOCKS.length;
}

window.openModal = function() {
  editIndex = -1;
  document.getElementById('modal-title').textContent = '新規銘柄の追加';
  document.getElementById('inp-code').value = '';
  document.getElementById('inp-name').value = '';
  document.getElementById('inp-price').value = '';
  document.getElementById('inp-shares').value = '';
  document.getElementById('modal').style.display = 'flex';
};

window.openEditModal = function(i) {
  editIndex = i;
  const s = STOCKS[i];
  document.getElementById('modal-title').textContent = '銘柄の編集';
  document.getElementById('inp-code').value = s.code;
  document.getElementById('inp-name').value = s.name;
  document.getElementById('inp-price').value = s.price;
  document.getElementById('inp-shares').value = s.shares;
  document.getElementById('modal').style.display = 'flex';
};

window.closeModal = function() {
  document.getElementById('modal').style.display = 'none';
};

window.saveStock = function() {
  const code = document.getElementById('inp-code').value.trim();
  const name = document.getElementById('inp-name').value.trim();
  const price = parseFloat(document.getElementById('inp-price').value);
  const shares = parseInt(document.getElementById('inp-shares').value, 10);

  if (!code || !name || isNaN(price) || isNaN(shares) || price < 0 || shares < 1) {
    alert('入力内容に誤りがあります。正しく入力してください。');
    return;
  }

  const newStock = { code, name, price, shares };

  if (editIndex >= 0) {
    STOCKS[editIndex] = newStock;
  } else {
    STOCKS.push(newStock);
  }

  localStorage.setItem('sm_stocks', JSON.stringify(STOCKS));
  render();
  closeModal();
};

window.delStock = function(i) {
  if (confirm(`「${STOCKS[i].name}」を削除してもよろしいですか？`)) {
    STOCKS.splice(i, 1);
    localStorage.setItem('sm_stocks', JSON.stringify(STOCKS));
    render();
  }
};

// --- Init ---
(function init() {
  render();
})();
