/* Football League Manager - Complete Stable Engine (Upgraded Visuals & Full Pyramid) */
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
    '.md-right .standings-card{flex:1;min-height:0;overflow-y:auto}}' +
    '.pitch-node{position:absolute;transform:translate(-50%,-50%);cursor:grab;display:flex;flex-direction:column;align-items:center;touch-action:none;transition:box-shadow 0.2s}' +
    '.pitch-node.dragging{cursor:grabbing;z-index:99;opacity:0.95;transform:translate(-50%,-50%) scale(1.12)}' +
    '.pitch-kit{width:36px;height:36px;border-radius:50%;background:#0284c7;border:2px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.85rem;position:relative;box-shadow:0 3px 6px rgba(0,0,0,0.4)}' +
    '.pitch-role-tag{position:absolute;bottom:-6px;background:#0f172a;color:#38bdf8;font-size:0.6rem;padding:0 4px;border-radius:3px;font-weight:800;border:1px solid rgba(255,255,255,0.2)}' +
    '.pitch-name-card{background:rgba(15,23,42,0.85);backdrop-filter:blur(4px);padding:2px 6px;border-radius:4px;margin-top:4px;text-align:center;border:1px solid rgba(255,255,255,0.15)}' +
    '.pitch-name-card .p-name{font-size:0.68rem;font-weight:800;color:#fff;white-space:nowrap}' +
    '.pitch-name-card .p-role{font-size:0.6rem;color:#cbd5e1}';
  document.head.appendChild(s);
})();

const STORAGE_KEY = 'FLM_CAREER_2026_V2';
const BACKUP_PREFIX = 'FLM_BACKUP_SLOT_';
let state = null, selectedPlayerSwapId = null, wizardChosenClubId = 'NEW', activeContractTarget = null,
  deadlineHour = 12, pendingAIBid = null, pendingJobOffer = null, shootoutState = null, simSpeedMultiplier = 1,
  matchSimInterval = null, animFrameId = null, marketSortKey = 'ovr', marketSortAsc = false, activeCupTree = 'fa';

let lastUserClubRatings = null;

let matchLiveState = {
  subsUsed: 0,
  maxSubs: 5,
  pendingSubInId: null,
  isPaused: false,
  timelineEvents: [],
  yellows: {},
  reds: [],
  isDerby: false
};

let pitchEngine = { 
  currentMinute: 0, 
  homePlayers: [], 
  awayPlayers: [], 
  ball: { x: 400, y: 240, targetX: 400, targetY: 240, trail: [] }, 
  floatingAlerts: [], 
  w: 800, 
  h: 480 
};

const $ = id => document.getElementById(id);
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const FIRSTNAMES = 'James,Oliver,Jack,Harry,Leo,Noah,Ethan,Mason,Luca,Tom,Ben,Sam,Callum,Declan,Marcus,Kieran'.split(',');
const SURNAMES = 'Smith,Jones,Taylor,Brown,Wilson,Evans,Walker,Wright,Hughes,Clarke,Bell,Cole,Reid,Moore,Ward,Hall,Grant,Shaw'.split(',');
const NATS = ['SCO', 'WAL', 'IRL', 'NIR', 'FRA', 'ESP', 'GER', 'NED', 'POR', 'BRA', 'ARG', 'SWE', 'DEN', 'ITA', 'BEL'];
const ROLE = { GK: 'GK-De', DEF: 'CD-De', MID: 'CM-At', FWD: 'AF-At' };
const TAG = { GK: 'GK', DEF: 'DF', MID: 'MF', FWD: 'FW' };
const DIV_NAMES = ['Premier League', 'Championship', 'League One', 'League Two'];
const CUP_WEEKS = { 
  7: ['Carabao Cup', 'carabao', 'Round of 16', false], 
  15: ['Carabao Cup', 'carabao', 'Carabao Cup Final (Wembley)', true], 
  23: ['The FA Cup', 'fa', 'Quarter Final', false], 
  31: ['The FA Cup', 'fa', 'The FA Cup Final (Wembley)', true] 
};

const HISTORIC_RIVALRIES = [
  ['Liverpool', 'Everton'], ['Arsenal', 'Tottenham'], ['Manchester United', 'Manchester City'],
  ['Newcastle United', 'Sunderland'], ['Aston Villa', 'Birmingham City'], ['Sheffield United', 'Sheffield Wednesday'],
  ['Portsmouth', 'Southampton'], ['Bristol City', 'Bristol Rovers'], ['Blackburn', 'Burnley'],
  ['Millwall', 'West Ham'], ['Derby County', 'Nottingham Forest'], ['Cardiff City', 'Swansea City'],
  ['Oxford United', 'Swindon'], ['Wrexham', 'Chesterfield']
];

function isRivalMatch(clubA, clubB) {
  if (!clubA || !clubB) return false;
  return HISTORIC_RIVALRIES.some(([c1, c2]) => 
    (c1 === clubA.name && c2 === clubB.name) || (c2 === clubA.name && c1 === clubB.name)
  );
}

const LEAGUES = ('Arsenal,Aston Villa,Bournemouth,Brentford,Brighton,Chelsea,Crystal Palace,Everton,Fulham,Leeds United,Liverpool,Manchester City,Manchester United,Newcastle United,Nottingham Forest,Sunderland,Tottenham,Coventry City,Ipswich Town,Hull City|' +
  'Leicester City,Southampton,Burnley,Middlesbrough,West Brom,Norwich City,Sheffield United,West Ham,Watford,Wolves,Stoke City,Swansea City,Bristol City,Millwall,Preston,QPR,Blackburn,Derby County,Portsmouth,Oxford United,Sheffield Wednesday,Plymouth Argyle,Birmingham City,Charlton|' +
  'Wrexham,Bolton,Stockport,Leyton Orient,Huddersfield,Lincoln City,Reading,Wycombe,Barnsley,Peterborough,Blackpool,Rotherham,Cardiff City,Bradford City,Stevenage,Mansfield Town,Exeter City,Northampton,Burton Albion,Wigan,Luton Town,Port Vale,Doncaster,Crawley Town|' +
  'Notts County,Walsall,Chesterfield,Swindon,Gillingham,Salford City,Grimsby Town,Bromley,Crewe Alexandra,Colchester,Fleetwood,Tranmere,AFC Wimbledon,Barrow,Cheltenham,Harrogate,MK Dons,Accrington Stanley,Newport County,Bristol Rovers,Carlisle,Shrewsbury,Morecambe,Oldham Athletic').split('|').map(s => s.split(','));

