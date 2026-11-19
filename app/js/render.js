// render.js — every view of Vice City Platinum Path, built with plain DOM calls
// (no innerHTML with trophy data, so names and guides are always text, never markup).

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const STAGES = {
  1: { name: 'Stage 1 · Opening & Chapter 1', blurb: 'The story opens with Gone Fishing and Chapter 1. Bank the two opening trophies, and take the Ocean Beach cocktail moment (In The Beginning…) while you are still in the opening stretch — it is flagged missable.' },
  2: { name: 'Stage 2 · Chapters 2–4', blurb: 'Straight story progress: one trophy per chapter. Keep a save near each chapter\'s end if you want cheap replays for chapter-era feats.' },
  3: { name: 'Stage 3 · The big jobs', blurb: 'The named missions and heists. Two missable windows live here: the unscheduled departure at VCIA (Catch Me If You Can) and the showroom smash (Capital Offense), with the Rhino set-piece (Challenging Tank) in the same stretch — attempt them as their missions arrive, not after.' },
  4: { name: 'Stage 4 · Strangers & side strands', blurb: 'Finish the stranger strands — Andy, Kenton, Billy, Randy and Tyrone each end in a finale trophy, and any eight completed strands earn the Strangers & Freaks silver. Bret\'s hunt belongs to this stretch too.' },
  5: { name: 'Stage 5 · The finale', blurb: 'The final mission and its gold. Before you start it, re-check the Missables view: anything story-windowed that is still open should be attempted or consciously left for a replay.' },
  6: { name: 'Stage 6 · Leonida completion', blurb: 'Everything the open world holds: stunts, ranges, races, cards, spots, robberies, money and properties, feeding the 100% gold (A Long Road). Bad Luck, I Guess can fall anywhere a fail-then-retry happens. The platinum closes the list when the other 54 are done.' },
};

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function gradeBadge(grade) {
  return el('span', `grade-badge grade-${grade}`, grade);
}

export function isMasked(trophy, earned, settings) {
  return Boolean(settings.spoilerShield && trophy.kind === 'story' && trophy.hidden && !earned.has(trophy.name));
}

function kindTag(trophy) {
  return el('span', `tag kind-${trophy.kind}`, KIND_LABELS[trophy.kind] ?? trophy.kind);
}

function missableTag() {
  return el('span', 'tag missable', '⚠ MISSABLE');
}

function countTag(trophy) {
  return el('span', 'tag', `PSN tracks ${trophy.count.toLocaleString('en-US')}`);
}

/* ---------------- progress header ---------------- */

export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('earned-count').textContent = String(done);
  document.getElementById('earned-pct').textContent = `${Math.round((done / total) * 100)}%`;
  document.getElementById('bar-fill').style.width = `${(done / total) * 100}%`;

  const chips = document.getElementById('grade-chips');
  chips.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = trophies.filter((t) => t.grade === grade);
    const got = all.filter((t) => earned.has(t.name)).length;
    const chip = el('span', 'grade-chip');
    chip.append(`${grade[0].toUpperCase()}${grade.slice(1)} `, el('b', null, `${got}/${all.length}`));
    chips.append(chip);
  }

  const others = trophies.filter((t) => t.grade !== 'platinum');
  const othersDone = others.filter((t) => earned.has(t.name)).length;
  document.getElementById('plat-note').textContent =
    `Platinum progress: ${othersDone} of ${others.length} — “Vice Got a Price!” unlocks when all the others are earned.`;
  document.getElementById('missable-count').textContent =
    String(trophies.filter((t) => t.missable && !earned.has(t.name)).length);
}

/* ---------------- checklist ---------------- */

export function trophyRow(trophy, ctx) {
  const earnedIt = ctx.earned.has(trophy.name);
  const masked = isMasked(trophy, ctx.earned, ctx.settings);
  const row = el('button', `trophy-row${earnedIt ? ' earned' : ''}${ctx.selectedId === trophy.id ? ' selected' : ''}`);
  row.type = 'button';
  row.dataset.id = String(trophy.id);
  row.addEventListener('click', () => ctx.onSelect(trophy.id));

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earnedIt;
  box.title = earnedIt ? 'Mark as not earned' : 'Mark as earned';
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => ctx.onToggle(trophy));

  const main = el('div', 'row-main');
  if (masked) {
    main.append(
      el('div', 'row-name', 'Hidden Trophy — story spoiler'),
      el('div', 'row-desc masked-note', 'Name and description hidden by the spoiler shield until you earn it.'),
    );
  } else {
    main.append(el('div', 'row-name', trophy.name), el('div', 'row-desc', trophy.description));
  }

  const tags = el('div', 'row-tags');
  tags.append(kindTag(trophy));
  if (trophy.missable) tags.append(missableTag());
  else if (trophy.count) tags.append(countTag(trophy));

  row.append(box, gradeBadge(trophy.grade), main, tags);
  return row;
}

export function renderList(container, trophies, ctx) {
  container.replaceChildren();
  if (!trophies.length) {
    container.append(el('p', 'detail-empty', 'No trophies match those filters. The official list has no online trophies — try another kind, or clear the search.'));
    return;
  }
  for (const trophy of trophies) container.append(trophyRow(trophy, ctx));
}

/* ---------------- detail pane ---------------- */

