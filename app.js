// No framework or build step.
// artwork.json holds the artwork metadata. content.json holds every piece of site text.
// Routes use the URL hash so the site works on any static host:
//   #/  #/paintings  #/practice  #/objects  #/work/<id>  #/about  #/stories  #/edit

const view = document.querySelector('#view');
let data, content, items = [], byId = {};

// ---- Edit mode state (removals are kept in this browser only) ----
let removed = [], showRemoved = false, lastRemoved = null, storageNotice = '';
try {
  removed = JSON.parse(localStorage.getItem('lf.removed.v1') || '[]');
  if (!Array.isArray(removed)) removed = [];
} catch { storageNotice = 'Browser storage is unavailable. Export your changes before closing.'; }
const canonical = id => data?.duplicate_aliases?.[id] || id;
const isRemoved = id => removed.some(x => canonical(x) === id);
const visible = item => !isRemoved(item.id);
function persist() {
  try { localStorage.setItem('lf.removed.v1', JSON.stringify(removed)); }
  catch { storageNotice = 'Changes could not be saved on this browser. Export before closing.'; }
}
function removeItem(item) { removed.push(item.id); lastRemoved = item.id; persist(); draw(); }
function restoreItem(id) { removed = removed.filter(x => canonical(x) !== id); lastRemoved = null; persist(); draw(); }
function exportData() {
  // Keeps every field, including "file", plus any top-level fields such as "home".
  const out = { ...data, items: data.items.filter(visible) };
  const blob = new Blob([JSON.stringify(out, null, 2) + '\n'], { type: 'application/json' });
  const link = make('a'); link.href = URL.createObjectURL(blob); link.download = 'artwork.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// ---- Small helpers (all text goes in with textContent, never as HTML) ----
function make(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}
// content.json uses "TODO" for anything not written yet. Those values never show.
const filled = v => (typeof v === 'string' && v.trim() && v.trim() !== 'TODO') ? v.trim() : '';
const safeUrl = v => /^https?:\/\//i.test(v) ? v : '';
function paragraphs(parent, text) {
  for (const part of text.split(/\n{2,}/)) parent.append(make('p', part.trim()));
}
function img(item) {
  const el = make('img');
  el.src = item.file; el.width = item.width; el.height = item.height; el.loading = 'lazy';
  el.alt = item.display_title === 'Untitled' ? `Untitled, ${item.series}` : item.display_title;
  return el;
}
function tile(item) {
  const link = make('a', null, 'work');
  link.href = '#/work/' + encodeURIComponent(item.id);
  const box = make('span', null, 'thumb'); box.append(img(item));
  link.append(box, make('span', item.display_title, 'caption'));
  return link;
}
function grid(list, className) {
  const el = make('div', null, 'grid' + (className ? ' ' + className : ''));
  for (const item of list) el.append(tile(item));
  return el;
}
const sectionKeys = () => Object.keys(content.sections);

// ---- Pages ----
function homePage() {
  const intro = filled(content.home?.intro);
  if (intro) view.append(make('p', intro, 'intro'));
  const list = (data.home || []).map(id => byId[id]).filter(x => x && visible(x));
  view.append(grid(list, 'home'));
}

function sectionPage(key) {
  const section = content.sections[key];
  view.append(make('h1', section.title, 'page-title'));
  const listed = section.series.map(s => s.name);
  const extra = [...new Set(items.filter(x => x.section === key).map(x => x.series))].filter(s => !listed.includes(s));
  for (const s of [...section.series, ...extra.map(name => ({ name }))]) {
    const list = items.filter(x => x.section === key && x.series === s.name && visible(x));
    if (!list.length) continue;
    const block = make('section', null, 'series');
    block.append(make('h2', s.name));
    const intro = filled(s.intro);
    if (intro) block.append(make('p', intro, 'intro'));
    block.append(grid(list));
    view.append(block);
  }
}

function workPage(id) {
  const item = byId[id];
  if (!item || !visible(item)) return notFound();
  const page = make('article', null, 'work-page');
  const hero = make('div', null, 'hero'), picture = img(item);
  picture.loading = 'eager'; hero.append(picture);
  const info = make('div', null, 'work-info');
  info.append(make('h1', item.display_title));
  const meta = make('p', null, 'meta'), link = make('a', item.series);
  link.href = '#/' + item.section; meta.append(link); info.append(meta);
  const story = filled(content.stories?.works?.[item.id]);
  if (story) { const box = make('div', null, 'story'); paragraphs(box, story); info.append(box); }
  page.append(hero, info);
  view.append(page);
  const related = items.filter(x => x.series === item.series && x.id !== item.id && visible(x));
  if (related.length) {
    const box = make('section', null, 'related');
    box.append(make('h2', 'More from ' + item.series), grid(related));
    view.append(box);
  }
  document.title = `${item.display_title} — Lisa Frost`;
}

function aboutPage() {
  const about = content.about, box = make('div', null, 'prose');
  if (filled(about.label)) box.append(make('p', about.label, 'label'));
  box.append(make('h1', about.title));
  for (const p of about.statement || []) box.append(make('p', p));
  // Empty slots stay hidden until content.json has a real value for them.
  const slots = [
    ['bio', 'Bio', (body, text) => paragraphs(body, text)],
    ['studio_photo', 'Studio', (body, text) => { const el = make('img'); el.src = text; el.alt = 'Lisa Frost in the studio'; el.loading = 'lazy'; body.append(el); }],
    ['music', 'Music', (body, text) => paragraphs(body, text)],
    ['chicago', 'Chicago', (body, text) => paragraphs(body, text)],
    ['contact', 'Contact', (body, text) => {
      const a = make('a', text); a.href = text.includes('@') ? 'mailto:' + text : safeUrl(text); body.append(a);
    }],
    ['instagram', 'Instagram', (body, text) => {
      const a = make('a', text); a.href = safeUrl(text) || 'https://www.instagram.com/' + text.replace(/^@/, '') + '/'; body.append(a);
    }],
  ];
  for (const [key, label, fill] of slots) {
    const slot = make('section', null, 'slot'); slot.dataset.slot = key;
    const text = filled(about[key]);
    slot.hidden = !text;
    if (text) { const body = make('div'); slot.append(make('h2', label), body); fill(body, text); }
    box.append(slot);
  }
  view.append(box);
  document.title = 'About — Lisa Frost';
}

function storiesPage() {
  const box = make('div', null, 'prose');
  box.append(make('h1', 'Stories'));
  const intro = filled(content.stories?.page_intro);
  if (intro) paragraphs(box, intro);
  view.append(box);
  const list = items.filter(x => filled(content.stories?.works?.[x.id]) && visible(x));
  if (list.length) view.append(grid(list));
  document.title = 'Stories — Lisa Frost';
}

function editPage() {
  const panel = make('aside', null, 'edit-panel');
  panel.append(
    make('p', `Tap an image to ${showRemoved ? 'restore' : 'remove'} it. Originals are not deleted.`),
    make('p', 'Changes are saved on this browser only. To update the website, export artwork.json, replace the artwork.json in the site folder, and upload the folder to your host.')
  );
  const actions = make('div', null, 'edit-actions');
  const mode = (label, on) => {
    const b = make('button', label); b.setAttribute('aria-pressed', String(showRemoved === on));
    b.onclick = () => { showRemoved = on; draw(); }; return b;
  };
  actions.append(mode('Artwork', false), mode(`Removed (${items.filter(x => !visible(x)).length})`, true));
  if (lastRemoved) { const undo = make('button', 'Undo last'); undo.onclick = () => restoreItem(lastRemoved); actions.append(undo); }
  const exp = make('button', 'Export artwork.json ↓'); exp.onclick = exportData; actions.append(exp);
  panel.append(actions);
  if (storageNotice) panel.append(make('p', storageNotice));
  view.append(panel);

  const el = make('div', null, 'grid');
  for (const item of items.filter(x => showRemoved ? !visible(x) : visible(x))) {
    const b = make('button', null, 'edit-tile');
    b.setAttribute('aria-label', (showRemoved ? 'Restore ' : 'Remove ') + item.display_title);
    const box = make('span', null, 'thumb'); box.append(img(item));
    b.append(box, make('span', item.display_title, 'caption'), make('span', showRemoved ? '+ Restore' : '− Remove', 'edit-label'));
    b.onclick = () => showRemoved ? restoreItem(item.id) : removeItem(item);
    el.append(b);
  }
  view.append(el);
  document.title = 'Edit — Lisa Frost';
}

function notFound() {
  const p = make('p', 'That page was not found. ', 'notice'), a = make('a', 'Back to the start');
  a.href = '#/'; p.append(a); view.append(p);
}

// ---- Router ----
function current() {
  const [name = '', arg = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { name, arg: decodeURIComponent(arg) };
}
function draw() {
  const { name, arg } = current();
  view.replaceChildren();
  document.title = 'Lisa Frost';
  if (name === '') homePage();
  else if (name === 'work') workPage(arg);
  else if (name === 'about') aboutPage();
  else if (name === 'stories') storiesPage();
  else if (name === 'edit') editPage();
  else if (sectionKeys().includes(name)) { sectionPage(name); document.title = `${content.sections[name].title} — Lisa Frost`; }
  else notFound();
  // Mark the current nav item. A work page highlights its own section.
  const navKey = name === 'work' ? byId[arg]?.section : name;
  document.querySelectorAll('nav a').forEach(a => {
    if (a.dataset.nav === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

// Remember where a list page was scrolled so Back returns to the same spot.
const scrolled = {};
let lastKey = null;
function onRoute() {
  if (lastKey !== null) scrolled[lastKey] = window.scrollY;
  const key = location.hash || '#/';
  draw();
  window.scrollTo(0, current().name !== 'work' && key in scrolled ? scrolled[key] : 0);
  lastKey = key;
  view.focus({ preventScroll: true });
}
document.addEventListener('click', event => {
  // Choosing something from the title or main nav starts fresh at the top.
  if (event.target.closest('.brand, nav a')) for (const k in scrolled) delete scrolled[k];
});
window.addEventListener('hashchange', onRoute);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && current().name === 'work') history.back();
});

Promise.all([
  fetch('artwork.json').then(r => { if (!r.ok) throw Error('Could not read artwork.json'); return r.json(); }),
  fetch('content.json').then(r => { if (!r.ok) throw Error('Could not read content.json'); return r.json(); }),
]).then(([art, text]) => {
  data = art; content = text; items = data.items;
  for (const item of items) byId[item.id] = item;
  onRoute();
}).catch(error => {
  view.textContent = error.message + '. Run a local web server as described in README.md.';
});
