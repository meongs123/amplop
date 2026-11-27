// The locked sample dataset for Amplop: The Wijaya Household, Jakarta,
// November 2026 (day 27 of 30). Every figure here is fixed by the plan
// (section 0.3) and every total on the site is derived from this file by
// totals.js — nothing is hard-coded in a view.
//
// Envelope kinds: 'spending' (spent = sum of its transactions),
// 'saving' (Emergency Fund: set aside, spent 0), 'invest' (Investments:
// the assigned amount is invested, spent = assigned).

export const SAMPLE = {
  household: {
    name: 'The Wijaya Household',
    city: 'Jakarta',
    month: 'November 2026',
    day: 27,
    daysInMonth: 30,
  },

  envelopes: [
    { id: 'kitchen', name: 'Kitchen', assigned: 3400000, kind: 'spending', note: 'Groceries, markets, pantry' },
    { id: 'electricity-water', name: 'Electricity & Water', assigned: 850000, kind: 'spending', note: 'PLN token & PAM Jaya water' },
    { id: 'fuel-transport', name: 'Fuel & Transport', assigned: 1250000, kind: 'spending', note: 'Petrol, rides & motorbike' },
    { id: 'snacks', name: 'Snacks', assigned: 600000, kind: 'spending', note: 'Coffee, bubble tea & treats' },
    { id: 'entertainment', name: 'Entertainment', assigned: 750000, kind: 'spending', note: 'Cinema, streaming & games' },
    { id: 'housing', name: 'Housing (Rent)', assigned: 3500000, kind: 'spending', note: 'Monthly rent, paid 1 Nov' },
    { id: 'internet-phone', name: 'Internet & Phone', assigned: 550000, kind: 'spending', note: 'Home internet & mobile data' },
    { id: 'health', name: 'Health', assigned: 500000, kind: 'spending', note: 'BPJS & pharmacy' },
    { id: 'school-kids', name: 'School & Kids', assigned: 1600000, kind: 'spending', note: 'School fees & supplies' },
    { id: 'clothing-household', name: 'Clothing & Household', assigned: 650000, kind: 'spending', note: 'Clothes & home linen' },
    { id: 'emergency-fund', name: 'Emergency Fund', assigned: 2000000, kind: 'saving', note: 'Set aside, not spent' },
    { id: 'investments', name: 'Investments', assigned: 2850000, kind: 'invest', note: 'Invested this month' },
  ],

  // 3 income rows + 48 spending rows = 51 rows. The spending rows
  // per envelope sum exactly to that envelope's Spent column in the plan.
  transactions: [
    // --- Income ---
    { id: 'inc-1', date: '2026-11-01', merchant: 'Salary — Andi Wijaya', envelope: null, amount: 14000000, type: 'income', method: 'BCA Main' },
    { id: 'inc-2', date: '2026-11-05', merchant: 'Salary — Sari Wijaya', envelope: null, amount: 3500000, type: 'income', method: 'BCA Main' },
    { id: 'inc-3', date: '2026-11-15', merchant: 'Freelance — design project', envelope: null, amount: 1000000, type: 'income', method: 'BCA Main' },
    // --- Kitchen (12 rows, 2,845,000) ---
    { id: 'tx-001', date: '2026-11-01', merchant: 'Pasar Santa — weekly groceries', envelope: 'kitchen', amount: 425000, type: 'expense', method: 'Cash' },
    { id: 'tx-002', date: '2026-11-03', merchant: 'Indomaret — groceries', envelope: 'kitchen', amount: 185000, type: 'expense', method: 'GoPay' },
    { id: 'tx-003', date: '2026-11-05', merchant: 'Pasar Mayestik — vegetables & fish', envelope: 'kitchen', amount: 310000, type: 'expense', method: 'Cash' },
    { id: 'tx-004', date: '2026-11-07', merchant: 'Warung Bu Tini — rice & eggs', envelope: 'kitchen', amount: 142500, type: 'expense', method: 'Cash' },
    { id: 'tx-005', date: '2026-11-09', merchant: 'Super Indo — weekly groceries', envelope: 'kitchen', amount: 268000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-006', date: '2026-11-11', merchant: 'Indomaret — milk & bread', envelope: 'kitchen', amount: 195000, type: 'expense', method: 'OVO' },
    { id: 'tx-007', date: '2026-11-14', merchant: 'Pasar Santa — weekly groceries', envelope: 'kitchen', amount: 342000, type: 'expense', method: 'Cash' },
    { id: 'tx-008', date: '2026-11-17', merchant: 'Alfamart — pantry top-up', envelope: 'kitchen', amount: 128500, type: 'expense', method: 'DANA' },
    { id: 'tx-009', date: '2026-11-19', merchant: 'Super Indo — weekly groceries', envelope: 'kitchen', amount: 276000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-010', date: '2026-11-22', merchant: 'Warung Bu Tini — rice & cooking oil', envelope: 'kitchen', amount: 164000, type: 'expense', method: 'Cash' },
    { id: 'tx-011', date: '2026-11-24', merchant: 'Pasar Mayestik — chicken & vegetables', envelope: 'kitchen', amount: 231000, type: 'expense', method: 'Cash' },
    { id: 'tx-012', date: '2026-11-26', merchant: 'Indomaret — milk & fruit', envelope: 'kitchen', amount: 178000, type: 'expense', method: 'GoPay' },
    // --- Electricity & Water (3 rows, 812,400) ---
    { id: 'tx-013', date: '2026-11-05', merchant: 'PLN — token electricity', envelope: 'electricity-water', amount: 312400, type: 'expense', method: 'BCA Main' },
    { id: 'tx-014', date: '2026-11-20', merchant: 'PLN — token electricity', envelope: 'electricity-water', amount: 300000, type: 'expense', method: 'GoPay' },
    { id: 'tx-015', date: '2026-11-20', merchant: 'PAM Jaya — water bill', envelope: 'electricity-water', amount: 200000, type: 'expense', method: 'BCA Main' },
    // --- Fuel & Transport (8 rows, 1,086,500) ---
    { id: 'tx-016', date: '2026-11-02', merchant: 'Pertamina — petrol', envelope: 'fuel-transport', amount: 150000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-017', date: '2026-11-04', merchant: 'Gojek — ride to office', envelope: 'fuel-transport', amount: 42500, type: 'expense', method: 'GoPay' },
    { id: 'tx-018', date: '2026-11-07', merchant: 'Pertamina — petrol', envelope: 'fuel-transport', amount: 150000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-019', date: '2026-11-10', merchant: 'Grab — airport ride', envelope: 'fuel-transport', amount: 68000, type: 'expense', method: 'OVO' },
    { id: 'tx-020', date: '2026-11-13', merchant: 'Pertamina — petrol', envelope: 'fuel-transport', amount: 150000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-021', date: '2026-11-18', merchant: 'Gojek — rides this week', envelope: 'fuel-transport', amount: 96000, type: 'expense', method: 'GoPay' },
    { id: 'tx-022', date: '2026-11-21', merchant: 'Pertamina — petrol', envelope: 'fuel-transport', amount: 150000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-023', date: '2026-11-25', merchant: 'Bengkel Motor Jaya — motorbike service & fuel', envelope: 'fuel-transport', amount: 280000, type: 'expense', method: 'Cash' },
    // --- Snacks (9 rows, 750,000) ---
    { id: 'tx-024', date: '2026-11-02', merchant: 'Kopi Kenangan — coffee', envelope: 'snacks', amount: 85000, type: 'expense', method: 'GoPay' },
    { id: 'tx-025', date: '2026-11-04', merchant: 'Janji Jiwa — coffee & pastry', envelope: 'snacks', amount: 62000, type: 'expense', method: 'OVO' },
    { id: 'tx-026', date: '2026-11-06', merchant: 'Indomaret — snacks', envelope: 'snacks', amount: 95000, type: 'expense', method: 'DANA' },
    { id: 'tx-027', date: '2026-11-09', merchant: 'Chatime — bubble tea', envelope: 'snacks', amount: 78000, type: 'expense', method: 'GoPay' },
    { id: 'tx-028', date: '2026-11-12', merchant: 'Kopi Kenangan — coffee for two', envelope: 'snacks', amount: 110000, type: 'expense', method: 'OVO' },
    { id: 'tx-029', date: '2026-11-15', merchant: "Roti'O — bakery", envelope: 'snacks', amount: 64000, type: 'expense', method: 'Cash' },
    { id: 'tx-030', date: '2026-11-18', merchant: 'Janji Jiwa — coffee', envelope: 'snacks', amount: 88000, type: 'expense', method: 'GoPay' },
    { id: 'tx-031', date: '2026-11-21', merchant: 'Indomaret — snacks & drinks', envelope: 'snacks', amount: 72000, type: 'expense', method: 'DANA' },
    { id: 'tx-032', date: '2026-11-24', merchant: 'Chatime — bubble tea', envelope: 'snacks', amount: 96000, type: 'expense', method: 'OVO' },
    // --- Entertainment (4 rows, 420,000) ---
    { id: 'tx-033', date: '2026-11-01', merchant: 'Spotify — music subscription', envelope: 'entertainment', amount: 54000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-034', date: '2026-11-08', merchant: 'CGV Cinemas — family movie night', envelope: 'entertainment', amount: 150000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-035', date: '2026-11-15', merchant: 'Netflix — streaming subscription', envelope: 'entertainment', amount: 186000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-036', date: '2026-11-22', merchant: 'Mobile Legends — game top-up', envelope: 'entertainment', amount: 30000, type: 'expense', method: 'DANA' },
    // --- Housing (1 row, 3,500,000) ---
    { id: 'tx-037', date: '2026-11-01', merchant: 'Pak Budi (landlord) — November rent', envelope: 'housing', amount: 3500000, type: 'expense', method: 'BCA Main' },
    // --- Internet & Phone (3 rows, 512,000) ---
    { id: 'tx-038', date: '2026-11-10', merchant: 'IndiHome — home internet', envelope: 'internet-phone', amount: 350000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-039', date: '2026-11-15', merchant: 'Telkomsel — mobile data', envelope: 'internet-phone', amount: 92000, type: 'expense', method: 'OVO' },
    { id: 'tx-040', date: '2026-11-15', merchant: 'XL — mobile top-up', envelope: 'internet-phone', amount: 70000, type: 'expense', method: 'DANA' },
    // --- Health (2 rows, 185,000) ---
    { id: 'tx-041', date: '2026-11-10', merchant: 'BPJS Kesehatan — health insurance', envelope: 'health', amount: 150000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-042', date: '2026-11-18', merchant: 'Apotek K-24 — pharmacy', envelope: 'health', amount: 35000, type: 'expense', method: 'Cash' },
    // --- School & Kids (3 rows, 1,425,000) ---
    { id: 'tx-043', date: '2026-11-03', merchant: 'SDN 01 Menteng — school fees', envelope: 'school-kids', amount: 1200000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-044', date: '2026-11-06', merchant: 'Gramedia — school supplies', envelope: 'school-kids', amount: 125000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-045', date: '2026-11-16', merchant: 'Gramedia — workbooks', envelope: 'school-kids', amount: 100000, type: 'expense', method: 'Cash' },
    // --- Clothing & Household (3 rows, 388,000) ---
    { id: 'tx-046', date: '2026-11-09', merchant: 'Uniqlo — kids’ clothes', envelope: 'clothing-household', amount: 145000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-047', date: '2026-11-15', merchant: 'Matahari — household linen', envelope: 'clothing-household', amount: 128000, type: 'expense', method: 'BCA Main' },
    { id: 'tx-048', date: '2026-11-23', merchant: 'Uniqlo — Andi’s shirt', envelope: 'clothing-household', amount: 115000, type: 'expense', method: 'OVO' },
  ],

  // Conscious moves between envelopes. The 20 Nov move is the rule in
  // action: Snacks ran out, so Rp150,000 moved in from Entertainment.
  transfers: [
    { date: '2026-11-20', from: 'entertainment', to: 'snacks', amount: 150000, note: 'Snacks ran out — topped up from Entertainment' },
  ],

  // 6 accounts, total Rp20,515,500.
  accounts: [
    { name: 'BCA Main', type: 'Bank account', balance: 6420000 },
    { name: 'BCA Savings', type: 'Bank account', balance: 12800000 },
    { name: 'GoPay', type: 'E-wallet', balance: 385000 },
    { name: 'OVO', type: 'E-wallet', balance: 262500 },
    { name: 'DANA', type: 'E-wallet', balance: 198000 },
    { name: 'Cash in wallet', type: 'Cash', balance: 450000 },
  ],

  // Net worth: assets Rp562,665,500 − debts Rp299,350,000 = Rp263,315,500.
  assets: [
    { name: 'Cash & bank', amount: 20515500, note: '6 accounts, see Accounts' },
    { name: 'Gold — 25 g', amount: 53750000, note: '25 g × Rp2,150,000' },
    { name: 'Mutual funds', amount: 38400000, note: 'Bibit portfolio' },
    { name: 'Apartment (estimated value)', amount: 450000000, note: 'Jakarta, estimated' },
  ],
  liabilities: [
    { name: 'Mortgage', amount: 285000000, note: 'Apartment loan' },
    { name: 'Motorbike loan', amount: 12500000, note: 'After the November payment' },
    { name: 'Credit card', amount: 1850000, note: 'BCA card, due 10 Dec' },
  ],

  // Net worth, last 6 months.
  trend: [
    { month: 'Jun', value: 248900000 },
    { month: 'Jul', value: 251750000 },
    { month: 'Aug', value: 254300000 },
    { month: 'Sep', value: 257150000 },
    { month: 'Oct', value: 260420000 },
    { month: 'Nov', value: 263315500 },
  ],

  // 8 bills: 7 paid + 1 upcoming (December rent, due 1 Dec).
  bills: [
    { name: 'Rent — November', amount: 3500000, due: '2026-11-01', status: 'paid', envelope: 'housing' },
    { name: 'Electricity & Water', amount: 812400, due: '2026-11-20', status: 'paid', envelope: 'electricity-water' },
    { name: 'Internet', amount: 350000, due: '2026-11-10', status: 'paid', envelope: 'internet-phone' },
    { name: 'Mobile', amount: 162000, due: '2026-11-15', status: 'paid', envelope: 'internet-phone' },
    { name: 'School fees', amount: 1200000, due: '2026-11-03', status: 'paid', envelope: 'school-kids' },
    { name: 'Motorbike installment', amount: 875000, due: '2026-11-05', status: 'paid', envelope: 'fuel-transport' },
    { name: 'BPJS Health', amount: 150000, due: '2026-11-10', status: 'paid', envelope: 'health' },
    { name: 'Rent — December', amount: 3500000, due: '2026-12-01', status: 'upcoming', envelope: 'housing' },
  ],

  // Goals are earmarks inside the account balances — never added to net
  // worth a second time.
  goals: [
    { name: 'Emergency fund', current: 12800000, target: 24000000, unit: 'Rp', note: 'Held in BCA Savings' },
    { name: 'Gold', current: 25, target: 50, unit: 'g', note: '25 g of 50 g' },
    { name: 'Holiday fund', current: 2150000, target: 8000000, unit: 'Rp', note: 'Bali trip, June 2027' },
  ],

  // October, for the month compare on the Reports page.
  october: { income: 18500000, spent: 12041200, saved: 4650000, left: 1808800, netWorth: 260420000 },
};
