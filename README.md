# Amplop — Zero-Based Digital Envelope & Wealth Tracking

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/meongs123/amplop/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/meongs123/amplop/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

**Every Rupiah Has a Job.**

A household budget site for The Wijaya Household, Jakarta, November 2026.
Zero-based envelope budgeting: all Rp18,500,000 of November income is assigned
to 12 envelopes — spending, saving or investing — until nothing is left
unassigned (Rp0). Plus multi-account tracking (banks, GoPay, OVO, DANA, cash),
net worth with a six-month trend, a 51-row transaction record, bills, goals
and a 50/30/20 report.

## Routes

- `#/` — Dashboard: headline figures, zero-based bar, spending donut, envelope strip, accounts summary, net-worth teaser, latest transactions
- `#/envelopes` — 12 envelope cards, working Move Funds (with transfer log), envelope detail pages
- `#/accounts` — 6 accounts, add an account, goals
- `#/net-worth` — net worth Rp263,315,500, six-month SVG trend, add assets and debts
- `#/transactions` — 51-row list with filter, search and sort; add a transaction; 50/30/20 report; November vs October; bills

Everything is stored in `localStorage` and survives reload; every change
recomputes all totals from one source of truth (`app/totals.js`). Reset to
the sample household from the footer.

## Run it

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

Static files only — no network requests, no CDN, no webfonts. Charts are
hand-built SVG.

## Hand in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # copies app/ + screenshots/, writes out/dossier.json
```

Entry for the make.fun bounty
`best-household-budget-site-20261126-1457` ("Make the best household budget
site").
