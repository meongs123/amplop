// views.js — HTML for each hash route, built from the state via totals.js.
// Every value is escaped before it goes into the page.

import { fmtRp, fmtNum, fmtPct, fmtDate } from './format.js';
import { computeTotals, envelopeSpent, envelopeRemaining, envelopeStatus, envelopeTransfersIn, envelopeTransfersOut, rule503020 } from './totals.js';
import { donut, donutLegend, hbars, lineChart } from './charts.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function statCard(label, value, sub, cls = '') {
  return `<div class="stat ${cls}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div>`;
}

function txRows(txs, envById) {
  return txs.map((t) => {
    const env = t.envelope ? envById[t.envelope] : null;
    const sign = t.type === 'income' ? '+' : '−';
    const cls = t.type === 'income' ? 'amt-in' : 'amt-out';
    return `<tr><td>${fmtDate(t.date)}</td><td>${esc(t.merchant)}</td><td>${env ? esc(env.name) : 'Income'}</td><td>${esc(t.method)}</td><td class="${cls}">${sign}${fmtRp(t.amount)}</td></tr>`;
  }).join('');
}

function txTable(txs, envById, caption) {
  return `<table class="tbl"><caption>${caption}</caption><thead><tr><th>Date</th><th>What</th><th>Envelope</th><th>Paid with</th><th class="num">Amount</th></tr></thead><tbody>${txRows(txs, envById)}</tbody></table>`;
}

function envById(state) {
  return Object.fromEntries(state.envelopes.map((e) => [e.id, e]));
}

function envMiniRow(state, env) {
  const spent = envelopeSpent(state, env);
  const left = envelopeRemaining(state, env);
  const st = envelopeStatus(state, env);
  const avail = env.assigned + envelopeTransfersIn(state, env.id) - envelopeTransfersOut(state, env.id);
  const pct = avail > 0 ? Math.min(100, (spent / avail) * 100) : 0;
  const barCls = st.cls === 'bad' ? 'bar-bad' : st.cls === 'warn' ? 'bar-warn' : '';
  return `<a class="env-mini" href="#/envelopes/${env.id}"><span class="env-mini-name">${esc(env.name)}</span><span class="env-mini-bar"><span class="${barCls}" style="width:${pct.toFixed(1)}%"></span></span><span class="env-mini-left ${st.cls === 'bad' ? 'txt-bad' : ''}">${fmtRp(left)} left</span><span class="badge ${st.cls}">${st.label}</span></a>`;
}

function envCard(state, env) {
  const spent = envelopeSpent(state, env);
  const left = envelopeRemaining(state, env);
  const st = envelopeStatus(state, env);
  const avail = env.assigned + envelopeTransfersIn(state, env.id) - envelopeTransfersOut(state, env.id);
  const pct = avail > 0 ? Math.min(100, (spent / avail) * 100) : 0;
  const barCls = st.cls === 'bad' ? 'bar-bad' : st.cls === 'warn' ? 'bar-warn' : '';
  const spentLabel = env.kind === 'invest' ? 'Invested' : env.kind === 'saving' ? 'Set aside' : 'Spent';
  return `<a class="env-card" href="#/envelopes/${env.id}">
    <div class="env-card-top"><h3>${esc(env.name)}</h3><span class="badge ${st.cls}">${st.label}</span></div>
    <p class="env-note">${esc(env.note)}</p>
    <div class="env-nums"><div><span>Assigned</span><strong>${fmtRp(env.assigned)}</strong></div><div><span>${spentLabel}</span><strong>${fmtRp(spent)}</strong></div><div><span>Left</span><strong class="${st.cls === 'bad' ? 'txt-bad' : ''}">${fmtRp(left)}</strong></div></div>
    <div class="bar"><span class="${barCls}" style="width:${pct.toFixed(1)}%"></span></div>
    <div class="env-pct">${fmtPct(pct, 0)} used</div></a>`;
}

