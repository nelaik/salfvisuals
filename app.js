// Общий код всех страниц: настройки из version.json, аккаунт (вход/регистрация через бэкенд),
// окно входа, уведомления, меню на телефоне.
//
// Аккаунты работают через свой сервер (apiBaseUrl в version.json). GitHub Pages умеет только раздавать
// файлы — хранить пароли и проверять вход он не может, поэтому этим занимается бэкенд. Пока apiBaseUrl
// пустой, окно входа честно говорит, что сервер ещё не подключён.

const SV = (() => {
  const TOKEN_KEY = 'sv_token';
  let config = null;
  let user = null;
  const listeners = [];

  // ---------------------------------------------------------------- хранилище токена

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  }
  function setToken(t) {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch { /* приватный режим — токен живёт до перезагрузки */ }
  }

  // ---------------------------------------------------------------- конфиг

  const configReady = fetch('version.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then((c) => { config = c; return c; })
    .catch(() => { config = {}; return config; });

  function apiBase() {
    return config && config.apiBaseUrl ? config.apiBaseUrl.replace(/\/$/, '') : '';
  }

  async function api(path, { method = 'GET', body } = {}) {
    const base = apiBase();
    if (!base) throw new Error('Сервер аккаунтов ещё не подключён.');
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    let res;
    try {
      res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch {
      throw new Error('Сервер аккаунтов не отвечает. Попробуй через минуту.');
    }
    let data = {};
    try { data = await res.json(); } catch { /* пустой ответ */ }
    if (!res.ok) {
      const e = new Error(data.error || 'Что-то пошло не так. Попробуй ещё раз.');
      e.status = res.status;
      throw e;
    }
    return data;
  }

  // ---------------------------------------------------------------- пользователь

  function setUser(u) {
    user = u;
    renderNav();
    listeners.forEach((fn) => fn(user));
  }

  async function loadUser() {
    await configReady;
    if (!getToken() || !apiBase()) { setUser(null); return null; }
    try {
      const { user: u } = await api('/api/me');
      setUser(u);
      return u;
    } catch (e) {
      if (e.status === 401) setToken('');
      setUser(null);
      return null;
    }
  }

  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* всё равно выходим локально */ }
    setToken('');
    setUser(null);
    toast('Ты вышел из аккаунта.');
  }

  function initials(name) {
    return (name || '?').replace(/[^A-Za-zА-Яа-я0-9]/g, '').slice(0, 2).toUpperCase() || '?';
  }

  /** Аватар: голова скина по нику Minecraft, если указан; иначе — инициалы. */
  function avatarEl(u, cls = 'avatar') {
    const el = document.createElement('span');
    el.className = cls;
    el.textContent = initials(u.username);
    if (u.minecraftNick) {
      const img = new Image();
      img.alt = '';
      img.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(u.minecraftNick) + '/96';
      img.onload = () => { el.textContent = ''; el.appendChild(img); };
    }
    return el;
  }

  // ---------------------------------------------------------------- шапка

  function renderNav() {
    const box = document.getElementById('nav-actions');
    if (!box) return;
    box.textContent = '';
    if (user) {
      const a = document.createElement('a');
      a.className = 'user-chip';
      a.href = 'account.html';
      a.appendChild(avatarEl(user));
      a.appendChild(document.createTextNode(user.username));
      box.appendChild(a);
    } else {
      const b = document.createElement('button');
      b.className = 'btn btn-ghost btn-small';
      b.type = 'button';
      b.textContent = 'Войти';
      b.addEventListener('click', () => openAuth('login'));
      box.appendChild(b);
    }
    const dl = document.createElement('a');
    dl.className = 'btn btn-primary btn-small';
    dl.href = location.pathname.endsWith('account.html') ? 'index.html#install' : '#install';
    dl.textContent = 'Скачать';
    box.appendChild(dl);

    const cta = document.getElementById('account-cta');
    if (cta) {
      if (user) {
        cta.textContent = 'Открыть профиль';
        cta.onclick = (ev) => { ev.preventDefault(); location.href = 'account.html'; };
      } else {
        cta.textContent = 'Создать аккаунт';
        cta.onclick = null;
      }
    }
  }

  function initNavToggle() {
    const nav = document.getElementById('nav');
    const btn = document.getElementById('nav-toggle');
    if (!nav || !btn) return;
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }));
  }

  // ---------------------------------------------------------------- уведомления

  function toast(text, kind = '') {
    const box = document.getElementById('toasts');
    if (!box) return;
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.textContent = text;
    box.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }

  // ---------------------------------------------------------------- окно входа

  let authMode = 'login';
  let lastFocus = null;

  function setAuthMode(mode) {
    authMode = mode;
    const modal = document.getElementById('auth-modal');
    modal.querySelectorAll('[data-auth-tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.authTab === mode)));
    modal.querySelectorAll('[data-only]').forEach((el) => { el.hidden = el.dataset.only !== mode; });
    const pw = modal.querySelector('input[name="password"]');
    pw.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    document.getElementById('auth-submit').textContent = mode === 'login' ? 'Войти' : 'Создать аккаунт';
    document.getElementById('auth-error').textContent = '';
  }

  async function openAuth(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    lastFocus = document.activeElement;
    setAuthMode(mode);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    await configReady;
    const offline = !apiBase();
    document.getElementById('auth-offline').hidden = !offline;
    document.getElementById('auth-submit').disabled = offline;
    modal.querySelector('input[name="login"]').focus();
  }

  function closeAuth() {
    const modal = document.getElementById('auth-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    document.querySelectorAll('[data-open-auth]').forEach((b) => b.addEventListener('click', (e) => {
      if (user && b.id === 'account-cta') return;
      e.preventDefault();
      openAuth(b.dataset.openAuth);
    }));
    modal.querySelectorAll('[data-close-auth]').forEach((b) => b.addEventListener('click', closeAuth));
    modal.querySelectorAll('[data-auth-tab]').forEach((t) => t.addEventListener('click', () => setAuthMode(t.dataset.authTab)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAuth(); });

    const form = document.getElementById('auth-form');
    const errBox = document.getElementById('auth-error');
    const submit = document.getElementById('auth-submit');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errBox.textContent = '';
      const login = form.login.value.trim();
      const password = form.password.value;
      if (authMode === 'register') {
        if (!/^[A-Za-z0-9_]{3,16}$/.test(login)) { errBox.textContent = 'Логин: 3–16 символов, латиница, цифры и _.'; return; }
        if (password.length < 8) { errBox.textContent = 'Пароль должен быть не короче 8 символов.'; return; }
        if (password !== form.password2.value) { errBox.textContent = 'Пароли не совпадают.'; return; }
      } else if (!login || !password) {
        errBox.textContent = 'Введи логин и пароль.';
        return;
      }
      submit.disabled = true;
      try {
        const data = authMode === 'register'
          ? await api('/api/auth/register', { method: 'POST', body: { username: login, password } })
          : await api('/api/auth/login', { method: 'POST', body: { login, password } });
        setToken(data.token);
        setUser(data.user);
        form.reset();
        closeAuth();
        toast(authMode === 'register' ? 'Аккаунт создан. Добро пожаловать!' : 'Ты вошёл как ' + data.user.username + '.', 'ok');
      } catch (err) {
        errBox.textContent = err.message;
      } finally {
        submit.disabled = !apiBase();
      }
    });
  }

  // ---------------------------------------------------------------- подстановка значений из version.json

  function fillConfigValues(c) {
    document.querySelectorAll('[data-v]').forEach((el) => {
      const v = c[el.dataset.v];
      if (v) el.textContent = v;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    initAuthModal();
    renderNav();
    configReady.then(fillConfigValues);
    loadUser();
    if (new URLSearchParams(location.search).get('auth') === 'login') openAuth('login');
  });

  return {
    configReady, api, getToken, setToken, loadUser, logout, toast, openAuth, avatarEl,
    onUser: (fn) => listeners.push(fn),
    get user() { return user; },
    apiBase,
  };
})();
