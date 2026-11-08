(() => {
  'use strict';

  const container = document.getElementById('game-groups');
  const games = Array.from(container.querySelectorAll('.game-card'));
  const controls = document.getElementById('catalog-controls');
  const platformButtons = Array.from(controls.querySelectorAll('[data-platform]'));
  const yearSelect = document.getElementById('year-filter');
  const groupSelect = document.getElementById('group-by');
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');
  const platforms = [{ id: 'ios', label: 'iOS' }, { id: 'android', label: 'Android' }, { id: 'pc', label: 'PC' }];
  let selectedPlatform = 'all';

  const supports = (game, platform) => game.dataset.platforms.split(' ').includes(platform);
  const countLabel = count => `${count} ${count === 1 ? 'game' : 'games'}`;

  function render() {
    const selectedYear = yearSelect.value;
    const filtered = games.filter(game =>
      (selectedPlatform === 'all' || supports(game, selectedPlatform)) &&
      (selectedYear === 'all' || game.dataset.year === selectedYear)
    );
    const groups = groupSelect.value === 'year'
      ? Array.from(new Set(filtered.map(game => game.dataset.year))).sort((a, b) => Number(b) - Number(a)).map(year => ({
        id: `year-${year}`, label: year, games: filtered.filter(game => game.dataset.year === year)
      }))
      : platforms.filter(platform => selectedPlatform === 'all' || platform.id === selectedPlatform).map(platform => ({
        id: `platform-${platform.id}`, label: platform.label, games: filtered.filter(game => supports(game, platform.id))
      })).filter(group => group.games.length);

    const fragment = document.createDocumentFragment();
    const renderedIds = new Set();
    groups.forEach(group => {
      const section = document.createElement('section');
      section.className = 'game-group';
      section.setAttribute('aria-labelledby', group.id);
      const heading = document.createElement('div');
      heading.className = 'group-heading';
      const title = document.createElement('h3');
      title.id = group.id;
      title.textContent = group.label;
      const count = document.createElement('span');
      count.textContent = countLabel(group.games.length);
      heading.append(title, count);
      const grid = document.createElement('div');
      grid.className = 'game-grid';
      group.games.forEach(game => {
        const card = game.cloneNode(true);
        // A multiplatform game can appear in several groups; keep every DOM ID unique.
        if (renderedIds.has(card.id)) card.id = `${card.id}-${group.id}`;
        renderedIds.add(game.id);
        grid.append(card);
      });
      section.append(heading, grid);
      fragment.append(section);
    });

    container.replaceChildren(fragment);
    emptyState.hidden = filtered.length > 0;
    const platformLabel = platforms.find(platform => platform.id === selectedPlatform)?.label;
    resultCount.textContent = `${countLabel(filtered.length)}${platformLabel ? ` on ${platformLabel}` : ''}${selectedYear !== 'all' ? ` · ${selectedYear}` : ' · available now'}`;
    platformButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.platform === selectedPlatform)));
  }

  platformButtons.forEach(button => button.addEventListener('click', () => {
    selectedPlatform = button.dataset.platform;
    render();
  }));
  yearSelect.addEventListener('change', render);
  groupSelect.addEventListener('change', render);
  document.getElementById('reset-filters').addEventListener('click', () => {
    selectedPlatform = 'all';
    yearSelect.value = 'all';
    render();
    platformButtons[0].focus();
  });

  // The complete year-grouped catalog is available even if JavaScript is disabled.
  controls.hidden = false;
})();
