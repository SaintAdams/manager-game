/* Real 2026/27 Managers and Authentic Squads Database across all 92 Clubs */

const REAL_MANAGERS = {
  /* Premier League */
  'Arsenal': 'Mikel Arteta', 'Aston Villa': 'Unai Emery', 'Bournemouth': 'Andoni Iraola',
  'Brentford': 'Thomas Frank', 'Brighton': 'Fabian Hürzeler', 'Chelsea': 'Enzo Maresca',
  'Crystal Palace': 'Oliver Glasner', 'Everton': 'Sean Dyche', 'Fulham': 'Marco Silva',
  'Leeds United': 'Daniel Farke', 'Liverpool': 'Arne Slot', 'Manchester City': 'Pep Guardiola',
  'Manchester United': 'Rúben Amorim', 'Newcastle United': 'Eddie Howe', 'Nottingham Forest': 'Nuno Espírito Santo',
  'Sunderland': 'Régis Le Bris', 'Tottenham': 'Ange Postecoglou', 'Coventry City': 'Frank Lampard',
  'Ipswich Town': 'Kieran McKenna', 'Hull City': 'Tim Walter',

  /* Championship */
  'Leicester City': 'Ruud van Nistelrooy', 'Southampton': 'Russell Martin', 'Burnley': 'Scott Parker',
  'Middlesbrough': 'Michael Carrick', 'West Brom': 'Carlos Corberán', 'Norwich City': 'Johannes Hoff Thorup',
  'Sheffield United': 'Chris Wilder', 'West Ham': 'Julen Lopetegui', 'Watford': 'Tom Cleverley',
  'Wolves': 'Gary O\'Neil', 'Stoke City': 'Narcís Pèlach', 'Swansea City': 'Luke Williams',
  'Bristol City': 'Liam Manning', 'Millwall': 'Neil Harris', 'Preston': 'Paul Heckingbottom',
  'QPR': 'Martí Cifuentes', 'Blackburn': 'John Eustace', 'Derby County': 'Paul Warne',
  'Portsmouth': 'John Mousinho', 'Oxford United': 'Des Buckingham', 'Sheffield Wednesday': 'Danny Röhl',
  'Plymouth Argyle': 'Wayne Rooney', 'Birmingham City': 'Chris Davies', 'Charlton': 'Nathan Jones',

  /* League One */
  'Wrexham': 'Phil Parkinson', 'Bolton': 'Ian Evatt', 'Stockport': 'Dave Challinor',
  'Leyton Orient': 'Richie Wellens', 'Huddersfield': 'Michael Duff', 'Lincoln City': 'Michael Skubala',
  'Reading': 'Rubén Sellés', 'Wycombe': 'Matt Bloomfield', 'Barnsley': 'Darrell Clarke',
  'Peterborough': 'Darren Ferguson', 'Blackpool': 'Steve Bruce', 'Rotherham': 'Steve Evans',
  'Cardiff City': 'Omer Riza', 'Bradford City': 'Graham Alexander', 'Stevenage': 'Alex Revell',
  'Mansfield Town': 'Nigel Clough', 'Exeter City': 'Gary Caldwell', 'Northampton': 'Jon Brady',
  'Burton Albion': 'Mark Robinson', 'Wigan': 'Shaun Maloney', 'Luton Town': 'Rob Edwards',
  'Port Vale': 'Darren Moore', 'Doncaster': 'Grant McCann', 'Crawley Town': 'Rob Elliot',

  /* League Two */
  'Notts County': 'Stuart Maynard', 'Walsall': 'Mat Sadler', 'Chesterfield': 'Paul Cook',
  'Swindon': 'Ian Holloway', 'Gillingham': 'Mark Bonner', 'Salford City': 'Karl Robinson',
  'Grimsby Town': 'David Artell', 'Bromley': 'Andy Woodman', 'Crewe Alexandra': 'Lee Bell',
  'Colchester': 'Danny Cowley', 'Fleetwood': 'Charlie Adam', 'Tranmere': 'Nigel Adkins',
  'AFC Wimbledon': 'Johnnie Jackson', 'Barrow': 'Stephen Clemence', 'Cheltenham': 'Michael Flynn',
  'Harrogate': 'Simon Weaver', 'MK Dons': 'Scott Lindsey', 'Accrington Stanley': 'John Doolan',
  'Newport County': 'Nelson Jardim', 'Bristol Rovers': 'Matt Taylor', 'Carlisle': 'Mike Williamson',
  'Shrewsbury': 'Gareth Ainsworth', 'Morecambe': 'Derek Adams', 'Oldham Athletic': 'Micky Mellon'
};

