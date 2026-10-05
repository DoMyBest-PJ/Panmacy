(function () {
  const DELIVERY_PER_PHARMACY = 20;

  function formatBaht(n) { return '฿' + n.toLocaleString('th-TH'); }

  function recalcItem(item) {
    const price = parseFloat(item.dataset.price);
    const qtyInput = item.querySelector('[data-qty-input]');
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    qtyInput.value = qty;
    item.querySelector('[data-line-total]').textContent = formatBaht(price * qty);
    return { qty, lineTotal: price * qty };
  }

  function recalcAll() {
    const items = document.querySelectorAll('[data-item]');
    let subtotal = 0;
    let totalQty = 0;
    const pharmacies = new Set();
    items.forEach((item) => {
      const { qty, lineTotal } = recalcItem(item);
      subtotal += lineTotal;
      totalQty += qty;
      pharmacies.add(item.dataset.pharmacy);
    });
    const delivery = pharmacies.size * DELIVERY_PER_PHARMACY;
    const subtotalEl = document.querySelector('[data-summary-subtotal]');
    const totalEl = document.querySelector('[data-summary-total]');
    if (subtotalEl) subtotalEl.textContent = formatBaht(subtotal) ;
    if (totalEl) totalEl.textContent = formatBaht(subtotal + delivery);

    // Remove empty pharmacy groups
    document.querySelectorAll('.pharmacy-group').forEach((group) => {
      if (!group.querySelector('[data-item]')) group.remove();
    });

    // Empty cart state
    const container = document.querySelector('[data-group="cart-items"]');
    if (items.length === 0 && container && !container.querySelector('.empty-cart')) {
      container.innerHTML = `
        <div class="card empty-cart">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 4h1.6L6 12.5A1.5 1.5 0 007.5 14h6a1.5 1.5 0 001.5-1.2L16.5 6.5H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h3>ตะกร้าของคุณว่างเปล่า</h3>
          <p>เลือกซื้อยาและเวชภัณฑ์จากร้านยาที่ไว้ใจได้</p>
          <a href="index.html" class="btn btn--primary" style="margin-top:16px;">เลือกซื้อสินค้า</a>
        </div>`;
    }
  }

  document.querySelectorAll('[data-item]').forEach((item) => {
    const minus = item.querySelector('[data-qty-minus]');
    const plus = item.querySelector('[data-qty-plus]');
    const qtyInput = item.querySelector('[data-qty-input]');
    minus.addEventListener('click', () => { qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1); recalcAll(); });
    plus.addEventListener('click', () => { qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1; recalcAll(); });
    qtyInput.addEventListener('change', recalcAll);

    item.querySelector('[data-remove-item]').addEventListener('click', () => {
      item.remove();
      recalcAll();
      window.pmToast('ลบสินค้าออกจากตะกร้าแล้ว');
    });
  });

  recalcAll();
})();
