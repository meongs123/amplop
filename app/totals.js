// totals.js — the single source of truth. Every number the site shows is
// derived here from the state (data.js sample + localStorage changes).
// Views never hard-code a total; they call these functions.

export const sum = (rows, key) => rows.reduce((a, r) => a + (Number(r[key]) || 0), 0);

// Spent of one envelope: spending envelopes sum their expense
// transactions; Investments counts its assigned amount as invested;
// the Emergency Fund is set aside, spent 0.
export function envelopeSpent(state, env) {
  if (env.kind === 'invest') return env.assigned;
  if (env.kind === 'saving') return 0;
  return state.transactions
    .filter((t) => t.type === 'expense' && t.envelope === env.id)
    .reduce((a, t) => a + t.amount, 0);
}

export function envelopeTransfersIn(state, id) {
  return state.transfers.filter((t) => t.to === id).reduce((a, t) => a + t.amount, 0);
}

export function envelopeTransfersOut(state, id) {
  return state.transfers.filter((t) => t.from === id).reduce((a, t) => a + t.amount, 0);
}

// What is left in an envelope: assigned − spent + moved in − moved out.
export function envelopeRemaining(state, env) {
  return env.assigned - envelopeSpent(state, env)
    + envelopeTransfersIn(state, env.id) - envelopeTransfersOut(state, env.id);
}

export function envelopeStatus(state, env) {
  const left = envelopeRemaining(state, env);
  if (env.kind === 'saving') return { label: 'Set aside', cls: 'ok' };
  if (env.kind === 'invest') return { label: 'Invested', cls: 'ok' };
  if (env.id === 'housing' && left === 0) return { label: 'Paid', cls: 'ok' };
  if (left <= 0) return { label: 'Empty', cls: 'bad' };
  if (left / env.assigned < 0.1) return { label: 'Low', cls: 'warn' };
  return { label: 'On track', cls: 'ok' };
}

export function computeTotals(state) {
  const income = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((a, t) => a + t.amount, 0);
  const assigned = sum(state.envelopes, 'assigned');
  const spendingEnvs = state.envelopes.filter((e) => e.kind === 'spending');
  const spentLiving = spendingEnvs.reduce((a, e) => a + envelopeSpent(state, e), 0);
  const savedInvested = state.envelopes
    .filter((e) => e.kind !== 'spending')
    .reduce((a, e) => a + e.assigned, 0);
  const leftSpending = spendingEnvs.reduce((a, e) => a + envelopeRemaining(state, e), 0);
  const leftTotal = state.envelopes.reduce((a, e) => a + envelopeRemaining(state, e), 0);
  const accountsTotal = sum(state.accounts, 'balance');
  const assetsTotal = sum(state.assets, 'amount');
  const debtsTotal = sum(state.liabilities, 'amount');
  const netWorth = assetsTotal - debtsTotal;
  const trend = state.trend;
  const prevNetWorth = trend.length > 1 ? trend[trend.length - 2].value : netWorth;
  return {
    income,
    assigned,
    unassigned: income - assigned,
    spentLiving,
    savedInvested,
    leftSpending,
    leftTotal,
    accountsTotal,
    assetsTotal,
    debtsTotal,
    netWorth,
    netWorthDelta: netWorth - prevNetWorth,
    netWorthDeltaPct: prevNetWorth ? ((netWorth - prevNetWorth) / prevNetWorth) * 100 : 0,
  };
}

// 50/30/20 check, by assigned amounts. Needs = Kitchen + Electricity &
// Water + Fuel + Housing + Internet & Phone + Health + School & Kids.
// Wants = Snacks + Entertainment + Clothing & Household.
// Savings = Emergency Fund + Investments.
export function rule503020(state) {
  const byId = Object.fromEntries(state.envelopes.map((e) => [e.id, e.assigned]));
  const needs = ['kitchen', 'electricity-water', 'fuel-transport', 'housing', 'internet-phone', 'health', 'school-kids']
    .reduce((a, id) => a + (byId[id] || 0), 0);
  const wants = ['snacks', 'entertainment', 'clothing-household']
    .reduce((a, id) => a + (byId[id] || 0), 0);
  const savings = ['emergency-fund', 'investments']
    .reduce((a, id) => a + (byId[id] || 0), 0);
  const total = needs + wants + savings;
  return {
    needs, wants, savings, total,
    needsPct: total ? (needs / total) * 100 : 0,
    wantsPct: total ? (wants / total) * 100 : 0,
    savingsPct: total ? (savings / total) * 100 : 0,
  };
}
