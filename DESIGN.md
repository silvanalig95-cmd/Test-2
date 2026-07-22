# Crown & Realm — Design Document (Draft 1)

A single-player, character-driven historical strategy game set in the Europe of
**1066**, playable entirely in the browser. You rule a dynasty, not a nation:
the realm is whatever your family currently holds, and the game ends when your
bloodline dies out — or when it wears an imperial crown.

**Status:** brainstorm draft — no code yet. This document is the thing to argue with.

---

## 1. Vision

- **Core fantasy:** you are a medieval dynasty. Marriages, heirs, plots, and
  wars across generations. Losing a battle stings; losing your only son changes
  everything.
- **Tone:** *Crusader Kings* character drama in a package the size of a good
  board game. A full run takes **60–90 minutes**.
- **Platform:** one self-contained HTML/JS/SVG file. No server, no build step,
  no assets to download. Saves in `localStorage`.

### Design pillars

1. **Characters are the content.** Every decision routes through a person with
   a name, traits, and grudges.
2. **Scarce actions create strategy.** 2–3 actions per turn, never enough for
   everything.
3. **Readable systems.** Every battle, plot, and succession shows its math.
   No hidden dice behind an outcome you care about.
4. **The world moves without you.** AI realms marry, scheme, and fight each
   other; the player is a participant, not the sun.

---

## 2. Scenario: 1066 — The Norman Gambit

Edward the Confessor is dying childless. Three men believe the English throne
is theirs. The map covers **England, Wales, Scotland, Ireland (partial),
Normandy & northern France, Flanders, Denmark, and southern Norway** —
roughly **30 provinces**.

### Playable realms at start (v1: pick one of three)

| Realm | Ruler | Situation |
|---|---|---|
| **England** | Harold Godwinson | Rich realm, shaky legitimacy, enemies on two coasts, an exiled brother (Tostig) plotting with the Norse |
| **Normandy** | William the Bastard | Strong army, papal favor, must cross the sea and hold what he takes |
| **Norway** | Harald Hardrada | Feared warrior-king, aging, the boldest claim and the longest odds |

Non-playable AI realms: France (Philip I), Scotland (Malcolm III), Denmark
(Sweyn II), Flanders (Baldwin V), Wales, Brittany, and the semi-independent
English earldoms (Mercia, Northumbria) that can defect.

Historical figures seed the start; from turn one, history diverges. Maybe
Harold wins at Hastings. Maybe William drowns in the Channel. The end-of-game
chronicle records *your* history.

---

## 3. Time & the seasonal loop

Turn-based, **1 turn = 1 season** (4 per year). Characters age each winter.

| Season | Theme |
|---|---|
| **Spring** | Levies muster; wars are declared; campaigns launch |
| **Summer** | Battles and sieges at full strength |
| **Autumn** | Harvest income; attrition begins; last chance to march home |
| **Winter** | Court season: marriages, plots, education, feasts. Brutal attrition for armies still in the field |

Most narrative events fire in winter (court drama); most military events in
summer.

**Pacing guard:** peacetime seasons with nothing pending auto-collapse — a
"skip to next event / next spring" fast-forward — so 100 game-years stay
playable in one sitting. Wartime is turn-by-turn and tense.

### Turn structure

1. **Income phase** — gold, food, levy availability from provinces
2. **Action phase** — spend 2–3 **Action Points** (see §5)
3. **Event phase** — respond to narrative events with choices
4. **Resolution** — AI realms act; battles/sieges resolve; births, deaths,
   aging, plot progress

---

## 4. Characters (the heart of the game)

Every ruler, consort, child, sibling, claimant, and councillor is a full
character:

- **Age & health** — characters age, sicken, and die; childbirth is dangerous;
  old kings fade.
- **Traits (2–3 each, ~20 in pool)** — e.g. *Brave, Craven, Cruel, Kind,
  Pious, Cynical, Lustful, Chaste, Genius, Dull, Sickly, Robust, Ambitious,
  Content, Honest, Deceitful, Wrathful, Patient, Greedy, Generous.*
  Traits are partly heritable and shaped by childhood education.
- **Skills (0–10)** — Diplomacy, Martial, Intrigue, Stewardship. Drive
  everything from battle odds to plot discovery.
- **Opinions** — every character holds an opinion (−100..+100) of every
  relevant other, moved by traits, actions, slights, and gifts. Opinion is the
  master currency of politics: it decides who joins plots, who honors
  alliances, who accepts your heir.

