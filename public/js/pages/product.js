(function () {
  // Gallery thumbnail switching
  const mainMedia = document.querySelector('[data-gallery-main]');
  document.querySelectorAll('[data-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('[data-thumb]').forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (mainMedia) mainMedia.innerHTML = thumb.innerHTML;
    });
  });

  // Quantity stepper
  const qtyInput = document.querySelector('[data-qty-input]');
  const minusBtn = document.querySelector('[data-qty-minus]');
  const plusBtn = document.querySelector('[data-qty-plus]');
  const UNIT_PRICE = 25;
  const addBtn = document.querySelector('[data-add-to-cart]');
  const MAX_QTY = 10;

  function clampQty(val) {
    let n = parseInt(val, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > MAX_QTY) n = MAX_QTY;
    return n;
  }
  function syncQty() {
    const qty = clampQty(qtyInput.value);
    qtyInput.value = qty;
    minusBtn.disabled = qty <= 1;
    plusBtn.disabled = qty >= MAX_QTY;
    if (addBtn) addBtn.textContent = `เพิ่มลงตะกร้า — ฿${qty * UNIT_PRICE}`;
  }
  if (qtyInput) {
    minusBtn.addEventListener('click', () => { qtyInput.value = clampQty(qtyInput.value) - 1; syncQty(); });
    plusBtn.addEventListener('click', () => { qtyInput.value = clampQty(qtyInput.value) + 1; syncQty(); });
    qtyInput.addEventListener('change', syncQty);
    syncQty();
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      try {
        const cart = JSON.parse(localStorage.getItem('pm_cart') || '[]');
        const name = document.querySelector('.product-info__name').textContent.trim();
        const qty = clampQty(qtyInput.value);
        const existing = cart.find((i) => i.name === name);
        if (existing) existing.qty += qty;
        else cart.push({ name, qty });
        localStorage.setItem('pm_cart', JSON.stringify(cart));
        window.pmUpdateCartBadge();
      } catch (e) {}
      window.pmToast('เพิ่มลงตะกร้าแล้ว');
    });
  }

  // Info tabs
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach((b) => b.classList.remove('is-active'));
      document.querySelectorAll('[data-panel]').forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('is-active');
    });
  });
})();