// ---------------- Dashboard ----------------
export function dashboard(state) {
  const t = computeTotals(state);
  const byId = envById(state);
  const spending = state.envelopes.filter((e) => e.kind === 'spending');
  const segments = spending
    .map((e) => ({ label: e.name, value: envelopeSpent(state, e), text: fmtRp(envelopeSpent(state, e)) }))
    .sort((a, b) => b.value - a.value);
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1))
    .slice(0, 8);
  const paidBills = state.bills.filter((b) => b.status === 'paid').length;
  const upcoming = state.bills.find((b) => b.status === 'upcoming');
  const zeroPct = t.assigned ? (t.spentLiving / t.assigned) * 100 : 0;
  const savedPct = t.assigned ? (t.savedInvested / t.assigned) * 100 : 0;
  const leftPct = Math.max(0, 100 - zeroPct - savedPct);
  return `<section class="page-head">
    <p class="kicker">The Wijaya Household · Jakarta · ${esc(state.household.month)} — Day ${state.household.day} of ${state.household.daysInMonth}</p>
    <h1>Every Rupiah Has a Job.</h1>
    <p class="lede">Zero-based envelope budgeting for one Jakarta family: all ${fmtRp(t.income)} of November income is assigned to an envelope — spending, saving or investing — until nothing is left unassigned.</p>
  </section>
  <section class="stats" aria-label="November headline figures">
    ${statCard('Monthly income', fmtRp(t.income), 'Salary Andi + Salary Sari + freelance', 'hl')}
    ${statCard('Assigned', fmtRp(t.assigned), '100% of income, 12 envelopes', 'hl')}
    ${statCard('Unassigned', fmtRp(t.unassigned), 'Every rupiah has a job ✓', 'hl zero')}
    ${statCard('Spent on living', fmtRp(t.spentLiving), '48 purchases, 1–27 Nov', '')}
    ${statCard('Saved & invested', fmtRp(t.savedInvested), 'Emergency Rp2.000.000 + Investments Rp2.850.000', 'hl')}
  </section>
  <section class="card zero-based">
    <div class="zb-head"><h2>Zero-based budget</h2><span class="zb-left">Left in spending envelopes: <strong>${fmtRp(t.leftSpending)}</strong></span></div>
    <div class="zb-bar" role="img" aria-label="Assigned budget split: spent on living, saved and invested, left in envelopes">
      <span class="zb-spent" style="width:${zeroPct.toFixed(1)}%"></span><span class="zb-saved" style="width:${savedPct.toFixed(1)}%"></span><span class="zb-leftseg" style="width:${leftPct.toFixed(1)}%"></span>
    </div>
    <div class="zb-legend"><span><i class="sw-blue"></i>Spent on living ${fmtRp(t.spentLiving)} (${fmtPct(zeroPct, 0)})</span><span><i class="sw-green"></i>Saved &amp; invested ${fmtRp(t.savedInvested)} (${fmtPct(savedPct, 0)})</span><span><i class="sw-yellow"></i>Still in envelopes ${fmtRp(t.leftSpending)} (${fmtPct(leftPct, 0)})</span></div>
    <p class="fine">Income ${fmtRp(t.income)} = spent ${fmtRp(t.spentLiving)} + saved ${fmtRp(t.savedInvested)} + left ${fmtRp(t.leftSpending)}. The Emergency Fund ${fmtRp(2000000)} sits inside “saved”, so it is never double-counted.</p>
  </section>
  <div class="grid-2">
    <section class="card">
      <h2>Where the money went</h2>
      <div class="donut-wrap">${donut(segments, 'Spent', fmtRp(t.spentLiving))}<ul class="legend">${donutLegend(segments)}</ul></div>
      <p class="fine">Housing is the biggest envelope at ${fmtRp(3500000)} — rent, paid 1 Nov. <a href="#/transactions">See all 51 transactions →</a></p>
    </section>
    <section class="card">
      <h2>12 envelopes <a class="hlink" href="#/envelopes">All envelopes →</a></h2>
      <div class="env-strip">${spending.map((e) => envMiniRow(state, e)).join('')}${state.envelopes.filter((e) => e.kind !== 'spending').map((e) => envMiniRow(state, e)).join('')}</div>
      <p class="fine"><strong class="txt-bad">Snacks is empty.</strong> It ran out on 20 Nov and was topped up with ${fmtRp(150000)} moved in from Entertainment — the envelope rule, in action.</p>
    </section>
  </div>
  <div class="grid-2">
    <section class="card">
      <h2>Accounts <a class="hlink" href="#/accounts">All accounts →</a></h2>
      <p class="big-total">${fmtRp(t.accountsTotal)} <span>across ${state.accounts.length} accounts</span></p>
      ${hbars(state.accounts.map((a) => ({ label: a.name, value: a.balance, text: fmtRp(a.balance) })), t.accountsTotal)}
      <p class="fine">Banks, e-wallets (GoPay, OVO, DANA) and cash — one total, updated everywhere.</p>
    </section>
    <section class="card">
      <h2>Net worth <a class="hlink" href="#/net-worth">Net worth →</a></h2>
      <p class="big-total">${fmtRp(t.netWorth)} <span class="txt-good">▲ +${fmtRp(t.netWorthDelta)} in November</span></p>
      <p>Assets ${fmtRp(t.assetsTotal)} − debts ${fmtRp(t.debtsTotal)}. Gold, mutual funds and the apartment, minus the mortgage, motorbike loan and credit card.</p>
      <p class="fine">Six-month trend: ${fmtRp(state.trend[0].value)} (Jun) → ${fmtRp(t.netWorth)} (Nov), +${fmtRp(t.netWorth - state.trend[0].value)}.</p>
      <p class="fine">Bills: ${paidBills} of ${state.bills.length} paid. Next: ${esc(upcoming.name)} ${fmtRp(upcoming.amount)}, due ${fmtDate(upcoming.due)}. <a href="#/transactions">Bills &amp; reports →</a></p>
    </section>
  </div>
  <section class="card">
    <h2>Latest transactions</h2>
    ${txTable(recent, byId, 'Most recent 8 of 51 transactions')}
  </section>`;
}

