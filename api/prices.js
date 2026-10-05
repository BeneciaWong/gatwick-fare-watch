const { R, TRIPS } = require('./_lib');
module.exports = async (req, res) => {
  const g = {};
  for (const t of TRIPS) {
    const v = JSON.parse((await R('GET', 'res:' + t.id)) || 'null');
    (g[t.group] = g[t.group] || { id: t.group, label: t.label, rows: [] }).rows.push({ dest: t.dest, ...(v || {}) });
  }
  const out = Object.values(g).map(t => ({ ...t, checked: t.rows.map(r => r.checked).filter(Boolean).sort()[0] || null }));
  res.setHeader('Cache-Control', 's-maxage=300');
  res.json(out);
};
