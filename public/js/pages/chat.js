(function () {
  // Switch active conversation (demo: updates header name only)
  document.querySelectorAll('[data-conv]').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('[data-conv]').forEach((i) => i.classList.remove('is-active'));
      item.classList.add('is-active');
      const nameEl = document.querySelector('[data-thread-name]');
      if (nameEl) nameEl.textContent = item.dataset.name;
      const unread = item.querySelector('.conv-item__unread');
      if (unread) unread.remove();
      const convList = document.querySelector('[data-group="conv-list"]');
      if (window.innerWidth <= 860 && convList) convList.classList.remove('is-open');
    });
  });

  // Mobile: toggle conversation list
  const convToggle = document.querySelector('[data-conv-toggle]');
  const convList = document.querySelector('[data-group="conv-list"]');
  function syncConvToggle() {
    if (!convToggle) return;
    convToggle.style.display = window.innerWidth <= 860 ? 'grid' : 'none';
  }
  if (convToggle && convList) {
    convToggle.addEventListener('click', () => convList.classList.toggle('is-open'));
    window.addEventListener('resize', syncConvToggle);
    syncConvToggle();
  }

  // Send message
  const messages = document.querySelector('[data-messages]');
  const input = document.querySelector('[data-msg-input]');
  const sendBtn = document.querySelector('[data-msg-send]');

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    const row = document.createElement('div');
    row.className = 'msg-row is-mine';
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    row.innerHTML = `<div><div class="msg-bubble"></div><span class="msg-time">${time}</span></div>`;
    row.querySelector('.msg-bubble').textContent = text;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    input.value = '';
  }
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  // Auto-scroll to latest message on load
  if (messages) messages.scrollTop = messages.scrollHeight;
})();
