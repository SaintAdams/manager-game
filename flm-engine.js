/* Football League Manager - game engine. Load this file before the audio script block. */
(function () {
  const s = document.createElement('style');
  s.textContent = '.matchday-grid>*,.broadcast-card>*,.canvas-container{min-width:0;max-width:100%}' +
    '#matchPitchCanvas{height:auto!important;aspect-ratio:800/480}.sub-chips-row{max-width:100%;overflow-x:auto}' +
    '@media (min-width:901px){#tab-matchday{height:calc(100vh - 96px);min-height:540px}' +
    '.matchday-grid{height:100%;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:12px}' +
    '.broadcast-card{height:100%;min-height:0;padding:10px;gap:8px}' +
    '.scoreboard-box{padding:6px 12px}.sb-score{font-size:1.8rem}.sb-team h2{font-size:1rem}.match-timeline-bar{min-height:32px}' +
    '.canvas-container{flex:1;min-height:0}' +
    '#matchPitchCanvas{flex:1;min-height:0;width:100%;height:auto!important;aspect-ratio:auto;object-fit:contain;background:#090e18}' +
    '.md-right{display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0;height:100%}' +
    '.md-right .commentary-box{flex:1.3;min-height:0;height:auto}' +
    '.md-right .in-match-sub-drawer{max-height:32%;overflow-y:auto}.md-right .sub-chips-row{flex-wrap:wrap;overflow:visible}' +
    '.md-right .standings-card{flex:1;min-height:0;overflow-y:auto}}';
  document.head.appendChild(s);
})();
const STORAGE_KEY = 'FLM_CAREER_2026_V2';
let state = null, selectedPlayerSwapId = null, wizardChosenClubId = 'NEW', activeContractTarget = null,
  deadlineHour = 12, pendingAIBid = null, shootoutState = null, simSpeedMultiplier = 1,
  matchSimInterval = null, animFrameId = null, marketSortKey = 'ovr', marketSortAsc = false;
let matchLiveState = { 
  activeShout: null, 
  shoutExpireMin: 0, 
  subsUsed: 0, 
  maxSubs: 5, 
  timelineEvents: [],
  yellows: {},
  reds: []
};
let pitchEngine = { currentMinute: 0, homePlayers: [], awayPlayers: [], ball: { x: 400, y: 240, targetX: 400, targetY: 240 }, w: 800, h: 480 };

const $ = id => document.getElementById(id);
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const FIRSTNAMES = 'James,Oliver,Jack,Harry,Leo,Noah,Ethan,Mason,Luca,Tom,Ben,Sam,Callum,Declan,Marcus,Kieran'.split(',');
const SURNAMES = 'Smith,Jones,Taylor,Brown,Wilson,Evans,Walker,Wright,Hughes,Clarke,Bell,Cole,Reid,Moore,Ward,Hall,Grant,Shaw'.split(',');
const NATS = ['SCO', 'WAL', 'IRL', 'NIR', 'FRA', 'ESP', 'GER', 'NED', 'POR', 'BRA', 'ARG', 'SWE', 'DEN', 'ITA', 'BEL'];
const ROLE = { GK: 'GK-De', DEF: 'CD-De', MID: 'CM-At', FWD: 'AF-At' };
const TAG = { GK: 'GK', DEF: 'DF', MID: 'MF', FWD: 'FW' };
const DIV_NAMES = ['Premier League', 'Championship', 'League One', 'League Two'];
const CUP_WEEKS = { 7: ['Carabao Cup', 'carabao', false], 15: ['Carabao Cup', 'carabao', true], 23: ['The FA Cup', 'fa', false], 31: ['The FA Cup', 'fa', true] };

const LEAGUES = ('Arsenal,Aston Villa,Bournemouth,Brentford,Brighton,Chelsea,Crystal Palace,Everton,Fulham,Leeds United,Liverpool,Manchester City,Manchester United,Newcastle United,Nottingham Forest,Sunderland,Tottenham,Coventry City,Ipswich Town,Hull City|' +
  'Leicester City,Southampton,Burnley,Middlesbrough,West Brom,Norwich City,Sheffield United,West Ham,Watford,Wolves,Stoke City,Swansea City,Bristol City,Millwall,Preston,QPR,Blackburn,Derby County,Portsmouth,Oxford United,Sheffield Wednesday,Plymouth Argyle,Birmingham City,Charlton|' +
  'Wrexham,Bolton,Stockport,Leyton Orient,Huddersfield,Lincoln City,Reading,Wycombe,Barnsley,Peterborough,Blackpool,Rotherham,Cardiff City,Bradford City,Stevenage,Mansfield Town,Exeter City,Northampton,Burton Albion,Wigan,Luton Town,Port Vale,Doncaster,Crawley Town|' +
  'Notts County,Walsall,Chesterfield,Swindon,Gillingham,Salford City,Grimsby Town,Bromley,Crewe Alexandra,Colchester,Fleetwood,Tranmere,AFC Wimbledon,Barrow,Cheltenham,Harrogate,MK Dons,Accrington Stanley,Newport County,Bristol Rovers,Carlisle,Shrewsbury,Morecambe,Oldham Athletic').split('|').map(s => s.split(','));

const CLUBS_DATABASE = [];
LEAGUES.forEach((names, div) => names.forEach(n => {
  const nu = n === 'Newcastle United'; let h = 0; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) % 360;
  CLUBS_DATABASE.push({ id: nu ? 'NEW' : 'C' + CLUBS_DATABASE.length, name: n, div, stadium: nu ? "St James' Park" : n + ' Stadium',
    cap: nu ? 52305 : [42000, 26000, 14000, 7000][div] + R(0, 8000), budget: [60, 20, 8, 3][div] + R(0, 10), col: `hsl(${h},60%,38%)`, str: [76, 66, 58, 52][div] + R(-4, 4) });
}));

const FORMATIONS = {};
[['4-3-3', [[4, 'DEF', 72], [3, 'MID', 50], [3, 'FWD', 22]]], ['4-2-3-1', [[4, 'DEF', 72], [2, 'MID', 56], [3, 'MID', 38], [1, 'FWD', 18]]],
 ['4-4-2', [[4, 'DEF', 72], [4, 'MID', 46], [2, 'FWD', 20]]], ['5-3-2', [[5, 'DEF', 72], [3, 'MID', 46], [2, 'FWD', 20]]], ['3-5-2', [[3, 'DEF', 72], [5, 'MID', 46], [2, 'FWD', 20]]]
].forEach(([name, rows]) => {
  const t = [{ x: 50, y: 90, role: 'GK', posType: 'GK', duty: ROLE.GK }];
  rows.forEach(([n, type, y]) => { for (let i = 0; i < n; i++) t.push({ x: n === 1 ? 50 : 12 + (76 / (n - 1)) * i, y, role: TAG[type], posType: type, duty: ROLE[type] }); });
  FORMATIONS[name] = t;
});

const SQUAD_ORDER = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD', 'GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'DEF', 'MID'];
function mkPlayer(pos, base, i, cid) {
  const ovr = Math.max(40, Math.min(92, base + R(-6, 7)));
  return { id: `${cid}_${i}_${R(0, 99999)}`, name: pick(FIRSTNAMES) + ' ' + pick(SURNAMES), naturalPos: pos, nat: Math.random() < 0.7 ? 'ENG' : pick(NATS), age: R(18, 35), ovr, con: 100,
    role: ROLE[pos], starter: i < 11, val: Math.max(0.3, +((ovr - 50) * 0.75).toFixed(1)), wage: Math.max(0.01, +((ovr - 45) * 0.003).toFixed(3)), contract: R(1, 5), morale: 'Good', goals: 0, cleanSheets: 0, inj: 0 };
}
function generateProceduralSquad(c) {
  const real = typeof REAL_SQUADS !== 'undefined' && REAL_SQUADS[c.name];
  if (!real) return SQUAD_ORDER.map((pos, i) => mkPlayer(pos, c.str, i, c.id));
  const all = real.map(([name, pos, ovr, age, nat], i) => Object.assign(mkPlayer(pos, ovr, i, c.id), { name, ovr, age: age || R(20, 32), nat: nat || 'ENG', starter: false,
    val: Math.max(0.3, +((ovr - 50) * 0.75).toFixed(1)), wage: Math.max(0.01, +((ovr - 45) * 0.003).toFixed(3)) })).sort((a, b) => b.ovr - a.ovr);
  const need = { GK: 1, DEF: 4, MID: 3, FWD: 3 }, xi = [];
  Object.keys(need).forEach(pos => { for (let k = 0; k < need[pos]; k++) { const i = all.findIndex(p => p.naturalPos === pos); xi.push(i >= 0 ? all.splice(i, 1)[0] : mkPlayer(pos, c.str, 50 + xi.length, c.id)); } });
  const squad = [...xi, ...all]; let i = squad.length;
  while (squad.length < 22) squad.push(mkPlayer(SQUAD_ORDER[squad.length], c.str - 6, i++, c.id));
  squad.forEach((p, j) => { p.starter = j < 11; }); return squad;
}
const TRANSFER_SCOUT_POOL = [];
for (let i = 0; i < 40; i++) {
  const pos = pick(['GK', 'DEF', 'MID', 'FWD']), p = mkPlayer(pos, 66 + R(0, 14), i, 'scout');
  TRANSFER_SCOUT_POOL.push({ id: 'scout_' + i, name: p.name, naturalPos: pos, nat: pick(NATS), age: R(19, 32), ovr: p.ovr, price: +(p.val * 1.2).toFixed(1), club: 'Foreign Club', wage: p.wage, contract: 3 });
}