/* ---------- COMPLETE REAL SQUADS (TIERS 1 - 4) ---------- */
const REAL_SQUADS = {
  // Premier League
  'Arsenal': [
    ['David Raya', 'GK', 85, 29, 'ESP'], ['William Saliba', 'DEF', 88, 24, 'FRA'], ['Gabriel Magalhaes', 'DEF', 86, 27, 'BRA'],
    ['Ben White', 'DEF', 83, 27, 'ENG'], ['Jurrien Timber', 'DEF', 82, 24, 'NED'], ['Declan Rice', 'MID', 88, 26, 'ENG'],
    ['Martin Odegaard', 'MID', 89, 26, 'NOR'], ['Mikel Merino', 'MID', 83, 29, 'ESP'], ['Bukayo Saka', 'FWD', 88, 23, 'ENG'],
    ['Gabriel Martinelli', 'FWD', 84, 24, 'BRA'], ['Kai Havertz', 'FWD', 84, 26, 'GER'], ['Neto', 'GK', 79, 36, 'BRA'],
    ['Oleksandr Zinchenko', 'DEF', 80, 28, 'UKR'], ['Thomas Partey', 'MID', 82, 32, 'GHA'], ['Leandro Trossard', 'FWD', 82, 30, 'BEL'],
    ['Gabriel Jesus', 'FWD', 81, 28, 'BRA']
  ],
  'Manchester City': [
    ['Ederson', 'GK', 87, 32, 'BRA'], ['Ruben Dias', 'DEF', 88, 28, 'POR'], ['Manuel Akanji', 'DEF', 84, 30, 'SUI'],
    ['Josko Gvardiol', 'DEF', 85, 23, 'CRO'], ['Kyle Walker', 'DEF', 83, 35, 'ENG'], ['Rodri', 'MID', 91, 29, 'ESP'],
    ['Kevin De Bruyne', 'MID', 90, 34, 'BEL'], ['Bernardo Silva', 'MID', 87, 31, 'POR'], ['Phil Foden', 'FWD', 88, 25, 'ENG'],
    ['Erling Haaland', 'FWD', 92, 25, 'NOR'], ['Jeremy Doku', 'FWD', 82, 23, 'BEL'], ['Stefan Ortega', 'GK', 80, 32, 'GER'],
    ['Nathan Ake', 'DEF', 82, 30, 'NED'], ['Mateo Kovacic', 'MID', 82, 31, 'CRO'], ['Jack Grealish', 'FWD', 83, 30, 'ENG'],
    ['Savinho', 'FWD', 81, 21, 'BRA']
  ],
  'Liverpool': [
    ['Alisson', 'GK', 89, 32, 'BRA'], ['Virgil van Dijk', 'DEF', 89, 34, 'NED'], ['Ibrahima Konate', 'DEF', 84, 26, 'FRA'],
    ['Trent Alexander-Arnold', 'DEF', 86, 26, 'ENG'], ['Andy Robertson', 'DEF', 84, 31, 'SCO'], ['Ryan Gravenberch', 'MID', 82, 23, 'NED'],
    ['Alexis Mac Allister', 'MID', 86, 26, 'ARG'], ['Dominik Szoboszlai', 'MID', 83, 24, 'HUN'], ['Mohamed Salah', 'FWD', 89, 33, 'EGY'],
    ['Luis Diaz', 'FWD', 85, 28, 'COL'], ['Darwin Nunez', 'FWD', 82, 26, 'URU'], ['Caoimhin Kelleher', 'GK', 79, 26, 'IRL'],
    ['Joe Gomez', 'DEF', 80, 28, 'ENG'], ['Curtis Jones', 'MID', 80, 24, 'ENG'], ['Cody Gakpo', 'FWD', 83, 26, 'NED'],
    ['Diogo Jota', 'FWD', 83, 28, 'POR']
  ],
  'Newcastle United': [
    ['Nick Pope', 'GK', 83, 33, 'ENG'], ['Fabian Schar', 'DEF', 82, 33, 'SUI'], ['Dan Burn', 'DEF', 80, 33, 'ENG'],
    ['Kieran Trippier', 'DEF', 82, 34, 'ENG'], ['Lewis Hall', 'DEF', 78, 20, 'ENG'], ['Bruno Guimaraes', 'MID', 86, 27, 'BRA'],
    ['Sandro Tonali', 'MID', 84, 25, 'ITA'], ['Joelinton', 'MID', 82, 28, 'BRA'], ['Anthony Gordon', 'FWD', 83, 24, 'ENG'],
    ['Alexander Isak', 'FWD', 86, 25, 'SWE'], ['Harvey Barnes', 'FWD', 80, 27, 'ENG'], ['Martin Dubravka', 'GK', 78, 36, 'SVK'],
    ['Tino Livramento', 'DEF', 80, 22, 'ENG'], ['Sean Longstaff', 'MID', 78, 27, 'ENG'], ['Jacob Murphy', 'FWD', 77, 30, 'ENG'],
    ['Callum Wilson', 'FWD', 80, 33, 'ENG']
  ],
  'Chelsea': [
    ['Robert Sanchez', 'GK', 80, 27, 'ESP'], ['Levi Colwill', 'DEF', 81, 22, 'ENG'], ['Wesley Fofana', 'DEF', 80, 24, 'FRA'],
    ['Reece James', 'DEF', 83, 25, 'ENG'], ['Marc Cucurella', 'DEF', 80, 27, 'ESP'], ['Moises Caicedo', 'MID', 83, 23, 'ECU'],
    ['Enzo Fernandez', 'MID', 83, 24, 'ARG'], ['Cole Palmer', 'MID', 86, 23, 'ENG'], ['Noni Madueke', 'FWD', 79, 23, 'ENG'],
    ['Nicolas Jackson', 'FWD', 80, 24, 'SEN'], ['Pedro Neto', 'FWD', 81, 25, 'POR'], ['Filip Jorgensen', 'GK', 76, 23, 'DEN'],
    ['Malo Gusto', 'DEF', 79, 22, 'FRA'], ['Romeo Lavia', 'MID', 77, 21, 'BEL'], ['Christopher Nkunku', 'FWD', 83, 27, 'FRA'],
    ['Joao Felix', 'FWD', 81, 25, 'POR']
  ],
  'Manchester United': [
    ['Andre Onana', 'GK', 82, 29, 'CMR'], ['Lisandro Martinez', 'DEF', 83, 27, 'ARG'], ['Matthijs de Ligt', 'DEF', 83, 26, 'NED'],
    ['Diogo Dalot', 'DEF', 81, 26, 'POR'], ['Noussair Mazraoui', 'DEF', 80, 27, 'MAR'], ['Kobbie Mainoo', 'MID', 80, 20, 'ENG'],
    ['Manuel Ugarte', 'MID', 81, 24, 'URU'], ['Bruno Fernandes', 'MID', 87, 30, 'POR'], ['Alejandro Garnacho', 'FWD', 81, 21, 'ARG'],
    ['Marcus Rashford', 'FWD', 81, 27, 'ENG'], ['Rasmus Hojlund', 'FWD', 80, 22, 'DEN'], ['Altay Bayindir', 'GK', 76, 27, 'TUR'],
    ['Harry Maguire', 'DEF', 79, 32, 'ENG'], ['Casemiro', 'MID', 82, 33, 'BRA'], ['Amad Diallo', 'FWD', 78, 23, 'CIV'],
    ['Joshua Zirkzee', 'FWD', 79, 24, 'NED']
  ],
  'Tottenham': [
    ['Guglielmo Vicario', 'GK', 83, 28, 'ITA'], ['Cristian Romero', 'DEF', 84, 27, 'ARG'], ['Micky van de Ven', 'DEF', 83, 24, 'NED'],
    ['Pedro Porro', 'DEF', 82, 25, 'ESP'], ['Destiny Udogie', 'DEF', 81, 22, 'ITA'], ['Rodrigo Bentancur', 'MID', 81, 28, 'URU'],
    ['Pape Matar Sarr', 'MID', 79, 22, 'SEN'], ['James Maddison', 'MID', 84, 28, 'ENG'], ['Dejan Kulusevski', 'FWD', 82, 25, 'SWE'],
    ['Son Heung-min', 'FWD', 86, 33, 'KOR'], ['Dominic Solanke', 'FWD', 81, 27, 'ENG'], ['Fraser Forster', 'GK', 75, 37, 'ENG'],
    ['Radu Dragusin', 'DEF', 78, 23, 'ROU'], ['Yves Bissouma', 'MID', 80, 28, 'MLI'], ['Brennan Johnson', 'FWD', 79, 24, 'WAL'],
    ['Richarlison', 'FWD', 80, 28, 'BRA']
  ],
  'Aston Villa': [
    ['Emiliano Martinez', 'GK', 87, 33, 'ARG'], ['Ezri Konsa', 'DEF', 82, 27, 'ENG'], ['Pau Torres', 'DEF', 82, 28, 'ESP'],
    ['Matty Cash', 'DEF', 79, 28, 'POL'], ['Lucas Digne', 'DEF', 80, 32, 'FRA'], ['Amadou Onana', 'MID', 81, 24, 'BEL'],
    ['Youri Tielemans', 'MID', 82, 28, 'BEL'], ['John McGinn', 'MID', 81, 30, 'SCO'], ['Leon Bailey', 'FWD', 81, 28, 'JAM'],
    ['Morgan Rogers', 'FWD', 79, 23, 'ENG'], ['Ollie Watkins', 'FWD', 84, 29, 'ENG'], ['Robin Olsen', 'GK', 74, 35, 'SWE'],
    ['Diego Carlos', 'DEF', 79, 32, 'BRA'], ['Boubacar Kamara', 'MID', 81, 25, 'FRA'], ['Jacob Ramsey', 'MID', 78, 24, 'ENG'],
    ['Jhon Duran', 'FWD', 80, 21, 'COL']
  ],

  // Championship
  'Leeds United': [
    ['Illan Meslier', 'GK', 76, 25, 'FRA'], ['Joe Rodon', 'DEF', 75, 27, 'WAL'], ['Pascal Struijk', 'DEF', 75, 26, 'NED'],
    ['Jayden Bogle', 'DEF', 73, 25, 'ENG'], ['Junior Firpo', 'DEF', 74, 29, 'DOM'], ['Ethan Ampadu', 'MID', 76, 24, 'WAL'],
    ['Ilia Gruev', 'MID', 73, 25, 'BUL'], ['Brenden Aaronson', 'MID', 74, 24, 'USA'], ['Wilfried Gnonto', 'FWD', 75, 21, 'ITA'],
    ['Daniel James', 'FWD', 75, 27, 'WAL'], ['Mateo Joseph', 'FWD', 73, 21, 'ESP'], ['Karl Darlow', 'GK', 71, 34, 'ENG'],
    ['Max Wober', 'DEF', 74, 27, 'AUT'], ['Ao Tanaka', 'MID', 74, 26, 'JPN'], ['Manor Solomon', 'FWD', 75, 26, 'ISR'],
    ['Joel Piroe', 'FWD', 74, 26, 'NED']
  ],
  'Sheffield United': [
    ['Michael Cooper', 'GK', 74, 25, 'ENG'], ['Anel Ahmedhodzic', 'DEF', 76, 26, 'BIH'], ['Harry Souttar', 'DEF', 74, 26, 'AUS'],
    ['Alfie Gilchrist', 'DEF', 72, 21, 'ENG'], ['Harrison Burrows', 'DEF', 73, 23, 'ENG'], ['Vinicius Souza', 'MID', 75, 26, 'BRA'],
    ['Oliver Arblaster', 'MID', 74, 21, 'ENG'], ['Gustavo Hamer', 'MID', 77, 28, 'NED'], ['Callum O\'Hare', 'FWD', 74, 27, 'ENG'],
    ['Jesurun Rak-Sakyi', 'FWD', 72, 22, 'ENG'], ['Kieffer Moore', 'FWD', 74, 33, 'WAL'], ['Adam Davies', 'GK', 69, 33, 'WAL'],
    ['Jack Robinson', 'DEF', 71, 32, 'ENG'], ['Sydie Peck', 'MID', 70, 21, 'ENG'], ['Andre Brooks', 'MID', 71, 22, 'ENG'],
    ['Rhian Brewster', 'FWD', 71, 25, 'ENG']
  ],
  'Burnley': [
    ['James Trafford', 'GK', 76, 22, 'ENG'], ['Maxime Esteve', 'DEF', 75, 23, 'FRA'], ['CJ Egan-Riley', 'DEF', 71, 22, 'ENG'],
    ['Connor Roberts', 'DEF', 73, 29, 'WAL'], ['Lucas Pires', 'DEF', 72, 24, 'BRA'], ['Josh Cullen', 'MID', 75, 29, 'IRL'],
    ['Josh Brownhill', 'MID', 76, 29, 'ENG'], ['Hannibal Mejbri', 'MID', 73, 22, 'TUN'], ['Luca Koleosho', 'FWD', 73, 20, 'ITA'],
    ['Jaidon Anthony', 'FWD', 73, 25, 'ENG'], ['Lyle Foster', 'FWD', 74, 25, 'RSA'], ['Vaclav Hladky', 'GK', 72, 34, 'CZE'],
    ['Joe Worrall', 'DEF', 73, 28, 'ENG'], ['Josh Laurent', 'MID', 72, 30, 'ENG'], ['Jeremy Sarmiento', 'FWD', 73, 23, 'ECU'],
    ['Zian Flemming', 'FWD', 74, 27, 'NED']
  ],
  'Sunderland': [
    ['Anthony Patterson', 'GK', 74, 25, 'ENG'], ['Dan Ballard', 'DEF', 74, 25, 'NIR'], ['Luke O\'Nien', 'DEF', 72, 30, 'ENG'],
    ['Trai Hume', 'DEF', 73, 23, 'NIR'], ['Dennis Cirkin', 'DEF', 72, 23, 'ENG'], ['Dan Neil', 'MID', 74, 23, 'ENG'],
    ['Jobe Bellingham', 'MID', 74, 19, 'ENG'], ['Chris Rigg', 'MID', 73, 18, 'ENG'], ['Patrick Roberts', 'FWD', 73, 28, 'ENG'],
    ['Romaine Mundle', 'FWD', 72, 22, 'ENG'], ['Wilson Isidor', 'FWD', 73, 25, 'FRA'], ['Simon Moore', 'GK', 68, 35, 'ENG'],
    ['Chris Mepham', 'DEF', 73, 27, 'WAL'], ['Alan Browne', 'MID', 72, 30, 'IRL'], ['Adil Aouchiche', 'MID', 71, 23, 'FRA'],
    ['Eliezer Mayenda', 'FWD', 70, 20, 'ESP']
  ],

  // League One
  'Wrexham': [
    ['Arthur Okonkwo', 'GK', 71, 23, 'ENG'], ['Eoghan O\'Connell', 'DEF', 67, 29, 'IRL'], ['Max Cleworth', 'DEF', 68, 23, 'ENG'],
    ['Thomas O\'Connor', 'DEF', 67, 26, 'IRL'], ['Ryan Barnett', 'DEF', 68, 25, 'ENG'], ['James McClean', 'DEF', 68, 36, 'IRL'],
    ['George Dobson', 'MID', 69, 27, 'ENG'], ['Andy Cannon', 'MID', 68, 29, 'ENG'], ['Elliot Lee', 'MID', 70, 30, 'ENG'],
    ['Jack Marriott', 'FWD', 69, 30, 'ENG'], ['Paul Mullin', 'FWD', 71, 30, 'ENG'], ['Callum Burton', 'GK', 64, 29, 'ENG'],
    ['Dan Scarr', 'DEF', 67, 30, 'ENG'], ['Ollie Rathbone', 'MID', 68, 28, 'ENG'], ['Steven Fletcher', 'FWD', 66, 38, 'SCO'],
    ['Ollie Palmer', 'FWD', 66, 33, 'ENG']
  ],
  'Birmingham City': [
    ['Ryan Allsop', 'GK', 71, 33, 'ENG'], ['Krystian Bielik', 'DEF', 73, 27, 'POL'], ['Christoph Klarer', 'DEF', 72, 25, 'AUT'],
    ['Ethan Laird', 'DEF', 71, 24, 'ENG'], ['Alex Cochrane', 'DEF', 71, 25, 'ENG'], ['Paik Seung-ho', 'MID', 73, 28, 'KOR'],
    ['Tomoki Iwata', 'MID', 73, 28, 'JPN'], ['Willum Willumsson', 'MID', 72, 26, 'ISL'], ['Keshi Anderson', 'FWD', 69, 30, 'ENG'],
    ['Emil Hansson', 'FWD', 71, 27, 'SWE'], ['Jay Stansfield', 'FWD', 73, 22, 'ENG'], ['Bailey Peacock-Farrell', 'GK', 69, 28, 'NIR'],
    ['Ben Davies', 'DEF', 70, 30, 'ENG'], ['Marc Leonard', 'MID', 70, 23, 'SCO'], ['Scott Wright', 'FWD', 70, 28, 'SCO'],
    ['Lyndon Dykes', 'FWD', 71, 29, 'SCO']
  ],
  'Bolton': [
    ['Nathan Baxter', 'GK', 70, 26, 'ENG'], ['Ricardo Santos', 'DEF', 70, 30, 'ENG'], ['Eoin Toal', 'DEF', 68, 26, 'NIR'],
    ['George Johnston', 'DEF', 67, 26, 'SCO'], ['Josh Dacres-Cogley', 'DEF', 68, 29, 'ENG'], ['Szabolcs Schon', 'DEF', 68, 24, 'HUN'],
    ['Josh Sheehan', 'MID', 70, 30, 'WAL'], ['George Thomason', 'MID', 69, 24, 'ENG'], ['Kyle Dempsey', 'MID', 68, 29, 'ENG'],
    ['Dion Charles', 'FWD', 71, 29, 'NIR'], ['Victor Adeboyejo', 'FWD', 68, 27, 'NGA'], ['Luke Southwood', 'GK', 67, 27, 'NIR'],
    ['Will Forrester', 'DEF', 66, 24, 'ENG'], ['Jay Matete', 'MID', 67, 24, 'ENG'], ['John McAtee', 'FWD', 68, 26, 'ENG'],
    ['Aaron Collins', 'FWD', 69, 28, 'WAL']
  ],
  'Huddersfield': [
    ['Lee Nicholls', 'GK', 71, 32, 'ENG'], ['Michal Helik', 'DEF', 72, 30, 'POL'], ['Tom Lees', 'DEF', 69, 34, 'ENG'],
    ['Nigel Lonwijk', 'DEF', 67, 22, 'NED'], ['Lasse Sorensen', 'DEF', 68, 25, 'DEN'], ['Jaheim Headley', 'DEF', 66, 23, 'ENG'],
    ['Jonathan Hogg', 'MID', 68, 36, 'ENG'], ['Ben Wiles', 'MID', 69, 26, 'ENG'], ['Antony Evans', 'MID', 69, 26, 'ENG'],
    ['Josh Koroma', 'FWD', 69, 26, 'SLE'], ['Callum Marshall', 'FWD', 67, 20, 'NIR'], ['Chris Maxwell', 'GK', 66, 35, 'WAL'],
    ['Matty Pearson', 'DEF', 68, 32, 'ENG'], ['David Kasumu', 'MID', 67, 25, 'ENG'], ['Brodie Spencer', 'DEF', 66, 21, 'NIR'],
    ['Danny Ward', 'FWD', 67, 33, 'ENG']
  ],

  // League Two
  'Notts County': [
    ['Alex Bass', 'GK', 66, 27, 'ENG'], ['Jacob Bedeau', 'DEF', 65, 25, 'GRN'], ['Matty Platt', 'DEF', 65, 27, 'ENG'],
    ['Lewis Macari', 'DEF', 63, 23, 'SCO'], ['Jodi Jones', 'MID', 68, 27, 'MLT'], ['Nick Tsaroulla', 'DEF', 64, 26, 'CYP'],
    ['Matt Palmer', 'MID', 66, 29, 'ENG'], ['Jack Edwards', 'MID', 63, 22, 'ENG'], ['Dan Crowley', 'MID', 67, 28, 'ENG'],
    ['Alassana Jatta', 'FWD', 66, 26, 'GAM'], ['David McGoldrick', 'FWD', 67, 37, 'IRL'], ['Sam Slocombe', 'GK', 61, 37, 'ENG'],
    ['Robbie Cundy', 'DEF', 63, 28, 'ENG'], ['Conor Grant', 'MID', 64, 23, 'IRL'], ['Sam Austin', 'MID', 63, 28, 'ENG'],
    ['Cedwyn Scott', 'FWD', 63, 26, 'ENG']
  ],
  'Chesterfield': [
    ['Ryan Boot', 'GK', 64, 30, 'ENG'], ['Chey Dunkley', 'DEF', 66, 33, 'ENG'], ['Tom Naylor', 'DEF', 66, 34, 'ENG'],
    ['Vontae Daley-Campbell', 'DEF', 63, 24, 'ENG'], ['Lewis Gordon', 'DEF', 63, 24, 'SCO'], ['Darren Oldaker', 'MID', 65, 26, 'ENG'],
    ['Ollie Banks', 'MID', 65, 32, 'ENG'], ['Armando Dobra', 'MID', 66, 24, 'ALB'], ['Dilan Markanday', 'FWD', 66, 23, 'ENG'],
    ['James Berry', 'FWD', 65, 24, 'ENG'], ['Will Grigg', 'FWD', 66, 34, 'NIR'], ['Max Thompson', 'GK', 63, 21, 'ENG'],
    ['Jamie Grimes', 'DEF', 62, 34, 'ENG'], ['Jenson Metcalfe', 'MID', 62, 20, 'ENG'], ['Liam Mandeville', 'FWD', 64, 28, 'ENG'],
    ['Paddy Madden', 'FWD', 65, 35, 'IRL']
  ],
  'Walsall': [
    ['Tommy Simkin', 'GK', 65, 20, 'ENG'], ['David Okagbue', 'DEF', 64, 21, 'IRL'], ['Harry Williams', 'DEF', 63, 22, 'ENG'],
    ['Taylor Allen', 'DEF', 65, 25, 'ENG'], ['Connor Barrett', 'DEF', 65, 23, 'ENG'], ['Liam Gordon', 'DEF', 64, 26, 'GUY'],
    ['Ryan Stirk', 'MID', 65, 24, 'WAL'], ['Charlie Lakin', 'MID', 65, 26, 'ENG'], ['Jamie Jellis', 'MID', 64, 24, 'ENG'],
    ['Nathan Lowe', 'FWD', 66, 20, 'ENG'], ['Jamille Matt', 'FWD', 64, 35, 'JAM'], ['Sam Hornby', 'GK', 62, 30, 'ENG'],
    ['Donervon Daniels', 'DEF', 64, 31, 'MSR'], ['Oisin McEntee', 'DEF', 64, 24, 'IRL'], ['Brandon Comley', 'MID', 63, 29, 'MSR'],
    ['Danny Johnson', 'FWD', 63, 32, 'ENG']
  ],
  'Gillingham': [
    ['Jake Turner', 'GK', 64, 26, 'ENG'], ['Max Ehmer', 'DEF', 65, 33, 'GER'], ['Shad Ogie', 'DEF', 64, 24, 'IRL'],
    ['Remao Hutton', 'DEF', 65, 26, 'ENG'], ['Max Clark', 'DEF', 64, 29, 'ENG'], ['Robbie McKenzie', 'MID', 64, 26, 'ENG'],
    ['Armani Little', 'MID', 65, 28, 'ENG'], ['Timothee Dieng', 'MID', 65, 33, 'FRA'], ['Jayden Clarke', 'FWD', 64, 24, 'ENG'],
    ['Jack Nolan', 'FWD', 65, 24, 'ENG'], ['Oliver Hawkins', 'FWD', 64, 33, 'ENG'], ['Glenn Morris', 'GK', 62, 41, 'ENG'],
    ['Conor Masterson', 'DEF', 64, 27, 'IRL'], ['Ethan Coleman', 'MID', 64, 25, 'ENG'], ['Jonny Williams', 'MID', 65, 31, 'WAL'],
    ['Josh Andrews', 'FWD', 63, 23, 'ENG']
  ]
};