// ---------------- Envelopes ----------------
export function envelopes(state) {
  const opts = state.envelopes.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join('');
  const log = [...state.transfers].reverse().map((tr) => {
    const from = state.envelopes.find((e) => e.id === tr.from);
    const to = state.envelopes.find((e) => e.id === tr.to);
    return `<li><strong>${fmtDate(tr.date)}</strong> — ${esc(from ? from.name : tr.from)} → ${esc(to ? to.name : tr.to)}: <strong>${fmtRp(tr.amount)}</strong>${tr.note ? ` <span class="muted">— ${esc(tr.note)}</span>` : ''}</li>`;
  }).join('');
  return `<section class="page-head">
    <h1>Envelopes</h1>
    <p class="lede">Twelve envelopes, one rule: an empty envelope means stop — or consciously move money from another envelope. Every move is logged, and every total updates.</p>
  </section>
  <section class="card">
    <h2>Move funds between envelopes</h2>
    <form data-action="move-funds" class="form-row">
      <label>From<select name="from" required>${opts}</select></label>
      <label>To<select name="to" required>${opts}</select></label>
      <label>Amount (Rp)<input name="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="150000" required></label>
      <label>Note<input name="note" type="text" maxlength="80" placeholder="Why the move?"></label>
      <button class="btn" type="submit">Move funds</button>
    </form>
    <p class="fine">Saved instantly in this browser. Moving money changes what is left in both envelopes — and the dashboard totals.</p>
  </section>
  <section class="card">
    <h2>Transfer log</h2>
    <ul class="transfer-log">${log || '<li>No transfers yet.</li>'}</ul>
  </section>
  <section class="env-grid">${state.envelopes.map((e) => envCard(state, e)).join('')}</section>`;
}

