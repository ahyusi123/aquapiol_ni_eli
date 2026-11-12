document.addEventListener('DOMContentLoaded', () => {
  const pw = document.getElementById('loginPassword'), btn = document.getElementById('pwToggle');
  if (pw && btn) btn.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    btn.classList.toggle('on', show);
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
});
