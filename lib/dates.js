// lib/dates.js — utilitaires de dates (format 'YYYY-MM-DD')

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  const ms = new Date(`${b}T12:00:00Z`) - new Date(`${a}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}

// ⚠️ "range" ici = construit une PÉRIODE à partir d'un mot-clé.
// Utilisé dans app/api/dashboard/route.js et app/api/data/[kind]/route.js.
export function range(period) {
  const t = today();

  switch (period) {
    case 'yesterday': {
      const y = addDays(t, -1);
      return { today: t, from: y, to: y, prevFrom: addDays(y, -1), prevTo: addDays(y, -1) };
    }
    case '7d': {
      return { today: t, from: addDays(t, -6), to: t, prevFrom: addDays(t, -13), prevTo: addDays(t, -7) };
    }
    case '30d': {
      return { today: t, from: addDays(t, -29), to: t, prevFrom: addDays(t, -59), prevTo: addDays(t, -30) };
    }
    case 'month': {
      const from = t.slice(0, 8) + '01';
      const prevTo = addDays(from, -1);
      const prevFrom = prevTo.slice(0, 8) + '01';
      return { today: t, from, to: t, prevFrom, prevTo };
    }
    case 'today':
    default: {
      return { today: t, from: t, to: t, prevFrom: addDays(t, -1), prevTo: addDays(t, -1) };
    }
  }
}

// Période libre [from, to] + période précédente de même durée.
export function customRange(from, to) {
  const ok = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d)) && !isNaN(new Date(`${d}T12:00:00Z`));
  if (!ok(from) || !ok(to) || from > to || daysBetween(from, to) > 731) return null;
  const len = daysBetween(from, to) + 1;
  const prevTo = addDays(from, -1);
  return { today: today(), from, to, prevFrom: addDays(prevTo, -(len - 1)), prevTo, len };
}

// (optionnel) liste inclusive de jours entre deux dates — si un jour tu en as besoin
export function eachDay(start, end) {
  const out = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}
