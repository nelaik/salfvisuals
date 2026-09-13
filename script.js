// Вся страница читает данные из version.json — чтобы выпустить новую версию,
// правишь только этот файл, менять HTML/CSS не нужно.

fetch('version.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('badge-stage').textContent = data.stage.toUpperCase();
    document.getElementById('meta-version').textContent = data.version;
    document.getElementById('meta-mc').textContent = data.minecraftVersion;

    const jarBtn = document.getElementById('download-jar');
    jarBtn.href = data.jarFile;
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
  })
  .catch(() => {
    document.getElementById('meta-version').textContent = '?';
    console.error('Не удалось загрузить version.json — проверь, что файл лежит рядом с index.html и страница открыта через сервер, а не напрямую с диска (file://).');
  });
