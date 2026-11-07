// Hộp thoại, thông báo, HUD (DOM).
import { STAT_INFO, clockStr, DOW, season, dow, yen, vnd, jpLevel } from './state.js';
import { sfx } from './audio.js';
import { input } from './input.js';

const $ = (id) => document.getElementById(id);
export const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

let current = null;
document.addEventListener('keydown', (e) => {
  if (!current || e.repeat) return;
  current.onKey(e);
});

export const modalOpen = () => !!current;

/**
 * Hộp thoại có lựa chọn. Trả về value của lựa chọn (hoặc chỉ số).
 * o: { who, title, jp, text (html), html, choices:[{label, sub, value, disabled, reason, primary, cancel}], wide }
 */
export function modal(o) {
  return new Promise((resolve) => {
    const m = $('modal'), card = $('card');
    const choices = o.choices && o.choices.length ? o.choices : [{ label: o.ok || 'Tiếp →', value: true, primary: true }];
    let h = '';
    if (o.who) h += `<div class="who">${esc(o.who)}</div>`;
    if (o.title) h += `<h2>${esc(o.title)}</h2>`;
    if (o.jp) h += `<p class="jp">${esc(o.jp)}</p>`;
    if (o.text) h += `<p class="txt">${o.text}</p>`;
    if (o.html) h += o.html;
    h += '<div class="choices">' + choices.map((c, i) => {
      const why = c.disabled && c.reason ? `<small class="why">${esc(c.reason)}</small>` : '';
      const sub = c.sub ? `<small>${c.sub}</small>` : '';
      const key = choices.length > 1 ? `<span class="k">${i + 1}</span>` : '';
      return `<button type="button" class="ch${c.primary ? ' pri' : ''}${c.cancel ? ' ghost' : ''}" data-i="${i}"${c.disabled ? ' disabled' : ''}>${key}<span class="l">${c.label}${sub}${why}</span></button>`;
    }).join('') + '</div>';
    card.innerHTML = h;
    card.className = 'card' + (o.wide ? ' wide' : '');
    m.hidden = false;
    card.scrollTop = 0;

    const pick = (i) => {
      const c = choices[i];
      if (!c || c.disabled) return;
      card.removeEventListener('click', onClick);
      current = null;
      m.hidden = true;
      input.suppress();
      sfx('tap');
      resolve(c.value !== undefined ? c.value : i);
    };
    const onClick = (e) => {
      const b = e.target.closest('button.ch');
      if (b) pick(+b.dataset.i);
    };
    card.addEventListener('click', onClick);
    current = {
      onKey(e) {
        if (/^Digit[1-9]$/.test(e.code) || /^Numpad[1-9]$/.test(e.code)) {
          e.preventDefault();
          pick(+e.code.slice(-1) - 1);
        } else if (e.code === 'Escape') {
          const ci = choices.findIndex((c) => c.cancel);
          if (ci >= 0) pick(ci);
        } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
          e.preventDefault();
          if (choices.length === 1) pick(0);
        }
      },
    };
  });
}

// Chọn nhiều mục (ví dụ đồ bảo hộ). Trả về mảng value đã chọn.
export function multi({ who, title, text, items, confirm = 'Xác nhận' }) {
  return new Promise((resolve) => {
    const m = $('modal'), card = $('card');
    const sel = new Set();
    card.className = 'card';
    card.innerHTML = (who ? `<div class="who">${esc(who)}</div>` : '') + `<h2>${esc(title)}</h2>` +
      (text ? `<p class="txt">${text}</p>` : '') +
      `<div class="multi">${items.map((it, i) => `<button type="button" class="tog" data-i="${i}" aria-pressed="false">${it.label}</button>`).join('')}</div>` +
      `<div class="choices"><button type="button" class="ch pri" data-ok="1"><span class="l">${confirm}</span></button></div>`;
    m.hidden = false;
    const onClick = (e) => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.ok) {
        card.removeEventListener('click', onClick);
        current = null; m.hidden = true; input.suppress(); sfx('tap');
        resolve(items.filter((_, i) => sel.has(i)).map((it) => it.value));
        return;
      }
      const i = +t.dataset.i;
      if (sel.has(i)) sel.delete(i); else sel.add(i);
      t.setAttribute('aria-pressed', sel.has(i) ? 'true' : 'false');
      sfx('tap');
    };
    card.addEventListener('click', onClick);
    current = { onKey() { /* dùng chuột / chạm */ } };
  });
}

let toastTimer = 0;
export function toast(msg, ms = 2200) {
  const t = $('toast');
  t.innerHTML = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

export function chips(out) {
  if (!out || !out.length) return '';
  return '<div class="chips">' + out.map(([k, d]) => {
    const info = STAT_INFO[k] || { icon: '', label: k };
    const good = d > 0;
    let v;
    if (k === 'money' || k === 'wage') v = (d > 0 ? '+' : '') + yen(d);
    else v = (d > 0 ? '+' : '−') + (Math.abs(d) < 1 ? Math.abs(d).toFixed(1) : Math.round(Math.abs(d)));
    return `<span class="chip ${good ? 'up' : 'down'}">${info.icon} ${info.label} <b>${v}</b></span>`;
  }).join('') + '</div>';
}

export function showHud(on) {
  $('hud').hidden = !on;
  $('hint').hidden = !on;
  document.body.classList.toggle('playing', !!on);
}

const BAR_KEYS = ['health', 'energy', 'full', 'mood'];
export function updateHud(S, hintText) {
  if (!S) return;
  $('h-day').textContent = `Ngày ${S.day}/56`;
  $('h-dow').textContent = `${DOW[dow(S)]} · ${season(S).name} ${season(S).jp}`;
  $('h-clock').textContent = clockStr(S.time);
  $('h-clock').classList.toggle('late', S.time >= 22 * 60);
  const yenEl = $('h-yen');
  yenEl.textContent = yen(S.money);
  yenEl.classList.toggle('neg', S.money < 0);
  $('h-debt').textContent = S.debt > 0 ? `Nợ: ${vnd(S.debt)}` : 'Đã trả hết nợ 🎉';
  $('h-extra').textContent = `🗣️ ${jpLevel(S.jp)} · ⭐ ${Math.round(S.rep)}${S.sick > 0 ? ' · 🤒 Ốm' : ''}${S.wage ? ' · 🧾 ' + yen(S.wage) : ''}`;
  for (const k of BAR_KEYS) {
    const el = $('bar-' + k);
    const v = Math.round(S[k]);
    el.style.width = v + '%';
    el.parentElement.classList.toggle('low', v < 25);
  }
  if (hintText !== undefined) $('hint').textContent = hintText;
}