const CLUB_KITS_DATABASE = {
  'Arsenal': { home: '#dc2626', away: '#09090b', gk: '#f59e0b' },
  'Aston Villa': { home: '#7b113a', away: '#f8fafc', gk: '#f59e0b' },
  'Bournemouth': { home: '#b91c1c', away: '#38bdf8', gk: '#10b981' },
  'Brentford': { home: '#dc2626', away: '#f43f5e', gk: '#10b981' },
  'Brighton': { home: '#0284c7', away: '#f59e0b', gk: '#10b981' },
  'Chelsea': { home: '#1d4ed8', away: '#fef08a', gk: '#f59e0b' },
  'Crystal Palace': { home: '#1d4ed8', away: '#f8fafc', gk: '#10b981' },
  'Everton': { home: '#1e40af', away: '#fef08a', gk: '#10b981' },
  'Fulham': { home: '#f8fafc', away: '#dc2626', gk: '#10b981' },
  'Leeds United': { home: '#f8fafc', away: '#f59e0b', gk: '#10b981' },
  'Liverpool': { home: '#b91c1c', away: '#f8fafc', gk: '#10b981' },
  'Manchester City': { home: '#38bdf8', away: '#0f172a', gk: '#10b981' },
  'Manchester United': { home: '#b91c1c', away: '#0f172a', gk: '#10b981' },
  'Newcastle United': { home: '#171717', away: '#f8fafc', gk: '#047857' },
  'Nottingham Forest': { home: '#dc2626', away: '#38bdf8', gk: '#10b981' },
  'Sunderland': { home: '#dc2626', away: '#0284c7', gk: '#10b981' },
  'Tottenham': { home: '#f8fafc', away: '#0f172a', gk: '#f59e0b' },
  'Coventry City': { home: '#38bdf8', away: '#475569', gk: '#10b981' },
  'Ipswich Town': { home: '#1d4ed8', away: '#78350f', gk: '#f59e0b' },
  'Hull City': { home: '#f59e0b', away: '#0f172a', gk: '#10b981' },
  'Leicester City': { home: '#1d4ed8', away: '#f59e0b', gk: '#0f172a' },
  'Southampton': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Burnley': { home: '#7b113a', away: '#f8fafc', gk: '#10b981' },
  'Middlesbrough': { home: '#dc2626', away: '#0284c7', gk: '#10b981' },
  'West Brom': { home: '#1e40af', away: '#f59e0b', gk: '#10b981' },
  'Norwich City': { home: '#facc15', away: '#065f46', gk: '#dc2626' },
  'Sheffield United': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'West Ham': { home: '#7b113a', away: '#0f172a', gk: '#10b981' },
  'Watford': { home: '#facc15', away: '#475569', gk: '#0284c7' },
  'Wolves': { home: '#f59e0b', away: '#0f172a', gk: '#dc2626' },
  'Stoke City': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Swansea City': { home: '#f8fafc', away: '#581c87', gk: '#f59e0b' },
  'Bristol City': { home: '#dc2626', away: '#f8fafc', gk: '#10b981' },
  'Millwall': { home: '#1e3a8a', away: '#f8fafc', gk: '#f59e0b' },
  'Preston': { home: '#f8fafc', away: '#f59e0b', gk: '#10b981' },
  'QPR': { home: '#1d4ed8', away: '#dc2626', gk: '#10b981' },
  'Blackburn': { home: '#0284c7', away: '#dc2626', gk: '#f59e0b' },
  'Derby County': { home: '#f8fafc', away: '#0284c7', gk: '#f59e0b' },
  'Portsmouth': { home: '#1e40af', away: '#f8fafc', gk: '#f59e0b' },
  'Oxford United': { home: '#f59e0b', away: '#dc2626', gk: '#0284c7' },
  'Sheffield Wednesday': { home: '#1d4ed8', away: '#f59e0b', gk: '#10b981' },
  'Plymouth Argyle': { home: '#064e3b', away: '#f8fafc', gk: '#f59e0b' },
  'Birmingham City': { home: '#1d4ed8', away: '#dc2626', gk: '#f59e0b' },
  'Charlton': { home: '#dc2626', away: '#f8fafc', gk: '#10b981' },
  'Wrexham': { home: '#dc2626', away: '#059669', gk: '#f59e0b' },
  'Bolton': { home: '#f8fafc', away: '#0f172a', gk: '#10b981' },
  'Stockport': { home: '#1d4ed8', away: '#f8fafc', gk: '#f59e0b' },
  'Leyton Orient': { home: '#dc2626', away: '#f8fafc', gk: '#0284c7' },
  'Huddersfield': { home: '#0284c7', away: '#0f172a', gk: '#f59e0b' },
  'Lincoln City': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Reading': { home: '#1d4ed8', away: '#dc2626', gk: '#f59e0b' },
  'Wycombe': { home: '#0284c7', away: '#dc2626', gk: '#f59e0b' },
  'Barnsley': { home: '#dc2626', away: '#f8fafc', gk: '#10b981' },
  'Peterborough': { home: '#1d4ed8', away: '#f8fafc', gk: '#f59e0b' },
  'Blackpool': { home: '#f97316', away: '#f8fafc', gk: '#10b981' },
  'Rotherham': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Cardiff City': { home: '#1d4ed8', away: '#dc2626', gk: '#f59e0b' },
  'Bradford City': { home: '#7b113a', away: '#f8fafc', gk: '#0284c7' },
  'Stevenage': { home: '#dc2626', away: '#0284c7', gk: '#10b981' },
  'Mansfield Town': { home: '#f59e0b', away: '#1d4ed8', gk: '#10b981' },
  'Exeter City': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Northampton': { home: '#7b113a', away: '#f8fafc', gk: '#0284c7' },
  'Burton Albion': { home: '#facc15', away: '#0f172a', gk: '#0284c7' },
  'Wigan': { home: '#1d4ed8', away: '#dc2626', gk: '#f59e0b' },
  'Luton Town': { home: '#f97316', away: '#f8fafc', gk: '#10b981' },
  'Port Vale': { home: '#f8fafc', away: '#0f172a', gk: '#10b981' },
  'Doncaster': { home: '#dc2626', away: '#0284c7', gk: '#10b981' },
  'Crawley Town': { home: '#dc2626', away: '#f8fafc', gk: '#10b981' },
  'Notts County': { home: '#171717', away: '#0284c7', gk: '#f59e0b' },
  'Walsall': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Chesterfield': { home: '#1d4ed8', away: '#f8fafc', gk: '#f59e0b' },
  'Swindon': { home: '#dc2626', away: '#0284c7', gk: '#10b981' },
  'Gillingham': { home: '#1d4ed8', away: '#f8fafc', gk: '#f59e0b' },
  'Salford City': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Grimsby Town': { home: '#171717', away: '#dc2626', gk: '#10b981' },
  'Bromley': { home: '#f8fafc', away: '#0284c7', gk: '#f59e0b' },
  'Crewe Alexandra': { home: '#dc2626', away: '#059669', gk: '#10b981' },
  'Colchester': { home: '#1d4ed8', away: '#f59e0b', gk: '#10b981' },
  'Fleetwood': { home: '#dc2626', away: '#0f172a', gk: '#10b981' },
  'Tranmere': { home: '#f8fafc', away: '#1d4ed8', gk: '#f59e0b' },
  'AFC Wimbledon': { home: '#1e3a8a', away: '#f8fafc', gk: '#f59e0b' },
  'Barrow': { home: '#1d4ed8', away: '#0f172a', gk: '#f59e0b' },
  'Cheltenham': { home: '#dc2626', away: '#0284c7', gk: '#10b981' },
  'Harrogate': { home: '#facc15', away: '#0284c7', gk: '#10b981' },
  'MK Dons': { home: '#f8fafc', away: '#dc2626', gk: '#10b981' },
  'Accrington Stanley': { home: '#dc2626', away: '#1d4ed8', gk: '#10b981' },
  'Newport County': { home: '#f59e0b', away: '#0f172a', gk: '#0284c7' },
  'Bristol Rovers': { home: '#1d4ed8', away: '#f8fafc', gk: '#f59e0b' },
  'Carlisle': { home: '#1d4ed8', away: '#f59e0b', gk: '#10b981' },
  'Shrewsbury': { home: '#1d4ed8', away: '#dc2626', gk: '#f59e0b' },
  'Morecambe': { home: '#dc2626', away: '#f8fafc', gk: '#10b981' },
  'Oldham Athletic': { home: '#1d4ed8', away: '#f97316', gk: '#f59e0b' }
};

function parseColorToRgb(colorStr) {
  if (!colorStr) return { r: 50, g: 50, b: 50 };
  if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '');
    const num = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  return { r: 50, g: 50, b: 50 };
}

function getKitColorDistance(c1, c2) {
  const rgb1 = parseColorToRgb(c1), rgb2 = parseColorToRgb(c2);
  return Math.sqrt(Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2));
}

function getClubKitColors(club) {
  if (!club) return { home: '#1e293b', away: '#ffffff', gk: '#047857' };
  const configured = CLUB_KITS_DATABASE[club.name];
  if (configured) return configured;
  return { home: club.col || '#1e293b', away: '#f8fafc', gk: '#047857' };
}

function resolveMatchKitColors(homeClub, awayClub) {
  const hKits = getClubKitColors(homeClub), aKits = getClubKitColors(awayClub);
  const homeColor = hKits.home;
  let awayColor = aKits.home, usedAwayKit = false;

  if (getKitColorDistance(homeColor, awayColor) < 110) {
    awayColor = aKits.away;
    usedAwayKit = true;
    if (getKitColorDistance(homeColor, awayColor) < 90) awayColor = '#f8fafc';
  }

  let hGK = hKits.gk || '#047857', aGK = aKits.gk || '#f59e0b';
  return { homeColor, awayColor, homeGK: hGK, awayGK: aGK, usedAwayKit };
}

const CLUBS_DATABASE = [];
LEAGUES.forEach((names, div) => names.forEach(n => {
  const nu = n === 'Newcastle United';
  let h = 0; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const clubKit = CLUB_KITS_DATABASE[n] || { home: `hsl(${h},60%,38%)`, away: '#ffffff', gk: '#047857' };
  CLUBS_DATABASE.push({ 
    id: nu ? 'NEW' : 'C' + CLUBS_DATABASE.length, 
    name: n, 
    div, 
    manager: pick(FIRSTNAMES) + ' ' + pick(SURNAMES),
    stadium: nu ? "St James' Park" : n + ' Stadium',
    cap: nu ? 52305 : [42000, 26000, 14000, 7000][div] + R(0, 8000), 
    budget: [60, 20, 8, 3][div] + R(0, 10), 
    col: clubKit.home, 
    str: [76, 66, 58, 52][div] + R(-4, 4) 
  });
}));

const FORMATIONS = {};
[
  ['4-3-3', [[4, 'DEF', 72], [3, 'MID', 50], [3, 'FWD', 22]]],
  ['4-2-3-1', [[4, 'DEF', 72], [2, 'MID', 56], [3, 'MID', 38], [1, 'FWD', 18]]],
  ['4-4-2', [[4, 'DEF', 72], [4, 'MID', 46], [2, 'FWD', 20]]],
  ['3-5-2', [[3, 'DEF', 72], [5, 'MID', 46], [2, 'FWD', 20]]],
  ['5-3-2', [[5, 'DEF', 72], [3, 'MID', 46], [2, 'FWD', 20]]],
  ['4-1-2-1-2', [[4, 'DEF', 72], [1, 'MID', 58], [2, 'MID', 46], [1, 'MID', 34], [2, 'FWD', 20]]],
  ['4-5-1', [[4, 'DEF', 72], [5, 'MID', 46], [1, 'FWD', 18]]]
].forEach(([name, rows]) => {
  const t = [{ x: 50, y: 90, role: 'GK', posType: 'GK', duty: ROLE.GK }];
  rows.forEach(([n, type, y]) => {
    for (let i = 0; i < n; i++) {
      t.push({ x: n === 1 ? 50 : Math.round(12 + (76 / (n - 1)) * i), y, role: TAG[type], posType: type, duty: ROLE[type] });
    }
  });
  FORMATIONS[name] = t;
});

const SQUAD_ORDER = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD', 'GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'DEF', 'MID'];
function mkPlayer(pos, base, i, cid) {
  const ovr = Math.max(40, Math.min(92, base + R(-4, 5)));
  return { 
    id: `${cid}_${i}_${R(0, 99999)}`, 
    name: pick(FIRSTNAMES) + ' ' + pick(SURNAMES), 
    naturalPos: pos, 
    nat: Math.random() < 0.7 ? 'ENG' : pick(NATS), 
    age: R(18, 35), 
    ovr, 
    con: 100, 
    role: ROLE[pos], 
    starter: i < 11, 
    val: Math.max(0.3, +((ovr - 50) * 0.75).toFixed(1)), 
    wage: Math.max(0.01, +((ovr - 45) * 0.003).toFixed(3)), 
    contract: R(1, 5), 
    morale: 'Good', 
    chemistry: R(55, 80), 
    goals: 0, 
    cleanSheets: 0, 
    inj: 0, 
    yellows: 0, 
    susp: 0 
  };
}

function generateProceduralSquad(c) {
  const real = REAL_SQUADS[c.name];
  if (!real) return SQUAD_ORDER.map((pos, i) => mkPlayer(pos, c.str, i, c.id));
  
  const all = real.map(([name, pos, ovr, age, nat], i) => Object.assign(mkPlayer(pos, ovr, i, c.id), { 
    name, ovr, age: age || R(20, 32), nat: nat || 'ENG', starter: false,
    val: Math.max(0.3, +((ovr - 50) * 0.75).toFixed(1)), 
    wage: Math.max(0.01, +((ovr - 45) * 0.003).toFixed(3)) 
  })).sort((a, b) => b.ovr - a.ovr);
  
  const need = { GK: 1, DEF: 4, MID: 3, FWD: 3 }, xi = [];
  Object.keys(need).forEach(pos => { 
    for (let k = 0; k < need[pos]; k++) { 
      const i = all.findIndex(p => p.naturalPos === pos); 
      xi.push(i >= 0 ? all.splice(i, 1)[0] : mkPlayer(pos, c.str, 50 + xi.length, c.id)); 
    } 
  });
  
  const squad = [...xi, ...all]; 
  let i = squad.length;
  while (squad.length < 22) squad.push(mkPlayer(SQUAD_ORDER[squad.length % SQUAD_ORDER.length], c.str - 6, i++, c.id));
  squad.forEach((p, j) => { p.starter = j < 11; }); 
  return squad;
}

