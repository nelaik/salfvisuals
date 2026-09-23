// Вся страница читает данные из version.json — чтобы выпустить новую версию,
// правишь только этот файл, менять HTML/CSS не нужно.

fetch('version.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('badge-stage').textContent = data.stage.toUpperCase();
    document.getElementById('meta-version').textContent = data.version;
    document.getElementById('meta-mc').textContent = data.minecraftVersion;

    // Кнопка "Скачать": если downloadBaseUrl в version.json задан (адрес
    // твоего downloads-backend) — ведём через его /download/<jarFile>, он
    // считает скачивание и отдаёт файл/редиректит. Если пусто — как раньше,
    // прямая ссылка на jarFile без счётчика (чтобы кнопка не сломалась, пока
    // бэкенд ещё не задеплоен).
    const jarBtn = document.getElementById('download-jar');
    jarBtn.href = data.downloadBaseUrl
      ? `${data.downloadBaseUrl.replace(/\/$/, '')}/download/${data.jarFile}`
      : data.jarFile;
    document.getElementById('download-jar-sub').textContent =
      `v${data.version} · ${data.stage} · .jar`;

    const fabricBtn = document.getElementById('download-fabric');
    fabricBtn.href = data.fabricApiUrl;
    document.getElementById('download-fabric-sub').textContent =
      `для ${data.minecraftVersion}`;

    document.getElementById('step-mc').textContent = data.minecraftVersion;
    document.getElementById('step-jar').textContent = data.jarFile.split('/').pop();

    document.getElementById('changelog-version').textContent =
      `v${data.version} ${data.stage}`;
    document.getElementById('changelog-date').textContent = data.releaseDate;

    const list = document.getElementById('changelog-list');
    data.changelog.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    loadDownloadStats(data.downloadBaseUrl);
  })
  .catch(() => {
    document.getElementById('meta-version').textContent = '?';
    console.error('Не удалось загрузить version.json — проверь, что файл лежит рядом с index.html и страница открыта через сервер, а не напрямую с диска (file://).');
  });

// Блок "скачано: сегодня / за неделю / за всё время" — данные с
// downloads-backend (см. salfvisuals-downloads-backend/README.md). Пока
// downloadBaseUrl в version.json пуст или бэкенд недоступен — блок просто
// прячется, никаких нулей/выдуманных цифр не показываем.
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
      // Бэкенд ещё не поднят/недоступен — тихо прячем блок, не роняем страницу.
      block.hidden = true;
    });
}