export function envelopeDetail(state, id) {
  const env = state.envelopes.find((e) => e.id === id);
  if (!env) return `<section class="page-head"><h1>Envelope not found</h1><p class="lede">There is no envelope at this address. <a href="#/envelopes">See all envelopes</a>.</p></section>`;
  const spent = envelopeSpent(state, env);
  const left = envelopeRemaining(state, env);
  const st = envelopeStatus(state, env);
  const txs = state.transactions.filter((t) => t.envelope === id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const bills = state.bills.filter((b) => b.envelope === id);
  const byId = envById(state);
  return `<section class="page-head">
    <p class="kicker"><a href="#/envelopes">← All envelopes</a></p>
    <h1>${esc(env.name)} <span class="badge ${st.cls}">${st.label}</span></h1>
    <p class="lede">${esc(env.note)}</p>
  </section>
  <section class="stats">
    ${statCard('Assigned', fmtRp(env.assigned), 'For November', 'hl')}
    ${statCard(env.kind === 'invest' ? 'Invested' : env.kind === 'saving' ? 'Set aside' : 'Spent', fmtRp(spent), env.kind === 'spending' ? `${txs.length} transactions` : '', 'hl')}
    ${statCard('Left', fmtRp(left), env.kind === 'spending' ? 'To last until 30 Nov' : '', st.cls === 'bad' ? 'zero' : 'hl')}
  </section>
  ${bills.length ? `<section class="card"><h2>Bills tied to this envelope</h2><ul class="bill-list">${bills.map((b) => `<li><span>${esc(b.name)}</span><span>${fmtRp(b.amount)}</span><span class="badge ${b.status === 'paid' ? 'ok' : 'warn'}">${b.status === 'paid' ? 'Paid' : 'Upcoming'}</span><span class="muted">due ${fmtDate(b.due)}</span></li>`).join('')}</ul></section>` : ''}
  <section class="card"><h2>Transactions — ${esc(env.name)} (${txs.length})</h2>
  ${txs.length ? txTable(txs, byId, `All transactions in the ${env.name} envelope`) : `<p class="muted">No transactions in this envelope yet — ${env.kind === 'saving' ? 'the money is set aside, not spent.' : env.kind === 'invest' ? 'the assigned amount is invested as one lump sum.' : 'add one from Transactions.'}</p>`}
  </section>`;
}

// ---------------- Accounts ----------------
export function accounts(state) {
  const t = computeTotals(state);
  const goalRows = state.goals.map((g) => {
    const pct = g.target ? Math.min(100, (g.current / g.target) * 100) : 0;
    const cur = g.unit === 'g' ? `${fmtNum(g.current)} g` : fmtRp(g.current);
    const tgt = g.unit === 'g' ? `${fmtNum(g.target)} g` : fmtRp(g.target);
    return `<div class="goal"><div class="goal-head"><strong>${esc(g.name)}</strong><span>${cur} of ${tgt} — ${fmtPct(pct, 0)}</span></div><div class="bar"><span style="width:${pct.toFixed(1)}%"></span></div><p class="fine">${esc(g.note)}</p></div>`;
  }).join('');
  return `<section class="page-head">
    <h1>Accounts</h1>
    <p class="lede">Every rupiah the family holds, in one place: two bank accounts, three e-wallets and cash. Total ${fmtRp(t.accountsTotal)}.</p>
  </section>
  <section class="card"><p class="big-total">${fmtRp(t.accountsTotal)} <span>total across ${state.accounts.length} accounts</span></p></section>
  <section class="acct-grid">${state.accounts.map((a) => {
    const share = t.accountsTotal ? (a.balance / t.accountsTotal) * 100 : 0;
    return `<div class="card acct-card"><div class="acct-top"><h3>${esc(a.name)}</h3><span class="badge">${esc(a.type)}</span></div><p class="acct-bal">${fmtRp(a.balance)}</p><div class="bar"><span style="width:${share.toFixed(1)}%"></span></div><p class="fine">${fmtPct(share)} of all money</p></div>`;
  }).join('')}</section>
  <section class="card">
    <h2>Add an account</h2>
    <form data-action="add-account" class="form-row">
      <label>Name<input name="name" type="text" maxlength="40" placeholder="e.g. BCA Dollar" required></label>
      <label>Type<select name="type"><option>Bank account</option><option>E-wallet</option><option>Cash</option><option>Other</option></select></label>
      <label>Opening balance (Rp)<input name="balance" type="number" min="0" step="1" inputmode="numeric" placeholder="0" required></label>
      <button class="btn" type="submit">Add account</button>
    </form>
    <p class="fine">The total updates everywhere — dashboard, net worth, and the cash &amp; bank asset.</p>
  </section>
  <section class="card">
    <h2>Goals — earmarks inside these balances</h2>
    <p class="fine">Goals are not extra money: the Emergency fund lives inside BCA Savings. They are never added to net worth a second time.</p>
    ${goalRows}
  </section>`;
}

// ---------------- Net worth ----------------
export function netWorth(state) {
  const t = computeTotals(state);
  const points = state.trend.map((p) => ({ ...p, short: fmtRp(p.value) }));
  const maxAsset = Math.max(...state.assets.map((a) => a.amount), 1);
  const maxDebt = Math.max(...state.liabilities.map((l) => l.amount), 1);
  return `<section class="page-head">
    <h1>Net Worth</h1>
    <p class="lede">Everything the family owns, minus everything it owes. November: ${fmtRp(t.netWorth)}.</p>
  </section>
  <section class="stats">
    ${statCard('Net worth', fmtRp(t.netWorth), 'Assets − debts', 'hl')}
    ${statCard('Change in November', `+${fmtRp(t.netWorthDelta)}`, `+${fmtPct(t.netWorthDeltaPct, 2)} vs October`, 'hl')}
    ${statCard('Assets', fmtRp(t.assetsTotal), `${state.assets.length} items`, '')}
    ${statCard('Debts', fmtRp(t.debtsTotal), `${state.liabilities.length} items`, '')}
  </section>
  <div class="grid-2">
    <section class="card">
      <h2>Assets vs debts</h2>
      ${hbars([{ label: 'Assets', value: t.assetsTotal, text: fmtRp(t.assetsTotal), color: '#4ADE80' }, { label: 'Debts', value: t.debtsTotal, text: fmtRp(t.debtsTotal), color: '#F87171' }], t.assetsTotal)}
      <p class="fine">Debts are ${fmtPct((t.debtsTotal / t.assetsTotal) * 100)} of assets. The mortgage is the big one — ${fmtRp(285000000)} of the apartment’s ${fmtRp(450000000)} value.</p>
    </section>
    <section class="card">
      <h2>Six-month trend</h2>
      ${lineChart(points)}
      <p class="fine">Jun ${fmtRp(state.trend[0].value)} → Nov ${fmtRp(t.netWorth)}: +${fmtRp(t.netWorth - state.trend[0].value)} (+${fmtPct(((t.netWorth - state.trend[0].value) / state.trend[0].value) * 100)}) in six months.</p>
    </section>
  </div>
  <div class="grid-2">
    <section class="card">
      <h2>Assets — ${fmtRp(t.assetsTotal)}</h2>
      <table class="tbl"><thead><tr><th>Asset</th><th class="num">Value</th></tr></thead><tbody>
      ${state.assets.map((a) => `<tr><td>${esc(a.name)}<br><span class="muted">${esc(a.note || '')}</span></td><td class="num">${fmtRp(a.amount)}</td></tr>`).join('')}
      </tbody></table>
      <form data-action="add-asset" class="form-row stack">
        <label>Name<input name="name" type="text" maxlength="50" placeholder="e.g. Gold — 5 g" required></label>
        <label>Value (Rp)<input name="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="0" required></label>
        <button class="btn" type="submit">Add asset</button>
      </form>
    </section>
    <section class="card">
      <h2>Debts — ${fmtRp(t.debtsTotal)}</h2>
      <table class="tbl"><thead><tr><th>Debt</th><th class="num">Owed</th></tr></thead><tbody>
      ${state.liabilities.map((l) => `<tr><td>${esc(l.name)}<br><span class="muted">${esc(l.note || '')}</span></td><td class="num">${fmtRp(l.amount)}</td></tr>`).join('')}
      </tbody></table>
      <form data-action="add-liability" class="form-row stack">
        <label>Name<input name="name" type="text" maxlength="50" placeholder="e.g. Personal loan" required></label>
        <label>Amount owed (Rp)<input name="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="0" required></label>
        <button class="btn" type="submit">Add debt</button>
      </form>
    </section>
  </div>`;
}

// ---------------- Transactions & Reports ----------------
export function transactions(state, ui) {
  const t = computeTotals(state);
  const byId = envById(state);
  const r = rule503020(state);
  const oct = state.october;
  let rows = [...state.transactions];
  if (ui.env) rows = rows.filter((x) => (ui.env === 'income' ? x.type === 'income' : x.envelope === ui.env));
  if (ui.q) {
    const q = ui.q.toLowerCase();
    rows = rows.filter((x) => `${x.merchant} ${x.method || ''}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => {
    if (ui.sort === 'amount-desc') return b.amount - a.amount;
    if (ui.sort === 'amount-asc') return a.amount - b.amount;
    return a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1;
  });
  const envOpts = ['<option value="">All envelopes</option>', '<option value="income"' + (ui.env === 'income' ? ' selected' : '') + '>Income</option>']
    .concat(state.envelopes.map((e) => `<option value="${e.id}"${ui.env === e.id ? ' selected' : ''}>${esc(e.name)}</option>`)).join('');
  const spentRows = state.envelopes.filter((e) => e.kind === 'spending')
    .map((e) => ({ label: e.name, value: envelopeSpent(state, e), text: fmtRp(envelopeSpent(state, e)) }))
    .sort((a, b) => b.value - a.value);
  const maxSpent = Math.max(...spentRows.map((x) => x.value), 1);
  return `<section class="page-head">
    <h1>Transactions &amp; Reports</h1>
    <p class="lede">${state.transactions.length} rows in the November record — ${state.transactions.filter((x) => x.type === 'expense').length} purchases and ${state.transactions.filter((x) => x.type === 'income').length} income. Add one and every total moves.</p>
  </section>
  <section class="card">
    <h2>Add a transaction</h2>
    <form data-action="add-tx" class="form-row">
      <label>Date<input name="date" type="date" value="2026-11-27" min="2026-11-01" max="2026-11-30" required></label>
      <label>What<input name="merchant" type="text" maxlength="60" placeholder="e.g. Indomaret — groceries" required></label>
      <label>Envelope<select name="envelope">${state.envelopes.filter((e) => e.kind === 'spending').map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select></label>
      <label>Amount (Rp)<input name="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="50000" required></label>
      <label>Paid with<select name="method"><option>BCA Main</option><option>GoPay</option><option>OVO</option><option>DANA</option><option>Cash</option></select></label>
      <button class="btn" type="submit">Add transaction</button>
    </form>
  </section>
  <section class="card">
    <h2>Transactions — ${rows.length} of ${state.transactions.length} rows</h2>
    <form data-action="filter" class="form-row filters">
      <label>Envelope<select name="env" data-filter>${envOpts}</select></label>
      <label>Search<input name="q" type="search" placeholder="Search merchant…" value="${esc(ui.q || '')}" data-filter></label>
      <label>Sort<select name="sort" data-filter>
        <option value="date-desc"${ui.sort === 'date-desc' ? ' selected' : ''}>Newest first</option>
        <option value="amount-desc"${ui.sort === 'amount-desc' ? ' selected' : ''}>Largest amount</option>
        <option value="amount-asc"${ui.sort === 'amount-asc' ? ' selected' : ''}>Smallest amount</option>
      </select></label>
    </form>
    <div class="table-scroll">${txTable(rows, byId, `Transactions, ${rows.length} rows shown`)}</div>
  </section>
  <div class="grid-2">
    <section class="card">
      <h2>50 / 30 / 20 check</h2>
      <p class="lede-sm">Needs ${fmtPct(r.needsPct, 0)} · Wants ${fmtPct(r.wantsPct, 0)} · Savings ${fmtPct(r.savingsPct, 0)} — of ${fmtRp(r.total)} assigned.</p>
      ${hbars([
        { label: 'Needs (target 50%)', value: r.needs, text: `${fmtRp(r.needs)} · ${fmtPct(r.needsPct)}`, color: '#7DD3FC' },
        { label: 'Wants (target 30%)', value: r.wants, text: `${fmtRp(r.wants)} · ${fmtPct(r.wantsPct)}`, color: '#FBBF24' },
        { label: 'Savings (target 20%)', value: r.savings, text: `${fmtRp(r.savings)} · ${fmtPct(r.savingsPct)}`, color: '#4ADE80' },
      ], r.total)}
      <p class="fine"><strong>Needs run high — Jakarta rent.</strong> Housing alone is ${fmtRp(3500000)}. The family still saves ${fmtPct(r.savingsPct)} — above the 20% target — because every rupiah is assigned first.</p>
    </section>
    <section class="card">
      <h2>November vs October</h2>
      <table class="tbl"><thead><tr><th></th><th class="num">October</th><th class="num">November</th><th class="num">Change</th></tr></thead><tbody>
      <tr><td>Income</td><td class="num">${fmtRp(oct.income)}</td><td class="num">${fmtRp(t.income)}</td><td class="num">${fmtRp(t.income - oct.income)}</td></tr>
      <tr><td>Spent on living</td><td class="num">${fmtRp(oct.spent)}</td><td class="num">${fmtRp(t.spentLiving)}</td><td class="num txt-good">${fmtRp(t.spentLiving - oct.spent)}</td></tr>
      <tr><td>Saved &amp; invested</td><td class="num">${fmtRp(oct.saved)}</td><td class="num">${fmtRp(t.savedInvested)}</td><td class="num txt-good">+${fmtRp(t.savedInvested - oct.saved)}</td></tr>
      <tr><td>Left unspent</td><td class="num">${fmtRp(oct.left)}</td><td class="num">${fmtRp(t.leftSpending)}</td><td class="num">${fmtRp(t.leftSpending - oct.left)}</td></tr>
      <tr><td>Net worth</td><td class="num">${fmtRp(oct.netWorth)}</td><td class="num">${fmtRp(t.netWorth)}</td><td class="num txt-good">+${fmtRp(t.netWorth - oct.netWorth)}</td></tr>
      </tbody></table>
      <p class="fine">November spent ${fmtRp(Math.abs(t.spentLiving - oct.spent))} less than October — mostly fewer snacks after the envelope ran out on 20 Nov.</p>
    </section>
  </div>
  <section class="card">
    <h2>Spending by envelope</h2>
    ${hbars(spentRows, maxSpent)}
    <p class="fine">Housing, Kitchen and School &amp; Kids are two-thirds of living costs. Snacks overspent its ${fmtRp(600000)} assignment — covered by the ${fmtRp(150000)} move from Entertainment.</p>
  </section>
  <section class="card">
    <h2>Bills — ${state.bills.filter((b) => b.status === 'paid').length} paid, 1 upcoming</h2>
    <ul class="bill-list">${state.bills.map((b) => `<li><span>${esc(b.name)}</span><span>${fmtRp(b.amount)}</span><span class="badge ${b.status === 'paid' ? 'ok' : 'warn'}">${b.status === 'paid' ? 'Paid' : 'Upcoming'}</span><span class="muted">due ${fmtDate(b.due)}</span></li>`).join('')}</ul>
  </section>`;
}

export function notFound() {
  return `<section class="page-head"><h1>Page not found</h1><p class="lede">That page is not in Amplop. <a href="#/">Back to the dashboard</a>.</p></section>`;
}
