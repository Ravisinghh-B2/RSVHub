/* ============================================================
   auth.js — JWT-based login/register modal for all pages
   Exports: loadAuthState(), openLoginModal()
   ============================================================ */
const API_AUTH = '/api/v1/auth';

// ── Storage ───────────────────────────────────────────────────
const getToken = () => localStorage.getItem('rsv_token');
const getUser = () => JSON.parse(localStorage.getItem('rsv_user') || 'null');
const saveAuth = (t, u) => {
  localStorage.setItem('rsv_token', t);
  localStorage.setItem('rsv_user', JSON.stringify(u));
};
const clearAuth = () => {
  localStorage.removeItem('rsv_token');
  localStorage.removeItem('rsv_user');
};

// ── Navbar auth section ───────────────────────────────────────
const loadAuthState = () => {
  const section = document.getElementById('authSection');
  if (!section) return;
  const user = getUser();
  if (user && getToken()) {
    section.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:13px;color:var(--text-muted)">${user.username}</span>
        <button class="profile-btn" title="${user.username}">${user.username[0].toUpperCase()}</button>
        <button class="btn-signin" id="logoutBtn">Logout</button>
      </div>`;
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
  } else {
    section.innerHTML = `<button class="btn-signin" id="openLoginBtn">Sign In</button>`;
    document.getElementById('openLoginBtn')?.addEventListener('click', openLoginModal);
  }
};

// ── Modal ─────────────────────────────────────────────────────
const openLoginModal = () => {
  document.getElementById('loginModal')?.classList.remove('hidden');
};
const closeLoginModal = () => {
  document.getElementById('loginModal')?.classList.add('hidden');
};

// Close on overlay click
document.getElementById('loginModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('loginModal')) closeLoginModal();
});
document.getElementById('modalClose')?.addEventListener('click', closeLoginModal);

// Tabs
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

tabLogin?.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});
tabRegister?.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

// ── Login ─────────────────────────────────────────────────────
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('loginMsg');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  msg.textContent = 'Signing in...';
  msg.className = 'auth-msg';

  try {
    const res = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    saveAuth(json.data.accessToken, json.data.user);
    msg.className = 'auth-msg success';
    msg.textContent = `Welcome back, ${json.data.user.username}!`;
    setTimeout(() => { closeLoginModal(); loadAuthState(); }, 800);
  } catch (err) {
    msg.className = 'auth-msg error';
    msg.textContent = err.message || 'Login failed';
  }
});

// ── Register ──────────────────────────────────────────────────
registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('registerMsg');
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  msg.textContent = 'Creating account...';
  msg.className = 'auth-msg';

  try {
    const res = await fetch(`${API_AUTH}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    saveAuth(json.data.accessToken, json.data.user);
    msg.className = 'auth-msg success';
    msg.textContent = `Account created! Welcome, ${json.data.user.username}!`;
    setTimeout(() => { closeLoginModal(); loadAuthState(); }, 800);
  } catch (err) {
    msg.className = 'auth-msg error';
    msg.textContent = err.message || 'Registration failed';
  }
});

// ── Logout ────────────────────────────────────────────────────
const logout = async () => {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_AUTH}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) { /* ignore network error on logout */ }
  }
  clearAuth();
  loadAuthState();
};

// ── Expose globals ────────────────────────────────────────────
window.openLoginModal = openLoginModal;
window.getToken = getToken;

// ── Init ──────────────────────────────────────────────────────
loadAuthState();
