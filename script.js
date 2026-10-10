// Вся страница читает данные из version.json — чтобы выпустить новую версию,
// правишь только этот файл, менять HTML/CSS не нужно.

// cache: 'no-store' — чтобы браузер и GitHub Pages не показывали старую версию после обновления
fetch('version.json', { cache: 'no-store' })
  .then(res => res.json())
  .then(data => {
    // stage: "beta"/"alpha" — показываем значок; пусто или "release" — значка нет
    const stage = (data.stage || '').trim();
    const isPre = stage !== '' && stage.toLowerCase() !== 'release';
    const badge = document.getElementById('badge-stage');
    badge.textContent = stage.toUpperCase();
    badge.hidden = !isPre;
    document.getElementById('meta-version').textContent = data.version;
    document.getElementById('meta-mc').textContent = data.minecraftVersion;

    // Кнопка "Скачать": если downloadBaseUrl в version.json задан (адрес
    // downloads-backend) — ведём через его /download/<jarFile>, он считает
    // скачивание и отдаёт файл. Если пусто — прямая ссылка на jarFile.
    const jarBtn = document.getElementById('download-jar');
    jarBtn.href = data.downloadBaseUrl
      ? `${data.downloadBaseUrl.replace(/\/$/, '')}/download/${data.jarFile}`
      : data.jarFile;
    document.getElementById('download-jar-sub').textContent =
      isPre ? `v${data.version} · ${stage} · .jar` : `v${data.version} · .jar`;

    const fabricBtn = document.getElementById('download-fabric');
    fabricBtn.href = data.fabricApiUrl;
    document.getElementById('download-fabric-sub').textContent =
      `для ${data.minecraftVersion}`;

    document.getElementById('step-mc').textContent = data.minecraftVersion;
    document.getElementById('step-jar').textContent = data.jarFile.split('/').pop();

    document.getElementById('changelog-version').textContent =
      isPre ? `v${data.version} ${stage}` : `v${data.version}`;
    document.getElementById('changelog-date').textContent = formatDate(data.releaseDate);

    renderChangelog(data.changelog, document.getElementById('changelog-list'));
    renderHistory(data.history);
    loadDownloadStats(data.downloadBaseUrl);
  })
  .catch(() => {
    document.getElementById('meta-version').textContent = '?';
    console.error('Не удалось загрузить version.json — проверь, что файл лежит рядом с index.html и страница открыта через сервер, а не напрямую с диска (file://).');
  });

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// changelog в version.json — список групп {title, items[]}.
// Для совместимости со старым форматом (просто массив строк) такие строки
// собираются в одну группу без заголовка.
function renderChangelog(changelog, root) {
  root.textContent = '';
  const groups = (changelog || []).every(x => typeof x === 'string')
    ? [{ title: '', items: changelog || [] }]
    : changelog;

  groups.forEach(group => {
    const box = document.createElement('div');
    box.className = 'log-group';
    if (group.title) {
      const h = document.createElement('h3');
      h.textContent = group.title;
      box.appendChild(h);
    }
    const ul = document.createElement('ul');
    group.items.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.appendChild(li);
    });
    box.appendChild(ul);
    root.appendChild(box);
  });
}

// history в version.json — прошлые версии [{version, date, changelog}], новые сверху.
// Каждая — свёрнутый блок <details>, раскрывается по клику.
function renderHistory(history) {
  const root = document.getElementById('changelog-history');
  if (!root) return;
  if (!Array.isArray(history) || history.length === 0) {
    root.hidden = true;
    return;
  }
  history.forEach(entry => {
    const det = document.createElement('details');
    det.className = 'log-old';
    const sum = document.createElement('summary');
    const ver = document.createElement('strong');
    ver.textContent = `v${entry.version}`;
    sum.appendChild(ver);
    if (entry.date) {
      const d = document.createElement('span');
      d.textContent = formatDate(entry.date);
      sum.appendChild(d);
    }
    det.appendChild(sum);
    const grid = document.createElement('div');
    grid.className = 'log-grid';
    renderChangelog(entry.changelog, grid);
    det.appendChild(grid);
    root.appendChild(det);
  });
  root.hidden = false;
}

// Блок "скачано: сегодня / за неделю / за всё время" — данные с downloads-backend.
// Пока downloadBaseUrl пуст или бэкенд недоступен — блок прячется, никаких
// нулей и выдуманных цифр не показываем.
function loadDownloadStats(downloadBaseUrl) {
  const block = document.getElementById('download-stats');
  if (!downloadBaseUrl) {
    block.hidden = true;
    return;
  }

  fetch(`${downloadBaseUrl.replace(/\/$/, '')}/api/stats`)
    .then(res => {
      if (!res.ok) throw new Error(`bad status ${res.status}`);
      return res.json();
    })
    .then(stats => {
      block.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        const value = typeof stats[key] === 'number' ? stats[key] : 0;
        el.textContent = value.toLocaleString('ru-RU');
      });
      block.hidden = false;
    })
    .catch(() => {
      block.hidden = true;
    });
}
