(function () {
  // Copy order number
  const copyBtn = document.querySelector('[data-copy-order]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const orderNumber = document.querySelector('.order-number-row strong').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(orderNumber).catch(() => {});
      window.pmToast('คัดลอกหมายเลขคำสั่งซื้อแล้ว');
    });
  }

  // Clear the demo cart once an order completes
  try {
    localStorage.setItem('pm_cart', '[]');
    window.pmUpdateCartBadge();
  } catch (e) {}
})();