/* ---------- helpers ---------- */
const clubById = id => state.clubs.find(c => c.id === id);
const getCurrentUserClub = () => state.clubs.find(c => c.id === state.userClubId) || state.clubs[0];
const getWeek = w => state.fixtures[(w || state.currentWeek) - 1];
const userLeagueMatch = () => { const w = getWeek(); return w ? w.matches.find(m => m.type === 'LEAGUE' && (m.home === state.userClubId || m.away === state.userClubId)) : null; };
const userCupMatch = () => { const w = getWeek(); return w ? w.matches.find(m => m.type === 'CUP' && (m.home === state.userClubId || m.away === state.userClubId)) : null; };
const getActiveUserMatch = () => {
  const cup = userCupMatch();
  if (cup && !cup.played) return cup;
  const league = userLeagueMatch();
  if (league && !league.played) return league;
  return cup || league;
};
function createBadgeHtml(id, size = 30) {
  const c = (state ? state.clubs : CLUBS_DATABASE).find(x => x.id === id) || {};
  const ini = (c.name || id).replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase();
  return `<span class="badge-icon-wrap" style="width:${size}px;height:${size}px"><span class="badge-fallback" style="background:${c.col || '#334155'};font-size:${Math.round(size * 0.34)}px">${ini}</span></span>`;
}
function computeClubAttributes(club) {
  const st = club.players.filter(p => p.starter);
  const avg = (arr, fb) => arr.length ? Math.round(arr.reduce((s, x) => s + x.ovr * (x.inj > 0 ? 0.6 : 0.8 + 0.2 * x.con / 100), 0) / arr.length) : fb;
  const d = avg(st.filter(p => p.naturalPos === 'DEF' || p.naturalPos === 'GK'), 60), m = avg(st.filter(p => p.naturalPos === 'MID'), 60), a = avg(st.filter(p => p.naturalPos === 'FWD'), 60);
  return { att: a, mid: m, def: d, ovr: Math.round((a + m + d) / 3) };
}
const computeClubWeeklyWageBill = club => +club.players.reduce((s, p) => s + (p.wage || 0.02), 0).toFixed(3);

/* ---------- state ---------- */
function setupFreshState(managerName = 'Manager', clubId = 'NEW') {
  state = { seasonYear: 2026, currentWeek: 1, totalWeeks: 46, userClubId: clubId, currentFormation: '4-3-3', audioEnabled: true, activeStandingsTab: 0,
    medicalFacilityLevel: 1, academyFacilityLevel: 1, stadiumCapacityBonus: 0, clubs: JSON.parse(JSON.stringify(CLUBS_DATABASE)),
    marketPlayers: JSON.parse(JSON.stringify(TRANSFER_SCOUT_POOL)), standings: {}, newsFeed: [], cups: { carabaoAlive: true, faAlive: true },
    deadlineDaysCompleted: {}, youthProspects: [], youthIntakeCompleted: false, fixtures: [],
    manager: { name: managerName, confidence: 85, fansApproval: 82, matches: 0, wins: 0, draws: 0, losses: 0, motmAwards: 0, faCups: 0, carabaoCups: 0 } };
  state.clubs.forEach(c => { c.players = generateProceduralSquad(c); });
  buildStandings(); generateTrueRoundRobinFixtures(); generateInitialNews(); generateYouthIntake(false);
}
function buildStandings() {
  for (let d = 0; d <= 3; d++) state.standings[d] = state.clubs.filter(c => c.div === d).map(c => ({ id: c.id, name: c.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }));
}
function ensureAllSquadsHydrated() {
  state.clubs.forEach(c => { if (!c.players || c.players.length < 14) c.players = generateProceduralSquad(c); });
  if (!state.cups) state.cups = { carabaoAlive: true, faAlive: true };
}
function saveGame() { if (state) try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }
function initGame() {
  let ok = false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { state = JSON.parse(saved); if (!state.clubs || state.clubs.length < 92 || !state.manager) throw 0; ensureAllSquadsHydrated(); ok = true; }
  } catch (e) { state = null; }
  if (!ok) { setupFreshState('Manager', 'NEW'); saveGame(); }
  layoutMatchday(); initMarketFilterDropdowns(); renderAll();
}

/* ---------- career wizard / club switch ---------- */
function openCareerSetupWizard() { wizardChosenClubId = 'NEW'; filterWizardClubs(0); $('careerSetupModal').style.display = 'flex'; }
function clubCardHtml(c) { return `${createBadgeHtml(c.id, 32)}<div><div style="font-weight:800;font-size:.85rem">${c.name}</div><div style="font-size:.7rem;color:var(--text-muted)">${c.stadium}</div><div style="font-size:.72rem;color:var(--accent)">Budget: £${c.budget}M</div></div>`; }
function filterWizardClubs(div) {
  for (let i = 0; i <= 3; i++) $(`wTab${i}`).className = `league-tab-btn ${i === div ? 'active' : ''}`;
  const grid = $('wizardClubsGrid'); grid.innerHTML = '';
  CLUBS_DATABASE.filter(c => c.div === div).forEach(c => {
    const card = document.createElement('div'); card.className = `club-select-card ${c.id === wizardChosenClubId ? 'selected' : ''}`;
    card.onclick = () => { wizardChosenClubId = c.id; filterWizardClubs(div); }; card.innerHTML = clubCardHtml(c); grid.appendChild(card);
  });
}
function confirmNewCareerSetup() {
  setupFreshState($('wizardNameInput').value.trim() || 'Manager', wizardChosenClubId);
  $('careerSetupModal').style.display = 'none'; initMarketFilterDropdowns(); saveGame(); renderAll(); switchTab('tactics'); playSound('whistle');
}
function promptNewCareer() { if (confirm('Start a completely new career? Current progress will be reset.')) { localStorage.removeItem(STORAGE_KEY); openCareerSetupWizard(); } }
function openClubSelectorModal() { filterModalClubs(0); $('clubSelectorModal').style.display = 'flex'; }
function closeClubSelectorModal() { $('clubSelectorModal').style.display = 'none'; }
function filterModalClubs(div) {
  for (let i = 0; i <= 3; i++) $(`mTab${i}`).className = `league-tab-btn ${i === div ? 'active' : ''}`;
  const grid = $('modalClubsGrid'); grid.innerHTML = '';
  state.clubs.filter(c => c.div === div).forEach(c => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg-panel);padding:8px 10px;border-radius:8px;cursor:pointer;border:1px solid var(--border);display:flex;align-items:center;gap:10px;';
    card.onclick = () => { state.userClubId = c.id; closeClubSelectorModal(); saveGame(); initMarketFilterDropdowns(); renderAll(); playSound('whistle'); };
    card.innerHTML = clubCardHtml(c); grid.appendChild(card);
  });
}

/* ---------- fixtures ---------- */
function buildRoundRobinSchedule(ids) {
  const n = ids.length, t = [...ids], rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const p = [];
    for (let i = 0; i < n / 2; i++) { const h = t[i], a = t[n - 1 - i]; p.push((i === 0 && r % 2) || (i > 0 && (r + i) % 2) ? { home: a, away: h } : { home: h, away: a }); }
    rounds.push(p); t.splice(1, 0, t.pop());
  }
  return [...rounds, ...rounds.map(r => r.map(m => ({ home: m.away, away: m.home })))];
}
function generateTrueRoundRobinFixtures() {
  const sched = {}; for (let d = 0; d <= 3; d++) sched[d] = buildRoundRobinSchedule(state.clubs.filter(c => c.div === d).map(c => c.id));
  state.fixtures = [];
  for (let w = 1; w <= state.totalWeeks; w++) {
    const matches = [];
    for (let d = 0; d <= 3; d++) if (sched[d][w - 1]) sched[d][w - 1].forEach(m => matches.push({ div: d, type: 'LEAGUE', home: m.home, away: m.away, homeGoals: null, awayGoals: null, played: false, scorers: [] }));
    state.fixtures.push({ week: w, matches, done: false, cupChecked: false });
  }
}
function ensureCupTie() {
  const w = getWeek(), cfg = CUP_WEEKS[state.currentWeek];
  if (!w || !cfg || w.cupChecked || w.done) return; w.cupChecked = true;
  if (!state.cups[cfg[1] + 'Alive']) return;
  const opp = pick(state.clubs.filter(c => c.id !== state.userClubId)), homeUser = Math.random() < 0.5;
  w.matches.unshift({ div: -1, type: 'CUP', cupName: cfg[0], cupKey: cfg[1], final: cfg[2], home: homeUser ? state.userClubId : opp.id, away: homeUser ? opp.id : state.userClubId, homeGoals: null, awayGoals: null, played: false, scorers: [] });
}

