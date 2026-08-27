(() => {
  if (window.__pokedexDMELOSmartSearch) return;
  window.__pokedexDMELOSmartSearch = true;

  const inputSelector = 'input[aria-label="Pesquisar Pokémon ou número"]';
  let pokemonCache = null;
  let timer = null;
  let activeController = null;

  const styles = `
    .dmelo-search-panel{position:absolute;left:0;right:0;top:calc(100% + 10px);z-index:100;overflow:hidden;border:2px solid #173d2c;border-radius:10px;background:#f7f2d8;box-shadow:6px 7px 0 rgba(16,45,35,.28),0 18px 45px rgba(16,45,35,.18);font-family:Arial,Helvetica,sans-serif;color:#17362c}
    .dmelo-search-grid{display:grid;grid-template-columns:1fr 1fr}
    .dmelo-search-col{padding:14px}
    .dmelo-search-col+ .dmelo-search-col{border-left:1px solid #d6d0b6}
    .dmelo-search-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#52655e}
    .dmelo-search-item{display:flex;align-items:center;gap:10px;width:100%;padding:7px;border:0;border-radius:8px;background:transparent;text-decoration:none;text-align:left;color:#17362c;cursor:pointer}
    .dmelo-search-item:hover{background:rgba(40,112,77,.08)}
    .dmelo-search-item img{width:42px;height:42px;object-fit:contain;flex:0 0 auto}
    .dmelo-search-name{font-size:12px;font-weight:900;text-transform:capitalize;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .dmelo-search-meta{margin-top:2px;font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#758078}
    .dmelo-search-card-img{width:34px!important;height:48px!important;border-radius:4px;object-fit:cover!important}
    .dmelo-search-empty{padding:16px 6px;font-size:11px;color:#758078}
    .dmelo-search-loading{font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#d71920}
    .dmelo-search-footer{display:flex;align-items:center;justify-content:center;padding:9px 12px;border-top:1px solid #d6d0b6;background:rgba(23,54,44,.035);font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#9e1017;text-decoration:none}
    @media(max-width:700px){.dmelo-search-grid{grid-template-columns:1fr}.dmelo-search-col+.dmelo-search-col{border-left:0;border-top:1px solid #d6d0b6}.dmelo-search-panel{position:fixed;left:14px;right:14px;top:125px;max-height:70vh;overflow:auto}}
  `;

  function injectStyles() {
    if (document.getElementById('dmelo-smart-search-styles')) return;
    const style = document.createElement('style');
    style.id = 'dmelo-smart-search-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function normalize(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function pokemonId(url) {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  function imageFor(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  function closePanel(input) {
    const panel = input.__dmeloPanel;
    if (panel) panel.remove();
    input.__dmeloPanel = null;
  }

  function makeItem({ href, image, name, meta, external }) {
    const item = document.createElement(href ? 'a' : 'div');
    item.className = 'dmelo-search-item';
    if (href) item.href = href;
    if (external) item.target = '_blank';
    if (image) {
      const img = document.createElement('img');
      img.src = image;
      img.alt = '';
      img.loading = 'lazy';
      item.appendChild(img);
    }
    const text = document.createElement('div');
    text.style.minWidth = '0';
    const title = document.createElement('div');
    title.className = 'dmelo-search-name';
    title.textContent = name;
    text.appendChild(title);
    const details = document.createElement('div');
    details.className = 'dmelo-search-meta';
    details.textContent = meta || '';
    text.appendChild(details);
    item.appendChild(text);
    return item;
  }

  async function loadPokemon() {
    if (pokemonCache) return pokemonCache;
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0');
    if (!response.ok) throw new Error('PokeAPI unavailable');
    const data = await response.json();
    pokemonCache = data.results;
    return pokemonCache;
  }

  async function search(input, query) {
    const panel = input.__dmeloPanel;
    if (!panel) return;
    const pokemonCol = panel.querySelector('[data-pokemon-results]');
    const tcgCol = panel.querySelector('[data-tcg-results]');
    const term = normalize(query);
    if (term.length < 2) { closePanel(input); return; }

    if (activeController) activeController.abort();
    activeController = new AbortController();
    const signal = activeController.signal;
    pokemonCol.innerHTML = '<div class="dmelo-search-empty">CONSULTANDO POKÉMON...</div>';
    tcgCol.innerHTML = '<div class="dmelo-search-empty">CONSULTANDO CARTAS...</div>';

    try {
      const pokemon = await loadPokemon();
      if (signal.aborted) return;
      const numberTerm = term.replace(/^#/, '');
      const matches = pokemon.filter((p) => p.name.includes(term) || String(pokemonId(p.url)) === numberTerm).slice(0, 5);
      pokemonCol.innerHTML = '';
      if (!matches.length) {
        pokemonCol.innerHTML = '<div class="dmelo-search-empty">Nenhum Pokémon encontrado.</div>';
      } else {
        matches.forEach((p) => {
          const id = pokemonId(p.url);
          pokemonCol.appendChild(makeItem({ href: `/pokemon/${id}`, image: imageFor(id), name: p.name.replace(/-/g, ' '), meta: `#${String(id).padStart(4, '0')}` }));
        });
      }
    } catch (error) {
      if (!signal.aborted) pokemonCol.innerHTML = '<div class="dmelo-search-empty">Não foi possível consultar a Pokédex.</div>';
    }

    try {
      const response = await fetch(`/api/tcg?q=${encodeURIComponent(query)}&limit=5`, { signal });
      if (!response.ok) throw new Error('TCG unavailable');
      const data = await response.json();
      const cards = data.cards || [];
      tcgCol.innerHTML = '';
      if (!cards.length) {
        tcgCol.innerHTML = '<div class="dmelo-search-empty">Nenhuma carta encontrada.</div>';
      } else {
        cards.slice(0, 5).forEach((card) => {
          const image = card.image ? `${card.image}/low.webp` : '';
          const meta = [card.set && card.set.name, card.rarity].filter(Boolean).join(' • ');
          tcgCol.appendChild(makeItem({ image, name: card.name || 'Carta TCG', meta }));
        });
      }
    } catch (error) {
      if (!signal.aborted) tcgCol.innerHTML = '<div class="dmelo-search-empty">Busca TCG indisponível.</div>';
    }
  }

  function openPanel(input) {
    injectStyles();
    closePanel(input);
    const wrapper = input.closest('form') || input.parentElement;
    if (!wrapper) return;
    if (getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';
    const panel = document.createElement('div');
    panel.className = 'dmelo-search-panel';
    panel.innerHTML = `
      <div class="dmelo-search-grid">
        <div class="dmelo-search-col"><div class="dmelo-search-head"><span>Pokémon</span><span data-pokemon-status></span></div><div data-pokemon-results></div></div>
        <div class="dmelo-search-col"><div class="dmelo-search-head"><span>Cartas TCG</span><span class="dmelo-search-loading" data-tcg-status></span></div><div data-tcg-results></div></div>
      </div>
      <a class="dmelo-search-footer" data-all-results>VER TODOS OS RESULTADOS →</a>
    `;
    wrapper.appendChild(panel);
    input.__dmeloPanel = panel;
    panel.querySelector('[data-all-results]').addEventListener('click', () => {
      const value = input.value.trim();
      if (value) window.location.href = `/busca?q=${encodeURIComponent(value)}`;
    });
  }

  function setup(input) {
    if (input.__dmeloSmartSearch) return;
    input.__dmeloSmartSearch = true;
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('focus', () => { if (input.value.trim().length >= 2) { openPanel(input); search(input, input.value); } });
    input.addEventListener('input', () => {
      openPanel(input);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => search(input, input.value), 300);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePanel(input);
      if (event.key === 'Enter' && input.value.trim()) {
        event.preventDefault();
        window.location.href = `/busca?q=${encodeURIComponent(input.value.trim())}`;
      }
    });
  }

  function scan() {
    document.querySelectorAll(inputSelector).forEach(setup);
  }

  document.addEventListener('click', (event) => {
    document.querySelectorAll(inputSelector).forEach((input) => {
      if (input.__dmeloPanel && !input.closest('form')?.contains(event.target)) closePanel(input);
    });
  });

  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
