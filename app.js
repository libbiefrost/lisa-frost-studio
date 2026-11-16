// No framework or build step. All artwork metadata is in artwork.json.
let removed = [], editing = false, showRemoved = false, lastRemoved = null, storageNotice = '';
try { removed = JSON.parse(localStorage.getItem('lf.removed.v1') || '[]'); if (!Array.isArray(removed)) removed = []; } catch { storageNotice = 'Browser storage is unavailable. Export your changes before closing.'; }
function canonical(id) { return data?.duplicate_aliases?.[id] || id; }
function isRemoved(id) { return removed.some(x=>canonical(x)===id); }
function persist() { try { localStorage.setItem('lf.removed.v1',JSON.stringify(removed)); } catch { storageNotice = 'Changes could not be saved on this browser. Export before closing.'; } }
function remove(item) { removed.push(item.id); lastRemoved = item.id; selected = null; persist(); render(); }
function restore(id) { removed = removed.filter(x=>canonical(x)!==id); lastRemoved = null; persist(); render(); }
function exportData() { const file = new Blob([JSON.stringify({...data,items:data.items.filter(x=>!isRemoved(x.id)).map(({file,...metadata})=>metadata)},null,2)],{type:'application/json'}); const link=make('a'); link.href=URL.createObjectURL(file);link.download='artwork.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000); }
let data, order = [], selected = null, activeCollection = '', limit = 48, previousScroll = 0;
const gallery = document.querySelector('#gallery');
const make = (tag, text, className) => {const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el;};
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1)); [result[i],result[j]] = [result[j],result[i]];}
  return result;
}
function button(label, action) {const el = make('button', label); el.onclick = action; return el;}
function picture(item) {const image = make('img'); image.src = item.file; image.alt = item.title; image.width = item.width; image.height = item.height; image.loading = 'lazy'; return image;}
function open(item) {if (!selected) previousScroll = window.scrollY; selected = item; activeCollection = item.collections[0]; render(); window.scrollTo(0,0); gallery.tabIndex = -1; gallery.focus({preventScroll:true});}
function close() {selected = null; render(); window.scrollTo(0,previousScroll);}
function grid(items) {
  const el = make('div', null, 'grid');
  for (const item of items) {const tile = button('', () => editing ? (showRemoved ? restore(item.id) : remove(item)) : open(item)); tile.className = 'art'; tile.setAttribute('aria-label',(editing ? (showRemoved ? 'Restore ' : 'Remove ') : 'Open ')+item.title); tile.append(picture(item)); if(editing) {const label=make('span',showRemoved?'+ Restore':'− Remove','edit-label');tile.append(label);} if (item.format === 'animation') tile.append(make('span','Process')); el.append(tile);}
  return el;
}
function render() {
  gallery.replaceChildren();
  const active = order.filter(x=>editing&&showRemoved ? isRemoved(x.id) : !isRemoved(x.id));
  document.querySelector('#edit').textContent=editing?'Done editing':'Edit';
  if(editing) {const panel=make('aside',null,'edit-panel');panel.append(make('p',`Tap an image to ${showRemoved?'restore':'remove'} it. Originals are not deleted.`),make('p','Changes are saved on this browser only. To update your actual website: export artwork.json, replace the old artwork.json in your site folder, and upload that folder to your host.'));
    const actions=make('div',null,'edit-actions');actions.append(button('Artwork',()=>{showRemoved=false;render();}),button(`Removed (${data.items.filter(x=>isRemoved(x.id)).length})`,()=>{showRemoved=true;render();})); if(lastRemoved)actions.append(button('Undo last',()=>restore(lastRemoved)));actions.append(button('Export artwork.json ↓',exportData));panel.append(actions);if(storageNotice)panel.append(make('p',storageNotice));gallery.append(panel);}

  document.querySelector('#shuffle').hidden = !!selected;
  if (!selected) {
    gallery.append(make('div',`${active.length} ${showRemoved&&editing?'removed on this browser':'artworks'}`,'count'),grid(active.slice(0,limit)));
    if (limit < active.length) {const more = make('div', null, 'more');more.append(button('More artwork',()=>{limit += 48;render();}),make('div',`${Math.min(limit,active.length)} / ${active.length}`));gallery.append(more);}
    return;
  }
  const item = selected;
  const bar = make('div',null,'bar');bar.append(button('← All artwork',close),button('Close ×',close));
  const hero = make('div',null,'hero');hero.append(picture(item));
  const info = make('div',null,'info'), groups = make('div');
  for (const name of item.collections) {const b=button(name,()=>{activeCollection=name;render();});b.setAttribute('aria-pressed',String(name===activeCollection));groups.append(b);}
  const details = make('aside',null,'details');details.hidden = true;
  details.append(make('p',`${item.width} × ${item.height}`),make('p',item.tags.map(t=>'#'+t).join(' ')),make('p','Colors: '+item.colors.join(', ')));
  details.append(make('p','Source: '+item.source_path));
  info.append(groups,button('Details',()=>{details.hidden=!details.hidden;}));
  const related = active.filter(x => x.id!==item.id && x.collections.includes(activeCollection));
  const heading=make('div',null,'related');heading.append(make('h2',activeCollection),make('span',`${related.length} more in this collection`));
  gallery.append(bar,hero,info,details,heading,grid(related));
}
document.querySelector('#edit').onclick=()=>{editing=!editing;showRemoved=false;selected=null;render();};
document.querySelectorAll('[download]').forEach(link=>link.onclick=event=>{event.preventDefault();exportData();});
document.querySelector('#shuffle').onclick=()=>{order=shuffle(data.items);limit=48;render();};
document.querySelector('#about').onclick=()=>{const panel=document.querySelector('#about-panel');panel.hidden=!panel.hidden;};
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&selected)close();});
fetch('artwork.json').then(response=>{if(!response.ok)throw Error('Could not read artwork.json');return response.json();}).then(manifest=>{data=manifest;order=shuffle(data.items);render();;}).catch(error=>{gallery.textContent=error.message+'. Run a local web server as described in README.md.';});
