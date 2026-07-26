/* Long-run health check: let the world run itself for 150 years and watch the
   shape of it. scen.js catches crashes; this catches a world that rots. */
const { chromium } = require('playwright-core');

const YEARS = 120, RUNS = 2, SAMPLE = 20;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const all = [];
  for (let run = 0; run < RUNS; run++) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file:///home/user/Test-2/index.html');
    await page.click('.realmCard:nth-child(1)');

    const samples = await page.evaluate(async ({ YEARS, SAMPLE }) => {
      const out = [];
      // answer every event with its first choice, so the world runs itself
      const drain = () => { for (let i = 0; i < 60; i++) {
        const btn = document.querySelector('.modal .choices button');
        if (!btn) break; btn.click();
      } };
      const snap = () => {
        const live = Object.keys(G.realms).filter(r => !rl(r).dead);
        const sizes = live.map(r => realmProvs(r).length).sort((a, b) => b - a);
        const golds = live.map(r => rl(r).gold);
        const vassals = live.filter(r => isVassal(r)).length;
        return {
          year: G.year,
          realms: live.length,
          biggest: sizes[0] || 0,
          top3: (sizes[0] || 0) + (sizes[1] || 0) + (sizes[2] || 0),
          unowned: Object.keys(G.provinces).filter(p => !pv(p).r && !PROVDATA[p].waste).length,
          wars: G.wars.length,
          vassals,
          emperor: G.empire ? G.empire.holder : null,
          medGold: Math.round(golds.sort((a, b) => a - b)[Math.floor(golds.length / 2)]),
          medLeg: Math.round(live.map(r => rl(r).leg).sort((a, b) => a - b)[Math.floor(live.length / 2)]),
          armies: G.armies.length,
          chars: Object.values(G.chars).filter(c => !c.dead).length,
          playerAlive: !rl(G.player).dead,
          playerProvs: realmProvs(G.player).length,
        };
      };
      drain();
      const start = G.year;
      out.push(snap());
      while (G.year < start + YEARS) {
        const before = G.year;
        G.eventQueue = [];
        Game.endSeason();
        drain();
        if (G.over) break;
        if (G.year !== before && G.year % SAMPLE === 0) out.push(snap());
        await new Promise(r => setTimeout(r, 0));
      }
      out.push(Object.assign(snap(), { final: true, over: G.over || false }));
      return out;
    }, { YEARS, SAMPLE });

    all.push({ run, samples, errors: errors.length, errSample: errors.slice(0, 3) });
    console.log(`--- run ${run} --- errors: ${errors.length} ${errors.slice(0,2).join(' ;; ')}`);
    const hdr = 'year realms biggest top3 unowned wars vass emperor medGold medLeg armies chars pProv';
    console.log(hdr);
    for (const s of samples) console.log(
      [s.year, s.realms, s.biggest, s.top3, s.unowned, s.wars, s.vassals,
       (s.emperor || '—').slice(0, 9), s.medGold, s.medLeg, s.armies, s.chars, s.playerProvs]
      .map(x => String(x).padStart(6)).join(''));
    await page.close();
  }
  await browser.close();

  // verdict
  console.log('\n===== VERDICT =====');
  for (const r of all) {
    const f = r.samples[r.samples.length - 1], s0 = r.samples[0];
    console.log(`run ${r.run}: realms ${s0.realms}→${f.realms}, biggest ${s0.biggest}→${f.biggest}, ` +
      `top3 share ${(f.top3 / (293 - f.unowned) * 100).toFixed(0)}%, wars ${f.wars}, ` +
      `medGold ${s0.medGold}→${f.medGold}, medLeg ${s0.medLeg}→${f.medLeg}, chars ${s0.chars}→${f.chars}, errors ${r.errors}`);
  }
})();
