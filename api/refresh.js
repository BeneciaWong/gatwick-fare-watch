// Called by the GitHub Action. No ?collect = start one run per destination. ?collect=1 = save finished runs.
const { R, TF, H, TRIPS } = require('./_lib');
const num = v => (v == null || v === '' ? null : Number(v));
module.exports = async (req, res) => {
  if (req.headers['x-refresh-secret'] !== process.env.REFRESH_SECRET) return res.status(401).end();
  if (req.query.collect) {
    const pending = JSON.parse((await R('GET', 'pending')) || '[]'), left = [];
    for (const p of pending) {
      const r = await (await fetch(`${TF}/runs/${p.run}`, { headers: H })).json();
      if (['PENDING', 'RUNNING'].includes(r.status)) { left.push(p); continue; }
      let d = r.status === 'COMPLETED' ? r.result : null;
      if (typeof d === 'string') { try { d = JSON.parse(d.match(/\{[\s\S]*\}/)[0]); } catch { d = null; } }
      if (Array.isArray(d)) d = d[0];
      if (d && Array.isArray(d.results)) d = d.results[0];
      const price = d && num(d.price_gbp);
      if (price) {  // no price = keep the last good value
        const old = JSON.parse((await R('GET', 'res:' + p.id)) || 'null');
        await R('SET', 'res:' + p.id, JSON.stringify({ checked: new Date().toISOString(), price_gbp: price,
          cheapest_any_gbp: num(d.cheapest_any_gbp), airline: d.airline || '', prev: old ? old.price_gbp : null }));
      }
    }
    await R('SET', 'pending', JSON.stringify(left));
    return res.json({ waiting: left.length });
  }
  const started = (await Promise.all(TRIPS.map(async t => {
    const r = await (await fetch(`${TF}/automation/run-async`, { method: 'POST', headers: H, body: JSON.stringify({ url: t.url, goal: t.goal }) })).json();
    return r.run_id ? { id: t.id, run: r.run_id } : null;
  }))).filter(Boolean);
  await R('SET', 'pending', JSON.stringify(started));
  res.json({ started: started.length });
};
