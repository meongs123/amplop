// Reconciliation script — asserts every locked figure in the plan (§0.3)
// against data.js + totals.js. Must exit 0. Run: node scripts/reconcile.mjs
import { SAMPLE } from '../app/data.js';
import { computeTotals, envelopeSpent, envelopeRemaining, rule503020, sum } from '../app/totals.js';

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${actual} (expected ${expected})`);
}

// Locked per-envelope spent (plan §0.3).
const SPENT = {
  kitchen: 2845000, 'electricity-water': 812400, 'fuel-transport': 1086500,
  snacks: 750000, entertainment: 420000, housing: 3500000,
  'internet-phone': 512000, health: 185000, 'school-kids': 1425000,
  'clothing-household': 388000, 'emergency-fund': 0, investments: 2850000,
};
const TX_COUNT = {
  kitchen: 12, 'electricity-water': 3, 'fuel-transport': 8, snacks: 9,
  entertainment: 4, housing: 1, 'internet-phone': 3, health: 2,
  'school-kids': 3, 'clothing-household': 3,
};

for (const env of SAMPLE.envelopes) {
  check(`spent ${env.id}`, envelopeSpent(SAMPLE, env), SPENT[env.id]);
  if (env.kind === 'spending') {
    const n = SAMPLE.transactions.filter((t) => t.type === 'expense' && t.envelope === env.id).length;
    check(`tx count ${env.id}`, n, TX_COUNT[env.id]);
  }
}

const t = computeTotals(SAMPLE);
check('income total', t.income, 18500000);
check('assigned total (Σ envelopes)', t.assigned, 18500000);
check('unassigned', t.unassigned, 0);
check('spent on living (Σ 48 expense txs)', t.spentLiving, 11923900);
check('saved & invested', t.savedInvested, 4850000);
check('left in spending envelopes', t.leftSpending, 1726100);
check('left total (incl. emergency)', t.leftTotal, 3726100);
check('living + saved + left-spending = income', t.spentLiving + t.savedInvested + t.leftSpending, 18500000);
check('accounts total', t.accountsTotal, 20515500);
check('assets total', t.assetsTotal, 562665500);
check('debts total', t.debtsTotal, 299350000);
check('net worth (assets − debts)', t.netWorth, 263315500);
check('net worth delta Nov vs Oct', t.netWorthDelta, 2895500);
check('snacks remaining (EMPTY)', envelopeRemaining(SAMPLE, SAMPLE.envelopes.find((e) => e.id === 'snacks')), 0);
check('entertainment remaining', envelopeRemaining(SAMPLE, SAMPLE.envelopes.find((e) => e.id === 'entertainment')), 180000);

const r = rule503020(SAMPLE);
check('50/30/20 needs', r.needs, 11650000);
check('50/30/20 wants', r.wants, 2000000);
check('50/30/20 savings', r.savings, 4850000);
check('50/30/20 total', r.total, 18500000);

check('ledger rows', SAMPLE.transactions.length, 51);
check('expense rows', SAMPLE.transactions.filter((x) => x.type === 'expense').length, 48);
check('income rows', SAMPLE.transactions.filter((x) => x.type === 'income').length, 3);
check('accounts', SAMPLE.accounts.length, 6);
check('bills', SAMPLE.bills.length, 8);
check('bills paid', SAMPLE.bills.filter((b) => b.status === 'paid').length, 7);
check('bills upcoming', SAMPLE.bills.filter((b) => b.status === 'upcoming').length, 1);
check('goals', SAMPLE.goals.length, 3);
check('trend months', SAMPLE.trend.length, 6);
check('trend Nov', SAMPLE.trend[5].value, 263315500);
check('gold asset', SAMPLE.assets.find((a) => a.name.startsWith('Gold')).amount, 53750000);
check('sum assets rows', sum(SAMPLE.assets, 'amount'), 562665500);
check('sum liabilities rows', sum(SAMPLE.liabilities, 'amount'), 299350000);

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll reconciliation checks passed.');
