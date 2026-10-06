(function () {
  // Category chip selection
  document.querySelectorAll('[data-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-chip]').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
    });
  });

  // Mobile filters toggle (sidebar becomes a collapsible panel under 980px)
  const filtersToggle = document.querySelector('[data-filters-toggle]');
  const filters = document.querySelector('[data-filters]');
  function syncFiltersToggle() {
    if (window.innerWidth <= 980) {
      filtersToggle.style.display = 'inline-flex';
    } else {
      filtersToggle.style.display = 'none';
      filters.classList.remove('is-open');
    }
  }
  if (filtersToggle && filters) {
    filtersToggle.addEventListener('click', () => filters.classList.toggle('is-open'));
    window.addEventListener('resize', syncFiltersToggle);
    syncFiltersToggle();
  }

  // Add to cart -> toast + persist a demo entry
  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        const cart = JSON.parse(localStorage.getItem('pm_cart') || '[]');
        const card = btn.closest('.product-card');
        const name = card.querySelector('.product-card__name').textContent.trim();
        const existing = cart.find((i) => i.name === name);
        if (existing) existing.qty += 1;
        else cart.push({ name, qty: 1 });
        localStorage.setItem('pm_cart', JSON.stringify(cart));
        window.pmUpdateCartBadge();
      } catch (e) {}
      window.pmToast('เพิ่มลงตะกร้าแล้ว');
    });
  });
})();
