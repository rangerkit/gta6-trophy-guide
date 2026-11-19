// main.js — Vice City Platinum Path entry point.
// Loads the trophy data (a file of this app, fetched relatively so the guide
// works from any static server and fully offline once cached by the page),
// wires the filters, the three views and the localStorage tracker, and keeps
// the view and the open trophy in the URL hash so a view can be bookmarked
// or shared: #/roadmap, #/missables, #/trophy/<id>.

import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, parseImport } from './store.js';
import { renderProgress, renderList, renderDetail, renderRoadmap, renderMissables, isMasked } from './render.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

const state = {
  earned: loadEarned(),
  settings: loadSettings(),
  view: 'checklist',
  kind: 'all',
  grade: 'all',
  status: 'all',
  query: '',
  selectedId: 17, // The Shootist: a silver with a guide worth opening on
};

const els = {
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('detail'),
  resultCount: document.getElementById('result-count'),
  controls: document.getElementById('checklist-controls'),
  views: {
    checklist: document.getElementById('view-checklist'),
    roadmap: document.getElementById('view-roadmap'),
    missables: document.getElementById('view-missables'),
  },
  roadmap: document.getElementById('roadmap'),
  missables: document.getElementById('missables'),
  search: document.getElementById('search'),
  grade: document.getElementById('grade-filter'),
  status: document.getElementById('status-filter'),
  spoiler: document.getElementById('spoiler-toggle'),
};

const ctx = {
  get earned() { return state.earned; },
  get settings() { return state.settings; },
  get selectedId() { return state.selectedId; },
  onSelect(id) {
    state.selectedId = id;
    if (state.view !== 'checklist') setView('checklist');
    else render();
    location.hash = `/trophy/${id}`;
  },
  onToggle(trophy) {
    if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
    else state.earned.add(trophy.name);
    saveEarned(state.earned);
    render();
  },
};

function matchesFilters(trophy) {
  if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.status === 'earned' && !state.earned.has(trophy.name)) return false;
  if (state.status === 'open' && state.earned.has(trophy.name)) return false;
  if (state.query) {
    if (isMasked(trophy, state.earned, state.settings)) return false;
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function setView(view) {
  state.view = view;
  for (const [name, node] of Object.entries(els.views)) node.hidden = name !== view;
  els.controls.style.display = view === 'checklist' ? '' : 'none';
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  render();
}

function render() {
  renderProgress(trophies, state.earned);
  if (state.view === 'checklist') {
    const shown = trophies.filter(matchesFilters);
    els.resultCount.textContent = `Showing ${shown.length} of ${trophies.length} trophies · click one to read its guide and sources`;
    renderList(els.list, shown, ctx);
    renderDetail(els.detail, trophies.find((t) => t.id === state.selectedId) ?? null, ctx);
  } else if (state.view === 'roadmap') {
    renderRoadmap(els.roadmap, trophies, ctx);
  } else if (state.view === 'missables') {
    renderMissables(els.missables, trophies, ctx);
  }
}

function applyHash() {
  const hash = location.hash.replace(/^#/, '');
  const trophyMatch = /^\/trophy\/(\d+)$/.exec(hash);
  if (trophyMatch) {
    state.selectedId = Number(trophyMatch[1]);
    setView('checklist');
  } else if (hash === '/roadmap') setView('roadmap');
  else if (hash === '/missables') setView('missables');
  else setView('checklist');
}

/* ---------------- wiring ---------------- */

for (const tab of document.querySelectorAll('.view-tab')) {
  tab.addEventListener('click', () => { location.hash = tab.dataset.view === 'checklist' ? '/' : `/${tab.dataset.view}`; });
}
for (const chip of document.querySelectorAll('#kind-chips .chip')) {
  chip.addEventListener('click', () => {
    state.kind = chip.dataset.kind;
    for (const c of document.querySelectorAll('#kind-chips .chip')) c.classList.toggle('active', c === chip);
    render();
  });
}
document.querySelector('#kind-chips .chip[data-kind="all"]').classList.add('active');

els.search.addEventListener('input', () => { state.query = els.search.value.trim().toLowerCase(); render(); });
els.grade.addEventListener('change', () => { state.grade = els.grade.value; render(); });
els.status.addEventListener('change', () => { state.status = els.status.value; render(); });

els.spoiler.checked = state.settings.spoilerShield;
els.spoiler.addEventListener('change', () => {
  state.settings.spoilerShield = els.spoiler.checked;
  saveSettings(state.settings);
  render();
});

document.getElementById('export-btn').addEventListener('click', () => exportProgress(state.earned, trophies));
document.getElementById('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state.earned = parseImport(await file.text(), trophies);
    saveEarned(state.earned);
    render();
  } catch {
    els.resultCount.textContent = 'That file did not contain importable progress — export from this guide first, then import that file.';
  }
  event.target.value = '';
});
document.getElementById('reset-btn').addEventListener('click', () => {
  state.earned = new Set();
  saveEarned(state.earned);
  render();
});

window.addEventListener('hashchange', applyHash);
applyHash();
