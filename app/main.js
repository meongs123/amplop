// main.js — router, localStorage store, and form handling for Amplop.
// Routes: #/ (dashboard), #/envelopes, #/envelopes/<id>, #/accounts,
// #/net-worth, #/transactions. window.__shotReady tells a screenshot
// script when the page has rendered.

import { SAMPLE } from './data.js';
import { dashboard, envelopes, envelopeDetail, accounts, netWorth, transactions, notFound } from './views.js';

const KEY = 'amplop-v1';
const app = document.getElementById('app');

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(SAMPLE);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.envelopes) || parsed.envelopes.length !== 12
      || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.accounts)) {
      return structuredClone(SAMPLE);
    }
    return parsed;
  } catch {
    return structuredClone(SAMPLE);
  }
}

let state = loadState();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep in-memory state */ } };

// Filter/sort UI state for the ledger (not persisted).
const ui = { env: '', q: '', sort: 'date-desc' };

function route() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\//, '').split('/').filter(Boolean);
  if (parts.length === 0) return { page: 'dashboard' };
  if (parts[0] === 'envelopes' && parts[1]) return { page: 'envelope', id: decodeURIComponent(parts[1]) };
  if (parts[0] === 'envelopes') return { page: 'envelopes' };
  if (parts[0] === 'accounts') return { page: 'accounts' };
  if (parts[0] === 'net-worth') return { page: 'net-worth' };
  if (parts[0] === 'transactions') return { page: 'transactions' };
  return { page: 'not-found' };
}

const TITLES = {
  dashboard: 'Amplop — Zero-Based Digital Envelope & Wealth Tracking',
  envelopes: 'Envelopes | Amplop',
  envelope: 'Envelope | Amplop',
  accounts: 'Accounts | Amplop',
  'net-worth': 'Net Worth | Amplop',
  transactions: 'Transactions & Reports | Amplop',
  'not-found': 'Not found | Amplop',
};

function render() {
  window.__shotReady = false;
  const r = route();
  let html;
  if (r.page === 'dashboard') html = dashboard(state);
  else if (r.page === 'envelopes') html = envelopes(state);
  else if (r.page === 'envelope') html = envelopeDetail(state, r.id);
  else if (r.page === 'accounts') html = accounts(state);
  else if (r.page === 'net-worth') html = netWorth(state);
  else if (r.page === 'transactions') html = transactions(state, ui);
  else html = notFound();
  app.innerHTML = html;
  document.title = TITLES[r.page] || TITLES.dashboard;
  document.querySelectorAll('.nav a').forEach((a) => {
    const href = a.getAttribute('href');
    const active = (r.page === 'dashboard' && href === '#/')
      || (r.page === 'envelopes' && href === '#/envelopes')
      || (r.page === 'envelope' && href === '#/envelopes')
      || (r.page === 'accounts' && href === '#/accounts')
      || (r.page === 'net-worth' && href === '#/net-worth')
      || (r.page === 'transactions' && href === '#/transactions');
    a.classList.toggle('active', !!active);
    if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function rerenderKeepScroll() {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

// --- Forms (event delegation; one listener for the whole app) ---
document.addEventListener('submit', (ev) => {
  const form = ev.target;
  const action = form.getAttribute('data-action');
  if (!action) return;
  ev.preventDefault();
  const data = new FormData(form);
  const num = (name) => Math.round(Number(data.get(name)) || 0);

  if (action === 'move-funds') {
    const from = String(data.get('from') || '');
    const to = String(data.get('to') || '');
    const amount = num('amount');
    if (!from || !to || from === to || amount <= 0) { alert('Pick two different envelopes and an amount above Rp0.'); return; }
    state.transfers.push({ date: '2026-11-27', from, to, amount, note: String(data.get('note') || '').slice(0, 80) });
    save();
    render();
  } else if (action === 'add-tx') {
    const amount = num('amount');
    const merchant = String(data.get('merchant') || '').trim();
    const envelope = String(data.get('envelope') || '');
    if (!merchant || amount <= 0 || !envelope) { alert('Fill in what, where and an amount above Rp0.'); return; }
    state.transactions.push({
      id: `tx-u${Date.now()}`,
      date: String(data.get('date') || '2026-11-27'),
      merchant,
      envelope,
      amount,
      type: 'expense',
      method: String(data.get('method') || 'Cash'),
    });
    save();
    location.hash = '#/transactions';
    render();
  } else if (action === 'add-account') {
    const name = String(data.get('name') || '').trim();
    const balance = num('balance');
    if (!name || balance < 0) { alert('Give the account a name and a balance of Rp0 or more.'); return; }
    state.accounts.push({ name, type: String(data.get('type') || 'Other'), balance });
    // Cash & bank asset tracks the accounts total.
    const cash = state.assets.find((a) => a.name === 'Cash & bank');
    if (cash) cash.amount = state.accounts.reduce((a, x) => a + x.balance, 0);
    save();
    render();
  } else if (action === 'add-asset') {
    const name = String(data.get('name') || '').trim();
    const amount = num('amount');
    if (!name || amount <= 0) { alert('Give the asset a name and a value above Rp0.'); return; }
    state.assets.push({ name, amount, note: 'Added by you' });
    save();
    render();
  } else if (action === 'add-liability') {
    const name = String(data.get('name') || '').trim();
    const amount = num('amount');
    if (!name || amount <= 0) { alert('Give the debt a name and an amount above Rp0.'); return; }
    state.liabilities.push({ name, amount, note: 'Added by you' });
    save();
    render();
  } else if (action === 'filter') {
    ev.preventDefault();
  }
});

// Ledger filters re-render live, keeping the typed search text.
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (!el.matches('[data-filter]')) return;
  if (el.name === 'q') ui.q = el.value;
  if (el.name === 'env') ui.env = el.value;
  if (el.name === 'sort') ui.sort = el.value;
  const pos = el.selectionStart;
  rerenderKeepScroll();
  const next = document.querySelector(`[data-filter][name="${el.name}"]`);
  if (next && el.name === 'q') { next.focus(); try { next.setSelectionRange(pos, pos); } catch { /* ignore */ } }
});
document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (!el.matches('[data-filter]')) return;
  if (el.name === 'env') ui.env = el.value;
  if (el.name === 'sort') ui.sort = el.value;
  rerenderKeepScroll();
});

// Reset to the sample household.
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-reset-sample]');
  if (!btn) return;
  if (!confirm('Reset Amplop to the sample Wijaya household data? Your changes will be lost.')) return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  state = structuredClone(SAMPLE);
  ui.env = ''; ui.q = ''; ui.sort = 'date-desc';
  render();
});

window.addEventListener('hashchange', render);
render();
