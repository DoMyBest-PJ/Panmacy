/* Panmacy — shared behavior across all pages */

(function () {
  // Mobile nav drawer
  const toggle = document.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-nav-drawer]');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Toast
  let toastTimer = null;
  window.pmToast = function (message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = `<svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-toast-text></span>`;
      document.body.appendChild(el);
    }
    el.querySelector('[data-toast-text]').textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
  };

  // Cart badge count
  function getCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('pm_cart') || '[]');
      return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    } catch (e) { return 0; }
  }
  window.pmUpdateCartBadge = function () {
    document.querySelectorAll('[data-cart-badge]').forEach((el) => {
      const count = getCartCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'grid' : 'none';
    });
  };
  window.pmUpdateCartBadge();

  // ---- Profile dropdown ----
  const profileBtn = document.querySelector('[data-profile-toggle]');
  const profileMenu = document.querySelector('[data-profile-menu]');
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = profileMenu.classList.toggle('is-open');
      profileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
        profileMenu.classList.remove('is-open');
        profileBtn.setAttribute('aria-expanded', 'false');
      }
    });
    profileMenu.querySelectorAll('[data-submenu-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.closest('.dropdown-submenu').classList.toggle('is-open');
      });
    });
  }

  // ---- Modals (event delegation so it works even if markup is after this script) ----
  window.pmOpenModal = function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  };
  window.pmCloseModal = function (id) {
    const el = id ? document.getElementById(id) : null;
    if (el) {
      el.classList.remove('is-open');
    } else {
      document.querySelectorAll('.modal-backdrop.is-open').forEach((m) => m.classList.remove('is-open'));
    }
    document.body.style.overflow = '';
  };

  document.addEventListener('click', (e) => {
    // Open modal
    const openBtn = e.target.closest('[data-open-modal]');
    if (openBtn) {
      e.preventDefault();
      const id = openBtn.getAttribute('data-open-modal');
      if (id) window.pmOpenModal(id);
      if (profileMenu) {
        profileMenu.classList.remove('is-open');
        if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
      }
      return;
    }

    // Close via [data-modal-close] (X / Cancel)
    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      e.preventDefault();
      const backdrop = closeBtn.closest('.modal-backdrop');
      if (backdrop) {
        backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
      }
      return;
    }

    // Click on backdrop (outside the modal panel)
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });

  // Escape key closes open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.pmCloseModal();
    }
  });

  // Form submits (use delegation in case forms are after this script)
  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'new-thread-form') {
      e.preventDefault();
      window.pmCloseModal('modal-new-thread');
      window.pmToast('Thread posted successfully');
      e.target.reset();
    }
    if (e.target && e.target.id === 'forum-composer-form') {
      e.preventDefault();
      window.pmCloseModal('modal-forum');
      window.pmToast('Posted to Health Forum');
      e.target.reset();
    }
  });
})();