/* ---------- match engine ---------- */
function poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
function pickScorer(club) {
  const pool = []; club.players.filter(p => p.starter && p.naturalPos !== 'GK').forEach(p => { const w = p.naturalPos === 'FWD' ? 4 : p.naturalPos === 'MID' ? 2 : 1; for (let i = 0; i < w; i++) pool.push(p); });
  return pick(pool.length ? pool : club.players);
}
function simGoals(h, a) {
  const hs = computeClubAttributes(h), as = computeClubAttributes(a);
  const dh = (hs.att + hs.mid) / 2 - (as.def + as.mid) / 2, da = (as.att + as.mid) / 2 - (hs.def + hs.mid) / 2;
  return [poisson(Math.max(0.25, 1.4 + dh / 22 + 0.25)), poisson(Math.max(0.2, 1.15 + da / 22))];
}
function applyResult(m, hg, ag, scorersDone) {
  const h = clubById(m.home), a = clubById(m.away); m.homeGoals = hg; m.awayGoals = ag; m.played = true;
  if (!scorersDone) {
    for (let i = 0; i < hg; i++) { const s = pickScorer(h); s.goals++; m.scorers.push({ team: h.name, player: s.name, min: R(3, 90) }); }
    for (let i = 0; i < ag; i++) { const s = pickScorer(a); s.goals++; m.scorers.push({ team: a.name, player: s.name, min: R(3, 90) }); }
  }
  if (ag === 0) { const g = h.players.find(p => p.starter && p.naturalPos === 'GK'); if (g) g.cleanSheets++; }
  if (hg === 0) { const g = a.players.find(p => p.starter && p.naturalPos === 'GK'); if (g) g.cleanSheets++; }
  if (m.type === 'LEAGUE') updateLeagueTableRecord(m.div, m.home, m.away, hg, ag);
  else { const gate = +(h.cap * 0.000035 / 2).toFixed(2); h.budget += gate; a.budget += gate; }
  if (m.home === state.userClubId || m.away === state.userClubId) recordUserMatchResult(m.home === state.userClubId, hg, ag);
}
function updateLeagueTableRecord(div, hid, aid, hg, ag) {
  const t = state.standings[div]; if (!t) return;
  const h = t.find(r => r.id === hid), a = t.find(r => r.id === aid); if (!h || !a) return;
  h.played++; a.played++; h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg; h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;
  if (hg > ag) { h.won++; h.pts += 3; a.lost++; } else if (hg < ag) { a.won++; a.pts += 3; h.lost++; } else { h.drawn++; a.drawn++; h.pts++; a.pts++; }
}
function recordUserMatchResult(isHome, hg, ag) {
  const u = isHome ? hg : ag, o = isHome ? ag : hg, mg = state.manager; mg.matches++;
  if (u > o) { mg.wins++; mg.confidence = Math.min(99, mg.confidence + 3); mg.fansApproval = Math.min(99, mg.fansApproval + (u >= 3 ? 4 : 2)); }
  else if (u === o) { mg.draws++; mg.fansApproval = Math.max(20, mg.fansApproval - 1); }
  else { mg.losses++; mg.confidence = Math.max(25, mg.confidence - 4); mg.fansApproval = Math.max(20, mg.fansApproval - 4); }
}
function cupWinnerId(m) { return m.homeGoals > m.awayGoals ? m.home : m.awayGoals > m.homeGoals ? m.away : m.penWinner; }
function cupOutcome(m) {
  const won = cupWinnerId(m) === state.userClubId, uc = getCurrentUserClub().name;
  if (!won) { state.cups[m.cupKey + 'Alive'] = false; addNewsStory('Cup Exit', `${uc} knocked out of the ${m.cupName}`, 'The cup run is over for this season.', false); }
  else if (m.final) {
    if (m.cupKey === 'fa') state.manager.faCups++; else state.manager.carabaoCups++;
    addNewsStory('Silverware', `${uc} WIN THE ${m.cupName.toUpperCase()}!`, 'A trophy for the cabinet.', true); playSound('cheer');
  } else addNewsStory('Cup Progress', `${uc} through in the ${m.cupName}`, 'On to the next round.', false);
}
function finalizeWeek() {
  const w = getWeek(); if (!w || w.done) return;
  ensureCupTie();
  w.matches.forEach(m => {
    if (m.played) return; const h = clubById(m.home), a = clubById(m.away); if (!h || !a) return;
    const [hg, ag] = simGoals(h, a); applyResult(m, hg, ag, false);
    if (m.type === 'CUP') { if (hg === ag) { w.pendingPens = true; launchPenaltyShootout(m, h, a); } else cupOutcome(m); }
  });
  const club = getCurrentUserClub(), lm = userLeagueMatch();
  if (lm && lm.home === club.id) club.budget += +(((club.cap + state.stadiumCapacityBonus) * 0.00004)).toFixed(2);
  applyWeeklyFinancesAndFatigue(); generateWeeklyNewsStory();
  if (state.currentWeek === 30 && !state.youthIntakeCompleted) generateYouthIntake(true);
  w.done = true; saveGame();
}
function applyWeeklyFinancesAndFatigue() {
  const club = getCurrentUserClub(), med = (state.medicalFacilityLevel || 1) * 3;
  club.budget = Math.max(0, +(club.budget - computeClubWeeklyWageBill(club) * 0.4 + [0.5, 0.2, 0.08, 0.03][club.div]).toFixed(2));
  club.players.forEach(p => {
    if (p.inj > 0) { p.inj--; if (!p.inj) addNewsStory('Medical Update', `${p.name} returns from injury`, `${p.name} has resumed training.`, false); }
    if (p.starter) {
      p.con = Math.max(55, p.con - R(4, 9));
      if (p.con < 70 && Math.random() < 0.12 && !p.inj) { p.inj = R(1, 3); addNewsStory('Injury Blow', `INJURY: ${p.name} out for ${p.inj} weeks`, 'A muscle strain.', true); }
    } else p.con = Math.min(100, p.con + 20 + med);
  });
}
function generateWeeklyNewsStory() {
  const m = getActiveUserMatch(); if (!m || m.played) return;
  const uc = getCurrentUserClub(), home = m.home === uc.id, opp = clubById(home ? m.away : m.home), my = home ? m.homeGoals : m.awayGoals, th = home ? m.awayGoals : m.homeGoals;
  if (my > th) addNewsStory('Match Reaction', `Victory: ${uc.name} beat ${opp.name} (${my}-${th})`, 'A confident display.', false);
  else if (my < th) addNewsStory('Defeat Reaction', `Setback: ${uc.name} lose to ${opp.name} (${my}-${th})`, 'Supporters question the tactics.', false);
  else addNewsStory('Match Reaction', `Points shared: ${uc.name} ${my}-${th} ${opp.name}`, 'An intense draw.', false);
}
function evaluateManagerOfMonth() {
  if (Math.random() > 0.45 && state.manager.confidence > 75) {
    state.manager.motmAwards++; state.manager.confidence = Math.min(99, state.manager.confidence + 5);
    addNewsStory('Award Winner', `${state.manager.name} named Manager of the Month!`, 'An impressive run of form.', true); alert('🏆 Manager of the Month!'); playSound('cheer');
  }
}

/* ---------- advance ---------- */
function handleMasterAdvanceClick() {
  if (!state || (shootoutState && shootoutState.active)) return;
  if (checkDeadlineDayTrigger()) return;
  const lm = getActiveUserMatch();
  if (lm && !lm.played) {
    clearTimeout(matchSimInterval); cancelAnimationFrame(animFrameId); $('btnStartMatch').disabled = false;
    finalizeWeek(); renderAll();
    if (!(shootoutState && shootoutState.active)) showResultModal(lm); return;
  }
  const w = getWeek(); if (w && !w.done) { finalizeWeek(); if (shootoutState && shootoutState.active) return; }
  if (state.currentWeek >= state.totalWeeks) { showEndSeasonGala(); return; }
  state.currentWeek++; resetLiveState();
  if (state.currentWeek % 4 === 0) evaluateManagerOfMonth();
  saveGame(); renderAll(); playSound('click');
}
function resetLiveState() { 
  matchLiveState = { activeShout: null, shoutExpireMin: 0, subsUsed: 0, maxSubs: 5, timelineEvents: [], yellows: {}, reds: [] }; 
  $('activeShoutBadge').innerText = ''; 
  $('subsRemainingText').innerText = 5; 
}
function showResultModal(m) {
  const h = clubById(m.home), a = clubById(m.away), mine = m.home === state.userClubId ? m.homeGoals - m.awayGoals : m.awayGoals - m.homeGoals;
  $('modalScoreDisplay').innerHTML = `<div class="result-modal-scoreboard"><div class="result-team">${createBadgeHtml(h.id, 46)}<div class="result-team-name">${h.name}</div></div><div class="result-score-center"><div class="result-score-digits">${m.homeGoals} - ${m.awayGoals}</div><div class="result-ft-badge">FULL TIME</div></div><div class="result-team">${createBadgeHtml(a.id, 46)}<div class="result-team-name">${a.name}</div></div></div>`;
  const sc = m.scorers.map(s => `${s.min}' ${s.player}`).join(', ');
  $('modalHighlightsFeed').innerHTML = `<p><b>${mine > 0 ? 'Great win!' : mine < 0 ? 'Tough defeat.' : 'Points shared.'}</b></p><p style="margin-top:6px">${sc ? 'Goals: ' + sc : 'No goals.'}</p>`;
  $('resultSummaryModal').style.display = 'flex'; playSound('whistle');
}
function dismissResultModal() { $('resultSummaryModal').style.display = 'none'; handleMasterAdvanceClick(); }

/* ---------- shootout ---------- */
function launchPenaltyShootout(m, h, a) {
  shootoutState = { active: true, match: m, homeClub: h, awayClub: a, homeScore: 0, awayScore: 0, homeKicks: [], awayKicks: [], turn: 'home' };
  $('penHomeTeamName').innerText = h.name; $('penAwayTeamName').innerText = a.name; $('penHomeScore').innerText = '0'; $('penAwayScore').innerText = '0';
  $('penHomePips').innerHTML = ''; $('penAwayPips').innerHTML = ''; $('penKickStatusText').innerText = `${h.name} to take first!`;
  $('btnTakePenalty').disabled = false; $('shootoutModal').style.display = 'flex'; playSound('whistle');
}
function takeShootoutTurn() {
  const s = shootoutState; if (!s || !s.active) return; const home = s.turn === 'home', scored = Math.random() < 0.78, team = home ? s.homeClub : s.awayClub;
  if (home) { s.homeKicks.push(scored); if (scored) s.homeScore++; s.turn = 'away'; } else { s.awayKicks.push(scored); if (scored) s.awayScore++; s.turn = 'home'; }
  [['penHomePips', s.homeKicks], ['penAwayPips', s.awayKicks]].forEach(([id, k]) => { $(id).innerHTML = k.map(r => `<div class="pen-pip ${r ? 'scored' : 'missed'}"></div>`).join(''); });
  $('penHomeScore').innerText = s.homeScore; $('penAwayScore').innerText = s.awayScore;
  $('penKickStatusText').innerHTML = scored ? `⚽ <b style="color:#10b981">SCORED!</b> ${team.name}` : `❌ <b style="color:#ef4444">MISSED!</b> ${team.name}`; playSound(scored ? 'goal' : 'click');
  const hk = s.homeKicks.length, ak = s.awayKicks.length;
  if (hk === ak && hk >= 5 && s.homeScore !== s.awayScore) concludeShootout();
  else if (hk <= 5 && ak <= 5 && (s.homeScore > s.awayScore + (5 - ak) || s.awayScore > s.homeScore + (5 - hk))) concludeShootout();
}
function concludeShootout() {
  const s = shootoutState; $('btnTakePenalty').disabled = true;
  const winner = s.homeScore > s.awayScore ? s.homeClub : s.awayClub; s.match.penWinner = winner.id; cupOutcome(s.match);
  setTimeout(() => {
    $('shootoutModal').style.display = 'none'; s.active = false; const w = getWeek(); if (w) w.pendingPens = false;
    alert(`🏆 ${winner.name} win ${s.homeScore}-${s.awayScore} on penalties!`); saveGame(); renderAll();
    const lm = userLeagueMatch(); showResultModal(lm || s.match);
  }, 1200);
}

