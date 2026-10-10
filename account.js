// Личный кабинет: профиль (ник в Minecraft), смена пароля, завершение других входов, выход.

(() => {
  const $ = (id) => document.getElementById(id);
  let firstLoadDone = false;

  function show(state) {
    $('state-loading').hidden = state !== 'loading';
    $('state-guest').hidden = state !== 'guest';
    $('state-user').hidden = state !== 'user';
  }

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function fill(u) {
    const av = $('profile-avatar');
    av.textContent = '';
    av.appendChild(SV.avatarEl(u));
    $('profile-username').textContent = u.username;
    $('profile-tag').textContent = u.tag;
    $('row-username').textContent = u.username;
    $('row-tag').textContent = u.tag;
    $('row-created').textContent = new Date(u.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const nick = $('nick-form').nick;
    if (document.activeElement !== nick) nick.value = u.minecraftNick || '';
    const n = u.sessions || 1;
    $('sessions-text').textContent = n <= 1
      ? 'Сейчас аккаунт открыт только здесь.'
      : `Аккаунт открыт на ${n} ${plural(n, 'устройстве', 'устройствах', 'устройствах')}, включая это.`;
    $('logout-all').disabled = n <= 1;
  }

  SV.onUser((u) => {
    firstLoadDone = true;
    if (u) { fill(u); show('user'); } else { show('guest'); }
  });

  SV.configReady.then(() => {
    if (!SV.apiBase()) {
      $('guest-text').textContent = 'Сервер аккаунтов ещё не подключён. Как только он заработает, профиль появится здесь.';
    }
    // если вход не проверялся (нет токена) — сразу показываем гостя
    setTimeout(() => { if (!firstLoadDone) show(SV.user ? 'user' : 'guest'); }, 1500);
  });

  // вкладки
  document.querySelectorAll('[data-pane]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-pane]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    document.querySelectorAll('[data-pane-body]').forEach((s) => { s.hidden = s.dataset.paneBody !== b.dataset.pane; });
  }));

  // ник в Minecraft
  $('nick-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nick = e.target.nick.value.trim();
    if (nick && !/^[A-Za-z0-9_]{3,16}$/.test(nick)) {
      SV.toast('Ник в Minecraft: 3–16 символов, латиница, цифры и _.', 'err');
      return;
    }
    try {
      const { user } = await SV.api('/api/me', { method: 'PATCH', body: { minecraftNick: nick } });
      fill(user);
      SV.toast(nick ? 'Ник сохранён.' : 'Ник убран из профиля.', 'ok');
    } catch (err) {
      SV.toast(err.message, 'err');
    }
  });

  // смена пароля
  $('pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const errBox = $('pw-error');
    errBox.textContent = '';
    if (f.new1.value.length < 8) { errBox.textContent = 'Новый пароль должен быть не короче 8 символов.'; return; }
    if (f.new1.value !== f.new2.value) { errBox.textContent = 'Новые пароли не совпадают.'; return; }
    try {
      const { user } = await SV.api('/api/me/password', { method: 'POST', body: { oldPassword: f.old.value, newPassword: f.new1.value } });
      f.reset();
      fill(user);
      SV.toast('Пароль сменён. Другие входы завершены.', 'ok');
    } catch (err) {
      errBox.textContent = err.message;
    }
  });

  $('logout-all').addEventListener('click', async () => {
    try {
      const { user } = await SV.api('/api/me/logout-all', { method: 'POST' });
      fill(user);
      SV.toast('Другие входы завершены.', 'ok');
    } catch (err) {
      SV.toast(err.message, 'err');
    }
  });

  $('logout-btn').addEventListener('click', () => SV.logout());
})();
