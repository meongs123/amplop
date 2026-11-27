// charts.js — hand-built SVG charts, no library, no network.
// Donut (spending by envelope), horizontal bars, and a 6-month line chart.

const PALETTE = ['#FFD60A', '#7DD3FC', '#4ADE80', '#FBBF24', '#F87171', '#A78BFA', '#F472B6', '#34D399', '#FDBA74', '#93C5FD'];

export function donut(segments, centerTop, centerBottom, size = 220) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 80;
  const cx = size / 2;
  const cy = size / 2;
  let angle = -Math.PI / 2;
  const parts = segments.map((s, i) => {
    const frac = s.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const color = PALETTE[i % PALETTE.length];
    if (frac >= 0.999) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="26"/>`;
    return `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${color}" stroke-width="26"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by envelope chart">${parts}<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-center-top">${centerTop}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-center-bottom">${centerBottom}</text></svg>`;
}

export function donutLegend(segments, totalOverride) {
  const total = totalOverride || segments.reduce((a, s) => a + s.value, 0) || 1;
  return segments.map((s, i) => {
    const pct = ((s.value / total) * 100).toFixed(1);
    return `<li><span class="swatch" style="background:${PALETTE[i % PALETTE.length]}"></span><span class="leg-name">${s.label}</span><span class="leg-val">${s.text}</span><span class="leg-pct">${pct}%</span></li>`;
  }).join('');
}

// Horizontal bars: [{label, value, text, color?}] scaled to the max value.
export function hbars(rows, maxValue) {
  const max = maxValue || Math.max(...rows.map((r) => r.value), 1);
  return rows.map((r) => {
    const pct = Math.max(0, Math.min(100, (r.value / max) * 100));
    const color = r.color || '#7DD3FC';
    return `<div class="hbar-row"><div class="hbar-label">${r.label}</div><div class="hbar-track"><div class="hbar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div><div class="hbar-val">${r.text}</div></div>`;
  }).join('');
}

// Line chart for the 6-month net-worth trend.
export function lineChart(points, width = 640, height = 260) {
  const padL = 8;
  const padR = 8;
  const padT = 18;
  const padB = 28;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = (max - min) || 1;
  const lo = min - span * 0.25;
  const hi = max + span * 0.25;
  const x = (i) => padL + (i * (width - padL - padR)) / (points.length - 1);
  const y = (v) => padT + ((hi - v) / (hi - lo)) * (height - padT - padB);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(points.length - 1).toFixed(1)} ${height - padB} L ${x(0).toFixed(1)} ${height - padB} Z`;
  const dots = points.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4.5" fill="#FFD60A" stroke="#1B1E22" stroke-width="1.5"/><text x="${x(i).toFixed(1)}" y="${height - 8}" text-anchor="middle" class="chart-label">${p.month}</text>`).join('');
  const first = points[0];
  const last = points[points.length - 1];
  return `<svg viewBox="0 0 ${width} ${height}" class="line-chart" role="img" aria-label="Net worth trend, June to November 2026"><path d="${area}" fill="#FFD60A" opacity="0.08"/><path d="${line}" fill="none" stroke="#FFD60A" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}<text x="${padL}" y="${(y(first.value) - 10).toFixed(1)}" text-anchor="start" class="chart-value">${first.short}</text><text x="${(width - padR).toFixed(1)}" y="${(y(last.value) - 10).toFixed(1)}" text-anchor="end" class="chart-value">${last.short}</text></svg>`;
}