/* ---------- deadline day ---------- */
function checkDeadlineDayTrigger() {
  if ((state.currentWeek === 4 || state.currentWeek === 22) && !state.deadlineDaysCompleted[state.currentWeek]) { deadlineHour = 12; updateDeadlineModalUI(); $('deadlineModal').style.display = 'flex'; playSound('whistle'); return true; }
  return false;
}
function updateDeadlineModalUI() {
  $('deadlineClockDisplay').innerText = `${12 - deadlineHour + 11}:00 (${deadlineHour}h left)`;
  const hd = $('deadlineOfferHeadline'), dt = $('deadlineOfferDetails'), bt = $('deadlineActionButtons');
  if (pendingAIBid) {
    hd.innerText = `🚨 Bid: £${pendingAIBid.fee.toFixed(1)}M from ${pendingAIBid.buyer}`; dt.innerHTML = `<b>${pendingAIBid.buyer}</b> offer <b>£${pendingAIBid.fee.toFixed(1)}M</b> for <b>${pendingAIBid.player.name}</b>.`;
    bt.style.display = 'flex'; bt.innerHTML = `<button class="btn-swap-pill" style="background:#10b981;color:#fff" onclick="acceptDeadlineBid()">Accept</button><button class="btn-swap-pill" style="background:#ef4444;color:#fff" onclick="rejectDeadlineBid()">Reject</button>`;
  } else { hd.innerText = 'Transfer Market Monitoring'; dt.innerText = 'No bids right now. Advance the clock to hear rival enquiries.'; bt.style.display = 'none'; }
}
function advanceDeadlineHour() {
  deadlineHour--;
  if (Math.random() < 0.45 && !pendingAIBid) {
    const club = getCurrentUserClub(), t = pick(club.players), b = pick(state.clubs.filter(c => c.id !== club.id));
    pendingAIBid = { player: t, buyer: b.name, fee: +(t.val * (1.15 + Math.random() * 0.35)).toFixed(1) };
  }
  if (deadlineHour <= 0) { closeDeadlineDay(); return; } updateDeadlineModalUI();
}
function acceptDeadlineBid() {
  if (!pendingAIBid) return; const club = getCurrentUserClub(), p = pendingAIBid.player;
  if (club.players.length <= 14) { alert('Squad too thin to sell.'); return; }
  club.budget += pendingAIBid.fee; club.players = club.players.filter(x => x.id !== p.id); fixStarters(club);
  state.manager.fansApproval = Math.max(20, state.manager.fansApproval - 2);
  addNewsStory('Deadline Day', `${p.name} joins ${pendingAIBid.buyer} for £${pendingAIBid.fee.toFixed(1)}M`, 'Deal completed.', true);
  pendingAIBid = null; saveGame(); renderAll(); updateDeadlineModalUI();
}
function rejectDeadlineBid() { pendingAIBid = null; updateDeadlineModalUI(); }
function closeDeadlineDay() {
  state.deadlineDaysCompleted[state.currentWeek] = true; pendingAIBid = null; $('deadlineModal').style.display = 'none';
  addNewsStory('Window Closed', 'TRANSFER WINDOW SLAMS SHUT', 'Squads are locked in.', true); saveGame(); renderAll();
}
function fixStarters(club) {
  while (club.players.filter(p => p.starter).length < 11) { const n = club.players.find(p => !p.starter); if (!n) break; n.starter = true; }
}

/* ---------- tactics ---------- */
function changeFormation(f) { if (!FORMATIONS[f]) return; state.currentFormation = f; autoPickBestXI(); }
function autoPickBestXI() {
  const club = getCurrentUserClub(), tpl = FORMATIONS[state.currentFormation] || FORMATIONS['4-3-3'];
  club.players.forEach(p => p.starter = false);
  const pool = [...club.players].sort((a, b) => (a.inj > 0) - (b.inj > 0) || b.ovr * b.con - a.ovr * a.con), picked = [];
  tpl.forEach(slot => { let i = pool.findIndex(p => p.naturalPos === slot.posType); if (i < 0) i = 0; picked.push(pool.splice(i, 1)[0]); });
  picked.forEach((p, i) => { p.starter = true; p.role = tpl[i].duty; });
  club.players = [...picked, ...pool]; cancelPlayerSwap(); saveGame(); renderTactics(); updateHeaderClubDisplay(); playSound('whistle');
}
function handlePlayerSelect(id) {
  const club = getCurrentUserClub();
  if (!selectedPlayerSwapId) {
    selectedPlayerSwapId = id; const p = club.players.find(x => x.id === id);
    $('swapNotificationText').innerHTML = `🔄 <b>${p.name}</b> selected — tap another player to swap`; $('swapNotificationBar').style.display = 'flex'; renderTactics(); playSound('click'); return;
  }
  if (selectedPlayerSwapId === id) { cancelPlayerSwap(); return; }
  const i = club.players.findIndex(x => x.id === selectedPlayerSwapId), j = club.players.findIndex(x => x.id === id);
  if (i >= 0 && j >= 0) {
    const a = club.players[i], b = club.players[j]; [a.starter, b.starter] = [b.starter, a.starter]; [a.role, b.role] = [b.role, a.role]; club.players[i] = b; club.players[j] = a;
    club.players = [...club.players.filter(p => p.starter), ...club.players.filter(p => !p.starter)];
  }
  cancelPlayerSwap(); saveGame(); renderTactics(); updateHeaderClubDisplay(); playSound('whistle');
}
function cancelPlayerSwap() { selectedPlayerSwapId = null; $('swapNotificationBar').style.display = 'none'; renderTactics(); }
function openContractModal(id) {
  const p = getCurrentUserClub().players.find(x => x.id === id); if (!p) return; activeContractTarget = p;
  $('contractModalDetails').innerHTML = `<p><b>${p.name}</b> (${p.naturalPos} • OVR ${p.ovr})</p><p>Contract: ${p.contract} yr(s) • Wage £${Math.round(p.wage * 1000)}k/w</p><p style="color:var(--text-muted);margin-top:8px">An extension adds years, raises wages 10% and sets morale to Superb.</p>`;
  $('contractModal').style.display = 'flex';
}
function confirmContractOffer(y) {
  if (!activeContractTarget) return; activeContractTarget.contract += y; activeContractTarget.wage = +(activeContractTarget.wage * 1.1).toFixed(3); activeContractTarget.morale = 'Superb';
  closeContractModal(); saveGame(); renderAll(); playSound('cheer');
}
function closeContractModal() { activeContractTarget = null; $('contractModal').style.display = 'none'; }

function renderTactics() {
  const club = getCurrentUserClub(), tpl = FORMATIONS[state.currentFormation] || FORMATIONS['4-3-3'];
  const st = club.players.filter(p => p.starter), bench = club.players.filter(p => !p.starter);
  $('formationSelect').value = state.currentFormation;
  const nodes = $('pitchNodesWrapper'); nodes.innerHTML = '';
  st.forEach((p, i) => {
    const t = tpl[i] || { x: 50, y: 50, role: TAG[p.naturalPos], duty: p.role }, n = document.createElement('div');
    n.className = `pitch-node ${selectedPlayerSwapId === p.id ? 'selected-for-swap' : ''}`; n.style.left = t.x + '%'; n.style.top = t.y + '%'; n.onclick = () => handlePlayerSelect(p.id);
    n.innerHTML = `<div class="pitch-kit">${i + 1}<div class="pitch-role-tag">${t.role}</div></div><div class="pitch-name-card"><div class="p-name">${p.name.split(' ').pop()} ${p.inj > 0 ? '🚑' : ''}</div><div class="p-role">${p.ovr} • ${p.con}%</div></div>`; nodes.appendChild(n);
  });
  const mor = m => m === 'Superb' ? '😄 <span style="color:#10b981">Superb</span>' : m === 'Good' ? '🙂 <span style="color:#38bdf8">Good</span>' : m === 'Fair' ? '😐 <span style="color:#f59e0b">Fair</span>' : '😠 <span style="color:#ef4444">Unhappy</span>';
  const row = (p, tag, cls) => {
    const sel = selectedPlayerSwapId === p.id, cc = p.con > 80 ? '#10b981' : p.con > 65 ? '#f59e0b' : '#ef4444', tr = document.createElement('tr');
    tr.className = `fm-row ${sel ? 'selected-for-swap' : ''}`; tr.onclick = e => { if (e.target.tagName !== 'BUTTON') handlePlayerSelect(p.id); };
    tr.innerHTML = `<td><span class="badge-pick ${cls}">${tag}</span></td><td><span class="role-badge">${p.role}</span></td><td><b>${p.name}</b>${p.inj > 0 ? `<span class="injury-badge">INJ ${p.inj}w</span>` : ''}</td><td>${p.age}</td><td><b style="color:var(--gold)">${p.ovr}</b></td>
      <td><div class="condition-bar"><div class="condition-fill" style="width:${p.con}%;background:${cc}"></div></div><span style="font-size:.72rem;font-weight:800;color:${cc}">${p.con}%</span></td><td>${mor(p.morale)}</td>
      <td style="color:${p.contract <= 1 ? '#ef4444' : '#fff'};font-weight:800">${p.contract} yr</td><td>£${Math.round(p.wage * 1000)}k/w</td>
      <td style="display:flex;gap:4px"><button class="btn-swap-pill" onclick="handlePlayerSelect('${p.id}')">${sel ? 'Cancel' : 'Swap ⇅'}</button><button class="btn-swap-pill" style="background:#334155" onclick="openContractModal('${p.id}')">📝</button></td>`;
    return tr;
  };
  const sb = $('startersTableBody'); sb.innerHTML = ''; st.forEach((p, i) => sb.appendChild(row(p, (tpl[i] || {}).role || p.naturalPos, 'pick-starter')));
  const bb = $('benchTableBody'); bb.innerHTML = ''; bench.forEach((p, i) => bb.appendChild(row(p, 'S' + (i + 1), 'pick-sub')));
}

/* ---------- matchday ---------- */
function initPitchCanvas() { const c = $('matchPitchCanvas'); pitchEngine.ctx = c.getContext('2d'); c.width = 800; c.height = 480; }
function getFormationCoords(formationKey, isAway = false) {
  const tpl = FORMATIONS[formationKey] || FORMATIONS['4-3-3'];
  const pitchW = 800;
  const pitchH = 480;

  return tpl.map((slot) => {
    let normX = ((100 - slot.y) / 100) * (pitchW * 0.42) + 40;
    let normY = (slot.x / 100) * (pitchH - 80) + 40;
    if (isAway) normX = pitchW - normX;
    return { x: Math.round(normX), y: Math.round(normY), role: slot.role };
  });
}

