// Главная: живое меню мода, вкладки возможностей, скачивание, обновления, небо в первом экране.

// ================= живая копия ClickGUI =================
const GUI = [
  { name: 'Combat', mods: [
    ['Target HUD', 'Карточка цели: голова, HP и дистанция.', true],
    ['Combat Timer', 'Сколько секунд ты ещё в бою.', true],
    ['Crit Indicator', 'Подсказывает, когда удар будет критическим.', false],
    ['Hit Marker', 'Отметка у прицела при попадании.', false],
    ['Totem Pops', 'Сколько тотемов сломал противник.', true],
  ] },
  { name: 'Movement', mods: [
    ['Sprint', 'Бег без зажатой клавиши.', true],
    ['Free Look', 'Оглядеться, не поворачивая персонажа.', false],
    ['Elytra Swap', 'Быстрая смена нагрудника и элитр.', false],
  ] },
  { name: 'Visuals', mods: [
    ['Sky', 'Звёзды, Vortex, метеоры, созвездия и 12 пресетов Cosmic.', true],
    ['Atmosphere', 'Магма, метель, утренняя дымка, пыль — плавный туман и погода.', false],
    ['Target Effect', '18 эффектов вокруг цели: орбита, галактика, сакура, молнии…', true],
    ['Swing Animation', 'Плавный взмах, 1.7 с блокхитом, круг, тычок.', false],
    ['Motion Blur', 'Мягкое размытие при повороте камеры.', false],
    ['Jump Circle', 'Круг под ногами при прыжке.', true],
  ] },
  { name: 'HUD', mods: [
    ['Keystrokes', 'WASD и клики на экране.', true],
    ['Armor HUD', 'Броня и её прочность.', true],
    ['Direction HUD', 'Полоса компаса сверху экрана.', false],
    ['Music', 'Что сейчас играет — с обложкой и текстом.', false],
    ['Player Stats', 'Скорость, CPS, дистанция удара.', true],
  ] },
  { name: 'Player', mods: [
    ['Cosmetics', 'Шапки, питомцы, крылья, плащи с физикой, кагуне.', true],
    ['ViewModel', 'Положение и размер рук от первого лица.', false],
    ['Emotes', 'Эмоции персонажа.', false],
  ] },
  { name: 'Server Helper', mods: [
    ['FTHelper', 'Зоны трапки, пласта, дезориентации на FunTime.', true],
    ['FTBinds', 'Предметы FunTime на одну клавишу.', false],
    ['AuchHelper', 'Подсвечивает самые дешёвые лоты на аукционе.', true],
    ['Event Checker', 'Напоминает о серверных ивентах.', false],
  ] },
  { name: 'Misc', mods: [
    ['Zoom', 'Приближение как у подзорной трубы.', true],
    ['Waypoints', 'Метки на мире с дистанцией.', false],
    ['Chat Timestamps', 'Время у сообщений чата.', false],
    ['Auto Reconnect', 'Сам перезайдёт после вылета с сервера.', false],
  ] },
];

function initGui() {
  const cats = document.getElementById('gui-cats');
  const list = document.getElementById('gui-list');
  const hint = document.getElementById('gui-hint');
  const count = document.getElementById('gui-count');
  if (!cats) return;
  let current = 2; // Visuals

  const enabledIn = (c) => c.mods.filter((m) => m[2]).length;
  const totalEnabled = () => GUI.reduce((s, c) => s + enabledIn(c), 0);

  function renderCats() {
    cats.textContent = '';
    GUI.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gui-cat';
      b.setAttribute('aria-pressed', String(i === current));
      b.innerHTML = '<span></span><b></b>';
      b.firstChild.textContent = c.name;
      b.lastChild.textContent = enabledIn(c) || '';
      b.addEventListener('click', () => { current = i; renderCats(); renderList(); });
      cats.appendChild(b);
    });
    count.textContent = totalEnabled() + ' активно';
  }

  function renderList() {
    list.textContent = '';
    GUI[current].mods.forEach((m) => {
      const r = document.createElement('button');
      r.type = 'button';
      r.className = 'gui-row' + (m[2] ? ' on' : '');
      r.setAttribute('aria-pressed', String(m[2]));
      r.innerHTML = '<span></span><i class="switch" aria-hidden="true"></i>';
      r.firstChild.textContent = m[0];
      const show = () => { hint.innerHTML = '<b></b> — '; hint.firstChild.textContent = m[0]; hint.appendChild(document.createTextNode(m[1])); };
      r.addEventListener('mouseenter', show);
      r.addEventListener('focus', show);
      r.addEventListener('click', () => {
        m[2] = !m[2];
        r.classList.toggle('on', m[2]);
        r.setAttribute('aria-pressed', String(m[2]));
        show();
        renderCats();
      });
      list.appendChild(r);
    });
  }

  renderCats();
  renderList();
}