const TRANSFER_SCOUT_POOL = [];
for (let i = 0; i < 40; i++) {
  const pos = pick(['GK', 'DEF', 'MID', 'FWD']), p = mkPlayer(pos, 66 + R(0, 14), i, 'scout');
  TRANSFER_SCOUT_POOL.push({ id: 'scout_' + i, name: p.name, naturalPos: pos, nat: pick(NATS), age: R(19, 32), ovr: p.ovr, price: +(p.val * 1.2).toFixed(1), club: 'Foreign Club', wage: p.wage, contract: 3 });
}

const clubById = id => (state && state.clubs && state.clubs.find(c => c.id === id)) || CLUBS_DATABASE.find(c => c.id === id);
const getCurrentUserClub = () => (state && state.clubs && state.clubs.find(c => c.id === state.userClubId)) || (state && state.clubs && state.clubs[0]) || CLUBS_DATABASE[0];
const getWeek = w => state && state.fixtures ? state.fixtures[(w || state.currentWeek) - 1] : null;
const userLeagueMatch = () => { const w = getWeek(); return w ? w.matches.find(m => m.type === 'LEAGUE' && (m.home === state.userClubId || m.away === state.userClubId)) : null; };
const userCupMatch = () => { const w = getWeek(); return w ? w.matches.find(m => m.type === 'CUP' && (m.home === state.userClubId || m.away === state.userClubId)) : null; };
const getActiveUserMatch = () => {
  const cup = userCupMatch();
  if (cup && !cup.played) return cup;
  const league = userLeagueMatch();
  if (league && !league.played) return league;
  return cup || league;
};

function getPositionFamiliarityMultiplier(naturalPos, currentPosType) {
  if (naturalPos === currentPosType) return 1.0;
  if (naturalPos === 'GK' || currentPosType === 'GK') return 0.35;
  if (naturalPos === 'MID' && (currentPosType === 'DEF' || currentPosType === 'FWD')) return 0.85;
  if ((naturalPos === 'DEF' || naturalPos === 'FWD') && currentPosType === 'MID') return 0.75;
  if (naturalPos === 'DEF' && currentPosType === 'FWD') return 0.45;
  if (naturalPos === 'FWD' && currentPosType === 'DEF') return 0.45;
  return 0.70;
}

function createBadgeHtml(id, size = 30) {
  const c = clubById(id) || {};
  const name = c.name || id;
  const fSize = Math.round(size * 0.30);
  const code = name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase();
  return `<span class="badge-icon-wrap" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
    <svg width="${size}" height="${size}" viewBox="0 0 40 46" fill="none">
      <path d="M20 2L37 7V24C37 34.5 29.5 41.5 20 44C10.5 41.5 3 34.5 3 24V7L20 2Z" fill="${c.col || '#1e293b'}" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"/>
      <path d="M20 5L34 9.5V23C34 32 28 38 20 40.5C12 38 6 32 6 23V9.5L20 5Z" fill="rgba(0,0,0,0.15)"/>
      <text x="20" y="27" font-size="${fSize + 3}" font-weight="900" font-family="-apple-system, sans-serif" fill="#ffffff" text-anchor="middle">${code}</text>
    </svg>
  </span>`;
}

function computeClubAttributes(club) {
  if (!club || !club.players || !club.players.length) return { att: 60, mid: 60, def: 60, ovr: 60 };
  const formationKey = (state && state.currentFormation && club.id === state.userClubId) ? state.currentFormation : '4-3-3';
  const tpl = FORMATIONS[formationKey] || FORMATIONS['4-3-3'];

  const getEffPlayerRating = (p, isStarter, slotIdx) => {
    let famMult = 1.0;
    if (isStarter && tpl[slotIdx]) famMult = getPositionFamiliarityMultiplier(p.naturalPos, tpl[slotIdx].posType);
    const healthMult = p.inj > 0 ? 0.60 : (0.80 + 0.20 * ((p.con || 100) / 100));
    const moraleMult = p.morale === 'Superb' ? 1.06 : p.morale === 'Good' ? 1.02 : 0.95;
    const chemMult = 0.94 + ((p.chemistry || 60) / 100) * 0.10;
    return p.ovr * famMult * healthMult * moraleMult * chemMult;
  };

  const starters = club.players.filter(p => p.starter);
  const bench = club.players.filter(p => !p.starter);

  const calcUnitRating = (posType, fallback) => {
    const unitStarters = starters.filter(p => posType === 'DEF' ? (p.naturalPos === 'DEF' || p.naturalPos === 'GK') : p.naturalPos === posType);
    let starterScore = fallback - 10;
    if (unitStarters.length > 0) {
      starterScore = unitStarters.reduce((acc, p) => acc + getEffPlayerRating(p, true, starters.indexOf(p)), 0) / unitStarters.length;
    }
    const unitBench = bench.filter(p => posType === 'DEF' ? (p.naturalPos === 'DEF' || p.naturalPos === 'GK') : p.naturalPos === posType);
    let benchScore = starterScore;
    if (unitBench.length > 0) {
      benchScore = unitBench.reduce((acc, p) => acc + (p.ovr * (p.inj > 0 ? 0.6 : 0.9)), 0) / unitBench.length;
    }
    return Math.max(35, Math.min(99, Math.round((starterScore * 0.70) + (benchScore * 0.30))));
  };

  const att = calcUnitRating('FWD', club.str || 65);
  const mid = calcUnitRating('MID', club.str || 65);
  const def = calcUnitRating('DEF', club.str || 65);
  const ovr = Math.round((att * 0.35) + (mid * 0.35) + (def * 0.30));
  return { att, mid, def, ovr };
}

const computeClubWeeklyWageBill = club => +club.players.reduce((s, p) => s + (p.wage || 0.02), 0).toFixed(3);

function getClubBoardObjectives(club) {
  const div = club.div, budget = club.budget || 10;
  if (div === 0) {
    if (budget >= 50) return { leagueObj: 'Champions Cup Spot (Top 4)', minRank: 4, faObj: 'Semi-Finals', carabaoObj: 'Quarter-Finals' };
    if (budget >= 25) return { leagueObj: 'Top Half Finish', minRank: 10, faObj: 'Fifth Round', carabaoObj: 'Fourth Round' };
    return { leagueObj: 'Avoid Relegation', minRank: 17, faObj: 'Fourth Round', carabaoObj: 'Third Round' };
  }
  if (div === 1) {
    if (budget >= 15) return { leagueObj: 'Automatic Promotion', minRank: 2, faObj: 'Fourth Round', carabaoObj: 'Third Round' };
    return { leagueObj: 'Play-Offs (Top 6)', minRank: 6, faObj: 'Third Round', carabaoObj: 'Second Round' };
  }
  return { leagueObj: 'Promotion Contention', minRank: 3, faObj: 'Second Round', carabaoObj: 'First Round' };
}

/* ---------- WEB AUDIO ENGINE ---------- */
let audioCtx = null, crowdLoopNode = null, crowdGainNode = null;
function initAudioEngine() {
  if (!state || !state.audioEnabled) return;
  try {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AudioClass) audioCtx = new AudioClass();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  } catch(e) {}
}

function startStadiumCrowdLoop(isDerby = false) {
  if (!state || !state.audioEnabled) return;
  initAudioEngine();
  if (!audioCtx) return;
  stopStadiumCrowdLoop();
  try {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = isDerby ? 550 : 380;
    crowdGainNode = audioCtx.createGain();
    crowdGainNode.gain.setValueAtTime(isDerby ? 0.08 : 0.04, audioCtx.currentTime);
    whiteNoise.connect(filter);
    filter.connect(crowdGainNode);
    crowdGainNode.connect(audioCtx.destination);
    whiteNoise.start();
    crowdLoopNode = whiteNoise;
  } catch(e) {}
}

function stopStadiumCrowdLoop() {
  if (crowdLoopNode) { try { crowdLoopNode.stop(); } catch(e) {} crowdLoopNode = null; }
}

function playSound(type) {
  if (!state || !state.audioEnabled) return;
  initAudioEngine();
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    if (type === 'whistle') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(2400, now); osc.frequency.setValueAtTime(2900, now + 0.08);
      gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'goal' || type === 'roar') {
      if (crowdGainNode) {
        crowdGainNode.gain.cancelScheduledValues(now);
        crowdGainNode.gain.setValueAtTime(0.25, now);
        crowdGainNode.gain.exponentialRampToValueAtTime(0.05, now + 3.0);
      }
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(160, now); osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
      gain.gain.setValueAtTime(0.35, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now); osc.stop(now + 0.6);
    } else if (type === 'click') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    }
  } catch(e) {}
}
function playSoundSafe(n) { try { playSound(n); } catch(e) {} }

/* ---------- 2D PITCH ENGINE WITH GOALS & TRAIL ---------- */
function initPitchCanvas() { 
  const c = $('matchPitchCanvas'); 
  if (!c) return;
  pitchEngine.ctx = c.getContext('2d'); 
  c.width = 800; c.height = 480; 
}

function getFormationCoords(formationKey, isAway = false) {
  const tpl = FORMATIONS[formationKey] || FORMATIONS['4-3-3'];
  return tpl.map((slot) => {
    let nx = ((100 - slot.y) / 100) * 336 + 40;
    let ny = (slot.x / 100) * 400 + 40;
    if (isAway) nx = 800 - nx;
    return { x: Math.round(nx), y: Math.round(ny), role: slot.role };
  });
}

function setup2DPlayers(h, a) {
  initPitchCanvas();
  const matchKits = resolveMatchKitColors(h, a);
  pitchEngine.homeColor = matchKits.homeColor;
  pitchEngine.awayColor = matchKits.awayColor;
  pitchEngine.homeGKColor = matchKits.homeGK;
  pitchEngine.awayGKColor = matchKits.awayGK;

  const hCoords = getFormationCoords(h.id === state.userClubId ? state.currentFormation : '4-3-3', false);
  const aCoords = getFormationCoords(a.id === state.userClubId ? state.currentFormation : '4-2-3-1', true);

  pitchEngine.homePlayers = hCoords.map((pos, i) => ({ 
    playerId: `h_${i}`, num: i + 1, baseX: pos.x, baseY: pos.y, x: pos.x, y: pos.y, 
    color: matchKits.homeColor, isHome: true 
  }));
  pitchEngine.awayPlayers = aCoords.map((pos, i) => ({ 
    playerId: `a_${i}`, num: i + 1, baseX: pos.x, baseY: pos.y, x: pos.x, y: pos.y, 
    color: matchKits.awayColor, isHome: false 
  }));
  pitchEngine.ball = { x: 400, y: 240, targetX: 400, targetY: 240, trail: [] };
  pitchEngine.floatingAlerts = [];
  draw2DPitch();
}

function draw2DPitch() {
  const { ctx, w, h, ball } = pitchEngine;
  if (!ctx) return;

  // Turf grass stripes
  ctx.fillStyle = '#1e5229'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#174221'; for (let i = 0; i < 10; i += 2) ctx.fillRect(i * 80, 0, 80, h);

  // Boundary lines & half-way circle
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, w - 40, h - 40);
  ctx.beginPath(); ctx.moveTo(w / 2, 20); ctx.lineTo(w / 2, h - 20); ctx.stroke();
  ctx.beginPath(); ctx.arc(w / 2, h / 2, 65, 0, Math.PI * 2); ctx.stroke();

  // Penalty Boxes & Spots
  ctx.strokeRect(20, 140, 110, 200);
  ctx.strokeRect(w - 130, 140, 110, 200);
  ctx.beginPath(); ctx.arc(95, 240, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(w - 95, 240, 2.5, 0, Math.PI * 2); ctx.fill();

  // 1. PHYSICAL GOAL POSTS & MESH NETS (Visible Goal mouths)
  const drawGoalPostAndNet = (isLeft) => {
    const gx = isLeft ? 4 : w - 20;
    const depth = 16;
    const topY = 195, botY = 285;

    // Net interior shading & cross-hatch pattern
    ctx.fillStyle = 'rgba(240, 240, 240, 0.16)';
    ctx.fillRect(gx, topY, depth, botY - topY);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let ny = topY; ny <= botY; ny += 10) {
      ctx.beginPath(); ctx.moveTo(gx, ny); ctx.lineTo(gx + depth, ny); ctx.stroke();
    }
    for (let nx = gx; nx <= gx + depth; nx += 5) {
      ctx.beginPath(); ctx.moveTo(nx, topY); ctx.lineTo(nx, botY); ctx.stroke();
    }

    // Heavy Goal frame posts
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(gx, topY, depth, botY - topY);
  };
  drawGoalPostAndNet(true);
  drawGoalPostAndNet(false);

  // 2. BALL TRAIL SYSTEM
  if (ball.trail && ball.trail.length > 1) {
    for (let i = 0; i < ball.trail.length - 1; i++) {
      const p1 = ball.trail[i], p2 = ball.trail[i + 1];
      const alpha = (i / ball.trail.length) * 0.75;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1 + (i / ball.trail.length) * 3.5;
      ctx.stroke();
    }
  }

  // Players
  [...pitchEngine.homePlayers, ...pitchEngine.awayPlayers].forEach(p => {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.num === 1 ? (p.isHome ? pitchEngine.homeGKColor : pitchEngine.awayGKColor) : p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 7.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8.5px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.num, p.x, p.y + 3);
  });

  // Glowing Ball
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke();

  // 3. FLOATING ON-PITCH GOAL ALERTS
  pitchEngine.floatingAlerts = (pitchEngine.floatingAlerts || []).filter(a => a.life > 0);
  pitchEngine.floatingAlerts.forEach(a => {
    ctx.save();
    ctx.globalAlpha = Math.min(1, a.life / 20);
    ctx.font = '900 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(a.x - 140, a.y - 28, 280, 48);
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.strokeRect(a.x - 140, a.y - 28, 280, 48);
    ctx.fillStyle = '#facc15';
    ctx.fillText(a.text, a.x, a.y + 5);
    ctx.restore();
    a.life--;
    a.y -= 0.4;
  });
}

function update2DPitchPhysics() {
  const b = pitchEngine.ball;
  b.x += (b.targetX - b.x) * 0.16;
  b.y += (b.targetY - b.y) * 0.16;

  // Add trail breadcrumb
  b.trail.push({ x: b.x, y: b.y });
  if (b.trail.length > 12) b.trail.shift();

  [...pitchEngine.homePlayers, ...pitchEngine.awayPlayers].forEach(p => {
    const dx = b.x - p.baseX, dy = b.y - p.baseY, d = Math.hypot(dx, dy) || 1;
    p.x += (p.baseX + (dx / d) * Math.min(38, d * 0.28) - p.x) * 0.1;
    p.y += (p.baseY + (dy / d) * Math.min(38, d * 0.28) - p.y) * 0.1;
  });
  draw2DPitch();
}