const REAL_SQUADS = {
  /* ==================== PREMIER LEAGUE ==================== */
  'Newcastle United': [
    ['Nick Pope', 'GK', 81, 34, 'ENG'], ['Odysseas Vlachodimos', 'GK', 76, 32, 'GRE'],
    ['Sven Botman', 'DEF', 83, 26, 'NED'], ['Fabian Schär', 'DEF', 80, 34, 'SUI'], ['Dan Burn', 'DEF', 79, 34, 'ENG'],
    ['Tino Livramento', 'DEF', 82, 23, 'ENG'], ['Lewis Hall', 'DEF', 80, 22, 'ENG'], ['Kieran Trippier', 'DEF', 79, 36, 'ENG'],
    ['Lloyd Kelly', 'DEF', 77, 27, 'ENG'], ['Jamaal Lascelles', 'DEF', 74, 32, 'ENG'],
    ['Bruno Guimarães', 'MID', 86, 28, 'BRA'], ['Sandro Tonali', 'MID', 85, 26, 'ITA'], ['Joelinton', 'MID', 82, 30, 'BRA'],
    ['Joe Willock', 'MID', 78, 27, 'ENG'], ['Sean Longstaff', 'MID', 77, 28, 'ENG'], ['Lewis Miley', 'MID', 78, 20, 'ENG'],
    ['Alexander Isak', 'FWD', 87, 27, 'SWE'], ['Anthony Gordon', 'FWD', 84, 25, 'ENG'], ['Harvey Barnes', 'FWD', 80, 28, 'ENG'],
    ['Jacob Murphy', 'FWD', 77, 31, 'ENG'], ['Callum Wilson', 'FWD', 78, 34, 'ENG'], ['William Osula', 'FWD', 73, 23, 'DEN']
  ],
  'Manchester City': [
    ['Ederson', 'GK', 87, 33, 'BRA'], ['Stefan Ortega', 'GK', 79, 33, 'GER'],
    ['Rúben Dias', 'DEF', 88, 29, 'POR'], ['Josko Gvardiol', 'DEF', 85, 24, 'CRO'], ['Manuel Akanji', 'DEF', 83, 31, 'SUI'],
    ['John Stones', 'DEF', 84, 32, 'ENG'], ['Nathan Aké', 'DEF', 82, 31, 'NED'], ['Rico Lewis', 'DEF', 80, 21, 'ENG'],
    ['Rodri', 'MID', 91, 30, 'ESP'], ['Kevin De Bruyne', 'MID', 88, 35, 'BEL'], ['Bernardo Silva', 'MID', 87, 32, 'POR'],
    ['Phil Foden', 'MID', 88, 26, 'ENG'], ['Mateo Kovacic', 'MID', 81, 32, 'CRO'], ['Matheus Nunes', 'MID', 79, 28, 'POR'],
    ['Erling Haaland', 'FWD', 92, 26, 'NOR'], ['Jérémy Doku', 'FWD', 82, 24, 'BEL'], ['Jack Grealish', 'FWD', 82, 31, 'ENG'],
    ['Sávio', 'FWD', 81, 22, 'BRA'], ['Oscar Bobb', 'FWD', 79, 23, 'NOR']
  ],
  'Arsenal': [
    ['David Raya', 'GK', 85, 31, 'ESP'], ['Neto', 'GK', 76, 37, 'BRA'],
    ['William Saliba', 'DEF', 88, 25, 'FRA'], ['Gabriel Magalhães', 'DEF', 86, 28, 'BRA'], ['Jurriën Timber', 'DEF', 82, 25, 'NED'],
    ['Riccardo Calafiori', 'DEF', 83, 24, 'ITA'], ['Ben White', 'DEF', 83, 28, 'ENG'], ['Oleksandr Zinchenko', 'DEF', 79, 29, 'UKR'],
    ['Declan Rice', 'MID', 88, 27, 'ENG'], ['Martin Ødegaard', 'MID', 88, 27, 'NOR'], ['Mikel Merino', 'MID', 83, 30, 'ESP'],
    ['Thomas Partey', 'MID', 81, 33, 'GHA'], ['Jorginho', 'MID', 79, 34, 'ITA'], ['Ethan Nwaneri', 'MID', 76, 19, 'ENG'],
    ['Bukayo Saka', 'FWD', 88, 25, 'ENG'], ['Kai Havertz', 'FWD', 84, 27, 'GER'], ['Gabriel Martinelli', 'FWD', 83, 25, 'BRA'],
    ['Leandro Trossard', 'FWD', 81, 31, 'BEL'], ['Gabriel Jesus', 'FWD', 81, 29, 'BRA'], ['Raheem Sterling', 'FWD', 79, 31, 'ENG']
  ],
  'Liverpool': [
    ['Alisson Becker', 'GK', 89, 33, 'BRA'], ['Caoimhin Kelleher', 'GK', 79, 27, 'IRL'],
    ['Virgil van Dijk', 'DEF', 88, 35, 'NED'], ['Ibrahima Konaté', 'DEF', 84, 27, 'FRA'], ['Trent Alexander-Arnold', 'DEF', 86, 27, 'ENG'],
    ['Andrew Robertson', 'DEF', 83, 32, 'SCO'], ['Conor Bradley', 'DEF', 80, 23, 'NIR'], ['Kostas Tsimikas', 'DEF', 78, 30, 'GRE'],
    ['Alexis Mac Allister', 'MID', 86, 27, 'ARG'], ['Dominik Szoboszlai', 'MID', 83, 25, 'HUN'], ['Ryan Gravenberch', 'MID', 83, 24, 'NED'],
    ['Curtis Jones', 'MID', 80, 25, 'ENG'], ['Wataru Endo', 'MID', 79, 33, 'JPN'], ['Harvey Elliott', 'MID', 80, 23, 'ENG'],
    ['Mohamed Salah', 'FWD', 88, 34, 'EGY'], ['Luis Díaz', 'FWD', 84, 29, 'COL'], ['Cody Gakpo', 'FWD', 83, 27, 'NED'],
    ['Darwin Núñez', 'FWD', 82, 27, 'URU'], ['Diogo Jota', 'FWD', 83, 29, 'POR'], ['Federico Chiesa', 'FWD', 80, 28, 'ITA']
  ],
  'Aston Villa': [
    ['Emiliano Martínez', 'GK', 87, 34, 'ARG'], ['Robin Olsen', 'GK', 73, 36, 'SWE'],
    ['Pau Torres', 'DEF', 83, 29, 'ESP'], ['Ezri Konsa', 'DEF', 82, 28, 'ENG'], ['Lucas Digne', 'DEF', 80, 33, 'FRA'],
    ['Matty Cash', 'DEF', 79, 29, 'POL'], ['Ian Maatsen', 'DEF', 79, 24, 'NED'], ['Diego Carlos', 'DEF', 78, 33, 'BRA'],
    ['Youri Tielemans', 'MID', 82, 29, 'BEL'], ['Amadou Onana', 'MID', 82, 25, 'BEL'], ['John McGinn', 'MID', 81, 31, 'SCO'],
    ['Boubacar Kamara', 'MID', 81, 26, 'FRA'], ['Ross Barkley', 'MID', 78, 32, 'ENG'], ['Jacob Ramsey', 'MID', 79, 25, 'ENG'],
    ['Ollie Watkins', 'FWD', 85, 30, 'ENG'], ['Leon Bailey', 'FWD', 82, 29, 'JAM'], ['Jhon Durán', 'FWD', 81, 22, 'COL'],
    ['Morgan Rogers', 'FWD', 81, 24, 'ENG'], ['Emiliano Buendía', 'FWD', 78, 29, 'ARG']
  ],
  'Chelsea': [
    ['Robert Sánchez', 'GK', 79, 28, 'ESP'], ['Filip Jörgensen', 'GK', 77, 24, 'DEN'],
    ['Levi Colwill', 'DEF', 82, 23, 'ENG'], ['Wesley Fofana', 'DEF', 81, 25, 'FRA'], ['Marc Cucurella', 'DEF', 81, 28, 'ESP'],
    ['Reece James', 'DEF', 83, 26, 'ENG'], ['Malo Gusto', 'DEF', 80, 23, 'FRA'], ['Tosin Adarabioyo', 'DEF', 78, 28, 'ENG'],
    ['Moisés Caicedo', 'MID', 84, 24, 'ECU'], ['Enzo Fernández', 'MID', 83, 25, 'ARG'], ['Cole Palmer', 'MID', 87, 24, 'ENG'],
    ['Roméo Lavia', 'MID', 78, 22, 'BEL'], ['Kiernan Dewsbury-Hall', 'MID', 78, 28, 'ENG'],
    ['Nicolas Jackson', 'FWD', 82, 25, 'SEN'], ['Christopher Nkunku', 'FWD', 83, 28, 'FRA'], ['Pedro Neto', 'FWD', 81, 26, 'POR'],
    ['Noni Madueke', 'FWD', 80, 24, 'ENG'], ['Jadon Sancho', 'FWD', 80, 26, 'ENG'], ['João Félix', 'FWD', 81, 26, 'POR']
  ],
  'Manchester United': [
    ['André Onana', 'GK', 83, 30, 'CMR'], ['Altay Bayindir', 'GK', 75, 28, 'TUR'],
    ['Lisandro Martínez', 'DEF', 84, 28, 'ARG'], ['Matthijs de Ligt', 'DEF', 84, 27, 'NED'], ['Leny Yoro', 'DEF', 80, 20, 'FRA'],
    ['Diogo Dalot', 'DEF', 82, 27, 'POR'], ['Noussair Mazraoui', 'DEF', 81, 28, 'MAR'], ['Harry Maguire', 'DEF', 79, 33, 'ENG'],
    ['Luke Shaw', 'DEF', 80, 31, 'ENG'], ['Kobbie Mainoo', 'MID', 83, 21, 'ENG'], ['Bruno Fernandes', 'MID', 87, 32, 'POR'],
    ['Manuel Ugarte', 'MID', 81, 25, 'URU'], ['Casemiro', 'MID', 80, 34, 'BRA'], ['Mason Mount', 'MID', 78, 27, 'ENG'],
    ['Alejandro Garnacho', 'FWD', 82, 22, 'ARG'], ['Rasmus Højlund', 'FWD', 81, 23, 'DEN'], ['Marcus Rashford', 'FWD', 81, 28, 'ENG'],
    ['Joshua Zirkzee', 'FWD', 79, 25, 'NED'], ['Amad Diallo', 'FWD', 80, 24, 'CIV']
  ],
  'Tottenham': [
    ['Guglielmo Vicario', 'GK', 83, 29, 'ITA'], ['Fraser Forster', 'GK', 73, 38, 'ENG'],
    ['Cristian Romero', 'DEF', 85, 28, 'ARG'], ['Micky van de Ven', 'DEF', 84, 25, 'NED'], ['Pedro Porro', 'DEF', 83, 27, 'ESP'],
    ['Destiny Udogie', 'DEF', 81, 23, 'ITA'], ['Radu Dragusin', 'DEF', 77, 24, 'ROU'], ['Ben Davies', 'DEF', 75, 33, 'WAL'],
    ['James Maddison', 'MID', 84, 29, 'ENG'], ['Rodrigo Bentancur', 'MID', 81, 29, 'URU'], ['Pape Matar Sarr', 'MID', 80, 24, 'SEN'],
    ['Yves Bissouma', 'MID', 79, 30, 'MLI'], ['Dejan Kulusevski', 'MID', 82, 26, 'SWE'], ['Lucas Bergvall', 'MID', 77, 20, 'SWE'],
    ['Son Heung-min', 'FWD', 86, 34, 'KOR'], ['Dominic Solanke', 'FWD', 82, 29, 'ENG'], ['Brennan Johnson', 'FWD', 80, 25, 'WAL'],
    ['Richarlison', 'FWD', 80, 29, 'BRA']
  ],
  'Brighton': [
    ['Bart Verbruggen', 'GK', 79, 24, 'NED'], ['Lewis Dunk', 'DEF', 80, 34, 'ENG'], ['Jan Paul van Hecke', 'DEF', 79, 26, 'NED'],
    ['Pervis Estupiñán', 'DEF', 79, 28, 'ECU'], ['Ferdi Kadioglu', 'DEF', 78, 26, 'TUR'], ['Carlos Baleba', 'MID', 79, 22, 'CMR'],
    ['Mats Wieffer', 'MID', 79, 26, 'NED'], ['Matt O\'Riley', 'MID', 79, 25, 'DEN'], ['Kaoru Mitoma', 'FWD', 82, 29, 'JPN'],
    ['Danny Welbeck', 'FWD', 79, 35, 'ENG'], ['Georginio Rutter', 'FWD', 78, 24, 'FRA'], ['Simon Adingra', 'FWD', 78, 24, 'CIV']
  ],
  'Brentford': [
    ['Mark Flekken', 'GK', 79, 33, 'NED'], ['Ethan Pinnock', 'DEF', 78, 33, 'JAM'], ['Nathan Collins', 'DEF', 78, 25, 'IRL'],
    ['Sepp van den Berg', 'DEF', 76, 24, 'NED'], ['Rico Henry', 'DEF', 77, 29, 'ENG'], ['Christian Nørgaard', 'MID', 78, 32, 'DEN'],
    ['Vitaly Janelt', 'MID', 77, 28, 'GER'], ['Mikkel Damsgaard', 'MID', 78, 26, 'DEN'], ['Bryan Mbeumo', 'FWD', 82, 27, 'CMR'],
    ['Yoane Wissa', 'FWD', 79, 30, 'COD'], ['Igor Thiago', 'FWD', 76, 25, 'BRA'], ['Kevin Schade', 'FWD', 75, 24, 'GER']
  ],
  'Fulham': [
    ['Bernd Leno', 'GK', 81, 34, 'GER'], ['Joachim Andersen', 'DEF', 80, 30, 'DEN'], ['Calvin Bassey', 'DEF', 78, 26, 'NGA'],
    ['Antonee Robinson', 'DEF', 80, 29, 'USA'], ['Timothy Castagne', 'DEF', 77, 30, 'BEL'], ['Sander Berge', 'MID', 78, 28, 'NOR'],
    ['Andreas Pereira', 'MID', 78, 30, 'BRA'], ['Emile Smith Rowe', 'MID', 80, 26, 'ENG'], ['Raúl Jiménez', 'FWD', 78, 35, 'MEX'],
    ['Alex Iwobi', 'FWD', 78, 30, 'NGA'], ['Adama Traoré', 'FWD', 76, 30, 'ESP'], ['Rodrigo Muniz', 'FWD', 78, 25, 'BRA']
  ],
  'Nottingham Forest': [
    ['Matz Sels', 'GK', 79, 34, 'BEL'], ['Murillo', 'DEF', 82, 24, 'BRA'], ['Nikola Milenković', 'DEF', 79, 28, 'SRB'],
    ['Ola Aina', 'DEF', 78, 29, 'NGA'], ['Alex Moreno', 'DEF', 77, 33, 'ESP'], ['Elliot Anderson', 'MID', 78, 23, 'ENG'],
    ['Morgan Gibbs-White', 'MID', 82, 26, 'ENG'], ['Ryan Yates', 'MID', 76, 28, 'ENG'], ['Chris Wood', 'FWD', 80, 34, 'NZL'],
    ['Anthony Elanga', 'FWD', 78, 24, 'SWE'], ['Callum Hudson-Odoi', 'FWD', 78, 25, 'ENG'], ['Taiwo Awoniyi', 'FWD', 77, 29, 'NGA']
  ],
  'Everton': [
    ['Jordan Pickford', 'GK', 83, 32, 'ENG'], ['Jarrad Branthwaite', 'DEF', 82, 24, 'ENG'], ['James Tarkowski', 'DEF', 79, 33, 'ENG'],
    ['Vitalii Mykolenko', 'DEF', 77, 27, 'UKR'], ['Nathan Patterson', 'DEF', 74, 24, 'SCO'], ['Idrissa Gueye', 'MID', 77, 36, 'SEN'],
    ['James Garner', 'MID', 76, 25, 'ENG'], ['Abdoulaye Doucouré', 'MID', 76, 33, 'MLI'], ['Dominic Calvert-Lewin', 'FWD', 78, 29, 'ENG'],
    ['Dwight McNeil', 'FWD', 78, 26, 'ENG'], ['Iliman Ndiaye', 'FWD', 78, 26, 'SEN'], ['Jack Harrison', 'FWD', 76, 29, 'ENG']
  ],
  'West Ham': [
    ['Alphonse Areola', 'GK', 80, 33, 'FRA'], ['Max Kilman', 'DEF', 79, 29, 'ENG'], ['Jean-Clair Todibo', 'DEF', 80, 26, 'FRA'],
    ['Aaron Wan-Bissaka', 'DEF', 79, 28, 'ENG'], ['Emerson Palmieri', 'DEF', 78, 32, 'ITA'], ['Edson Álvarez', 'MID', 80, 28, 'MEX'],
    ['Guido Rodríguez', 'MID', 78, 32, 'ARG'], ['Lucas Paquetá', 'MID', 83, 29, 'BRA'], ['Jarrod Bowen', 'FWD', 83, 29, 'ENG'],
    ['Mohammed Kudus', 'FWD', 83, 26, 'GHA'], ['Niclas Füllkrug', 'FWD', 79, 33, 'GER'], ['Crysencio Summerville', 'FWD', 78, 24, 'NED']
  ],
  'Bournemouth': [
    ['Kepa Arrizabalaga', 'GK', 79, 31, 'ESP'], ['Ilya Zabarnyi', 'DEF', 79, 24, 'UKR'], ['Marcos Senesi', 'DEF', 78, 29, 'ARG'],
    ['Milos Kerkez', 'DEF', 78, 22, 'HUN'], ['Julian Araujo', 'DEF', 75, 25, 'MEX'], ['Tyler Adams', 'MID', 78, 27, 'USA'],
    ['Lewis Cook', 'MID', 77, 29, 'ENG'], ['Ryan Christie', 'MID', 77, 31, 'SCO'], ['Antoine Semenyo', 'FWD', 79, 26, 'GHA'],
    ['Evanilson', 'FWD', 79, 26, 'BRA'], ['Justin Kluivert', 'FWD', 78, 27, 'NED'], ['Marcus Tavernier', 'FWD', 77, 27, 'ENG']
  ],
  'Crystal Palace': [
    ['Dean Henderson', 'GK', 79, 29, 'ENG'], ['Marc Guéhi', 'DEF', 82, 26, 'ENG'], ['Maxence Lacroix', 'DEF', 78, 26, 'FRA'],
    ['Chris Richards', 'DEF', 76, 26, 'USA'], ['Tyrick Mitchell', 'DEF', 77, 27, 'ENG'], ['Daniel Muñoz', 'DEF', 78, 30, 'COL'],
    ['Adam Wharton', 'MID', 80, 22, 'ENG'], ['Cheick Doucouré', 'MID', 79, 26, 'MLI'], ['Will Hughes', 'MID', 75, 31, 'ENG'],
    ['Eberechi Eze', 'FWD', 83, 28, 'ENG'], ['Jean-Philippe Mateta', 'FWD', 80, 29, 'FRA'], ['Eddie Nketiah', 'FWD', 77, 27, 'ENG'],
    ['Ismaïla Sarr', 'FWD', 77, 28, 'SEN']
  ],
  'Leicester City': [
    ['Mads Hermansen', 'GK', 78, 26, 'DEN'], ['Wout Faes', 'DEF', 77, 28, 'BEL'], ['Jannik Vestergaard', 'DEF', 75, 34, 'DEN'],
    ['James Justin', 'DEF', 76, 28, 'ENG'], ['Victor Kristiansen', 'DEF', 75, 23, 'DEN'], ['Harry Winks', 'MID', 77, 30, 'ENG'],
    ['Wilfred Ndidi', 'MID', 78, 29, 'NGA'], ['Facundo Buonanotte', 'MID', 77, 21, 'ARG'], ['Stephy Mavididi', 'FWD', 76, 28, 'ENG'],
    ['Abdul Fatawu', 'FWD', 76, 22, 'GHA'], ['Jamie Vardy', 'FWD', 76, 39, 'ENG'], ['Jordan Ayew', 'FWD', 75, 35, 'GHA']
  ],
  'Wolves': [
    ['José Sá', 'GK', 79, 33, 'POR'], ['Toti Gomes', 'DEF', 77, 27, 'POR'], ['Santiago Bueno', 'DEF', 75, 27, 'URU'],
    ['Rayan Aït-Nouri', 'DEF', 80, 25, 'ALG'], ['Nélson Semedo', 'DEF', 77, 32, 'POR'], ['André', 'MID', 79, 25, 'BRA'],
    ['João Gomes', 'MID', 80, 25, 'BRA'], ['Mario Lemina', 'MID', 78, 33, 'GAB'], ['Matheus Cunha', 'FWD', 82, 27, 'BRA'],
    ['Hwang Hee-chan', 'FWD', 78, 30, 'KOR'], ['Jørgen Strand Larsen', 'FWD', 78, 26, 'NOR'], ['Gonçalo Guedes', 'FWD', 77, 29, 'POR']
  ],
  'Southampton': [
    ['Aaron Ramsdale', 'GK', 80, 28, 'ENG'], ['Jan Bednarek', 'DEF', 76, 30, 'POL'], ['Taylor Harwood-Bellis', 'DEF', 76, 24, 'ENG'],
    ['Kyle Walker-Peters', 'DEF', 77, 29, 'ENG'], ['Charlie Taylor', 'DEF', 74, 32, 'ENG'], ['Flynn Downes', 'MID', 76, 27, 'ENG'],
    ['Mateus Fernandes', 'MID', 76, 22, 'POR'], ['Joe Aribo', 'MID', 74, 30, 'NGA'], ['Adam Lallana', 'MID', 73, 38, 'ENG'],
    ['Cameron Archer', 'FWD', 75, 24, 'ENG'], ['Tyler Dibling', 'FWD', 75, 20, 'ENG'], ['Adam Armstrong', 'FWD', 75, 29, 'ENG']
  ],
  'Ipswich Town': [
    ['Arijanet Muric', 'GK', 76, 27, 'KOS'], ['Jacob Greaves', 'DEF', 76, 25, 'ENG'], ['Dara O\'Shea', 'DEF', 75, 27, 'IRL'],
    ['Leif Davis', 'DEF', 76, 26, 'ENG'], ['Axel Tuanzebe', 'DEF', 74, 28, 'COD'], ['Kalvin Phillips', 'MID', 76, 30, 'ENG'],
    ['Sam Morsy', 'MID', 74, 34, 'EGY'], ['Omari Hutchinson', 'MID', 76, 22, 'JAM'], ['Sammie Szmodics', 'FWD', 76, 31, 'IRL'],
    ['Liam Delap', 'FWD', 77, 23, 'ENG'], ['Jack Clarke', 'FWD', 76, 25, 'ENG'], ['Chiedozie Ogbene', 'FWD', 74, 29, 'IRL']
  ],

  /* ==================== CHAMPIONSHIP STARS ==================== */
  'Leeds United': [
    ['Illan Meslier', 'GK', 77, 26, 'FRA'], ['Pascal Struijk', 'DEF', 76, 27, 'NED'], ['Joe Rodon', 'DEF', 76, 28, 'WAL'],
    ['Jayden Bogle', 'DEF', 74, 26, 'ENG'], ['Junior Firpo', 'DEF', 74, 30, 'DOM'], ['Ethan Ampadu', 'MID', 76, 25, 'WAL'],
    ['Ao Tanaka', 'MID', 75, 27, 'JPN'], ['Wilfried Gnonto', 'FWD', 76, 22, 'ITA'], ['Daniel James', 'FWD', 75, 28, 'WAL'],
    ['Joël Piroe', 'FWD', 75, 27, 'NED'], ['Mateo Joseph', 'FWD', 74, 22, 'ESP']
  ],
  'Burnley': [
    ['James Trafford', 'GK', 77, 23, 'ENG'], ['Maxime Estève', 'DEF', 76, 24, 'FRA'], ['CJ Egan-Riley', 'DEF', 72, 23, 'ENG'],
    ['Connor Roberts', 'DEF', 74, 30, 'WAL'], ['Lucas Pires', 'DEF', 73, 25, 'BRA'], ['Josh Brownhill', 'MID', 76, 30, 'ENG'],
    ['Josh Cullen', 'MID', 75, 29, 'IRL'], ['Hannibal Mejbri', 'MID', 74, 23, 'TUN'], ['Luca Koleosho', 'FWD', 74, 21, 'ITA'],
    ['Zian Flemming', 'FWD', 75, 28, 'NED'], ['Lyle Foster', 'FWD', 74, 26, 'RSA']
  ],
  'Sunderland': [
    ['Anthony Patterson', 'GK', 76, 26, 'ENG'], ['Daniel Ballard', 'DEF', 75, 26, 'NIR'], ['Luke O\'Nien', 'DEF', 73, 31, 'ENG'],
    ['Trai Hume', 'DEF', 74, 24, 'NIR'], ['Dennis Cirkin', 'DEF', 73, 24, 'ENG'], ['Dan Neil', 'MID', 75, 24, 'ENG'],
    ['Jobe Bellingham', 'MID', 76, 21, 'ENG'], ['Chris Rigg', 'MID', 75, 19, 'ENG'], ['Patrick Roberts', 'FWD', 74, 29, 'ENG'],
    ['Romaine Mundle', 'FWD', 73, 23, 'ENG'], ['Wilson Isidor', 'FWD', 74, 26, 'FRA']
  ],
  'Sheffield United': [
    ['Michael Cooper', 'GK', 75, 26, 'ENG'], ['Anel Ahmedhodzic', 'DEF', 76, 27, 'BIH'], ['Harry Souttar', 'DEF', 75, 27, 'AUS'],
    ['Harrison Burrows', 'DEF', 74, 24, 'ENG'], ['Vinicius Souza', 'MID', 76, 27, 'BRA'], ['Oliver Arblaster', 'MID', 75, 22, 'ENG'],
    ['Callum O\'Hare', 'MID', 75, 28, 'ENG'], ['Gustavo Hamer', 'MID', 77, 29, 'NED'], ['Kieffer Moore', 'FWD', 74, 34, 'WAL'],
    ['Tyrese Campbell', 'FWD', 73, 26, 'ENG'], ['Jesurun Rak-Sakyi', 'FWD', 74, 23, 'ENG']
  ],
  'Middlesbrough': [
    ['Seny Dieng', 'GK', 74, 31, 'SEN'], ['Rav van den Berg', 'DEF', 75, 22, 'NED'], ['Matt Clarke', 'DEF', 73, 29, 'ENG'],
    ['Luke Ayling', 'DEF', 73, 35, 'ENG'], ['Hayden Hackney', 'MID', 76, 24, 'ENG'], ['Aidan Morris', 'MID', 74, 24, 'USA'],
    ['Finn Azaz', 'MID', 74, 25, 'IRL'], ['Emmanuel Latte Lath', 'FWD', 75, 27, 'CIV'], ['Tommy Conway', 'FWD', 74, 24, 'SCO'],
    ['Ben Doak', 'FWD', 75, 20, 'SCO'], ['Riley McGree', 'MID', 74, 27, 'AUS']
  ],
  'West Brom': [
    ['Alex Palmer', 'GK', 75, 30, 'ENG'], ['Semi Ajayi', 'DEF', 73, 32, 'NGA'], ['Torbjørn Heggem', 'DEF', 73, 27, 'NOR'],
    ['Darnell Furlong', 'DEF', 73, 30, 'ENG'], ['Alex Mowatt', 'MID', 74, 31, 'ENG'], ['Jayson Molumby', 'MID', 73, 27, 'IRL'],
    ['John Swift', 'MID', 74, 31, 'ENG'], ['Tom Fellows', 'FWD', 75, 23, 'ENG'], ['Karlan Grant', 'FWD', 73, 28, 'ENG'],
    ['Josh Maja', 'FWD', 75, 27, 'NGA'], ['Grady Diangana', 'FWD', 73, 28, 'COD']
  ],
  'Norwich City': [
    ['Angus Gunn', 'GK', 75, 30, 'SCO'], ['Shane Duffy', 'DEF', 72, 34, 'IRL'], ['Callum Doyle', 'DEF', 74, 22, 'ENG'],
    ['Jack Stacey', 'DEF', 73, 30, 'ENG'], ['Kenny McLean', 'MID', 74, 34, 'SCO'], ['Marcelino Núñez', 'MID', 75, 26, 'CHI'],
    ['Amankwah Forson', 'MID', 73, 23, 'GHA'], ['Borja Sainz', 'FWD', 77, 25, 'ESP'], ['Josh Sargent', 'FWD', 76, 26, 'USA'],
    ['Ante Crnac', 'FWD', 73, 22, 'CRO'], ['Onel Hernández', 'FWD', 71, 33, 'CUB']
  ],
  'Coventry City': [
    ['Oliver Dovin', 'GK', 73, 24, 'SWE'], ['Bobby Thomas', 'DEF', 73, 25, 'ENG'], ['Liam Kitching', 'DEF', 72, 26, 'ENG'],
    ['Milan van Ewijk', 'DEF', 75, 26, 'NED'], ['Ben Sheaf', 'MID', 76, 28, 'ENG'], ['Josh Eccles', 'MID', 73, 26, 'ENG'],
    ['Jack Rudoni', 'MID', 74, 25, 'ENG'], ['Tatsuhiro Sakamoto', 'FWD', 74, 29, 'JPN'], ['Haji Wright', 'FWD', 76, 28, 'USA'],
    ['Ellis Simms', 'FWD', 75, 25, 'ENG'], ['Norman Bassette', 'FWD', 72, 21, 'BEL']
  ],
  'Birmingham City': [
    ['Ryan Allsop', 'GK', 72, 34, 'ENG'], ['Christoph Klarer', 'DEF', 74, 26, 'AUT'], ['Krystian Bielik', 'DEF', 74, 28, 'POL'],
    ['Alex Cochrane', 'DEF', 73, 26, 'ENG'], ['Paik Seung-ho', 'MID', 74, 29, 'KOR'], ['Tomoki Iwata', 'MID', 74, 29, 'JPN'],
    ['Willum Willumsson', 'MID', 74, 27, 'ISL'], ['Jay Stansfield', 'FWD', 75, 23, 'ENG'], ['Alfie May', 'FWD', 73, 33, 'ENG'],
    ['Emil Hansson', 'FWD', 72, 28, 'SWE'], ['Keshi Anderson', 'FWD', 71, 31, 'ENG']
  ],

  /* ==================== LEAGUE ONE & TWO MARQUEE CLUBS ==================== */
  'Wrexham': [
    ['Arthur Okonkwo', 'GK', 71, 25, 'ENG'], ['Callum Burton', 'GK', 62, 30, 'ENG'],
    ['Max Cleworth', 'DEF', 68, 24, 'ENG'], ['Eoghan O\'Connell', 'DEF', 67, 31, 'IRL'], ['Thomas O\'Connor', 'DEF', 67, 27, 'IRL'],
    ['Ryan Barnett', 'DEF', 68, 27, 'ENG'], ['James McClean', 'DEF', 68, 37, 'IRL'], ['Dan Scarr', 'DEF', 66, 31, 'ENG'],
    ['George Dobson', 'MID', 69, 28, 'ENG'], ['Andy Cannon', 'MID', 67, 30, 'ENG'], ['Elliot Lee', 'MID', 70, 31, 'ENG'],
    ['Ollie Rathbone', 'MID', 68, 29, 'ENG'], ['Matty James', 'MID', 67, 35, 'ENG'],
    ['Paul Mullin', 'FWD', 70, 31, 'ENG'], ['Jack Marriott', 'FWD', 68, 32, 'ENG'], ['Ollie Palmer', 'FWD', 65, 34, 'ENG'],
    ['Steven Fletcher', 'FWD', 65, 39, 'SCO'], ['Modou Faal', 'FWD', 64, 23, 'GAM']
  ],
  'Bolton': [
    ['Nathan Baxter', 'GK', 71, 27, 'ENG'], ['Ricardo Santos', 'DEF', 70, 31, 'ENG'], ['George Johnston', 'DEF', 68, 28, 'SCO'],
    ['Josh Dacres-Cogley', 'DEF', 69, 30, 'ENG'], ['Josh Sheehan', 'MID', 71, 31, 'WAL'], ['George Thomason', 'MID', 69, 25, 'ENG'],
    ['Kyle Dempsey', 'MID', 68, 30, 'ENG'], ['Dion Charles', 'FWD', 71, 30, 'NIR'], ['Victor Adeboyejo', 'FWD', 68, 28, 'NGA'],
    ['John McAtee', 'FWD', 69, 27, 'ENG'], ['Aaron Collins', 'FWD', 70, 29, 'WAL']
  ],
  'Huddersfield': [
    ['Lee Nicholls', 'GK', 72, 33, 'ENG'], ['Michal Helik', 'DEF', 72, 30, 'POL'], ['Tom Lees', 'DEF', 70, 35, 'ENG'],
    ['Lasse Sørensen', 'DEF', 69, 26, 'DEN'], ['Jonathan Hogg', 'MID', 69, 37, 'ENG'], ['Ben Wiles', 'MID', 70, 27, 'ENG'],
    ['David Kasumu', 'MID', 68, 26, 'ENG'], ['Josh Koroma', 'FWD', 70, 27, 'SLE'], ['Callum Marshall', 'FWD', 68, 21, 'NIR'],
    ['Bojan Radulovic', 'FWD', 69, 26, 'SRB']
  ],
  'Blackpool': [
    ['Daniel Grimshaw', 'GK', 71, 28, 'ENG'], ['James Husband', 'DEF', 69, 32, 'ENG'], ['Odel Offiah', 'DEF', 68, 23, 'ENG'],
    ['Lee Evans', 'MID', 69, 32, 'WAL'], ['Albie Morgan', 'MID', 68, 26, 'ENG'], ['CJ Hamilton', 'FWD', 69, 31, 'IRL'],
    ['Kyle Joseph', 'FWD', 69, 24, 'SCO'], ['Dom Ballard', 'FWD', 68, 21, 'ENG'], ['Ashley Fletcher', 'FWD', 68, 30, 'ENG']
  ],
  'Notts County': [
    ['Alex Bass', 'GK', 66, 28, 'ENG'], ['Jacob Bedeau', 'DEF', 65, 26, 'GRN'], ['Lewis Macari', 'DEF', 64, 24, 'SCO'],
    ['Matt Palmer', 'MID', 66, 30, 'ENG'], ['Dan Crowley', 'MID', 68, 29, 'ENG'], ['Conor Grant', 'MID', 65, 25, 'IRL'],
    ['Alassana Jatta', 'FWD', 67, 27, 'GAM'], ['David McGoldrick', 'FWD', 66, 38, 'IRL'], ['Jodi Jones', 'FWD', 68, 28, 'MLT']
  ],
  'Chesterfield': [
    ['Ryan Boot', 'GK', 65, 31, 'ENG'], ['Chey Dunkley', 'DEF', 66, 34, 'ENG'], ['Tom Naylor', 'DEF', 66, 35, 'ENG'],
    ['Darren Oldaker', 'MID', 65, 27, 'ENG'], ['Ollie Banks', 'MID', 65, 33, 'ENG'], ['Armando Dobra', 'FWD', 67, 25, 'ALB'],
    ['Will Grigg', 'FWD', 66, 35, 'NIR'], ['James Berry', 'FWD', 66, 25, 'ENG'], ['Michael Jacobs', 'FWD', 65, 34, 'ENG']
  ]
};