function setup2DPlayers(h, a) {
  initPitchCanvas();
  pitchEngine.homeClubId = h.id;
  pitchEngine.awayClubId = a.id;
  pitchEngine.homeColor = h.col;
  pitchEngine.awayColor = a.col === h.col ? '#ef4444' : a.col;

  const homeFormation = (h.id === state.userClubId) ? state.currentFormation : '4-3-3';
  const awayFormation = (a.id === state.userClubId) ? state.currentFormation : '4-2-3-1';

  const homeCoords = getFormationCoords(homeFormation, false);
  const awayCoords = getFormationCoords(awayFormation, true);

  pitchEngine.homePlayers = homeCoords.map((pos, i) => ({
    num: i + 1,
    baseX: pos.x,
    baseY: pos.y,
    x: pos.x,
    y: pos.y,
    color: pitchEngine.homeColor
  }));

  pitchEngine.awayPlayers = awayCoords.map((pos, i) => ({
    num: i + 1,
    baseX: pos.x,
    baseY: pos.y,
    x: pos.x,
    y: pos.y,
    color: pitchEngine.awayColor
  }));

  pitchEngine.ball = { x: 400, y: 240, targetX: 400, targetY: 240 };
  draw2DPitch();
}
function draw2DPitch() {
  const { ctx, w, h } = pitchEngine; if (!ctx) return;
  ctx.fillStyle = '#235d31'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#1b4926'; for (let i = 0; i < 10; i += 2) ctx.fillRect(i * 80, 0, 80, h);
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2.5; ctx.strokeRect(16, 16, w - 32, h - 32);
  ctx.beginPath(); ctx.moveTo(w / 2, 16); ctx.lineTo(w / 2, h - 16); ctx.stroke(); ctx.beginPath(); ctx.arc(w / 2, h / 2, 65, 0, 7); ctx.stroke();
  ctx.strokeRect(16, h / 2 - 105, 115, 210); ctx.strokeRect(w - 131, h / 2 - 105, 115, 210);
  [...pitchEngine.homePlayers, ...pitchEngine.awayPlayers].forEach(p => {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 9.5, 0, 7); ctx.fill(); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 7.8, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.num, p.x, p.y + 0.5);
  });
  const b = pitchEngine.ball; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 5.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2; ctx.stroke();
}
function update2DPitchPhysics() {
  const b = pitchEngine.ball; b.x += (b.targetX - b.x) * 0.15; b.y += (b.targetY - b.y) * 0.15;
  [...pitchEngine.homePlayers, ...pitchEngine.awayPlayers].forEach(p => {
    const dx = b.x - p.baseX, dy = b.y - p.baseY, d = Math.hypot(dx, dy) || 1, inf = Math.min(38, d * 0.28);
    p.x += (p.baseX + dx / d * inf - p.x) * 0.1; p.y += (p.baseY + dy / d * inf - p.y) * 0.1;
  }); draw2DPitch();
}
function setSimSpeed(s) { simSpeedMultiplier = s; $('spd1').className = `btn-speed ${s === 1 ? 'active' : ''}`; $('spd3').className = `btn-speed ${s === 3 ? 'active' : ''}`; }
function triggerInstantSim() { simSpeedMultiplier = 25; }
function triggerTouchlineShout(t) {
  matchLiveState.activeShout = t; matchLiveState.shoutExpireMin = (pitchEngine.currentMinute || 0) + 12;
  const L = { DEMAND_MORE: '🔥 Demand More', TIGHTEN_UP: '🛡️ Tighten Up', PUSH_FORWARD: '⚡ Push Forward', WASTE_TIME: '⏱️ Waste Time' };
  $('activeShoutBadge').innerText = L[t] || ''; $('commentaryFeed').insertAdjacentHTML('afterbegin', `<div class="comm-line" style="border-left-color:#f59e0b">📢 Shout: ${L[t]}</div>`); playSound('whistle');
}
function addTimelineEvent(type, text) {
  matchLiveState.timelineEvents.push({ type, text }); const bar = $('matchTimelineBar'); if (matchLiveState.timelineEvents.length === 1) bar.innerHTML = '';
  const i = document.createElement('div'); i.className = `timeline-event-item ${type}`; i.innerText = text; bar.appendChild(i);
}
function populateInMatchSubChips() {
  const c = $('benchSubChipsList'); c.innerHTML = '';
  getCurrentUserClub().players.filter(p => !p.starter && !p.inj).forEach(p => {
    const d = document.createElement('div'); d.className = 'sub-chip'; d.innerHTML = `<span>${p.name} (${p.naturalPos} • ${p.ovr})</span><b style="color:#10b981">Sub In</b>`; d.onclick = () => makeLiveMatchSub(p.id); c.appendChild(d);
  });
}
function makeLiveMatchSub(id) {
  if (matchLiveState.subsUsed >= matchLiveState.maxSubs) { alert('All 5 substitutions used.'); return; }
  const club = getCurrentUserClub(), inP = club.players.find(x => x.id === id), outP = club.players.filter(p => p.starter && p.naturalPos !== 'GK').sort((a, b) => a.con - b.con)[0];
  if (!inP || !outP) return; inP.starter = true; outP.starter = false; inP.role = outP.role; matchLiveState.subsUsed++;
  $('subsRemainingText').innerText = matchLiveState.maxSubs - matchLiveState.subsUsed; addTimelineEvent('sub', `🔄 ${pitchEngine.currentMinute}' ${inP.name} on for ${outP.name}`); populateInMatchSubChips(); playSound('click');
}
function startMatchdaySim() {
  const m = getActiveUserMatch();
  if (!m || m.played) return;
  const btn = $('btnStartMatch');
  btn.disabled = true;
  const h = clubById(m.home), a = clubById(m.away), feed = $('commentaryFeed');
  feed.innerHTML = '';
  $('matchTimelineBar').innerHTML = '';
  matchLiveState.timelineEvents = [];
  matchLiveState.yellows = {};
  matchLiveState.reds = [];
  m.scorers = [];
  let min = 0, hs = 0, as = 0;
  clearTimeout(matchSimInterval);
  cancelAnimationFrame(animFrameId);

  (function loop() {
    update2DPitchPhysics();
    if (min < 90) animFrameId = requestAnimationFrame(loop);
  })();

  const goal = (club, isHome) => {
    const sc = pickScorer(club);
    sc.goals++;
    isHome ? hs++ : as++;
    m.scorers.push({ team: club.name, player: sc.name, min });
    pitchEngine.ball.targetX = isHome ? 782 : 18;
    pitchEngine.ball.targetY = 240;
    feed.insertAdjacentHTML('afterbegin', `<div class="comm-line goal">⚽ ${min}' GOAL! ${club.name} (${sc.name}) [${hs}-${as}]</div>`);
    addTimelineEvent('goal', `⚽ ${min}' ${sc.name.split(' ').pop()} (${club.id})`);
    playSound('goal');
    $('sbScore').innerText = `${hs} - ${as}`;
  };

  const getRandomActivePlayer = (club) => {
    const active = club.players.filter(p => p.starter && !matchLiveState.reds.includes(p.id));
    return active.length ? pick(active) : null;
  };

  const triggerCard = (club) => {
    const p = getRandomActivePlayer(club);
    if (!p) return;
    const currentYellows = matchLiveState.yellows[p.id] || 0;

    if (currentYellows === 1 || Math.random() < 0.08) {
      // Red card (second yellow or straight red)
      matchLiveState.reds.push(p.id);
      feed.insertAdjacentHTML('afterbegin', `<div class="comm-line redcard">🟥 ${min}' RED CARD! ${p.name} (${club.name}) is sent off!</div>`);
      addTimelineEvent('red', `🟥 ${min}' ${p.name.split(' ').pop()}`);
      playSound('whistle');
    } else {
      // Yellow card
      matchLiveState.yellows[p.id] = 1;
      feed.insertAdjacentHTML('afterbegin', `<div class="comm-line card">🟨 ${min}' Booking: ${p.name} (${club.name}) receives a yellow card.</div>`);
      addTimelineEvent('yellow', `🟨 ${min}' ${p.name.split(' ').pop()}`);
      playSound('click');
    }
  };

  const triggerMatchInjury = (club) => {
    const p = getRandomActivePlayer(club);
    if (!p || p.inj > 0) return;
    p.inj = R(1, 3);
    p.con = Math.max(30, p.con - 35);
    feed.insertAdjacentHTML('afterbegin', `<div class="comm-line injury">🚑 ${min}' INJURY: ${p.name} (${club.name}) is down in pain!</div>`);
    addTimelineEvent('injury', `🚑 ${min}' ${p.name.split(' ').pop()}`);
    playSound('whistle');
    if (club.id === state.userClubId) {
      populateInMatchSubChips();
    }
  };

  function tick() {
    min += 2;
    pitchEngine.currentMinute = min;
    $('sbMinute').innerText = `${min}'`;

    if (matchLiveState.activeShout && min >= matchLiveState.shoutExpireMin) {
      matchLiveState.activeShout = null;
      $('activeShoutBadge').innerText = '';
    }

    if (min % 4 === 0) {
      pitchEngine.ball.targetX = 140 + Math.random() * 520;
      pitchEngine.ball.targetY = 60 + Math.random() * 360;
    }

    // Fatigue outfield starters slightly during the game
    if (min % 10 === 0) {
      [h, a].forEach(club => club.players.forEach(p => {
        if (p.starter) p.con = Math.max(40, p.con - 1);
      }));
    }

    // Disciplinary & Injury Checks (~3.5% chance per tick for foul, ~1.2% for knock)
    if (Math.random() < 0.035) {
      triggerCard(Math.random() < 0.5 ? h : a);
    }
    if (Math.random() < 0.012) {
      triggerMatchInjury(Math.random() < 0.5 ? h : a);
    }

    const userHome = h.id === state.userClubId;
    const s = matchLiveState.activeShout;
    const boost = (s === 'DEMAND_MORE' || s === 'PUSH_FORWARD') ? 0.03 : 0;
    const guard = s === 'TIGHTEN_UP' ? 0.025 : 0;

    // Calculate ratings with 10-man penalty if a red card has occurred
    const hS = computeClubAttributes(h);
    const aS = computeClubAttributes(a);
    const homeRedPenalty = matchLiveState.reds.some(id => h.players.some(p => p.id === id)) ? 8 : 0;
    const awayRedPenalty = matchLiveState.reds.some(id => a.players.some(p => p.id === id)) ? 8 : 0;

    const netHomeAtt = Math.max(30, (hS.att + hS.mid) / 2 - homeRedPenalty);
    const netHomeDef = Math.max(30, (hS.def + hS.mid) / 2 - homeRedPenalty);
    const netAwayAtt = Math.max(30, (aS.att + aS.mid) / 2 - awayRedPenalty);
    const netAwayDef = Math.max(30, (aS.def + aS.mid) / 2 - awayRedPenalty);

    const pH = Math.max(0.01, (0.028 + (netHomeAtt - netAwayDef) / 1400 + 0.004) + (userHome ? boost : -guard));
    const pA = Math.max(0.01, (0.024 + (netAwayAtt - netHomeDef) / 1400) + (userHome ? -guard : boost));

    if (Math.random() < pH * 1.35) goal(h, true);
    if (Math.random() < pA * 1.35) goal(a, false);

    if (min >= 90) {
      cancelAnimationFrame(animFrameId);
      btn.disabled = false;
      applyResult(m, hs, as, true);
      $('sbMinute').innerText = 'FULL TIME';
      feed.insertAdjacentHTML('afterbegin', `<div class="comm-line" style="font-weight:800">🏁 Full-time: ${h.name} ${hs}-${as} ${a.name}</div>`);

      if (m.type === 'CUP') {
        if (hs === as) {
          launchPenaltyShootout(m, h, a);
          return;
        } else {
          cupOutcome(m);
        }
      }

      $('btnAdvanceMaster').className = 'btn-advance-master btn-continue-mode';$('btnAdvanceText').innerText = `CONTINUE TO WK ${state.currentWeek + 1}`;
      saveGame();
      renderStandingsTable(getCurrentUserClub().div);
      playSound('whistle');
      return;
    }
    matchSimInterval = setTimeout(tick, Math.max(12, 120 / simSpeedMultiplier));
  }
  tick();
}
  function tick() {
    min += 2; pitchEngine.currentMinute = min; $('sbMinute').innerText = `${min}'`;
    if (matchLiveState.activeShout && min >= matchLiveState.shoutExpireMin) { matchLiveState.activeShout = null; $('activeShoutBadge').innerText = ''; }
    if (min % 4 === 0) { pitchEngine.ball.targetX = 140 + Math.random() * 520; pitchEngine.ball.targetY = 60 + Math.random() * 360; }
    const userHome = h.id === state.userClubId, s = matchLiveState.activeShout, boost = (s === 'DEMAND_MORE' || s === 'PUSH_FORWARD') ? 0.03 : 0, guard = s === 'TIGHTEN_UP' ? 0.025 : 0;
    const hS = computeClubAttributes(h), aS = computeClubAttributes(a);
    const pH = Math.max(0.01, (0.028 + ((hS.att + hS.mid) / 2 - (aS.def + aS.mid) / 2) / 1400 + 0.004) + (userHome ? boost - 0 : -guard * 0)), pA = Math.max(0.01, 0.024 + ((aS.att + aS.mid) / 2 - (hS.def + hS.mid) / 2) / 1400);
    const bonusH = userHome ? boost - 0 : -guard, bonusA = userHome ? -guard : boost;
    if (Math.random() < pH * 1.4 + bonusH * 0.3) goal(h, true); if (Math.random() < pA * 1.4 + bonusA * 0.3) goal(a, false);
    if (min >= 90) {
      cancelAnimationFrame(animFrameId); btn.disabled = false; applyResult(m, hs, as, true); $('sbMinute').innerText = 'FULL TIME';
      feed.insertAdjacentHTML('afterbegin', `<div class="comm-line" style="font-weight:800">🏁 Full-time: ${h.name} ${hs}-${as} ${a.name}</div>`);
      $('btnAdvanceMaster').className = 'btn-advance-master btn-continue-mode'; $('btnAdvanceText').innerText = `CONTINUE TO WK ${state.currentWeek + 1}`; saveGame(); renderStandingsTable(getCurrentUserClub().div); playSound('whistle'); return;
    }
    matchSimInterval = setTimeout(tick, Math.max(12, 120 / simSpeedMultiplier));
  }
  tick();
}