/* ---------- MATCHDAY SIMULATION WITH VISUAL GOALS ---------- */
function startMatchdaySim() {
  const m = getActiveUserMatch(); if (!m || m.played) return;
  if ($('btnStartMatch')) $('btnStartMatch').disabled = true;
  const h = clubById(m.home), a = clubById(m.away), feed = $('commentaryFeed');
  if (feed) feed.innerHTML = ''; 
  if ($('matchTimelineBar')) $('matchTimelineBar').innerHTML = '';
  matchLiveState.isDerby = isRivalMatch(h, a);
  matchLiveState.reds = []; matchLiveState.yellows = {}; m.scorers = [];

  const pauseBtn = $('btnPauseMatch');
  if (pauseBtn) { pauseBtn.style.display = 'inline-flex'; pauseBtn.innerText = '⏸️ PAUSE'; }

  startStadiumCrowdLoop(matchLiveState.isDerby);
  playSoundSafe('whistle');

  let min = 0, hs = 0, as = 0;
  clearTimeout(matchSimInterval); 
  cancelAnimationFrame(animFrameId);

  function renderLoop() { 
    update2DPitchPhysics(); 
    if (min < 90) animFrameId = requestAnimationFrame(renderLoop); 
  }
  renderLoop();

  const triggerGoalVisual = (club, isHome) => {
    const sc = pickScorer(club); sc.goals++;
    isHome ? hs++ : as++;
    m.scorers.push({ team: club.name, player: sc.name, min });

    // Target the actual goal nets: (Left Goal x=12, Right Goal x=788)
    pitchEngine.ball.targetX = isHome ? 788 : 12;
    pitchEngine.ball.targetY = 220 + R(-25, 25);

    // Trigger on-canvas celebration badge
    pitchEngine.floatingAlerts.push({
      x: 400,
      y: 200,
      text: `⚽ GOAL! ${sc.name.split(' ').pop().toUpperCase()}`,
      life: 75
    });

    if (feed) feed.insertAdjacentHTML('afterbegin', `<div class="comm-line goal">⚽ ${min}' GOAL! ${club.name} (${sc.name}) [${hs}-${as}]</div>`);
    addTimelineEvent('goal', `⚽ ${min}' ${sc.name.split(' ').pop()}`);
    if ($('sbScore')) $('sbScore').innerText = `${hs} - ${as}`;
    playSoundSafe(isHome ? 'goal' : 'roar');
  };

  function tick() {
    if (matchLiveState.isPaused) {
      matchSimInterval = setTimeout(tick, 200);
      return;
    }

    min += 2; 
    pitchEngine.currentMinute = min;
    if ($('sbMinute')) $('sbMinute').innerText = `${min}'`;
    
    // Normal passage of play passes
    if (min % 4 === 0) {
      pitchEngine.ball.targetX = 140 + Math.random() * 520;
      pitchEngine.ball.targetY = 60 + Math.random() * 360;
    }

    const hS = computeClubAttributes(h), aS = computeClubAttributes(a);
    if (Math.random() < Math.max(0.01, (0.028 + (hS.att - aS.def) / 1400))) triggerGoalVisual(h, true);
    if (Math.random() < Math.max(0.01, (0.024 + (aS.att - hS.def) / 1400))) triggerGoalVisual(a, false);

    if (min >= 90) {
      cancelAnimationFrame(animFrameId);
      stopStadiumCrowdLoop();
      playSoundSafe('whistle');
      applyResult(m, hs, as, true);
      if ($('sbMinute')) $('sbMinute').innerText = 'FULL TIME';
      if ($('btnStartMatch')) $('btnStartMatch').disabled = false;
      if ($('btnPauseMatch')) $('btnPauseMatch').style.display = 'none';
      if (feed) feed.insertAdjacentHTML('afterbegin', `<div class="comm-line" style="font-weight:900;">🏁 Full Time: ${h.name} ${hs}-${as} ${a.name}</div>`);
      if (m.type === 'CUP') {
        if (hs === as) launchPenaltyShootout(m, h, a);
        else cupOutcome(m);
      }
      if ($('btnAdvanceMaster')) $('btnAdvanceMaster').className = 'btn-advance-master btn-continue-mode';
      if ($('btnAdvanceText')) $('btnAdvanceText').innerText = `CONTINUE TO WK ${state.currentWeek + 1}`;
      saveGame(); 
      renderStandingsTable(getCurrentUserClub().div); 
      return;
    }
    matchSimInterval = setTimeout(tick, Math.max(12, 120 / simSpeedMultiplier));
  }
  tick();
}

function addTimelineEvent(type, text) {
  matchLiveState.timelineEvents.push({ type, text });
  const bar = $('matchTimelineBar');
  if (bar) {
    const i = document.createElement('div');
    i.className = `timeline-event-item ${type}`; i.innerText = text; bar.appendChild(i);
  }
}

function setSimSpeed(s) { 
  simSpeedMultiplier = s; 
  if ($('spd1')) $('spd1').className = `btn-speed ${s === 1 ? 'active' : ''}`; 
  if ($('spd3')) $('spd3').className = `btn-speed ${s === 3 ? 'active' : ''}`; 
}
function triggerInstantSim() { simSpeedMultiplier = 25; }
function toggleMatchPause() {
  matchLiveState.isPaused = !matchLiveState.isPaused;
  if ($('btnPauseMatch')) $('btnPauseMatch').innerText = matchLiveState.isPaused ? '▶️ RESUME' : '⏸️ PAUSE';
}

/* ---------- BRACKETS & CUPS ---------- */
function initCupTournamentTrees() {
  const generateBracket = (name) => {
    const r16 = [];
    const pool = [...state.clubs].slice(0, 16);
    for (let i = 0; i < 16; i += 2) {
      r16.push({ h: (pool[i] && pool[i].name) || 'Team A', a: (pool[i + 1] && pool[i + 1].name) || 'Team B', hScore: null, aScore: null, winner: null });
    }
    return { name, r16, qf: [], sf: [], final: [] };
  };
  state.cupBrackets = { fa: generateBracket('The FA Cup'), carabao: generateBracket('Carabao Cup') };
}

function switchCupTreeTab(key) {
  activeCupTree = key;
  if ($('cupTabBtnFA')) $('cupTabBtnFA').className = `league-tab-btn ${key === 'fa' ? 'active' : ''}`;
  if ($('cupTabBtnCarabao')) $('cupTabBtnCarabao').className = `league-tab-btn ${key === 'carabao' ? 'active' : ''}`;
  renderCupBracketTree();
}

function renderCupBracketTree() {
  const container = $('cupBracketDisplayWrapper');
  if (!container || !state || !state.cupBrackets) return;
  const bracket = state.cupBrackets[activeCupTree];
  if (!bracket) return;

  const renderRound = (title, matches) => `
    <div class="bracket-round-column">
      <div class="bracket-round-title">${title}</div>
      ${(matches || []).map(m => `
        <div class="bracket-match-node">
          <div class="bracket-team-line ${m && m.winner === m.h ? 'winner' : ''}"><span>${(m && m.h) || 'TBD'}</span><span>${(m && m.hScore !== null) ? m.hScore : '-'}</span></div>
          <div class="bracket-team-line ${m && m.winner === m.a ? 'winner' : ''}"><span>${(m && m.a) || 'TBD'}</span><span>${(m && m.aScore !== null) ? m.aScore : '-'}</span></div>
        </div>
      `).join('')}
    </div>
  `;

  const qfNodes = bracket.qf && bracket.qf.length ? bracket.qf : Array(4).fill({ h: 'TBD', a: 'TBD' });
  const sfNodes = bracket.sf && bracket.sf.length ? bracket.sf : Array(2).fill({ h: 'TBD', a: 'TBD' });
  const finalNodes = bracket.final && bracket.final.length ? bracket.final : [{ h: 'Wembley Finalist 1', a: 'Wembley Finalist 2' }];

  container.innerHTML = `
    <div style="font-size:0.85rem; font-weight:900; color:var(--gold); margin-bottom:10px;">🏆 ${bracket.name} - Roadmap to Wembley</div>
    <div class="cup-tree-bracket">
      ${renderRound('Round of 16', bracket.r16 || [])}
      ${renderRound('Quarter Finals', qfNodes)}
      ${renderRound('Semi Finals', sfNodes)}
      ${renderRound('Wembley Final', finalNodes)}
    </div>
  `;
}

/* ---------- SAVE EXPORT, IMPORT & BACKUPS ---------- */
function saveGame() {
  if (!state) return;
  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, raw);
    if (state.currentWeek % 4 === 0) {
      const slot = ((Math.floor(state.currentWeek / 4) - 1) % 3) + 1;
      localStorage.setItem(`${BACKUP_PREFIX}${slot}`, JSON.stringify({
        savedAtWeek: state.currentWeek, savedSeason: state.seasonYear, timestamp: new Date().toLocaleTimeString(), data: raw
      }));
    }
  } catch(e) {
    try {
      for (let i = 1; i <= 3; i++) localStorage.removeItem(`${BACKUP_PREFIX}${i}`);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e2) {}
  }
}