// ================= возможности =================
const FEATURES = [
  { key: 'sky', title: 'Небо и атмосфера', short: 'Sky, Atmosphere', glow: 'rgba(63, 224, 192, 0.20)',
    text: 'Небо, которое меняет настроение игры: от звёздной ночи с метеорами до раскалённой магмы. Туман плавный, без полос, а снег не идёт под крышей.',
    chips: ['Cosmic — 12 пресетов', 'Vortex', 'Созвездия', 'Метеоры и звездопад', 'Rift', 'Магма', 'Метель', 'Утренняя дымка', 'Пыль', 'Зима 21-22'] },
  { key: 'combat', title: 'Эффекты цели и боя', short: 'Target Effect, Swing', glow: 'rgba(180, 240, 74, 0.18)',
    text: 'Красиво подсвечивает того, с кем ты дерёшься, и делает удары приятнее на вид. Только визуал: урон и кулдаун не меняются.',
    chips: ['18 режимов Target Effect', 'Target HUD', 'Hit Color', 'Crit Shockwave', 'Kill Effect', 'Swing Animation', 'Motion Blur'] },
  { key: 'cosmetics', title: 'Косметика', short: '80+ вариантов', glow: 'rgba(200, 160, 255, 0.18)',
    text: 'Шесть слотов на персонаже. Плащи развеваются на бегу и в падении, крылья складываются в покое, питомцы ходят за тобой.',
    chips: ['Головные уборы', 'Питомцы', 'Крылья', 'Плащи с физикой', 'Обувь', 'Кагуне'] },
  { key: 'hud', title: 'HUD и меню', short: 'Интерфейс', glow: 'rgba(120, 200, 255, 0.18)',
    text: 'Свой интерфейс поверх игры: карточки двигаются мышкой прямо в чате, меню в двух стилях, темы и стеклянный режим. Своя заставка при запуске.',
    chips: ['Перетаскиваемый HUD', 'ClickGUI в двух стилях', 'Темы', 'Liquid Glass', 'Заставка запуска', 'Готовые конфиги'] },
  { key: 'servers', title: 'Для серверов', short: 'FunTime, HolyWorld', glow: 'rgba(255, 170, 90, 0.16)',
    text: 'Помощники под популярные серверы. Только то, что сервер разрешает, — функции под конкретный сервер привязаны к нему в коде.',
    chips: ['FTHelper', 'FTBinds', 'AuchHelper', 'Event Checker', 'See Invisible — только HolyWorld'] },
  { key: 'comfort', title: 'Удобства', short: 'Мелочи на каждый день', glow: 'rgba(180, 240, 74, 0.14)',
    text: 'То, что экономит время в каждой сессии: приближение, метки, друзья, поиск по сундукам, уведомления о подборе предметов.',
    chips: ['Zoom', 'Free Look', 'Waypoints', 'Друзья', 'Shulker Preview', 'Container Search', 'Pickup Notifications', 'Break Progress'] },
];

function initExplore() {
  const list = document.getElementById('explore-list');
  const panel = document.getElementById('explore-panel');
  if (!list) return;
  let current = 0;

  function render() {
    list.textContent = '';
    FEATURES.forEach((f, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'explore-item';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(i === current));
      b.innerHTML = '<span></span><small></small>';
      b.firstChild.textContent = f.title;
      b.lastChild.textContent = f.short;
      b.addEventListener('click', () => { current = i; render(); });
      list.appendChild(b);
    });
    const f = FEATURES[current];
    panel.style.setProperty('--glow', f.glow);
    panel.innerHTML = '<h3></h3><p></p><div class="chips"></div>';
    panel.querySelector('h3').textContent = f.title;
    panel.querySelector('p').textContent = f.text;
    const chips = panel.querySelector('.chips');
    f.chips.forEach((c) => { const s = document.createElement('span'); s.className = 'chip'; s.textContent = c; chips.appendChild(s); });
  }
  render();
}

