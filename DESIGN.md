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