export function renderDetail(pane, trophy, ctx) {
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', 'detail-empty', 'Pick a trophy from the checklist to read its guide — what to do, where and how, when it can be missed, and the sources it cites.'));
    return;
  }
  const earnedIt = ctx.earned.has(trophy.name);
  const masked = isMasked(trophy, ctx.earned, ctx.settings);

  const badges = el('div', 'detail-badges');
  badges.append(gradeBadge(trophy.grade), kindTag(trophy));
  if (trophy.hidden) badges.append(el('span', 'tag hidden-tag', 'Hidden on PSN'));
  if (trophy.count) badges.append(countTag(trophy));
  pane.append(badges);

  if (masked) {
    pane.append(
      el('h2', null, 'Hidden Trophy — story spoiler'),
      el('p', 'official-label', 'Official description'),
      el('p', 'official-desc masked-note', 'Hidden by the spoiler shield. Earn this story trophy in the game — or turn the shield off — to reveal its name, description and guide.'),
    );
  } else {
    pane.append(
      el('h2', null, trophy.name),
      el('p', 'official-label', 'Official description (PlayStation)'),
      el('p', 'official-desc', trophy.description),
    );
    const stage = STAGES[trophy.stage];
    pane.append(el('p', 'meta-line',
      `Roadmap: ${stage ? stage.name : `Stage ${trophy.stage}`} · position ${trophy.order} of 55${trophy.hidden ? ' · hidden on PlayStation until earned' : ''}`));
    if (trophy.missable) {
      pane.append(el('p', 'missable-banner', '⚠ Missable — this guide flags it from its official description. Attempt it inside its story window; if the window closes, use a save from before the mission or mission replay.'));
    }
    pane.append(el('p', 'guide-label', 'Guide — in our own words'), el('p', 'guide-text', trophy.guide));
    pane.append(el('p', 'sources-label', 'Sources'));
    const list = el('ul', 'sources-list');
    for (const source of trophy.sources ?? []) list.append(el('li', null, source));
    pane.append(list);
  }

  const btn = el('button', `earn-btn${earnedIt ? ' is-earned' : ''}`, earnedIt ? '✓ Earned — tap to undo' : 'Mark as earned');
  btn.type = 'button';
  btn.addEventListener('click', () => ctx.onToggle(trophy));
  pane.append(btn);
}

/* ---------------- roadmap ---------------- */

export function renderRoadmap(container, trophies, ctx) {
  container.replaceChildren();
  const byStage = new Map();
  for (const trophy of [...trophies].sort((a, b) => a.order - b.order)) {
    if (!byStage.has(trophy.stage)) byStage.set(trophy.stage, []);
    byStage.get(trophy.stage).push(trophy);
  }
  for (const [stageNo, items] of [...byStage.entries()].sort((a, b) => a[0] - b[0])) {
    const stage = STAGES[stageNo] ?? { name: `Stage ${stageNo}`, blurb: '' };
    const done = items.filter((t) => ctx.earned.has(t.name)).length;
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('h3', null, stage.name), el('span', 'stage-progress', `${done} of ${items.length} earned`));
    section.append(head, el('p', 'stage-blurb', stage.blurb));
    const list = el('div', 'stage-items');
    for (const trophy of items) {
      const earnedIt = ctx.earned.has(trophy.name);
      const item = el('button', `stage-item${earnedIt ? ' earned' : ''}`);
      item.type = 'button';
      item.addEventListener('click', () => ctx.onSelect(trophy.id));
      const name = el('span', 'si-name');
      name.append(`${trophy.order}. ${trophy.name} `, el('small', null, `— ${trophy.description}`));
      item.append(el('span', 'order', earnedIt ? '✓' : ''), gradeBadge(trophy.grade), name, trophy.missable ? missableTag() : kindTag(trophy));
      list.append(item);
    }
    section.append(list);
    container.append(section);
  }
}

/* ---------------- missables ---------------- */

export function renderMissables(container, trophies, ctx) {
  container.replaceChildren();
  for (const trophy of trophies.filter((t) => t.missable).sort((a, b) => a.order - b.order)) {
    const earnedIt = ctx.earned.has(trophy.name);
    const card = el('article', 'missable-card');
    const badges = el('div', 'detail-badges');
    badges.append(gradeBadge(trophy.grade), missableTag());
    if (trophy.hidden) badges.append(el('span', 'tag hidden-tag', 'Hidden on PSN'));
    card.append(
      badges,
      el('h3', null, trophy.name),
      el('p', 'official-label', 'Official description (PlayStation)'),
      el('p', 'official-desc', trophy.description),
      el('p', 'meta-line', `Roadmap window: ${STAGES[trophy.stage]?.name ?? `Stage ${trophy.stage}`}`),
      el('p', 'guide-label', 'Guide — in our own words'),
      el('p', 'guide-text', trophy.guide),
      el('p', 'sources-label', 'Sources'),
    );
    const list = el('ul', 'sources-list');
    for (const source of trophy.sources ?? []) list.append(el('li', null, source));
    card.append(list);
    const btn = el('button', `earn-btn${earnedIt ? ' is-earned' : ''}`, earnedIt ? '✓ Earned — tap to undo' : 'Mark as earned');
    btn.type = 'button';
    btn.addEventListener('click', () => ctx.onToggle(trophy));
    card.append(btn);
    container.append(card);
  }
}