function exportCareerSave() {
  if (!state) return;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FLM_Career_${getCurrentUserClub().name.replace(/\s+/g, '_')}_Wk${state.currentWeek}.json`;
  a.click();
  URL.revokeObjectURL(url);
  playSoundSafe('click');
}

function importCareerSave(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const loaded = JSON.parse(ev.target.result);
      if (!loaded.clubs || !loaded.manager) throw new Error('Invalid save');
      state = loaded;
      ensureAllSquadsHydrated();
      saveGame(); renderAll(); alert('✅ Career save loaded!');
    } catch(err) { alert('❌ Corrupted save file.'); }
  };
  reader.readAsText(file);
}

function restoreBackupSlot(slot) {
  const b = localStorage.getItem(`${BACKUP_PREFIX}${slot}`);
  if (!b) return;
  try {
    const parsed = JSON.parse(b);
    state = JSON.parse(parsed.data);
    ensureAllSquadsHydrated();
    saveGame(); renderAll(); alert(`✅ Restored to Week ${parsed.savedAtWeek}!`);
  } catch(e) { alert('Failed to restore backup.'); }
}

function renderBackupsList() {
  const container = $('backupsListContainer');
  if (!container) return;
  container.innerHTML = '';
  for (let s = 1; s <= 3; s++) {
    const b = localStorage.getItem(`${BACKUP_PREFIX}${s}`);
    const row = document.createElement('div');
    row.style.cssText = 'background:var(--bg-panel); border:1px solid var(--border); padding:8px 12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;';
    if (b) {
      const p = JSON.parse(b);
      row.innerHTML = `<span><b>Backup Slot ${s}</b>: Season ${p.savedSeason}, Week ${p.savedAtWeek} (${p.timestamp})</span> <button class="btn-swap-pill" style="background:#0284c7;color:#fff;" onclick="restoreBackupSlot(${s})">Restore</button>`;
    } else {
      row.innerHTML = `<span style="color:var(--text-muted);">Backup Slot ${s}: Empty</span> <button class="btn-swap-pill" disabled style="opacity:0.4;">Empty</button>`;
    }
    container.appendChild(row);
  }
}

/* ---------- INITIALIZATION & ENGINE HYDRATION ---------- */
function setupFreshState(managerName = 'Manager', clubId = 'NEW') {
  state = { 
    seasonYear: 2026, currentWeek: 1, totalWeeks: 46, userClubId: clubId, 
    currentFormation: '4-3-3', audioEnabled: true, activeStandingsTab: 0,
    medicalFacilityLevel: 1, academyFacilityLevel: 1, stadiumCapacityBonus: 0, 
    clubs: JSON.parse(JSON.stringify(CLUBS_DATABASE)),
    marketPlayers: JSON.parse(JSON.stringify(TRANSFER_SCOUT_POOL)), 
    standings: {}, newsFeed: [], cups: { carabaoAlive: true, faAlive: true },
    deadlineDaysCompleted: {}, youthProspects: [], youthIntakeCompleted: false, fixtures: [],
    customFormations: {},
    tacticalFamiliarity: { '4-3-3': 100, '4-2-3-1': 55, '4-4-2': 50, '3-5-2': 40, '5-3-2': 40, '4-1-2-1-2': 45, '4-5-1': 45 },
    manager: { 
      name: managerName, confidence: 85, fansApproval: 82, reputation: 2.5, contractYears: 2, warningsCount: 0,
      matches: 0, wins: 0, draws: 0, losses: 0, motmAwards: 0, faCups: 0, carabaoCups: 0, leagueTitles: 0, promotions: 0
    } 
  };
  state.clubs.forEach(c => { c.players = generateProceduralSquad(c); });
  buildStandings(); 
  generateTrueRoundRobinFixtures(); 
  generateInitialNews(); 
  generateYouthIntake(false); 
  initCupTournamentTrees();
}

function buildStandings() {
  for (let d = 0; d <= 3; d++) state.standings[d] = state.clubs.filter(c => c.div === d).map(c => ({ id: c.id, name: c.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }));
}

function ensureAllSquadsHydrated() {
  state.clubs.forEach(c => { 
    if (!c.players || c.players.length < 14) c.players = generateProceduralSquad(c);
    const configuredKit = CLUB_KITS_DATABASE[c.name];
    if (configuredKit) c.col = configuredKit.home;
    c.players.forEach(p => {
      if (p.chemistry === undefined) p.chemistry = R(55, 80);
      if (p.morale === undefined) p.morale = 'Good';
    });
  });
  if (!state.cups) state.cups = { carabaoAlive: true, faAlive: true };
  if (!state.tacticalFamiliarity) state.tacticalFamiliarity = { '4-3-3': 100, '4-2-3-1': 55, '4-4-2': 50, '3-5-2': 40, '5-3-2': 40, '4-1-2-1-2': 45, '4-5-1': 45 };
  if (!state.customFormations) state.customFormations = {};
  if (state.customFormations['Custom']) FORMATIONS['Custom'] = state.customFormations['Custom'];
  if (!state.cupBrackets) initCupTournamentTrees();
}

function initGame() {
  let ok = false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { 
      state = JSON.parse(saved); 
      if (!state.clubs || state.clubs.length < 92 || !state.manager) throw 0; 
      ensureAllSquadsHydrated(); 
      ok = true; 
    }
  } catch (e) { state = null; }
  if (!ok) { setupFreshState('Manager', 'NEW'); saveGame(); }
  layoutMatchday(); 
  initMarketFilterDropdowns(); 
  renderAll();
}

function openCareerSetupWizard() { 
  wizardChosenClubId = 'NEW'; 
  filterWizardClubs(0); 
  if ($('careerSetupModal')) $('careerSetupModal').style.display = 'flex'; 
}

function clubCardHtml(c) { 
  return `${createBadgeHtml(c.id, 32)}<div><div style="font-weight:800;font-size:.85rem">${c.name}</div><div style="font-size:.7rem;color:var(--text-muted)">${c.stadium}</div><div style="font-size:.72rem;color:var(--accent)">Budget: £${c.budget}M</div></div>`; 
}

function filterWizardClubs(div) {
  for (let i = 0; i <= 3; i++) {
    const tab = $(`wTab${i}`);
    if (tab) tab.className = `league-tab-btn ${i === div ? 'active' : ''}`;
  }
  const grid = $('wizardClubsGrid'); 
  if (!grid) return;
  grid.innerHTML = '';
  CLUBS_DATABASE.filter(c => c.div === div).forEach(c => {
    const card = document.createElement('div'); 
    card.className = `club-select-card ${c.id === wizardChosenClubId ? 'selected' : ''}`;
    card.onclick = () => { wizardChosenClubId = c.id; filterWizardClubs(div); }; 
    card.innerHTML = clubCardHtml(c); 
    grid.appendChild(card);
  });
}

function confirmNewCareerSetup() {
  const name = ($('wizardNameInput') && $('wizardNameInput').value.trim()) || 'Manager';
  if ($('careerSetupModal')) $('careerSetupModal').style.display = 'none';
  setupFreshState(name, wizardChosenClubId);
  initMarketFilterDropdowns(); 
  saveGame(); 
  renderAll(); 
  switchTab('tactics'); 
  playSoundSafe('whistle');
}

function promptNewCareer() { 
  if (confirm('Start a completely new career? Current progress will be reset.')) { 
    localStorage.removeItem(STORAGE_KEY); 
    openCareerSetupWizard(); 
  } 
}

function openClubSelectorModal() { filterModalClubs(0); if ($('clubSelectorModal')) $('clubSelectorModal').style.display = 'flex'; }
function closeClubSelectorModal() { if ($('clubSelectorModal')) $('clubSelectorModal').style.display = 'none'; }
function filterModalClubs(div) {
  for (let i = 0; i <= 3; i++) {
    const tab = $(`mTab${i}`);
    if (tab) tab.className = `league-tab-btn ${i === div ? 'active' : ''}`;
  }
  const grid = $('modalClubsGrid'); 
  if (!grid) return;
  grid.innerHTML = '';
  state.clubs.filter(c => c.div === div).forEach(c => {
    const card = document.createElement('div'); 
    card.style.cssText = 'background:var(--bg-panel);padding:8px 10px;border-radius:8px;cursor:pointer;border:1px solid var(--border);display:flex;align-items:center;gap:10px;';
    card.onclick = () => { 
      state.userClubId = c.id; 
      closeClubSelectorModal(); 
      saveGame(); 
      initMarketFilterDropdowns(); 
      renderAll(); 
      playSoundSafe('whistle'); 
    };
    card.innerHTML = clubCardHtml(c); 
    grid.appendChild(card);
  });
}

function buildRoundRobinSchedule(ids) {
  const n = ids.length, t = [...ids], rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const p = [];
    for (let i = 0; i < n / 2; i++) { 
      const h = t[i], a = t[n - 1 - i]; 
      p.push((i === 0 && r % 2) || (i > 0 && (r + i) % 2) ? { home: a, away: h } : { home: h, away: a }); 
    }
    rounds.push(p); t.splice(1, 0, t.pop());
  }
  return [...rounds, ...rounds.map(r => r.map(m => ({ home: m.away, away: m.home })))];
}

function generateTrueRoundRobinFixtures() {
  const sched = {}; 
  for (let d = 0; d <= 3; d++) sched[d] = buildRoundRobinSchedule(state.clubs.filter(c => c.div === d).map(c => c.id));
  state.fixtures = [];
  for (let w = 1; w <= state.totalWeeks; w++) {
    const matches = [];
    for (let d = 0; d <= 3; d++) {
      if (sched[d] && sched[d][w - 1]) {
        sched[d][w - 1].forEach(m => matches.push({ div: d, type: 'LEAGUE', home: m.home, away: m.away, homeGoals: null, awayGoals: null, played: false, scorers: [] }));
      }
    }
    state.fixtures.push({ week: w, matches, done: false, cupChecked: false });
  }
}

function ensureCupTie() {
  const w = getWeek(), cfg = CUP_WEEKS[state.currentWeek];
  if (!w || !cfg || w.cupChecked || w.done) return; 
  w.cupChecked = true;
  if (!state.cups[cfg[1] + 'Alive']) return;
  const opp = pick(state.clubs.filter(c => c.id !== state.userClubId)), homeUser = Math.random() < 0.5;
  w.matches.unshift({ 
    div: -1, type: 'CUP', cupName: cfg[0], cupKey: cfg[1], roundName: cfg[2], final: cfg[3], 
    home: homeUser ? state.userClubId : opp.id, away: homeUser ? opp.id : state.userClubId, 
    homeGoals: null, awayGoals: null, played: false, scorers: [] 
  });
}

function poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
function pickScorer(club) {
  const pool = []; 
  club.players.filter(p => p.starter && p.naturalPos !== 'GK').forEach(p => { 
    const w = p.naturalPos === 'FWD' ? 4 : p.naturalPos === 'MID' ? 2 : 1; 
    for (let i = 0; i < w; i++) pool.push(p); 
  });
  return pick(pool.length ? pool : club.players);
}

function simGoals(h, a) {
  const hs = computeClubAttributes(h), as = computeClubAttributes(a);
  const dh = (hs.att + hs.mid) / 2 - (as.def + as.mid) / 2, da = (as.att + as.mid) / 2 - (hs.def + hs.mid) / 2;
  return [poisson(Math.max(0.25, 1.4 + dh / 22 + 0.25)), poisson(Math.max(0.2, 1.15 + da / 22))];
}

function applyResult(m, hg, ag, scorersDone) {
  const h = clubById(m.home), a = clubById(m.away); 
  m.homeGoals = hg; m.awayGoals = ag; m.played = true;
  if (!scorersDone) {
    for (let i = 0; i < hg; i++) { const s = pickScorer(h); s.goals++; m.scorers.push({ team: h.name, player: s.name, min: R(3, 90) }); }
    for (let i = 0; i < ag; i++) { const s = pickScorer(a); s.goals++; m.scorers.push({ team: a.name, player: s.name, min: R(3, 90) }); }
  }
  if (ag === 0) { const g = h.players.find(p => p.starter && p.naturalPos === 'GK'); if (g) g.cleanSheets++; }
  if (hg === 0) { const g = a.players.find(p => p.starter && p.naturalPos === 'GK'); if (g) g.cleanSheets++; }

  [h, a].forEach(club => {
    club.players.filter(p => p.starter).forEach(p => {
      p.chemistry = Math.min(100, (p.chemistry || 60) + 1);
    });
  });

  const isUserHome = m.home === state.userClubId, isUserAway = m.away === state.userClubId;
  if (isUserHome || isUserAway) {
    const userWon = isUserHome ? hg > ag : ag > hg;
    const userLost = isUserHome ? hg < ag : ag < hg;
    const club = getCurrentUserClub();
    club.players.forEach(p => {
      if (userWon) p.morale = 'Superb';
      else if (userLost) p.morale = 'Fair';
    });
  }

  if (m.type === 'LEAGUE') updateLeagueTableRecord(m.div, m.home, m.away, hg, ag);
  else { 
    const prize = m.final ? 3.5 : 0.8;
    const winner = hg > ag ? h : a;
    winner.budget = +(winner.budget + prize).toFixed(1);
  }
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
  const derbyFactor = matchLiveState.isDerby ? 2 : 1;
  if (u > o) { 
    mg.wins++; 
    mg.confidence = Math.min(99, mg.confidence + 3 * derbyFactor); 
    mg.fansApproval = Math.min(99, mg.fansApproval + (u >= 3 ? 5 : 3) * derbyFactor);
    mg.reputation = Math.min(5.0, +(mg.reputation + 0.02).toFixed(2));
  } else if (u === o) { 
    mg.draws++; 
    mg.fansApproval = Math.max(15, mg.fansApproval - 1); 
  } else { 
    mg.losses++; 
    mg.confidence = Math.max(15, mg.confidence - 4 * derbyFactor); 
    mg.fansApproval = Math.max(15, mg.fansApproval - 4 * derbyFactor);
    mg.reputation = Math.max(1.0, +(mg.reputation - 0.01).toFixed(2));
  }
}

function cupWinnerId(m) { return m.homeGoals > m.awayGoals ? m.home : m.awayGoals > m.homeGoals ? m.away : m.penWinner; }
function cupOutcome(m) {
  const won = cupWinnerId(m) === state.userClubId, uc = getCurrentUserClub().name;
  if (!won) { 
    state.cups[m.cupKey + 'Alive'] = false; 
    addNewsStory('Cup Exit', `${uc} knocked out of the ${m.cupName}`, 'The cup run is over for this season.', false); 
  } else if (m.final) {
    if (m.cupKey === 'fa') state.manager.faCups++; else state.manager.carabaoCups++;
    state.manager.reputation = Math.min(5.0, +(state.manager.reputation + 0.35).toFixed(2));
    state.manager.confidence = Math.min(99, state.manager.confidence + 18);
    addNewsStory('Wembley Glory', `🏆 ${uc} WIN THE ${m.cupName.toUpperCase()} AT WEMBLEY!`, 'A magnificent silver trophy lifted beneath the arch.', true); 
    playSoundSafe('cheer');
  } else {
    addNewsStory('Cup Progress', `${uc} advance to next round of the ${m.cupName}`, 'On to the next round.', false);
  }
}

function checkManagerJobOffers() {
  if (pendingJobOffer || !state || state.currentWeek < 12 || Math.random() > 0.28) return;
  const userClub = getCurrentUserClub(), rep = state.manager.reputation || 2.5;
  let suitors = [];
  if (rep >= 4.2) suitors = state.clubs.filter(c => c.div === 0 && c.id !== userClub.id && c.budget >= 40);
  else if (rep >= 3.4) suitors = state.clubs.filter(c => (c.div === 0 || c.div === 1) && c.id !== userClub.id && c.str > userClub.str);
  else if (rep >= 2.6) suitors = state.clubs.filter(c => c.id !== userClub.id && (c.div < userClub.div || (c.div === userClub.div && c.budget > userClub.budget)));

  if (suitors.length > 0) {
    const suitor = pick(suitors);
    pendingJobOffer = { club: suitor, contractYears: R(2, 4) };
    const objs = getClubBoardObjectives(suitor);
    if ($('jobOfferDetails')) {
      $('jobOfferDetails').innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px; background:var(--bg-panel); padding:12px; border-radius:8px;">
          ${createBadgeHtml(suitor.id, 48)}
          <div>
            <h3 style="font-size:1.1rem; color:#fff;">${suitor.name}</h3>
            <p style="font-size:0.75rem; color:var(--accent);">${DIV_NAMES[suitor.div]} • Budget: £${suitor.budget}M</p>
          </div>
        </div>
        <p>Following your tactical reputation (⭐ <b>${rep.toFixed(1)}</b>), <b>${suitor.name}</b> invites you to become their new manager!</p>
        <ul style="margin:12px 0 12px 20px; font-size:0.8rem; color:#cbd5e1;">
          <li><b>Contract Term:</b> ${pendingJobOffer.contractYears} Years</li>
          <li><b>Transfer Budget:</b> £${suitor.budget}M</li>
          <li><b>Board Expectation:</b> ${objs.leagueObj}</li>
        </ul>
      `;
    }
    if ($('jobOfferModal')) $('jobOfferModal').style.display = 'flex';
  }
}

function acceptJobOffer() {
  if (!pendingJobOffer) return;
  const newClub = pendingJobOffer.club, oldClubName = getCurrentUserClub().name;
  state.userClubId = newClub.id;
  state.manager.contractYears = pendingJobOffer.contractYears;
  state.manager.confidence = 85;
  state.manager.warningsCount = 0;
  addNewsStory('New Chapter', `${state.manager.name} joins ${newClub.name}`, `Departed ${oldClubName} to take over the hotseat.`, true);
  pendingJobOffer = null;
  if ($('jobOfferModal')) $('jobOfferModal').style.display = 'none';
  saveGame(); renderAll(); alert(`🤝 Welcome to ${newClub.name}!`); playSoundSafe('cheer');
}

function declineJobOffer() {
  pendingJobOffer = null;
  if ($('jobOfferModal')) $('jobOfferModal').style.display = 'none';
}

function finalizeWeek() {
  const w = getWeek(); if (!w || w.done) return;
  ensureCupTie();
  w.matches.forEach(m => {
    if (m.played) return; const h = clubById(m.home), a = clubById(m.away); if (!h || !a) return;
    const [hg, ag] = simGoals(h, a); applyResult(m, hg, ag, false);
    if (m.type === 'CUP') { if (hg === ag) { w.pendingPens = true; launchPenaltyShootout(m, h, a); } else cupOutcome(m); }
  });
  const club = getCurrentUserClub(), lm = getActiveUserMatch();
  if (lm && lm.home === club.id) club.budget += +(((club.cap + state.stadiumCapacityBonus) * 0.00004)).toFixed(2);
  
  club.budget = +(club.budget + [0.45, 0.20, 0.08, 0.03][club.div]).toFixed(2);
  club.budget = Math.max(0, +(club.budget - computeClubWeeklyWageBill(club) * 0.4).toFixed(2));

  applyWeeklyFatigueAndInjuries();
  generateWeeklyNewsStory();
  try { checkManagerJobOffers(); } catch(e) {}
  if (state.currentWeek === 30 && !state.youthIntakeCompleted) generateYouthIntake(true);
  w.done = true; saveGame();
}

function applyWeeklyFatigueAndInjuries() {
  const club = getCurrentUserClub(), med = (state.medicalFacilityLevel || 1) * 3;
  club.players.forEach(p => {
    if (p.inj > 0) { p.inj--; if (!p.inj) addNewsStory('Medical Update', `${p.name} fit to return`, 'Resumed first-team training.', false); }
    if (p.susp > 0) p.susp--;
    if (p.starter) p.con = Math.max(55, p.con - R(4, 9));
    else p.con = Math.min(100, p.con + 20 + med);
  });
}

function generateWeeklyNewsStory() {
  const m = getActiveUserMatch(); if (!m || !m.played) return;
  const uc = getCurrentUserClub(), home = m.home === uc.id, opp = clubById(home ? m.away : m.home), my = home ? m.homeGoals : m.awayGoals, th = home ? m.awayGoals : m.homeGoals;
  if (my > th) addNewsStory('Match Reaction', `Victory: ${uc.name} ${my}-${th} ${opp.name}`, 'A confident display.', false);
  else if (my < th) addNewsStory('Defeat Reaction', `Loss: ${uc.name} ${my}-${th} ${opp.name}`, 'Supporters question tactical choices.', false);
  else addNewsStory('Draw Reaction', `Points shared: ${uc.name} ${my}-${th} ${opp.name}`, 'Hard-fought point on the road.', false);
}

function handleMasterAdvanceClick() {
  if (!state || (shootoutState && shootoutState.active)) return;
  if (checkDeadlineDayTrigger()) return;
  const m = getActiveUserMatch();
  if (m && !m.played) {
    clearTimeout(matchSimInterval); cancelAnimationFrame(animFrameId); 
    if ($('btnStartMatch')) $('btnStartMatch').disabled = false;
    finalizeWeek(); renderAll();
    if (!(shootoutState && shootoutState.active)) showResultModal(m); return;
  }
  const w = getWeek(); if (w && !w.done) { finalizeWeek(); if (shootoutState && shootoutState.active) return; }
  if (state.currentWeek >= state.totalWeeks) { showEndSeasonGala(); return; }
  state.currentWeek++; resetLiveState();
  saveGame(); renderAll(); playSoundSafe('click');
}

function resetLiveState() {
  matchLiveState = { subsUsed: 0, maxSubs: 5, pendingSubInId: null, isPaused: false, timelineEvents: [], yellows: {}, reds: [], isDerby: false };
  const subCount = $('subsRemainingText'); if (subCount) subCount.innerText = 5;
  const pauseBtn = $('btnPauseMatch'); if (pauseBtn) { pauseBtn.style.display = 'none'; pauseBtn.innerText = '⏸️ PAUSE'; }
}