/* ---------- tables / views ---------- */
function renderStandingsTable(div) {
  state.activeStandingsTab = div; for (let i = 0; i <= 3; i++) $(`tabTier${i}`).className = `league-tab-btn ${i === div ? 'active' : ''}`;
  const body = $('leagueTableBody'); body.innerHTML = '';
  [...(state.standings[div] || [])].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).forEach((r, i) => {
    const tr = document.createElement('tr'); tr.className = 'fm-row'; if (r.id === state.userClubId) tr.style.background = 'rgba(0,210,255,.15)';
    const col = div === 0 ? (i < 4 ? '#10b981' : i >= 17 ? '#ef4444' : '') : (i < 2 ? '#10b981' : i < 6 ? '#f59e0b' : i >= r.length ? '' : '');
    tr.innerHTML = `<td><b>${i + 1}</b></td><td style="display:flex;align-items:center;gap:8px">${createBadgeHtml(r.id, 20)}<b>${r.name}</b>${r.id === state.userClubId ? ' ⭐' : ''}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gd > 0 ? '+' + r.gd : r.gd}</td><td><b>${r.pts}</b></td>`;
    if (col) tr.firstElementChild.style.borderLeft = `3px solid ${col}`; body.appendChild(tr);
  });
  const all = []; state.clubs.filter(c => c.div === div).forEach(c => c.players.forEach(p => all.push({ ...p, clubName: c.name, clubId: c.id })));
  const fill = (id, list, key, color) => { const b = $(id); b.innerHTML = ''; list.forEach(p => { const tr = document.createElement('tr'); tr.innerHTML = `<td><b>${p.name}</b></td><td style="display:flex;align-items:center;gap:4px">${createBadgeHtml(p.clubId, 16)}<span>${p.clubName}</span></td><td><b style="color:${color}">${p[key] || 0}</b></td>`; b.appendChild(tr); }); };
  fill('goldenBootBody', [...all].sort((a, b) => b.goals - a.goals).slice(0, 5), 'goals', 'var(--gold)');
  fill('goldenGloveBody', all.filter(p => p.naturalPos === 'GK').sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 5), 'cleanSheets', '#38bdf8');
}
function renderMatchdayView() {
  const m = getActiveUserMatch(), w = getWeek();
  if (m) {
    const h = clubById(m.home), a = clubById(m.away);
    $('sbHomeBadgeWrap').innerHTML = createBadgeHtml(h.id, 40); $('sbAwayBadgeWrap').innerHTML = createBadgeHtml(a.id, 40); $('sbHomeName').innerText = h.name; $('sbAwayName').innerText = a.name;
    $('sbScore').innerText = m.played ? `${m.homeGoals} - ${m.awayGoals}` : '0 - 0'; $('sbMinute').innerText = m.played ? 'FULL TIME' : 'PRE-MATCH'; $('btnStartMatch').disabled = m.played;
    if (!m.played) $('commentaryFeed').innerHTML = `<div class="comm-line">Week ${state.currentWeek}: ${h.name} vs ${a.name}. Click "Start Match" or "Advance Week".</div>`;
    setup2DPlayers(h, a); populateInMatchSubChips();
  } else { $('sbScore').innerText = '-'; $('sbMinute').innerText = 'NO MATCH'; $('btnStartMatch').disabled = true; $('commentaryFeed').innerHTML = '<div class="comm-line">No league fixture for your club this week.</div>'; }
  const g = $('aroundGroundsList'); g.innerHTML = '';
  if (w) w.matches.filter(x => x.div === getCurrentUserClub().div || (x.type === 'CUP' && (x.home === state.userClubId || x.away === state.userClubId))).forEach(x => {
    const h = clubById(x.home), a = clubById(x.away), r = document.createElement('div'); r.className = 'grounds-match-row';
    r.innerHTML = `<div class="team-home"><span>${h.name}</span>${createBadgeHtml(h.id, 18)}</div><div class="match-vs-box">${x.played ? `${x.homeGoals}-${x.awayGoals}` : 'v'}</div><div class="team-away">${createBadgeHtml(a.id, 18)}<span>${a.name}</span></div>`; g.appendChild(r);
  });
}
function renderCupsTab() {
  ensureCupTie(); const c = userCupMatch(), d = $('cupFixtureDisplay');
  d.innerHTML = c ? `<div style="font-weight:800;color:var(--accent);margin-bottom:6px">${c.cupName}${c.final ? ' FINAL' : ''}</div><div style="display:flex;align-items:center;gap:8px">${createBadgeHtml(c.home, 24)}<b>${clubById(c.home).name}</b> vs <b>${clubById(c.away).name}</b>${createBadgeHtml(c.away, 24)}</div><div style="font-size:.75rem;color:var(--text-muted);margin-top:6px">${c.played ? `Result: ${c.homeGoals}-${c.awayGoals}` : 'Played when you advance the week. Penalties if level.'}</div>` :
    `No cup tie this week.<br><span style="color:var(--text-muted);font-size:.75rem">Carabao Cup: ${state.cups.carabaoAlive ? 'still in' : 'out'} • FA Cup: ${state.cups.faAlive ? 'still in' : 'out'} (ties in weeks 7, 15, 23, 31)</span>`;
}
function renderFacilities() {
  const med = state.medicalFacilityLevel || 1, ac = state.academyFacilityLevel || 1;
  $('facilitiesList').innerHTML = `<div style="background:var(--bg-panel);padding:14px;border-radius:8px"><h4>🏟️ Stand Expansion</h4><p style="font-size:.72rem;color:var(--text-muted);margin:4px 0">+2,500 seats, more gate revenue.</p><button class="btn-swap-pill" onclick="upgradeStand(2500,4.0)">Expand (£4.0M)</button></div>
  <div style="background:var(--bg-panel);padding:14px;border-radius:8px"><h4>🏥 Medical Centre (Lvl ${med})</h4><p style="font-size:.72rem;color:var(--text-muted);margin:4px 0">Bench recovery +${med * 3}% weekly.</p><button class="btn-swap-pill" onclick="upgradeMedicalCentre()">Upgrade (£2.5M)</button></div>
  <div style="background:var(--bg-panel);padding:14px;border-radius:8px"><h4>🌱 Youth Academy (Lvl ${ac})</h4><p style="font-size:.72rem;color:var(--text-muted);margin:4px 0">Better wonderkids each spring.</p><button class="btn-swap-pill" onclick="upgradeAcademyFacility()">Upgrade (£3.0M)</button></div>`;
}
function spend(cost) { const c = getCurrentUserClub(); if (c.budget < cost) { alert(`Insufficient budget (£${cost}M needed).`); return false; } c.budget -= cost; return true; }
function upgradeMedicalCentre() { if (spend(2.5)) { state.medicalFacilityLevel++; saveGame(); renderAll(); renderFacilities(); } }
function upgradeAcademyFacility() { if (spend(3.0)) { state.academyFacilityLevel++; saveGame(); renderAll(); renderFacilities(); } }
function upgradeStand(s, c) { if (spend(c)) { state.stadiumCapacityBonus += s; saveGame(); renderAll(); renderFacilities(); } }
function renderManagerOffice() {
  const m = state.manager, club = getCurrentUserClub();
  $('managerProfileSummary').innerHTML = `<p><b>Manager:</b> ${m.name}</p><p><b>Club:</b> ${club.name}</p><p><b>Record:</b> ${m.wins}W ${m.draws}D ${m.losses}L (${m.matches} played)</p><p><b>Win rate:</b> ${m.matches ? Math.round(m.wins / m.matches * 100) : 0}%</p><p><b>Weekly wages:</b> £${Math.round(computeClubWeeklyWageBill(club) * 1000).toLocaleString()}k</p><p><b>Board:</b> ${m.confidence}% • <b>Fans:</b> ${m.fansApproval}%</p>`;
}
function renderHonours() {
  const m = state.manager, box = (i, v, l) => `<div style="background:var(--bg-panel);padding:14px;border-radius:8px;text-align:center;min-width:120px"><div style="font-size:1.8rem">${i}</div><div style="font-weight:800;color:var(--gold)">${v || 0}</div><div style="font-size:.72rem;color:var(--text-muted)">${l}</div></div>`;
  $('honoursList').innerHTML = box('🏅', m.motmAwards, 'Manager of Month') + box('🏆', m.faCups, 'FA Cups') + box('🏆', m.carabaoCups, 'Carabao Cups');
}

