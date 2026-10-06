(function () {
  // Like toggle
  document.querySelectorAll('[data-like]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const countEl = btn.querySelector('[data-like-count]');
      let count = parseInt(countEl.textContent, 10);
      const liked = btn.classList.toggle('is-liked');
      countEl.textContent = liked ? count + 1 : count - 1;
    });
  });

  // Tab switching (visual only in this demo)
  document.querySelectorAll('.forum-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.forum-tab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
    });
  });
})();
