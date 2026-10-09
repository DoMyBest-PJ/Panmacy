(function () {
  // Password visibility toggle (works for any [data-password-toggle] paired with the preceding input)
  document.querySelectorAll('[data-password-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');
    });
  });

  // Sign up: live confirm-password validation state
  const pwInput = document.querySelector('[data-password-input]');
  const confirmInput = document.querySelector('[data-confirm-input]');
  const confirmField = document.querySelector('[data-confirm-field]');
  const confirmError = document.querySelector('[data-confirm-error]');

  function validateConfirm() {
    if (!confirmInput.value) {
      confirmField.classList.remove('is-valid');
      confirmInput.classList.remove('is-invalid');
      confirmError.style.display = 'none';
      return;
    }
    const matches = pwInput.value === confirmInput.value;
    confirmInput.classList.toggle('is-invalid', !matches);
    confirmField.classList.toggle('is-valid', matches);
    confirmError.style.display = matches ? 'none' : 'block';
  }
  if (confirmInput) {
    confirmInput.addEventListener('input', validateConfirm);
    pwInput.addEventListener('input', validateConfirm);
  }

})();
