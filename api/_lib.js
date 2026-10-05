// Shared helpers. One TinyFish run per destination (parallel). Add destinations to DEST.
const R = async (...c) => (await (await fetch(process.env.UPSTASH_REDIS_REST_URL, {
  method: 'POST', headers: { Authorization: 'Bearer ' + process.env.UPSTASH_REDIS_REST_TOKEN }, body: JSON.stringify(c) })).json()).result;
const TF = 'https://agent.tinyfish.ai/v1';
const H = { 'X-API-Key': process.env.TINYFISH_API_KEY, 'Content-Type': 'application/json' };
const DEST = [['Tenerife', 'TFS'], ['Malta', 'MLA'], ['Larnaca', 'LCA'], ['Antalya', 'AYT'], ['Faro', 'FAO'], ['Vienna', 'VIE']];
const TRIPS = DEST.map(([n, c]) => ({
  id: 'xmas-' + c, group: 'xmas', label: 'Christmas', dest: `${n} (${c})`, url: 'https://www.kayak.co.uk/flights',
  goal: `Search for return flights from London Gatwick (LGW) to ${n} (${c}), departing 18 December 2026 and returning 11 January 2027, 1 adult, economy. Do not search other destinations. Reply with only a JSON object: {"price_gbp": number, "airline": string, "cheapest_any_gbp": number}. price_gbp is the cheapest total return price on a single ticket. cheapest_any_gbp is the cheapest overall, including self-transfer combinations of separate tickets. Use only prices shown on the page. If you cannot find a price, reply {"price_gbp": null}.`
}));
module.exports = { R, TF, H, TRIPS };