// ================= скачивание, обновления, статистика =================
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderLog(groups, root) {
  root.textContent = '';
  (groups || []).forEach((g) => {
    const box = document.createElement('div');
    box.className = 'log-group';
    if (g.title) { const h = document.createElement('h3'); h.textContent = g.title; box.appendChild(h); }
    const ul = document.createElement('ul');
    (g.items || []).forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    box.appendChild(ul);
    root.appendChild(box);
  });
}

SV.configReady.then((c) => {
  if (!c || !c.version) return;
  const jar = document.getElementById('download-jar');
  const base = (c.downloadBaseUrl || '').replace(/\/$/, '');
  jar.href = base ? `${base}/download/${c.jarFile}` : c.jarFile;
  jar.textContent = 'Скачать SalfVisuals ' + c.version;
  if (c.fabricApiUrl) document.getElementById('download-fabric').href = c.fabricApiUrl;

  document.getElementById('log-ver').textContent = 'v' + c.version;
  document.getElementById('log-date').textContent = formatDate(c.releaseDate);
  renderLog(c.changelog, document.getElementById('log-list'));

  const hist = document.getElementById('log-history');
  if (Array.isArray(c.history) && c.history.length) {
    c.history.forEach((h) => {
      const det = document.createElement('details');
      det.className = 'log-old';
      det.innerHTML = '<summary><strong></strong><span></span></summary><div class="log-grid"></div>';
      det.querySelector('strong').textContent = 'v' + h.version;
      det.querySelector('span').textContent = h.date ? formatDate(h.date) : '';
      renderLog(h.changelog, det.querySelector('.log-grid'));
      hist.appendChild(det);
    });
    hist.hidden = false;
  }

  // скачивания и аккаунты — только если бэкенд подключён (никаких выдуманных цифр)
  const statsBase = (c.apiBaseUrl || c.downloadBaseUrl || '').replace(/\/$/, '');
  if (statsBase) {
    fetch(statsBase + '/api/stats').then((r) => r.ok ? r.json() : null).then((s) => {
      if (!s) return;
      const line = document.getElementById('stats-line');
      const parts = [`Скачали сегодня: ${s.today.toLocaleString('ru-RU')}`, `всего: ${s.allTime.toLocaleString('ru-RU')}`];
      if (typeof s.users === 'number') parts.push(`аккаунтов: ${s.users.toLocaleString('ru-RU')}`);
      line.textContent = parts.join(', ');
      line.hidden = false;
    }).catch(() => {});
  }
});

// ================= небо в первом экране =================
// Медленное северное сияние и звёзды — единственная анимация на странице. При «уменьшить движение»
// рисуется один неподвижный кадр; вне экрана анимация стоит.
function initSky() {
  const canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1, visible = true, raf = 0;
  const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * 0.75, r: Math.random() * 1.2 + 0.2, p: Math.random() * 6.28 }));

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ribbon(t, base, amp, freq, speed, c1, c2, alpha) {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(28px)';
    ctx.fillStyle = g;
    ctx.beginPath();
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * w;
      const y = base * h + Math.sin(i / steps * freq + t * speed) * amp * h + Math.sin(i / steps * freq * 2.3 - t * speed * 0.7) * amp * 0.35 * h;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const x = (i / steps) * w;
      const y = base * h + 0.16 * h + Math.sin(i / steps * freq + t * speed + 0.6) * amp * h;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function frame(ms) {
    const t = ms / 1000;
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#071a17'); sky.addColorStop(0.6, '#08130f'); sky.addColorStop(1, '#08110e');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    for (const s of stars) {
      ctx.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.p));
      ctx.fillStyle = '#e8fff0';
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ribbon(t, 0.10, 0.06, 5.0, 0.12, 'rgba(63,224,192,0.0)', 'rgba(63,224,192,0.9)', 0.35);
    ribbon(t, 0.18, 0.05, 3.6, 0.09, 'rgba(180,240,74,0.85)', 'rgba(63,224,192,0.2)', 0.28);
    ribbon(t, 0.04, 0.04, 7.0, 0.15, 'rgba(120,200,255,0.0)', 'rgba(150,255,210,0.6)', 0.18);
    if (!reduce && visible) raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', () => { resize(); if (reduce) frame(0); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    }).observe(canvas);
  }
  frame(0);
}

initGui();
initExplore();
initSky();