/* ---------- news / academy ---------- */
function generateInitialNews() {
  state.newsFeed = [{ tag: 'Season Kick-Off', breaking: true, headline: `${state.seasonYear}/${String(state.seasonYear + 1).slice(-2)} season underway: 92 clubs battle for glory`, body: 'Boards demand results across the pyramid.', time: 'Week 1' }];
}
function addNewsStory(tag, headline, body, breaking = false) { state.newsFeed.unshift({ tag, headline, body, breaking, time: `Week ${state.currentWeek}` }); if (state.newsFeed.length > 25) state.newsFeed.pop(); }
function renderNewsFeed() {
  const f = $('newsFeedList'); f.innerHTML = '';
  state.newsFeed.forEach(n => { const c = document.createElement('div'); c.className = `news-card ${n.breaking ? 'breaking' : ''}`; c.innerHTML = `<div style="display:flex;justify-content:space-between"><span style="font-size:.65rem;font-weight:800;color:var(--accent);text-transform:uppercase">${n.tag}</span><span style="font-size:.68rem;color:var(--text-muted)">${n.time}</span></div><div style="font-weight:800">${n.headline}</div><div style="font-size:.8rem;color:#cbd5e1">${n.body}</div>`; f.appendChild(c); });
}
function generateYouthIntake(announce) {
  const lvl = state.academyFacilityLevel || 1, n = R(3, 5);
  state.youthProspects = Array.from({ length: n }, (_, i) => { const pos = pick(['GK', 'DEF', 'MID', 'FWD']), ovr = 52 + lvl * 2 + R(0, 6); return { id: `youth_${Date.now()}_${i}`, name: pick(FIRSTNAMES) + ' ' + pick(SURNAMES), naturalPos: pos, nat: 'ENG', age: R(16, 17), ovr, potential: Math.min(94, ovr + 16 + R(0, 10)), wage: 0.005, contract: 3, signed: false }; });
  if (announce) { state.youthIntakeCompleted = true; addNewsStory('Academy Day', `Spring intake: ${n} new prospects at ${getCurrentUserClub().name}`, 'Inspect them in the Academy tab.', true); }
}
function renderAcademyTab() {
  const g = $('academyProspectsGrid'); g.innerHTML = ''; $('academyIntakeStatusTag').innerText = state.youthIntakeCompleted ? 'Spring Intake Active' : `Next intake: Week 30 (now Wk ${state.currentWeek})`;
  if (!state.youthIntakeCompleted) { g.innerHTML = '<p style="color:var(--text-muted);font-size:.8rem">No prospects yet. The spring intake arrives in Week 30.</p>'; return; }
  state.youthProspects.forEach(p => { const c = document.createElement('div'); c.className = 'prospect-card'; c.innerHTML = `<div class="prospect-tag">${p.potential >= 88 ? '⭐ Wonderkid' : 'Prospect'}</div><div style="font-weight:900">${p.name}</div><div style="font-size:.75rem;color:var(--text-muted)">${p.naturalPos} • ${p.age} yrs</div><div style="display:flex;justify-content:space-between;font-size:.8rem"><span>Now <b style="color:var(--gold)">${p.ovr}</b></span><span>Potential <b style="color:#10b981">${p.potential}</b></span></div><button class="btn-swap-pill" style="margin-top:8px;background:${p.signed ? '#334155' : '#059669'};color:#fff" onclick="signAcademyProspect('${p.id}')">${p.signed ? 'Signed' : 'Sign (£5k/w)'}</button>`; g.appendChild(c); });
}
function signAcademyProspect(id) {
  const p = state.youthProspects.find(x => x.id === id); if (!p || p.signed) return; p.signed = true;
  getCurrentUserClub().players.push({ id: p.id, name: p.name, naturalPos: p.naturalPos, nat: p.nat, age: p.age, ovr: p.ovr, con: 100, role: ROLE[p.naturalPos], starter: false, val: +((p.ovr - 45) * 0.8).toFixed(1), wage: p.wage, contract: p.contract, morale: 'Superb', goals: 0, cleanSheets: 0, inj: 0 });
  saveGame(); renderAll(); renderAcademyTab(); playSound('cheer');
}

/* ---------- transfer market ---------- */
function initMarketFilterDropdowns() {
  $('filterMarketNation').innerHTML = ['ALL', 'ENG', 'SCO', 'WAL', 'IRL', 'NIR', ...NATS.slice(4)].map(n => `<option value="${n}">${n === 'ALL' ? 'All Nations' : n}</option>`).join(''); onMarketLeagueChange();
}
function onMarketLeagueChange() {
  const v = $('filterMarketLeague').value, t = $('filterMarketTeam'); t.innerHTML = '<option value="ALL">All Teams</option>';
  if (v !== 'ALL' && v !== 'SCOUT') state.clubs.filter(c => c.div === +v && c.id !== state.userClubId).forEach(c => { const o = document.createElement('option'); o.value = c.id; o.innerText = c.name; t.appendChild(o); });
  renderTransfers();
}
function resetMarketFilters() { $('marketSearchInput').value = ''; $('filterMarketLeague').value = 'ALL'; $('filterMarketPos').value = 'ALL'; $('filterMarketNation').value = 'ALL'; onMarketLeagueChange(); }
function toggleMarketSort(k) { if (marketSortKey === k) marketSortAsc = !marketSortAsc; else { marketSortKey = k; marketSortAsc = k === 'name' || k === 'clubName'; } renderTransfers(); }
function renderTransfers() {
  const club = getCurrentUserClub(); $('marketBudgetDisplay').innerText = `Available: £${club.budget.toFixed(1)}M`;
  ['name', 'naturalPos', 'nat', 'age', 'ovr', 'price', 'clubName'].forEach(k => { const e = $(`sort_${k}`); if (e) e.innerText = marketSortKey === k ? (marketSortAsc ? ' ▲' : ' ▼') : ''; });
  const q = $('marketSearchInput').value.toLowerCase().trim(), fl = $('filterMarketLeague').value, ft = $('filterMarketTeam').value, fp = $('filterMarketPos').value, fn = $('filterMarketNation').value;
  let pool = state.marketPlayers.map(p => ({
  id: p.id,
  name: p.name,
  naturalPos: p.naturalPos,
  nat: p.nat,
  age: p.age,
  ovr: p.ovr,
  price: p.price,
  clubName: p.club || (p.price === 0 ? 'Free Agent' : 'Foreign Club'),
  clubId: 'SCOUT',
  div: -1,
  scout: true
}));
  state.clubs.forEach(c => { if (c.id !== club.id) c.players.forEach(p => pool.push({ id: p.id, name: p.name, naturalPos: p.naturalPos, nat: p.nat, age: p.age, ovr: p.ovr, price: +(p.val * 1.15).toFixed(1), clubName: c.name, clubId: c.id, div: c.div, scout: false })); });
  if (q) pool = pool.filter(p => p.name.toLowerCase().includes(q)); if (fl === 'SCOUT') pool = pool.filter(p => p.scout); else if (fl !== 'ALL') pool = pool.filter(p => p.div === +fl);
  if (ft !== 'ALL') pool = pool.filter(p => p.clubId === ft); if (fp !== 'ALL') pool = pool.filter(p => p.naturalPos === fp); if (fn !== 'ALL') pool = pool.filter(p => p.nat === fn);
  pool.sort((a, b) => typeof a[marketSortKey] === 'string' ? (marketSortAsc ? a[marketSortKey].localeCompare(b[marketSortKey]) : b[marketSortKey].localeCompare(a[marketSortKey])) : (marketSortAsc ? a[marketSortKey] - b[marketSortKey] : b[marketSortKey] - a[marketSortKey]));
  const shown = pool.slice(0, 100); $('marketCountNote').innerText = `Showing ${shown.length} of ${pool.length}. Click headers to sort.`;
  $('transferMarketBody').innerHTML = shown.map(p => { const ok = club.budget >= p.price; return `<tr class="fm-row"><td><b>${p.name}</b></td><td><span class="role-badge">${p.naturalPos}</span></td><td>${p.nat}</td><td>${p.age}</td><td><b style="color:var(--gold)">${p.ovr}</b></td><td><b>£${p.price.toFixed(1)}M</b></td><td style="display:flex;align-items:center;gap:6px">${p.scout ? '' : createBadgeHtml(p.clubId, 18)}<span>${p.clubName}</span></td><td><button class="btn-swap-pill" style="${ok ? 'background:#059669;color:#fff' : 'opacity:.4'}" onclick="executeBuyPlayer('${p.id}',${p.scout},'${p.clubId}')">${ok ? 'Sign' : 'No funds'}</button></td></tr>`; }).join('');
  $('squadSellListBody').innerHTML = club.players.map(p => `<tr class="fm-row"><td><b>${p.name}</b>${p.starter ? ' <span style="font-size:.65rem;color:#10b981">[XI]</span>' : ''}</td><td><span class="role-badge" style="background:#475569">${p.naturalPos}</span></td><td>${p.age}</td><td><b style="color:var(--gold)">${p.ovr}</b></td><td><b style="color:#34d399">£${p.val.toFixed(1)}M</b></td><td><button class="btn-sell-pill" onclick="sellSquadPlayer('${p.id}')">Sell</button></td></tr>`).join('');
}
function executeBuyPlayer(id, scout, sellerId) {
  const club = getCurrentUserClub();
  if (scout) {
    const i = state.marketPlayers.findIndex(x => x.id === id); if (i < 0) return; const t = state.marketPlayers[i];
    if (club.budget < t.price) { alert('Insufficient budget.'); return; }
    if (!confirm(`Sign ${t.name} for £${t.price.toFixed(1)}M?`)) return; club.budget -= t.price; state.marketPlayers.splice(i, 1);
    club.players.push({ id: 'trans_' + Date.now() + R(0, 999), name: t.name, naturalPos: t.naturalPos, nat: t.nat, age: t.age, ovr: t.ovr, con: 100, role: ROLE[t.naturalPos], starter: false, val: t.price, wage: t.wage || 0.05, contract: t.contract || 3, morale: 'Superb', goals: 0, cleanSheets: 0, inj: 0 });
    addNewsStory('Done Deal', `${club.name} sign ${t.name} (£${t.price.toFixed(1)}M)`, 'Signing confirmed.', true);
  } else {
    const s = clubById(sellerId); if (!s) return; const i = s.players.findIndex(x => x.id === id); if (i < 0) return; const t = s.players[i], fee = +(t.val * 1.15).toFixed(1);
    if (club.budget < fee) { alert('Insufficient budget.'); return; } if (s.players.length <= 16) { alert(`${s.name} refuse: squad too thin.`); return; }
    if (!confirm(`Buy ${t.name} from ${s.name} for £${fee.toFixed(1)}M?`)) return; club.budget -= fee; s.budget += fee; s.players.splice(i, 1); fixStarters(s);
    club.players.push({ ...t, starter: false, inj: 0, con: 100, morale: 'Superb' }); addNewsStory('Done Deal', `${club.name} raid ${s.name} for ${t.name} (£${fee}M)`, 'Signing confirmed.', true);
  }
  state.manager.fansApproval = Math.min(99, state.manager.fansApproval + 3); saveGame(); renderAll(); renderTransfers(); playSound('cheer');
}
function sellSquadPlayer(id) {
  const club = getCurrentUserClub(); if (club.players.length <= 16) { alert('Squad too small. Sign replacements first.'); return; }
  const i = club.players.findIndex(x => x.id === id); if (i < 0) return; const p = club.players[i];
  if (!confirm(`Sell ${p.name} for £${p.val.toFixed(1)}M?`)) return; club.budget += p.val; club.players.splice(i, 1); fixStarters(club);
  state.manager.fansApproval = Math.max(20, state.manager.fansApproval - 2); addNewsStory('Departure', `${p.name} leaves ${club.name} (£${p.val.toFixed(1)}M)`, 'Sale agreed.', false); saveGame(); renderAll(); renderTransfers(); playSound('whistle');
}