function showResultModal(m) {
  const h = clubById(m.home), a = clubById(m.away);
  if ($('modalScoreDisplay')) {
    $('modalScoreDisplay').innerHTML = `<div class="result-modal-scoreboard"><div class="result-team">${createBadgeHtml(h.id, 46)}<div class="result-team-name">${h.name}</div></div><div class="result-score-center"><div class="result-score-digits">${m.homeGoals} - ${m.awayGoals}</div><div class="result-ft-badge">FULL TIME</div></div><div class="result-team">${createBadgeHtml(a.id, 46)}<div class="result-team-name">${a.name}</div></div></div>`;
  }
  const sc = m.scorers.map(s => `${s.min}' ${s.player}`).join(', ');
  if ($('modalHighlightsFeed')) {
    $('modalHighlightsFeed').innerHTML = `<p style="margin-top:6px">${sc ? 'Goals: ' + sc : 'No goals in this fixture.'}</p>`;
  }
  if ($('resultSummaryModal')) $('resultSummaryModal').style.display = 'flex'; 
  playSoundSafe('whistle');
}
function dismissResultModal() { if ($('resultSummaryModal')) $('resultSummaryModal').style.display = 'none'; handleMasterAdvanceClick(); }

function launchPenaltyShootout(m, h, a) {
  shootoutState = { active: true, match: m, homeClub: h, awayClub: a, homeScore: 0, awayScore: 0, homeKicks: [], awayKicks: [], turn: 'home' };
  if ($('penHomeTeamName')) $('penHomeTeamName').innerText = h.name; 
  if ($('penAwayTeamName')) $('penAwayTeamName').innerText = a.name; 
  if ($('penHomeScore')) $('penHomeScore').innerText = '0'; 
  if ($('penAwayScore')) $('penAwayScore').innerText = '0';
  if ($('penHomePips')) $('penHomePips').innerHTML = ''; 
  if ($('penAwayPips')) $('penAwayPips').innerHTML = ''; 
  if ($('penKickStatusText')) $('penKickStatusText').innerText = `${h.name} to shoot first`;
  if ($('btnTakePenalty')) $('btnTakePenalty').disabled = false; 
  if ($('shootoutModal')) $('shootoutModal').style.display = 'flex'; 
  playSoundSafe('whistle');
}

function takeShootoutTurn() {
  const s = shootoutState; if (!s || !s.active) return; const home = s.turn === 'home', scored = Math.random() < 0.78, team = home ? s.homeClub : s.awayClub;
  if (home) { s.homeKicks.push(scored); if (scored) s.homeScore++; s.turn = 'away'; } else { s.awayKicks.push(scored); if (scored) s.awayScore++; s.turn = 'home'; }
  [['penHomePips', s.homeKicks], ['penAwayPips', s.awayKicks]].forEach(([id, k]) => { const el = $(id); if (el) el.innerHTML = k.map(r => `<div class="pen-pip ${r ? 'scored' : 'missed'}"></div>`).join(''); });
  if ($('penHomeScore')) $('penHomeScore').innerText = s.homeScore; 
  if ($('penAwayScore')) $('penAwayScore').innerText = s.awayScore;
  if ($('penKickStatusText')) $('penKickStatusText').innerHTML = scored ? `⚽ <b style="color:#10b981">SCORED!</b> ${team.name}` : `❌ <b style="color:#ef4444">MISSED!</b> ${team.name}`; 
  playSoundSafe(scored ? 'goal' : 'groan');
  const hk = s.homeKicks.length, ak = s.awayKicks.length;
  if (hk === ak && hk >= 5 && s.homeScore !== s.awayScore) concludeShootout();
  else if (hk <= 5 && ak <= 5 && (s.homeScore > s.awayScore + (5 - ak) || s.awayScore > s.homeScore + (5 - hk))) concludeShootout();
}

function concludeShootout() {
  const s = shootoutState; 
  if ($('btnTakePenalty')) $('btnTakePenalty').disabled = true;
  const winner = s.homeScore > s.awayScore ? s.homeClub : s.awayClub; s.match.penWinner = winner.id; cupOutcome(s.match);
  setTimeout(() => {
    if ($('shootoutModal')) $('shootoutModal').style.display = 'none'; 
    s.active = false;
    alert(`🏆 ${winner.name} win ${s.homeScore}-${s.awayScore} on penalties!`); saveGame(); renderAll();
    showResultModal(s.match);
  }, 1200);
}

function checkDeadlineDayTrigger() {
  if ((state.currentWeek === 4 || state.currentWeek === 22) && !state.deadlineDaysCompleted[state.currentWeek]) { 
    deadlineHour = 12; updateDeadlineModalUI(); 
    if ($('deadlineModal')) $('deadlineModal').style.display = 'flex'; 
    playSoundSafe('whistle'); return true; 
  }
  return false;
}

function updateDeadlineModalUI() {
  if ($('deadlineClockDisplay')) $('deadlineClockDisplay').innerText = `${12 - deadlineHour + 11}:00 (${deadlineHour}h left)`;
  const hd = $('deadlineOfferHeadline'), dt = $('deadlineOfferDetails'), bt = $('deadlineActionButtons');
  if (pendingAIBid) {
    if (hd) hd.innerText = `🚨 Bid: £${pendingAIBid.fee.toFixed(1)}M from ${pendingAIBid.buyer}`; 
    if (dt) dt.innerHTML = `<b>${pendingAIBid.buyer}</b> offer <b>£${pendingAIBid.fee.toFixed(1)}M</b> for <b>${pendingAIBid.player.name}</b>.`;
    if (bt) {
      bt.style.display = 'flex'; 
      bt.innerHTML = `<button class="btn-swap-pill" style="background:#10b981;color:#fff" onclick="acceptDeadlineBid()">Accept</button><button class="btn-swap-pill" style="background:#ef4444;color:#fff" onclick="rejectDeadlineBid()">Reject</button>`;
    }
  } else { 
    if (hd) hd.innerText = 'Transfer Market Monitoring'; 
    if (dt) dt.innerText = 'No bids right now. Advance the clock to hear rival enquiries.'; 
    if (bt) bt.style.display = 'none'; 
  }
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
  addNewsStory('Deadline Day', `${p.name} joins ${pendingAIBid.buyer} for £${pendingAIBid.fee.toFixed(1)}M`, 'Deal completed.', true);
  pendingAIBid = null; saveGame(); renderAll(); updateHeaderClubDisplay(); updateDeadlineModalUI();
}

function rejectDeadlineBid() { pendingAIBid = null; updateDeadlineModalUI(); }
function closeDeadlineDay() {
  state.deadlineDaysCompleted[state.currentWeek] = true; pendingAIBid = null; 
  if ($('deadlineModal')) $('deadlineModal').style.display = 'none';
  addNewsStory('Window Closed', 'TRANSFER WINDOW SLAMS SHUT', 'Squads locked in.', true); saveGame(); renderAll();
}

function fixStarters(club) {
  while (club.players.filter(p => p.starter).length < 11) { const n = club.players.find(p => !p.starter); if (!n) break; n.starter = true; }
}

/* ---------- TACTICS & INTERACTIVE DRAG ENGINE ---------- */
function changeFormation(f) {
  state.currentFormation = f;
  autoPickBestXI();
}

function autoPickBestXI() {
  const club = getCurrentUserClub(), tpl = FORMATIONS[state.currentFormation] || FORMATIONS['4-3-3'];
  club.players.forEach(p => p.starter = false);
  const pool = [...club.players].sort((a, b) => b.ovr * b.con - a.ovr * a.con), picked = [];
  tpl.forEach(slot => { 
    let i = pool.findIndex(p => p.naturalPos === slot.posType && !p.susp && !p.inj); 
    if (i < 0) i = 0; 
    picked.push(pool.splice(i, 1)[0]); 
  });
  picked.forEach((p, i) => { p.starter = true; p.role = tpl[i].duty; });
  club.players = [...picked, ...pool]; 
  cancelPlayerSwap(); saveGame(); renderTactics(); updateHeaderClubDisplay(); playSoundSafe('whistle');
}

function handlePlayerSelect(id) {
  const club = getCurrentUserClub();
  if (!selectedPlayerSwapId) {
    selectedPlayerSwapId = id; const p = club.players.find(x => x.id === id);
    if ($('swapNotificationText')) $('swapNotificationText').innerHTML = `🔄 <b>${p.name}</b> selected — choose swap target`; 
    if ($('swapNotificationBar')) $('swapNotificationBar').style.display = 'flex'; 
    renderTactics(); playSoundSafe('click'); return;
  }
  if (selectedPlayerSwapId === id) { cancelPlayerSwap(); return; }
  const i = club.players.findIndex(x => x.id === selectedPlayerSwapId), j = club.players.findIndex(x => x.id === id);
  if (i >= 0 && j >= 0) {
    const a = club.players[i], b = club.players[j]; 
    [a.starter, b.starter] = [b.starter, a.starter]; 
    [a.role, b.role] = [b.role, a.role]; 
    club.players[i] = b; club.players[j] = a;
    club.players = [...club.players.filter(p => p.starter), ...club.players.filter(p => !p.starter)];
  }
  cancelPlayerSwap(); saveGame(); renderTactics(); updateHeaderClubDisplay(); playSoundSafe('whistle');
}

function cancelPlayerSwap() { selectedPlayerSwapId = null; if ($('swapNotificationBar')) $('swapNotificationBar').style.display = 'none'; renderTactics(); }

function renderTactics() {
  const club = getCurrentUserClub(), tpl = FORMATIONS[state.currentFormation] || FORMATIONS['4-3-3'];
  const st = club.players.filter(p => p.starter), bench = club.players.filter(p => !p.starter);
  if ($('formationSelect')) $('formationSelect').value = state.currentFormation;

  const nodes = $('pitchNodesWrapper');
  if (nodes) {
    nodes.innerHTML = '';
    const userKit = getClubKitColors(club);

    st.forEach((p, i) => {
      let t = tpl[i] || { x: 50, y: 50, role: TAG[p.naturalPos], duty: p.role, posType: p.naturalPos };
      const n = document.createElement('div');
      n.className = `pitch-node ${selectedPlayerSwapId === p.id ? 'selected-for-swap' : ''}`;
      n.style.left = t.x + '%'; 
      n.style.top = t.y + '%';

      const famMult = Math.round(getPositionFamiliarityMultiplier(p.naturalPos, t.posType) * 100);
      const famColor = famMult === 100 ? '#10b981' : famMult >= 75 ? '#f59e0b' : '#ef4444';
      const nodeKit = i === 0 ? (userKit.gk || '#047857') : userKit.home;

      n.innerHTML = `<div class="pitch-kit" style="background:${nodeKit}">${i + 1}<div class="pitch-role-tag">${t.role}</div></div>
        <div class="pitch-name-card">
          <div class="p-name">${p.name.split(' ').pop()} ${p.inj > 0 ? '🚑' : ''}</div>
          <div class="p-role">${p.ovr} OVR • <span style="color:${famColor};font-weight:800;">${famMult}%</span></div>
        </div>`;

      n.onclick = () => handlePlayerSelect(p.id);
      nodes.appendChild(n);
    });
  }

  const row = (p, tag, cls) => {
    const sel = selectedPlayerSwapId === p.id;
    const tr = document.createElement('tr');
    tr.className = `fm-row ${sel ? 'selected-for-swap' : ''}`;
    tr.innerHTML = `<td style="padding:6px;"><span class="badge-pick ${cls}">${tag}</span></td>
      <td style="padding:6px;">${p.role}</td><td style="padding:6px;"><b>${p.name}</b></td>
      <td style="padding:6px;">${p.age}</td><td style="padding:6px;color:var(--gold);font-weight:900;">${p.ovr}</td>
      <td style="padding:6px;">${p.con}%</td><td style="padding:6px;">${p.morale}</td><td style="padding:6px;color:#38bdf8;">🤝${p.chemistry || 60}%</td>
      <td style="padding:6px;">${p.contract} yr</td><td style="padding:6px;">£${Math.round(p.wage * 1000)}k</td>
      <td style="padding:6px;text-align:right;"><button class="btn-swap-pill" onclick="handlePlayerSelect('${p.id}')">${sel ? 'Cancel' : 'Swap ⇅'}</button></td>`;
    return tr;
  };
  const sb = $('startersTableBody'), bb = $('benchTableBody');
  if (sb) { sb.innerHTML = ''; st.forEach((p, i) => sb.appendChild(row(p, (tpl[i] && tpl[i].role) || p.naturalPos, 'pick-starter'))); }
  if (bb) { bb.innerHTML = ''; bench.forEach((p, i) => bb.appendChild(row(p, 'S' + (i + 1), 'pick-sub'))); }
}

/* ---------- IN-MATCH SUBSTITUTIONS ---------- */
function cancelInMatchSub() {
  matchLiveState.pendingSubInId = null;
  populateInMatchSubChips();
}

function populateInMatchSubChips() {
  const container = $('benchSubChipsList');
  if (!container) return;
  const drawer = $('inMatchSubDrawer');
  const titleElem = drawer ? drawer.querySelector('.in-match-sub-title') : null;
  container.innerHTML = '';
  const club = getCurrentUserClub();

  if (matchLiveState.pendingSubInId) {
    const incomingPlayer = club.players.find(p => p.id === matchLiveState.pendingSubInId);
    if (titleElem) {
      titleElem.innerHTML = `<span>🔄 Subbing in: <b style="color:var(--gold)">${incomingPlayer ? incomingPlayer.name : ''}</b></span> <button class="btn-swap-pill" style="padding:2px 8px;font-size:0.68rem;" onclick="cancelInMatchSub()">Cancel</button>`;
    }
    club.players.filter(p => p.starter).forEach(p => {
      const isRed = matchLiveState.reds.includes(p.id);
      const chip = document.createElement('div');
      chip.className = 'sub-chip starter-chip';
      chip.style.opacity = isRed ? '0.4' : '1';
      chip.innerHTML = `<span>${p.name} (${p.naturalPos} • ${p.con}%)</span><b style="color:${isRed ? '#ef4444' : '#f87171'}">${isRed ? 'SENT OFF' : 'Sub Off ⬇'}</b>`;
      if (!isRed) chip.onclick = () => confirmLiveMatchSub(p.id);
      container.appendChild(chip);
    });
    return;
  }

  const remaining = matchLiveState.maxSubs - matchLiveState.subsUsed;
  if (titleElem) {
    titleElem.innerHTML = `<span>🔄 TACTICAL SUBSTITUTIONS (REMAINING: <span id="subsRemainingText">${remaining}</span>)</span>`;
  }
  if (remaining <= 0) {
    container.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted);">All substitutions used for this match.</span>';
    return;
  }
  const bench = club.players.filter(p => !p.starter && !p.inj && !p.susp);
  bench.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'sub-chip';
    chip.innerHTML = `<span>${p.name} (${p.naturalPos} • OVR ${p.ovr} • ${p.con}%)</span><b style="color:#10b981">Bring On ⬆</b>`;
    chip.onclick = () => { matchLiveState.pendingSubInId = p.id; populateInMatchSubChips(); };
    container.appendChild(chip);
  });
}