### The royal family

- **Marriage** is the strongest diplomatic tool: it creates an alliance, and
  places your blood in a foreign line (→ future claims).
- **Children** are born, educated (pick a guardian → shapes traits/skills),
  and eventually married off or installed as heirs.
- **Succession (v1: primogeniture only)** — when the ruler dies, the eldest
  son inherits. Every succession is a stress test: passed-over siblings with
  high ambition and low opinion may press their claim; a child heir means a
  **regency** (your regent's traits temporarily rule your options).
- **Dynasty over rulers:** you play the family. When your king dies, you
  continue as the heir — with *their* skills and *their* enemies.

### The council (political appointments, not stat sticks)

Four seats — **Marshal, Steward, Spymaster, Chaplain** — each giving passive
bonuses scaled by the holder's skill. The tension: competent commoners give
better bonuses; powerful nobles *demand* seats and grow disloyal when refused.
Your ambitious brother expects to be Marshal. He is bad at it. Choose.

---

## 5. Actions (2–3 Action Points per season)

A single menu of actions, all competing for the same points:

**Dynasty & diplomacy** — arrange marriage/betrothal · send envoy (improve
relations) · send gift · arrange alliance · demand fealty (earldoms)
**Intrigue** — start a plot (§6) · task Spymaster to sniff out plots ·
imprison/banish/execute a courtier
**War** — declare war (needs casus belli) · raise/dismiss levies · move army ·
hire mercenaries · appoint commander
**Realm** — construct building · develop province · convene court (loyalty
event) · host feast/tournament (opinion + prestige)

Action scarcity is the strategy: the season you spend courting Flanders is a
season you are not fortifying York.

---

## 6. Intrigue (in v1 — this is a character game)

Plots have a **plotter, target, goal, and backers**. Backers join based on
opinion of target, own ambition, and plotter's Intrigue skill. Each turn a
plot advances; power vs. the target's Spymaster sets discovery risk.

**v1 plot types:**

1. **Murder** — remove a rival claimant, an inconvenient spouse, a foreign
   heir. Discovery = major opinion/legitimacy hit, possible war.
2. **Depose** — nobles back a claimant against a ruler (the AI's favorite
   against *you* when legitimacy is low).
3. **Defection** — lure a border earldom/vassal province to switch realms.
4. **Slander** — wreck a target's legitimacy/betrothal (cheap, deniable).

**Crucially, the AI plots too.** Your Spymaster periodically uncovers plots
against you; each discovery is an event with choices (arrest, confront,
turn the plotter, pretend ignorance and set a trap).

---

## 7. War

- **Casus belli required** — a claim (from blood or fabrication-v2), a
  defection dispute, or defense of an ally. Warring without one costs
  legitimacy and piety.
- **Armies** = **levies** (cheap, seasonal, drawn from provinces, want to go
  home in autumn) + **retinue** (small, permanent, expensive) +
  **mercenaries** (gold-hungry, instant).
- **Battle resolution** — one transparent report:
  `army size × commander Martial × terrain × morale × 2d6` per side, with
  every modifier listed. Losers retreat with casualties; leaders can be
  captured or killed (dynastic consequences!).
- **Sieges** take seasons, scaled by the province's castle level.
- **Attrition** — autumn hurts, winter maims. Supply is abstracted into
  seasonal attrition %; the strategic question every autumn is *press or go
  home*.
- **Naval movement** (needed for 1066): sea-adjacent provinces can be invaded
  at gold cost with a storm-risk roll. No fleet micromanagement.
- **Peace** — wars end by demand (enforce claim, gold, province) when war
  score (battles + sieges + occupation) allows, or white peace / surrender.

---

## 8. Territory & economy

- **~30 provinces**, each with: terrain (plains/hills/forest/marsh — combat
  modifiers), development level (1–5), one building slot (v1 buildings:
  **castle** = defense + levy, **market** = gold, **cathedral** = piety +
  legitimacy), and a local levy pool.
- **Three currencies:**
  - **Gold** — buildings, mercenaries, bribes, gifts
  - **Prestige** — earned by victories, marriages, feasts; spent on claims,
    prestigious betrothals, imperial coronation
  - **Legitimacy** (fused piety/authority, one number in v1) — keeps nobles
    and clergy in line; low legitimacy invites depose plots and revolts
- **Food is implicit** in v1: harvest modifies autumn income and winter
  attrition rather than being a tracked stock.

---

## 9. AI realms

Each AI realm's behavior derives from **its current ruler's actual traits** —
no separate personality system. Ambitious+Brave William acts like William.
When a cautious heir inherits, the realm's behavior visibly changes: the AI
is readable *through the characters*, reinforcing the pillar.

AI rulers pursue simple weighted goals: press claims, seek marriages, build
when rich, plot when weak, honor alliances by opinion. AI-vs-AI wars and
marriages happen in the resolution phase and appear in a **season log**.

---

## 10. Events (~30 in v1)

Choice-driven narrative pop-ups, weighted by season, traits, and situation.
Categories: succession crises, plots discovered, papal demands, harvest/plague,
border raids, character drama (affairs, feuds, prodigal sons), and a few
1066-specific scripted openers (the death of Edward the Confessor kicks off
the scenario; Tostig's exile burns; the comet is seen).

Events are the flavor delivery system — each one shows its mechanical stakes
and remembers your choice in the chronicle.

---

## 11. Victory, defeat & the chronicle

- **Defeat:** dynasty extinct (no living dynast) or zero provinces.
- **Victory:** any of —
  - **Imperial:** hold 15+ provinces and crown yourself (prestige +
    legitimacy cost) — *"Emperor of the North Sea"*
  - **Endurance:** your dynasty survives to 1166 (100 years)
  - **Prestige score** threshold
- **The chronicle:** every game ends with a generated illuminated-manuscript
  history of the dynasty — rulers, reigns, epithets earned from traits and
  deeds, wars, murders (including the ones never proven). This is the
  screenshot-and-share artifact and the "one more run" hook.

---

## 12. Presentation

- **Map:** stylized **parchment SVG** — hand-drawn-feel province borders,
  heraldic realm colors, aged-paper texture (all procedural, no image files).
  Armies as heraldic counters; sieges as little flame icons.
- **UI:** map center-stage; left panel = your dynasty tree & council; right
  panel = selected province/character; bottom = season log + end-turn.
  Portraits are procedural heraldic medallions (v1) — trait icons around a
  colored shield, aging visibly.
- **Typography/palette:** manuscript-inspired (deep reds, golds, ink on
  parchment), dark-mode variant as "night scriptorium."
- Fully client-side; responsive down to tablet width.

---

## 13. Tech approach (for later — not building yet)

- Single `index.html` with embedded CSS/JS. Vanilla JS, SVG map, no
  frameworks, no build step. Playable by double-clicking the file or via any
  static host / GitHub Pages.
- Deterministic seeded RNG → shareable/replayable seeds and testable battles.
- Game state = one serializable object → trivial `localStorage` saves,
  export/import as text.
- Data-driven content: characters, provinces, events, and traits defined as
  plain data tables so adding content never touches engine code.

---

## 14. Scope

### v1 (first playable)
1066 map (~30 provinces, 3 playable realms) · full character system
(traits/skills/opinions) · aging, death, primogeniture succession +
regencies · marriage alliances · council politics · intrigue (4 plot types,
AI plots against you) · seasonal war with attrition, sieges, naval invasion ·
economy (gold/prestige/legitimacy, 3 buildings) · ~30 events ·
trait-driven AI · season log · chronicle end screen · save/load.

### v2 — SHIPPED
The v2 expansion is now implemented on top of v1:

- **Second scenario: 1187 — The Devil's Brood.** Henry II's Angevin empire
  (13 provinces spanning the Channel) vs. Philip Augustus's France and
  William the Lion's Scotland, on the same map with a full historical cast
  (Richard, John, Eleanor, William Marshal, Arthur of Brittany…). Scripted
  events: the fall of Jerusalem and the crusade call; Richard demanding the
  succession with Paris behind him. Scenario picker on the title screen.
- **Succession laws.** Primogeniture or elective (magnates crown the ablest
  adult of the blood — no child regencies, but passed-over sons seethe).
  Changeable once per ruler for prestige + legitimacy.
- **Fabricated claims.** Set the monks forging a charter against any foreign
  province — a plot that takes seasons and costs prestige if discovered,
  yielding a province-claim casus belli.
- **Province claims & province wars** as a full CB type, for the player and
  the AI (Philip Augustus presses Normandy; William the Lion presses
  Northumbria).
- **Rome.** Petition for legitimacy yearly; failing or godless rulers risk
  excommunication (-25 opinion with all Christendom, legitimacy bleed) until
  they reconcile at a price.
- **The Great Mortality.** A once-per-game plague pandemic: two years of
  doubled mortality, collapsed income, and withering provinces.
- **Quiet-seasons fast-forward** — the pacing guard from §3, as a button.

### v2.1 — map & UX update (SHIPPED)
- **Map v2:** 30 → 43 provinces. Aquitaine, Poitou, Anjou, Champagne,
  Burgundy, Lorraine, Saxony, Frisia, Trøndelag, Svealand, Götaland,
  Connacht, Munster. Five new realms: Germany (Henry IV / Barbarossa),
  Sweden, Aquitaine, Anjou, Munster. The 1187 Angevin empire now correctly
  spans 16 provinces from Northumbria to Aquitaine.
- **Map presentation:** sea labels (Mare Germanicum…), compass rose,
  cartouche, terrain glyphs (hills/forest/marsh), coastal drop shadow.
- **Advisor:** "The Council Advises" panel — up to three contextual,
  one-click suggestions (muster when invaded, marry when heirless,
  reconcile when excommunicate, build when rich, fabricate when claimless).
- **Marriage market fixed:** every ruling house keeps marriageable kin
  (replenished yearly), betrothals from age 13, and the match browser lists
  every pairing with ages and traits — plus an explanation when no match exists.
- **Action points** shown as glowing pips that visibly deplete.
- Bug fixes: Court tab rendered raw HTML; player defeat (realm loss / line
  extinct / deposition) failed to trigger the game-over screen.

### v2.2 — the real map (SHIPPED)
- **Geographic map**: province geometry now generated from Natural Earth
  coastline data (see `tools/gen_map.mjs`) — real coastlines, fjords, and
  islands, projected conic-conformal, partitioned into **70 provinces** by
  Voronoi around historical seats (York, Winchester, Rouen, Uppsala,
  Toulouse…). Adjacency and coastal flags computed from the geometry.
- **Four new realms**: Ulaid, Toulouse, Blois-Champagne, Burgundy — 21
  realms total. The 1187 Angevin empire now correctly runs 24 provinces
  from Northumbria to Gascony.
- **Zoom & pan**: mouse-wheel zoom to cursor, drag to pan, ＋/－/⌂
  controls; small-province labels appear as you zoom in.
- **Achievements**: twelve deeds persisted across runs (localStorage),
  earned with a toast and displayed on the title screen.

### v2.3 — Europe entire (SHIPPED)
- **Map expanded to most of Europe**: 117 provinces from Portugal to
  Trebizond — Iberia, Italy, the Balkans, Anatolia, Hungary, Poland, Kievan
  Rus, with Messina/Bosporus/Danish straits. ~33 realms including Byzantium
  (playable in both scenarios), the Seljuks, al-Andalus, the Papacy, Venice,
  Sicily, Hungary, Poland, Kiev, Cumania.
- **Religion**: Catholic ☩, Orthodox ☦, Muslim ☪, Pagan 🌙. Cross-faith
  opinion penalties, no cross-faith marriages, Rome/excommunication gated to
  Catholics (Orthodox endow the Patriarchate, Muslims the madrasas), and
  **holy wars** — a province casus belli against any realm of another faith,
  used by the AI along the faith lines (Iberia, Anatolia, the steppe).
- **Culture** shown on every character (nine name cultures incl. Greek,
  Arabic, Iberian, Slavic, Magyar, Turkic).
- **Scripted Manzikert (1071)**: the Seljuk realm spawns under Alp Arslan,
  seizes eastern Anatolia and declares war on Byzantium.
- **Levy exploit fixed**: men already fielded cannot be mustered twice.
- **UI**: Wars and Plots are separate tabs (with spymaster status); skill
  values carry icons (🕊⚔🗡🔑) everywhere they appear.

### v2.4 — the great map (SHIPPED)
- **181 provinces** across Europe (up from 137): denser France, Germany,
  Italy, Iberia, Balkans, Anatolia and the Rus, plus the Baltic
  (Lithuania/Prussia/Livonia as a new pagan realm), Finland, Novgorod,
  Sicily/Corsica/Sardinia/Crete/Cyprus/Mallorca as islands. 39 realms.
- **Look & feel overhaul**: bold dark coastlines with faint interior
  province borders (rendered via a two-layer draw so the sea-facing edge
  stays bold and internal divisions stay quiet); 14 major rivers (Rhine,
  Danube, Loire, Seine, Po, Thames, Elbe, Ebro, Tagus, Dnieper, Vistula,
  Rhône, Volga, Oder); per-province tinting so every realm reads as shades
  of one hue (and same-hue = same realm at a glance).
- **Realm spotlight**: selecting any province, character or army highlights
  that realm's whole territory and dims the rest.
- **The Great Powers ledger** (📜 button): every living realm ranked by
  levy strength, with ruler, faith, size and its disposition toward you;
  click a row to fly the map to that realm.

### v2.5 — the living turn (SHIPPED)
Answer to "the seasons feel board-game-like": give the turn anticipation,
a payoff, a calendar identity, and put people behind the actions.
- **Tidings**: a forward-looking panel above the realm overview — enemy
  hosts in the field, claimants with the strength to press, plot progress,
  the spymaster's sense of hidden plots, pregnancies due, buildings
  finishing, truces lapsing, seasonal attrition warnings, plague seasons
  remaining. Each row clicks through to the thing it warns about.
- **Season Report**: instead of a drip of log lines, each season ends with
  one composed chronicle page — Your Realm / Wars & Battles / The Wider
  World — shown only when at least two notable things happened, and never
  during fast-forward.
- **Seasonal signature actions** (one per season, once a year): spring
  tournament, summer forced march (one host marches twice), autumn harvest
  levy (gold now, goodwill later), winter crown-wearing court.
- **Pregnancy**: conception is announced ("X is with child"), birth follows
  three seasons later — twins possible, childbed deaths possible, posthumous
  children of dead fathers handled. Due dates surface in Tidings.
- **Embodied orders replace action points**: the abstract 2–3 ⚡ budget is
  gone. Each season the crown gives one order of any kind (👑), and each
  filled council seat performs one task of its office — marshal ⚔ musters,
  marches, recruits; steward 🔑 builds, develops, squeezes; spymaster 🗡
  plots and forges; chaplain 🕊 prays, parleys, sends envoys. A busy
  councillor (or an empty seat) can be covered by the crown in person,
  spending the crown's order. A child ruler has no crown order — regencies
  govern through the council alone. The topbar shows the five order tokens
  with tooltips naming each councillor; buttons show their seat's icon as
  the cost.
- **Advisor with a face**: council suggestions are now voiced by the actual
  seat-holder by name, and marriage-match pickers show acceptance odds for
  every candidate.

### v2.6 — the reactive court (SHIPPED)
Answer to "getting several events at once at the start of a turn feels
odd; I'd rather events also fire from what I do."
- **Action-triggered events**: ~22 flavor events are now tagged with the
  action(s) that can spark them (`trig`), and each player action rolls a
  ~28% chance to fire a thematically matched one immediately — muster
  draws captains, eagles and free companies; building uncovers Roman
  ruins or fills a convoy; endowing Rome brings relics and legates;
  plotting brings a wavering conspirator; declaring war draws volunteers
  and offers of assassination.
- **Four new reaction events**: buried Roman stones (build/develop), a
  return embassy (envoy/gift), a conspirator's cold feet (plots), the
  banner drawing swords (war).
- **Thinner season starts**: reactive events are pulled out of the
  season-opening random pool, and that pool's budget is cut so a new
  season no longer dumps a stack of modals — scripted historical beats
  still open the season, but the flavor now spreads across the turn as
  you play it.

### v2.7 — columns and captains (SHIPPED)
Army manoeuvre that a single-stack model couldn't express.
- **Split**: a host of 100+ divides into two columns via a slider dialog
  ("Divide the Host") — choose exactly how many men march out. The
  detachment takes its own captain (the next-ablest courtier), keeps the
  parent's marching orders (so splitting never conjures a free move), and
  stands at the same province. Garrison a town with one column and strike
  with the other in the same season.
- **Merge**: co-located columns of the same realm fold into one — massing
  for battle — keeping the better commander, the higher siege progress,
  and the more-cautious moved-state (can't move again if either had).
- **Reinforcement**: mustering onto a province where a host already stands
  adds the fresh levies to that stack, and merge folds one column into
  another — so reinforcement is simply mustering or merging.
- Army panel gains ✂ Split / ⊕ Merge buttons; map already fans
  co-located tokens side by side so both columns stay clickable.

### v2.8 — the treasury (SHIPPED)
A dedicated economic screen, and one shared finance model behind it.
- **Treasury tab**: coin on hand and net-per-season up top; a Revenue card
  (provincial taxes, losses to occupation, steward multiplier, harvest ×2
  and plague ×0.65 modifiers, gross revenue) and an Expenditure card
  (retinue upkeep, one line per host in the field); a sortable province
  ledger (development, building, tax each — click a row to jump to that
  province); buildings under construction with seasons remaining.
- **One finance model**: `realmFinances(rid)` is the single source of truth
  used by the applied season income, the topbar preview tooltip, and the
  Treasury screen — they can no longer drift apart.
- **Army upkeep is now real**: the topbar always advertised a per-host cost
  but the season tick never actually charged it; now it does (levies/350 +
  mercs/160 per host per season), so the displayed net is truthful and a
  long war carries a genuine drag on the treasury.
- The topbar gold box is clickable — it opens the Treasury.

### v2.9 — allies & rivals (SHIPPED)
Diplomacy was only legible one court at a time; now the whole web is.
- **Relations tab**: a "Sworn Allies" section (each with the marriage that
  binds the realms, combined levy, and a warning if the ally is already at
  war), a "Rivals" section (ranked by threat, each with its reason — claim
  on your crown, claim on your land, active war, or deep enmity — its
  relative strength, and whether one of your allies shares the grudge), and
  a full "Every Court's Disposition" list ranking all living realms by their
  ruler's opinion of you. Every row jumps the map to that realm.
- **Formal rivalry**: `relationReasons(rid)` derives ally/rival status and
  the human-readable factors behind it (faith, marriage, truce, claims,
  excommunication) from existing state — no parallel bookkeeping. A realm is
  a rival if it wars you, claims your crown or land, or its ruler's opinion
  falls below −35. At the 1066 start this correctly names Denmark and Norway,
  both pressing claims on England.
- **Overview** gains an Allies / Rivals tally that links to the tab.

### v3.0 — the Mediterranean world (SHIPPED)
The map grows south and east to take in the whole medieval Mediterranean.
- **35 new provinces** across the Maghreb (Marrakesh, Fez, Sus, Tlemcen,
  Tahert, Algiers, Bejaïa, Tunis, Kairouan, Tripoli, Barca), Egypt
  (Alexandria, Cairo, Damietta, Upper Egypt), the Levant (Antioch, Aleppo,
  Tripoli, Damascus, Acre, Jerusalem, Kerak), Mesopotamia (Jazira, Mosul,
  Baghdad, Basra) and Arabia (Medina, Mecca, Nejd, al-Hasa) — 216 provinces
  in all.
- **The generator** (tools/gen_map.mjs) extends its bbox to lon −11..50,
  lat 20..64.8 and derives the canvas height (1000×747) from the fitted
  projection so the region fills the frame; new straits stitch the coast
  together (Gibraltar, Sicily–Tunis, the Sinai, the Sirte crossing,
  Jazira–Mosul) and new rivers (Nile, Tigris, Euphrates) are drawn. The
  whole continent is one connected landmass; only the British Isles remain
  sea-separated, as they should be.
- **Five impassable deserts** (the Sahara ×2, the Libyan Desert, the Nejd
  and Syrian wastes) fill the interior as sand-hatched wasteland — a
  distinct warm pattern from the grey Alps — so the south reads as land,
  not sea, while remaining uncrossable.
- **New realms & peoples**: a Berber culture with its own names, and the
  Muslim powers of the age. 1066 fields the Almoravids, Hammadids, Zirids,
  the Fatimid Caliphate (Egypt, the Levant coast and the Hejaz with Mecca
  and Medina) and the Abbasid Caliphate (Mesopotamia and inland Syria);
  Byzantium holds Antioch. 1187 replaces them with the Almohads, the
  Abbasids, the Crusader states of Outremer (Antioch, Tripoli, Acre), and
  **Saladin's Ayyubid Sultanate** — holding Egypt, Syria and a
  freshly-taken Jerusalem, giving the "Jerusalem Has Fallen" and Saladin
  Tithe events their historical antagonist on the map at last.
- **Robustness**: an auto-ruler fallback now generates a culturally-named
  ruler for any realm that holds land without a scripted one, so new powers
  (and future additions) never spawn headless.

### v3.1 — the living score (SHIPPED)
The generative music grows from one melody voice into a small ensemble
that reads the game.
- **Layered ensemble**: a continuous drone, a bass on the downbeat, a
  two-note harmonic pad, and the lead melody — over a slow chord
  progression (i–vi–iv–v, one chord per bar) so the harmony actually moves
  instead of sitting on a single mode.
- **Culture timbre**: western/slav play soft triangle-and-sine (church-like);
  norse/greek/arabic play a reedier sawtooth lead with a plucked attack, a
  gentle vibrato for the hijaz modes, and a frame-drum pulse. Berber joins
  the arabic mode.
- **Mood follows the realm's fortunes**: at war the drums double and the
  tempo hurries; pestilence thins the texture to a mournful drag and darkens
  it; excommunication and low legitimacy darken the lead; a proud realm at
  peace lightens and quickens. Re-evaluated every bar, so the score shifts
  with events as you play.
- A lowpass warms the master and a 2.2-second fade-in/out keeps toggling
  smooth. Still fully generative — nothing recorded.

### v3.2 — the southern thrones (SHIPPED)
The new map becomes playable from the other side of the sea.
- **Fatimid Egypt (1066)**: play al-Mustansir, Caliph in Cairo — the
  richest realm on the map (Nile gold, the Levant coast to Jerusalem, the
  Hejaz with Mecca and Medina), a boy-caliph shadowed by an over-mighty
  vizier (Badr al-Jamali), with the Seljuk storm about to break on Syria.
- **Saladin's Ayyubids (1187)**: play Salah al-Din himself, fresh from
  retaking Jerusalem, holding Egypt to the Euphrates — with the Crusader
  coast (Antioch, Tripoli, Acre) at your flank and the Third Crusade, Richard
  of England and all, gathering across the sea.
- Both start with a **full dynasty** (consort, heirs, ambitious kin) so the
  succession has continuity — verified over a 20-season run in which Saladin
  died and al-Afdal inherited cleanly. Made playable simply by giving each a
  scenario card; the auto-ruler fallback covers every other landed realm.

### v3.3 — densifying the south (SHIPPED)
The North African, Levantine, Mesopotamian and Arabian provinces were far
sparser than Europe; this brings them to the same grain (246 provinces).
- **28 new southern provinces** in the settled zones: the Maghreb coast
  (Tangier, Sijilmasa, Oran, Constantine, Sfax, Gabès, Tozeur, Marmarica),
  the Nile (Fayyum, Sinai, Asyut, Aswan), the Levant (Latakia, Homs,
  Baalbek, Hauran, Ascalon, Edessa), Mesopotamia (Sinjar, Samarra, Kufa,
  Wasit) and Arabia (Taima, Ha'il, Khaybar, Jedda, Yamama, Qatif) — the
  deserts stay large and impassable, which is how these lands actually sat.
- **Two more desert wastes** (the Great Nafud, the Empty Quarter) plus a
  third Sahara cell break up the southern interior; finer coastline
  simplification (DP ε 1.1 → 0.85) sharpens every shore.
- **All assigned in both eras**: the new lands slot into the Almoravids,
  Hammadids, Zirids, Fatimids and Abbasids (1066, with Byzantium taking
  Latakia and Edessa) and into the Almohads, Ayyubids, Crusader Outremer
  and Abbasids (1187).
- **Opens on your realm**: a new game now frames the map on the player's
  own capital at a comfortable zoom instead of the whole world — so a
  European lord starts looking at Europe and Saladin at the Levant, and
  the larger map never feels cramped.

### v3.4 — densifying the north & east (SHIPPED)
The same treatment for Scandinavia, the Baltic and the Rus, which were the
last sparse quarter of the map (268 provinces).
- **22 new provinces**: Norway (Telemark, Oppland, Hålogaland), Sweden
  (Värmland, Norrland, Gotland), Finland (Tavastia, Karelia), the Baltic
  (Estonia, Semgallia, Samogitia), Poland (Silesia, Sandomierz), the Rus
  (Pskov, Turov, Pereyaslavl, Ryazan, Vladimir, Rostov, Murom, Beloozero)
  and the Pontic steppe (the Cuman Steppe).
- **Reworked frontier dummies**: the points that used to absorb the
  Russian northeast and Arctic fringe were pulled back to the true edges
  (deep Russia toward the Urals, the steppe toward the Caspian, the coast
  above lat 64.8), letting real provinces claim the land.
- Assigned to their historical realms in both eras — the Rus to the
  Kievan realm, the Baltic to pagan Lithuania, the new Nordic lands to
  Norway and Sweden, the steppe to the Cumans — with a Gotland strait and
  a Hålogaland–Trøndelag coastal link. The whole map now reads at one
  density from Ireland to the Volga and Norway to Mecca.

### v3.5 — clearer orders, faster map (SHIPPED)
Three fixes from playtesting feedback.
- **Orders are one pool again (Option C).** The embodied per-councillor
  gating was hard to read — you had to learn which action belonged to which
  seat. Now you have a single pool of orders (⚡) spent on *anything*, sized
  by your council: **one for the crown plus one for each seated councillor**
  (five at a full council, fewer with an empty seat or a child's regency).
  This keeps the one good idea of the embodied model — a fuller, abler
  council literally lets you do more, a regency cripples you — while
  restoring the old "spend a point on whatever" clarity. Every button now
  shows a single ⚡ cost; the top bar shows the pool with a tooltip that
  explains where the number comes from. The council still gives its skill
  bonuses and voices the advice, so staffing it well matters twice over.
- **No double-fabrication.** You can no longer start forging a claim on a
  province where your monks are already at work — the action is refused and
  the button reads "Claim being forged…".
- **The map is much faster.** The renderer used to tear down and rebuild the
  entire SVG (268 provinces, labels, rivers, two turbulence filters) on
  every action and every click. It now builds that static geometry once and,
  thereafter, only repaints what actually moves — fills, the realm
  spotlight, marks and army tokens — via direct attribute updates. A
  selection/repaint dropped from a full rebuild to ~2.5 ms, so clicking
  around the map is smooth again. No rewrite or new language needed — the
  bottleneck was DOM churn, not computation, and the game stays one portable
  self-contained HTML file.

### v3.6 — claims, a marriage fix, and values that matter (SHIPPED)
More playtest feedback.
- **Claims of Your House.** The Dynasty tab now lists every casus belli your
  house holds — throne claims and province claims, whose they are, who holds
  the land, and a Press button to make war on the spot — plus any claims your
  monks are still forging, with progress. (Fixed a latent double-count:
  `myCourt()` already includes the ruler, so several places listed the ruler's
  claims twice.)
- **Marriage confirmation bug.** Proposing a match as a male ruler read the
  bride's realm *after* she'd joined your court, so the confirmation said your
  own country had "accepted." It now names the correct foreign house.
- **Prestige and legitimacy made legible and consequential.** Both top-bar
  values now carry rich tooltips explaining what they currently *do* and the
  thresholds in play. The realm overview shows the crown's standing
  (Secure / Accepted / Uneasy / Precarious) and the house's renown
  (minor → respected → illustrious → legendary), and the victory line shows
  live progress (provinces toward empire, prestige toward 2500). Tidings warns
  when legitimacy falls below 40. Most importantly, **low legitimacy now
  tangibly shrinks your levies** — below ~45 your disrespected vassals withhold
  their spears (down to −30% at zero), so the number you watch in the overview
  and the army you can raise are one and the same. Above 45 it costs nothing.

### v3 candidates (still cut)
Vassal sub-realms with their own courts · gavelkind partition · 1328 Hundred
Years and 1213 Reconquista scenarios · achievements · Ironman mode.

---

## 15. Resolved design decisions

1. **Historical difficulty.** No difficulty settings — your choice of realm is
   the difficulty knob (England = normal, Normandy = hard, Norway = very hard).
2. **No grace period.** The AI plots, schemes, and wars by exactly the same
   rules as the player, from turn one.
3. **Wars and alliances are personal (historical reality).** A claim war ends
   in white peace if the claimant dies and the heir does not hold the claim.
   Any ruler's death mid-war causes levy desertion for their realm. Marriage
   alliances lapse when a linking spouse dies, and are tested when a ruler
   dies — the heir's neighbors may not honor their father's friendships.
4. **Colorful chronicle.** The end-of-game history is written by an
   opinionated medieval chronicler, epithets and judgments included.
5. **v1 scope locked** as written in §14 — nothing pulled forward from v2.