/* ---------- season end ---------- */
const sortedDivs = () => { const s = {}; for (let d = 0; d <= 3; d++) s[d] = [...state.standings[d]].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf); return s; };
function showEndSeasonGala() {
  const s = sortedDivs(), mv = d => `<p><b>Up from ${DIV_NAMES[d + 1]}:</b> ${s[d + 1].slice(0, 3).map(r => r.name).join(', ')}</p><p><b>Down from ${DIV_NAMES[d]}:</b> ${s[d].slice(-3).map(r => r.name).join(', ')}</p>`;
  $('eosSummaryContent').innerHTML = `<div style="background:var(--bg-panel);padding:12px;border-radius:8px;margin-bottom:10px"><h3 style="color:var(--gold)">👑 Champions</h3>${[0, 1, 2, 3].map(d => `<p><b>${DIV_NAMES[d]}:</b> ${s[d][0].name}</p>`).join('')}</div><div style="background:var(--bg-panel);padding:12px;border-radius:8px"><h3 style="color:#38bdf8">📈 Movement</h3>${mv(0)}${mv(1)}${mv(2)}</div>`;
  $('endSeasonModal').style.display = 'flex'; playSound('cheer');
}
function closeEosModal() { $('endSeasonModal').style.display = 'none'; }
function executeNextSeasonTransition() {
  closeEosModal();
  const s = sortedDivs(), move = {};
  for (let d = 0; d <= 2; d++) {
    s[d].slice(-3).forEach(r => move[r.id] = d + 1);
    s[d + 1].slice(0, 3).forEach(r => move[r.id] = d);
  }
  state.clubs.forEach(c => {
    if (move[c.id] !== undefined) c.div = move[c.id];
  });

  state.seasonYear++;
  state.currentWeek = 1;
  state.deadlineDaysCompleted = {};
  state.youthIntakeCompleted = false;
  state.cups = { carabaoAlive: true, faAlive: true };

  let userReleasedCount = 0;

  // Age players, decrement contracts, and handle free agency
  state.clubs.forEach(c => {
    const retainedPlayers = [];

    c.players.forEach(p => {
      p.age++;
      p.con = 100;
      p.inj = 0;
      p.goals = 0;
      p.cleanSheets = 0;
      p.contract--; // Decrement contract year

      // Attribute aging curve
      if (p.age < 23) p.ovr += R(0, 2);
      else if (p.age > 31) p.ovr -= R(0, 2);
      p.val = Math.max(0.3, +((p.ovr - 50) * 0.75).toFixed(1));

      // Check for contract expiry
      if (p.contract <= 0) {
        // Player is now a Free Agent! Add them to the transfer pool with £0 fee
        state.marketPlayers.push({
          id: p.id,
          name: p.name,
          naturalPos: p.naturalPos,
          nat: p.nat,
          age: p.age,
          ovr: p.ovr,
          price: 0.0, // Free agent fee!
          club: 'Free Agent',
          wage: p.wage,
          contract: 2
        });

        if (c.id === state.userClubId) {
          userReleasedCount++;
        }
      } else {
        retainedPlayers.push(p);
      }
    });

    c.players = retainedPlayers;

    // Safety net: ensure club always maintains at least 15 players
    while (c.players.length < 16) {
      c.players.push(mkPlayer(SQUAD_ORDER[c.players.length % SQUAD_ORDER.length], c.str - 4, c.players.length, c.id));
    }
    fixStarters(c);
  });

  buildStandings();
  generateTrueRoundRobinFixtures();
  generateInitialNews();
  generateYouthIntake(false);
  saveGame();
  renderAll();

  if (userReleasedCount > 0) {
    addNewsStory('Contract Expiry', `${userReleasedCount} player(s) released as Free Agents`, 'Their contracts ran out and they departed the club.', false);
  }

  alert(`Welcome to the ${state.seasonYear}/${String(state.seasonYear + 1).slice(-2)} season!${userReleasedCount > 0 ? `\n\n📢 Note: ${userReleasedCount} player(s) left on a free transfer after their contracts expired.` : ''}`);
}

/* ---------- master render ---------- */
function updateHeaderClubDisplay() {
  const c = getCurrentUserClub(), s = computeClubAttributes(c);
  $('headerBadgeWrap').innerHTML = createBadgeHtml(c.id, 34); $('headerClubName').innerText = c.name; $('headerStadium').innerText = `${c.stadium} • Capacity: ${(c.cap + (state.stadiumCapacityBonus || 0)).toLocaleString()}`;
  $('statAttack').innerText = s.att; $('statMidfield').innerText = s.mid; $('statDefence').innerText = s.def; $('statOvr').innerText = s.ovr; $('headerWageBill').innerText = `£${Math.round(computeClubWeeklyWageBill(c) * 1000).toLocaleString()}k/w`;
}
function renderAll() {
  const club = getCurrentUserClub(); ensureCupTie();
  $('headerDivName').innerText = DIV_NAMES[club.div]; $('headerWeek').innerText = `Wk ${state.currentWeek} / ${state.totalWeeks}`;
  $('headerSeasonTag').innerText = `${state.seasonYear}/${String(state.seasonYear + 1).slice(-2)} Career • English Pyramid`;
  $('headerConfidence').innerText = `${state.manager.confidence}%`; $('headerFansApproval').innerText = `${state.manager.fansApproval}%`; $('headerBudget').innerText = `£${club.budget.toFixed(1)}M`;
  $('btnAudio').innerText = state.audioEnabled ? '🔊' : '🔇';
  const lm = getActiveUserMatch(), w = getWeek(), dl = (state.currentWeek === 4 || state.currentWeek === 22) && !state.deadlineDaysCompleted[state.currentWeek];
  const b = $('btnAdvanceMaster'), t = $('btnAdvanceText');
  if (dl) { b.className = 'btn-advance-master btn-deadline-mode'; t.innerText = 'DEADLINE DAY'; }
  else if ((lm && lm.played) || (w && w.done)) { b.className = 'btn-advance-master btn-continue-mode'; t.innerText = state.currentWeek >= state.totalWeeks ? 'END SEASON' : `CONTINUE TO WK ${state.currentWeek + 1}`; }
  else { b.className = 'btn-advance-master'; t.innerText = 'ADVANCE WEEK'; }
  updateHeaderClubDisplay(); renderTactics(); renderStandingsTable(club.div); renderMatchdayView();
}
function switchTab(id) {
  ['tactics', 'matchday', 'cups', 'news', 'transfers', 'standings', 'academy', 'facilities', 'manager', 'honours'].forEach(t => { $(`tab-${t}`).style.display = t === id ? 'block' : 'none'; $(`nav-${t}`).className = `nav-item ${t === id ? 'active' : ''}`; });
  ({ tactics: renderTactics, news: renderNewsFeed, cups: renderCupsTab, transfers: renderTransfers, standings: () => renderStandingsTable(state.activeStandingsTab), academy: renderAcademyTab, matchday: renderMatchdayView, facilities: renderFacilities, manager: renderManagerOffice, honours: renderHonours })[id]();
}

/* Matchday: pitch + scoreboard left; commentary, subs and other games right (one screen, no scrolling) */
function layoutMatchday() {
  const grid = document.querySelector('.matchday-grid'); if (!grid || grid.dataset.laid) return; grid.dataset.laid = 1;
  const grounds = grid.querySelector('.standings-card'), comm = $('commentaryFeed'), right = document.createElement('div'); right.className = 'md-right';
  right.append(comm.previousElementSibling, comm, $('inMatchSubDrawer'), grounds); grid.appendChild(right);
}