function confirmLiveMatchSub(starterOutId) {
  if (matchLiveState.subsUsed >= matchLiveState.maxSubs || !matchLiveState.pendingSubInId) return;
  const club = getCurrentUserClub();
  const inP = club.players.find(x => x.id === matchLiveState.pendingSubInId);
  const outP = club.players.find(x => x.id === starterOutId);
  if (!inP || !outP) { cancelInMatchSub(); return; }

  inP.starter = true; outP.starter = false; inP.role = outP.role;
  matchLiveState.subsUsed++; matchLiveState.pendingSubInId = null;

  addTimelineEvent('sub', `🔄 ${pitchEngine.currentMinute}' ${inP.name.split(' ').pop()} on for ${outP.name.split(' ').pop()}`);
  populateInMatchSubChips();
  const m = getActiveUserMatch();
  if (m) setup2DPlayers(clubById(m.home), clubById(m.away));
  playSoundSafe('click');
}

/* ---------- STANDINGS & EUROPEAN QUALIFICATION ---------- */
function renderStandingsTable(div) {
  state.activeStandingsTab = div;
  for (let i = 0; i <= 3; i++) {
    const tab = $(`tabTier${i}`);
    if (tab) tab.className = `league-tab-btn ${i === div ? 'active' : ''}`;
  }
  const body = $('leagueTableBody'); 
  if (!body) return;
  body.innerHTML = '';
  const rows = [...(state.standings[div] || [])].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  rows.forEach((r, i) => {
    const tr = document.createElement('tr'); tr.className = 'fm-row';
    if (r.id === state.userClubId) tr.style.background = 'rgba(0,210,255,.15)';

    let borderCol = '';
    if (div === 0) {
      if (i < 4) borderCol = '#38bdf8';
      else if (i === 4) borderCol = '#f59e0b';
      else if (i === 5) borderCol = '#10b981';
      else if (i >= 17) borderCol = '#ef4444';
    } else {
      if (i < 2) borderCol = '#10b981';
      else if (i < 6) borderCol = '#f59e0b';
      else if (i >= rows.length - 3) borderCol = '#ef4444';
    }

    tr.innerHTML = `<td><b>${i + 1}</b></td><td style="display:flex;align-items:center;gap:8px">${createBadgeHtml(r.id, 20)}<b>${r.name}</b>${r.id === state.userClubId ? ' ⭐' : ''}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gd > 0 ? '+' + r.gd : r.gd}</td><td><b>${r.pts}</b></td>`;
    if (borderCol) tr.firstElementChild.style.borderLeft = `3px solid ${borderCol}`;
    body.appendChild(tr);
  });
}

/* ---------- MATCHDAY VIEW & VENUES ---------- */
function renderMatchdayView() {
  const m = getActiveUserMatch();
  if (m) {
    const h = clubById(m.home), a = clubById(m.away);
    const isDerby = isRivalMatch(h, a);
    if ($('derbyBannerWrap'))$('derbyBannerWrap').style.display = isDerby ? 'block' : 'none';

    const compText = m.type === 'CUP' ? `${m.cupName} - ${m.roundName || 'Knockout Round'}` : `${DIV_NAMES[m.div]} - Matchday ${state.currentWeek}`;
    if ($('matchCompetitionBadge'))$('matchCompetitionBadge').innerText = compText;
    if ($('matchVenueBadge'))$('matchVenueBadge').innerText = m.final ? '🏟️ Wembley Stadium (National Final)' : `🏟️ ${h.stadium}`;

    if ($('sbHomeBadgeWrap'))$('sbHomeBadgeWrap').innerHTML = createBadgeHtml(h.id, 40);
    if ($('sbAwayBadgeWrap'))$('sbAwayBadgeWrap').innerHTML = createBadgeHtml(a.id, 40);
    if ($('sbHomeName'))$('sbHomeName').innerText = h.name; 
    if ($('sbAwayName'))$('sbAwayName').innerText = a.name;
    if ($('sbScore'))$('sbScore').innerText = m.played ? `${m.homeGoals} - ${m.awayGoals}` : '0 - 0';
    if ($('sbMinute'))$('sbMinute').innerText = m.played ? 'FULL TIME' : 'PRE-MATCH';
    if ($('btnStartMatch'))$('btnStartMatch').disabled = m.played;

    setup2DPlayers(h, a);
    populateInMatchSubChips();
  }
}

/* ---------- TRANSFER MARKET ---------- */
function initMarketFilterDropdowns() {
  if ($('filterMarketNation')) {$('filterMarketNation').innerHTML = ['ALL', 'ENG', 'SCO', 'WAL', 'IRL', 'NIR', ...NATS.slice(4)].map(n => `<option value="${n}">${n === 'ALL' ? 'All Nations' : n}</option>`).join('');
  }
  onMarketLeagueChange();
}

function onMarketLeagueChange() {
  const filterLeague = $('filterMarketLeague');
  const t = $('filterMarketTeam'); 
  if (t) t.innerHTML = '<option value="ALL">All Teams</option>';
  const v = filterLeague ? filterLeague.value : 'ALL';
  if (v !== 'ALL' && v !== 'SCOUT' && t) {
    state.clubs.filter(c => c.div === +v && c.id !== state.userClubId).forEach(c => { 
      const o = document.createElement('option'); o.value = c.id; o.innerText = c.name; t.appendChild(o); 
    });
  }
  renderTransfers();
}

function resetMarketFilters() { 
  if ($('marketSearchInput'))$('marketSearchInput').value = ''; 
  if ($('filterMarketLeague'))$('filterMarketLeague').value = 'ALL'; 
  if ($('filterMarketPos'))$('filterMarketPos').value = 'ALL'; 
  if ($('filterMarketNation'))$('filterMarketNation').value = 'ALL'; 
  onMarketLeagueChange(); 
}

function toggleMarketSort(k) { 
  if (marketSortKey === k) marketSortAsc = !marketSortAsc; 
  else { marketSortKey = k; marketSortAsc = k === 'name' || k === 'clubName'; } 
  renderTransfers(); 
}

function renderTransfers() {
  const club = getCurrentUserClub(); 
  if ($('marketBudgetDisplay'))$('marketBudgetDisplay').innerText = `Available: £${club.budget.toFixed(1)}M`;
  const q = $('marketSearchInput') ?$('marketSearchInput').value.toLowerCase().trim() : '';
  const fl = $('filterMarketLeague') ?$('filterMarketLeague').value : 'ALL';
  const ft = $('filterMarketTeam') ?$('filterMarketTeam').value : 'ALL';
  const fp = $('filterMarketPos') ?$('filterMarketPos').value : 'ALL';
  const fn = $('filterMarketNation') ?$('filterMarketNation').value : 'ALL';

  let pool = state.marketPlayers.map(p => ({ id: p.id, name: p.name, naturalPos: p.naturalPos, nat: p.nat, age: p.age, ovr: p.ovr, price: p.price, clubName: p.club || 'Foreign Club', clubId: 'SCOUT', div: -1, scout: true }));
  state.clubs.forEach(c => { 
    if (c.id !== club.id) c.players.forEach(p => pool.push({ id: p.id, name: p.name, naturalPos: p.naturalPos, nat: p.nat, age: p.age, ovr: p.ovr, price: +(p.val * 1.15).toFixed(1), clubName: c.name, clubId: c.id, div: c.div, scout: false })); 
  });
  if (q) pool = pool.filter(p => p.name.toLowerCase().includes(q)); 
  if (fl === 'SCOUT') pool = pool.filter(p => p.scout); else if (fl !== 'ALL') pool = pool.filter(p => p.div === +fl);
  if (ft !== 'ALL') pool = pool.filter(p => p.clubId === ft); 
  if (fp !== 'ALL') pool = pool.filter(p => p.naturalPos === fp); 
  if (fn !== 'ALL') pool = pool.filter(p => p.nat === fn);
  pool.sort((a, b) => typeof a[marketSortKey] === 'string' ? (marketSortAsc ? a[marketSortKey].localeCompare(b[marketSortKey]) : b[marketSortKey].localeCompare(a[marketSortKey])) : (marketSortAsc ? a[marketSortKey] - b[marketSortKey] : b[marketSortKey] - a[marketSortKey]));
  
  if ($('transferMarketBody')) {$('transferMarketBody').innerHTML = pool.slice(0, 100).map(p => {
      const ok = club.budget >= p.price;
      return `<tr class="fm-row"><td><b>${p.name}</b></td><td>${p.naturalPos}</td><td>${p.nat}</td><td>${p.age}</td><td><b style="color:var(--gold)">${p.ovr}</b></td><td>£${p.price.toFixed(1)}M</td><td>${p.clubName}</td><td><button class="btn-swap-pill" style="${ok ? 'background:#059669;color:#fff' : 'opacity:.4'}" onclick="executeBuyPlayer('${p.id}',${p.scout},'${p.clubId}')">${ok ? 'Sign' : 'No funds'}</button></td></tr>`;
    }).join('');
  }
}

function executeBuyPlayer(id, scout, sellerId) {
  const club = getCurrentUserClub();
  if (scout) {
    const i = state.marketPlayers.findIndex(x => x.id === id); if (i < 0) return; const t = state.marketPlayers[i];
    if (club.budget < t.price) { alert('Insufficient funds.'); return; }
    club.budget -= t.price; state.marketPlayers.splice(i, 1);
    club.players.push({ id: 'trans_' + Date.now(), name: t.name, naturalPos: t.naturalPos, nat: t.nat, age: t.age, ovr: t.ovr, con: 100, role: ROLE[t.naturalPos], starter: false, val: t.price, wage: 0.05, contract: 3, morale: 'Superb', chemistry: 60, goals: 0, cleanSheets: 0, inj: 0, yellows: 0, susp: 0 });
  } else {
    const s = clubById(sellerId); if (!s) return; const i = s.players.findIndex(x => x.id === id); if (i < 0) return; const t = s.players[i], fee = +(t.val * 1.15).toFixed(1);
    if (club.budget < fee) { alert('Insufficient funds.'); return; }
    club.budget -= fee; s.budget += fee; s.players.splice(i, 1); fixStarters(s);
    club.players.push({ ...t, starter: false, morale: 'Superb', chemistry: 60 });
  }
  saveGame(); renderAll(); updateHeaderClubDisplay(); renderTransfers(); playSoundSafe('cheer');
}

/* ---------- YOUTH ACADEMY & NEWS FEED ---------- */
function generateYouthIntake(announce) {
  const lvl = state.academyFacilityLevel || 1, n = R(3, 5);
  state.youthProspects = Array.from({ length: n }, (_, i) => {
    const pos = pick(['GK', 'DEF', 'MID', 'FWD']), ovr = 52 + lvl * 2 + R(0, 5), potential = Math.min(95, ovr + 18 + R(0, 14));
    return { id: `youth_${Date.now()}_${i}`, name: pick(FIRSTNAMES) + ' ' + pick(SURNAMES), naturalPos: pos, nat: 'ENG', age: R(15, 17), ovr, potential, wage: 0.005, contract: 3, signed: false };
  });
  if (announce) { state.youthIntakeCompleted = true; addNewsStory('Academy Day', `Spring Intake: ${n} prospects at ${getCurrentUserClub().name}`, 'Wonderkids ready for inspection.', true); }
}

function generateInitialNews() {
  state.newsFeed = [{ tag: 'Season Kick-Off', breaking: true, headline: `${state.seasonYear}/${String(state.seasonYear + 1).slice(-2)} season underway: 92 clubs battle for glory`, body: 'Boards demand results across the pyramid.', time: 'Week 1' }];
}
function addNewsStory(tag, headline, body, breaking = false) { 
  if (!state || !state.newsFeed) return;
  state.newsFeed.unshift({ tag, headline, body, breaking, time: `Week ${state.currentWeek}` }); 
  if (state.newsFeed.length > 25) state.newsFeed.pop(); 
}

/* ---------- MANAGER & MASTER RENDER ---------- */
function updateHeaderClubDisplay() {
  const c = getCurrentUserClub(); if (!c) return;
  const s = computeClubAttributes(c);
  if ($('headerBadgeWrap'))$('headerBadgeWrap').innerHTML = createBadgeHtml(c.id, 34);
  if ($('headerClubName'))$('headerClubName').innerText = c.name;
  if ($('headerStadium'))$('headerStadium').innerText = `${c.stadium} • Capacity: ${(c.cap + state.stadiumCapacityBonus).toLocaleString()}`;
  if ($('statAttack'))$('statAttack').innerText = s.att; 
  if ($('statMidfield'))$('statMidfield').innerText = s.mid; 
  if ($('statDefence'))$('statDefence').innerText = s.def; 
  if ($('statOvr'))$('statOvr').innerText = s.ovr;
  if ($('headerReputation'))$('headerReputation').innerText = `⭐ ${(state.manager.reputation || 2.5).toFixed(1)}`;
}

function renderAll() {
  const club = getCurrentUserClub(); 
  ensureCupTie();
  if ($('headerDivName'))$('headerDivName').innerText = DIV_NAMES[club.div];
  if ($('headerWeek'))$('headerWeek').innerText = `Wk ${state.currentWeek} / ${state.totalWeeks}`;
  if ($('headerConfidence'))$('headerConfidence').innerText = `${state.manager.confidence}%`;
  if ($('headerBudget'))$('headerBudget').innerText = `£${club.budget.toFixed(1)}M`;
  updateHeaderClubDisplay(); 
  renderTactics(); 
  renderStandingsTable(club.div); 
  renderMatchdayView(); 
  renderCupBracketTree();
}

function switchTab(id) {
  ['tactics', 'matchday', 'cups', 'news', 'transfers', 'standings'].forEach(t => { 
    const el = $(`tab-${t}`); if (el) el.style.display = t === id ? 'block' : 'none'; 
    const nav = $(`nav-${t}`); if (nav) nav.className = `nav-item ${t === id ? 'active' : ''}`; 
  });
  if (id === 'tactics') renderTactics();
  if (id === 'matchday') renderMatchdayView();
  if (id === 'cups') renderCupBracketTree();
  if (id === 'transfers') renderTransfers();
  if (id === 'standings') renderStandingsTable(state.activeStandingsTab);
}

function layoutMatchday() {
  const grid = document.querySelector('.matchday-grid'); 
  if (!grid || grid.dataset.laid) return; 
  grid.dataset.laid = '1';
  const grounds = grid.querySelector('.standings-card'), comm = $('commentaryFeed');
  if (grounds && comm && comm.previousElementSibling) {
    const right = document.createElement('div'); right.className = 'md-right';
    right.append(comm.previousElementSibling, comm, $('inMatchSubDrawer'), grounds); 
    grid.appendChild(right);
  }
}

if (typeof window.showEndSeasonGala !== 'function') {
  window.showEndSeasonGala = function () {
    const club = getCurrentUserClub();
    const rows = [...(state.standings[club.div] || [])].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    const pos = rows.findIndex(r => r.id === club.id) + 1;
    alert(`Season complete! ${club.name} finished position ${pos} in the ${DIV_NAMES[club.div]}.`);
  };
}
