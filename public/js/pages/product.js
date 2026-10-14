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
  const priceElement = document.querySelector('[data-unit-price]');
  const UNIT_PRICE = priceElement ? Number(priceElement.dataset.unitPrice) : 0;
  const addBtn = document.querySelector('[data-add-to-cart]');
  const MAX_QTY = qtyInput ? Number(qtyInput.max) || 10 : 10;

  function clampQty(val) {
    let n = parseInt(val, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > MAX_QTY) n = MAX_QTY;
    return n;
  }
  function syncQty() {
    const qty = clampQty(qtyInput.value);
    qtyInput.value = qty;
    if (minusBtn) minusBtn.disabled = qty <= 1;
    if (plusBtn) plusBtn.disabled = qty >= MAX_QTY;
    if (addBtn) addBtn.textContent = `Add to cart — ฿${qty * UNIT_PRICE}`;
  }
  if (qtyInput) {
    minusBtn.addEventListener('click', () => { qtyInput.value = clampQty(qtyInput.value) - 1; syncQty(); });
    plusBtn.addEventListener('click', () => { qtyInput.value = clampQty(qtyInput.value) + 1; syncQty(); });
    qtyInput.addEventListener('change', syncQty);
    syncQty();
  }

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      if (addBtn.disabled) return;

      const originalText = addBtn.textContent;
      addBtn.disabled = true;
      addBtn.textContent = 'Adding...';

      try {
        const response = await fetch('/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productID: addBtn.dataset.productId,
            quantity: clampQty(qtyInput.value)
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to add product.');
        }

        window.pmUpdateCartBadge(result.cartItemCount);
        window.pmToast(result.message);
      } catch (error) {
        alert(error.message || 'Unable to add product.');
      } finally {
        addBtn.disabled = false;
        syncQty();
      }
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
