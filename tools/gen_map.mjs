import * as topojson from 'topojson-client';
import { geoConicConformal, geoPath } from 'd3-geo';
import { Delaunay } from 'd3-delaunay';
import pc from 'polygon-clipping';
import { readFileSync, writeFileSync } from 'fs';

const W = 1000, PAD = 8;
let H = 800; // recomputed from the fitted projection below

// ---- province seeds: id, display name, lon, lat, terrain, dev ----
const WASTE = new Set(['alps','alps2','sahara_w','sahara_m','sahara_c','libyan','nafud','rubalkhali','syriandes']);
const SEEDS = [
 ['alps','The Alps',7.9,46.35,'hills',1], ['alps2','The Alps',10.3,46.55,'hills',1],
 // England
 ['cornwall','Cornwall',-5.05,50.30,'hills',1], ['devon','Devon',-3.53,50.75,'hills',1],
 ['wessex','Wessex',-1.31,51.06,'plains',3], ['sussex','Sussex',-0.77,50.86,'plains',2],
 ['kent','Kent',1.08,51.28,'plains',3], ['essex','Middlesex',-0.12,51.51,'plains',4],
 ['oxford','Oxford',-1.26,51.75,'plains',2], ['hereford','Hereford',-2.72,52.06,'plains',2],
 ['eastanglia','East Anglia',1.10,52.55,'marsh',3], ['lincoln','Lincoln',-0.54,53.23,'marsh',2],
 ['mercia','Mercia',-1.60,52.68,'plains',3], ['chester','Chester',-2.89,53.19,'forest',2],
 ['lancaster','Lancaster',-2.80,54.05,'forest',1], ['york','York',-1.08,53.96,'plains',2],
 ['northumbria','Northumbria',-1.80,55.35,'hills',1], ['cumbria','Cumbria',-2.94,54.80,'hills',1],
 // Wales
 ['gwynedd','Gwynedd',-4.13,53.10,'hills',1], ['powys','Powys',-3.42,52.35,'hills',1],
 ['deheubarth','Deheubarth',-4.20,51.90,'hills',1],
 // Scotland
 ['lothian','Lothian',-3.19,55.85,'plains',2], ['strathclyde','Galloway',-4.30,55.20,'hills',1],
 ['argyll','Argyll',-5.45,56.40,'hills',1], ['alba','Alba',-3.43,56.55,'hills',1],
 ['moray','Moray',-4.10,57.55,'hills',1],
 // Ireland
 ['ulster','Ulster',-6.65,54.55,'hills',1], ['connacht','Connacht',-8.85,53.45,'hills',1],
 ['meath','Meath',-7.00,53.75,'plains',1], ['leinster','Leinster',-6.45,52.95,'plains',2],
 ['munster','Munster',-8.30,52.35,'plains',2],
 // Norway
 ['trondelag','Trøndelag',10.39,63.20,'hills',1], ['vestland','Vestland',5.90,60.60,'hills',1],
 ['agder','Agder',7.60,58.60,'hills',1], ['viken','Viken',10.75,59.75,'forest',2],
 // Sweden
 ['svealand','Svealand',17.00,59.75,'forest',2], ['gotaland','Västergötland',13.20,58.20,'forest',1],
 ['ostergotland','Östergötland',15.62,58.35,'forest',1], ['smaland','Småland',14.50,56.95,'forest',1],
 // Denmark
 ['jylland','Jylland',9.40,56.60,'forest',2], ['slesvig','Slesvig',9.30,54.80,'plains',2],
 ['fyn','Fyn',10.39,55.35,'plains',2], ['sjaelland','Sjaelland',11.85,55.55,'plains',3],
 ['skane','Skåne',13.30,55.85,'plains',2],
 // France & Low Countries
 ['flanders','Flanders',3.22,50.95,'plains',4], ['ponthieu','Ponthieu',1.85,50.15,'plains',2],
 ['vermandois','Vermandois',3.40,49.60,'plains',3], ['rouen','Rouen',1.09,49.44,'plains',3],
 ['caen','Caen',-0.90,49.10,'plains',2], ['brittany','Brittany',-1.68,48.11,'hills',2],
 ['leon','Cornouaille',-4.10,48.20,'hills',1], ['maine','Maine',0.20,48.10,'forest',2],
 ['anjou','Anjou',-0.55,47.47,'plains',2], ['touraine','Touraine',0.68,47.39,'plains',2],
 ['orleans','Orléans',1.90,47.90,'plains',3], ['idf','Île-de-France',2.35,48.85,'plains',4],
 ['champagne','Champagne',4.07,48.55,'plains',3], ['burgundy','Burgundy',4.85,47.25,'hills',2],
 ['berry','Berry',2.40,46.95,'plains',2], ['poitou','Poitou',0.10,46.55,'plains',2],
 ['aquitaine','Aquitaine',-0.58,44.84,'plains',3], ['gascony','Gascony',0.30,43.75,'plains',2],
 ['toulouse','Toulouse',1.44,43.70,'plains',3], ['auvergne','Auvergne',3.09,45.60,'hills',1],
 ['provence','Provence',5.45,43.70,'hills',2],
 // The Empire
 ['frisia','Frisia',5.90,53.10,'marsh',2], ['holland','Holland',4.90,52.20,'marsh',3],
 ['cologne','Cologne',6.96,50.94,'plains',3], ['saxony','Saxony',9.60,52.40,'forest',2],
 ['lorraine','Lorraine',6.18,48.90,'forest',2], ['franconia','Franconia',9.93,49.90,'forest',2],
 ['swabia','Swabia',9.50,48.30,'hills',2],
 ['bavaria','Bavaria',12.10,49.02,'forest',2], ['austria','Austria',16.37,48.21,'plains',2],
 ['carinthia','Carinthia',14.31,46.62,'hills',1],
 // Iberia
 ['galicia','Galicia',-8.54,42.88,'hills',1], ['leonp','León',-5.57,42.60,'plains',2],
 ['castile','Castile',-3.70,42.00,'plains',2], ['navarre','Navarre',-1.64,42.60,'hills',2],
 ['aragon','Aragon',-0.88,41.65,'plains',2], ['barcelona','Barcelona',1.80,41.55,'plains',3],
 ['portugal','Portugal',-8.43,40.21,'hills',2], ['toledo','Toledo',-4.03,39.86,'plains',3],
 ['andalusia','Andalusia',-5.30,37.50,'plains',3], ['valencia','Valencia',-0.80,39.20,'plains',2],
 // Italy
 ['savoy','Savoy',7.50,45.07,'hills',2], ['lombardy','Lombardy',9.60,45.40,'plains',4],
 ['venice','Venice',12.34,45.44,'marsh',4], ['genoa','Genoa',8.93,44.20,'hills',3],
 ['tuscany','Tuscany',11.25,43.60,'plains',3], ['romagna','Romagna',11.80,44.30,'plains',2],
 ['latium','Latium',12.48,41.89,'plains',4], ['apulia','Apulia',16.60,41.00,'plains',2],
 ['naples','Naples',14.25,40.85,'plains',3], ['calabria','Calabria',16.25,39.10,'hills',1],
 ['sicily','Sicily',13.80,37.70,'plains',3],
 // Balkans & Byzantium
 ['croatia','Croatia',15.80,44.80,'hills',1], ['serbia','Serbia',20.90,43.70,'hills',1],
 ['hungary','Hungary',19.04,47.30,'plains',3], ['transylvania','Transylvania',23.60,46.77,'hills',1],
 ['wallachia','Wallachia',25.46,44.70,'plains',1], ['bulgaria','Bulgaria',25.30,43.00,'hills',2],
 ['macedonia','Macedonia',22.94,40.75,'plains',3], ['hellas','Hellas',23.00,38.60,'hills',2],
 ['epirus','Epirus',20.60,39.80,'hills',1], ['dyrrachion','Dyrrachion',19.60,41.40,'hills',2],
 ['thrace','Thrace',27.60,41.30,'plains',5], ['nicaea','Nicaea',29.30,40.00,'plains',3],
 ['paphlagonia','Paphlagonia',32.85,40.60,'plains',2], ['cappadocia','Cappadocia',34.80,38.72,'plains',2],
 ['armeniakon','Armeniakon',38.00,39.90,'hills',1], ['trebizond','Trebizond',39.30,40.80,'hills',2],
 ['cilicia','Cilicia',34.80,36.90,'plains',2],
 // Eastern Europe
 ['brabant','Brabant',4.70,50.88,'plains',3], ['thuringia','Thuringia',11.03,51.00,'forest',2],
 ['verona','Verona',11.00,45.43,'plains',3], ['spoleto','Spoleto',12.65,42.90,'hills',2],
 ['smyrna','Smyrna',27.14,38.60,'plains',3], ['cordoba','Córdoba',-4.78,37.89,'plains',3],
 ['bloisp','Blois',1.33,47.59,'plains',2],
 ['lyonnais','Lyonnais',4.83,45.60,'hills',3], ['limousin','Limousin',1.77,45.60,'hills',2],
 ['pisa','Pisa',10.40,43.60,'plains',3], ['westphalia','Westphalia',7.90,51.60,'plains',2],
 ['adrianople','Adrianople',26.57,41.80,'plains',3], ['attaleia','Attaleia',30.70,36.90,'plains',2],
 ['badajoz','Badajoz',-6.97,38.70,'plains',2], ['bosnia','Bosnia',18.20,44.20,'hills',1],
 ['zeta','Zeta',19.26,42.60,'hills',1], ['crete','Crete',24.80,35.30,'hills',2],
 ['cyprus','Cyprus',33.00,35.10,'plains',2],
 ['bohemia','Bohemia',14.42,50.09,'forest',2], ['poland','Poland',19.40,50.60,'plains',2],
 ['masovia','Masovia',21.01,52.23,'forest',1], ['pomerania','Pomerania',17.00,53.80,'forest',1],
 ['volhynia','Volhynia',24.90,50.40,'forest',1], ['kiev','Kiev',30.52,50.45,'plains',3],
 // --- density additions ---
 ['angouleme','Angoulême',0.16,45.65,'plains',2], ['perigord','Périgord',0.90,45.10,'hills',2],
 ['nevers','Nevers',3.30,47.00,'hills',2], ['foix','Foix',1.55,42.98,'hills',1],
 ['dauphine','Dauphiné',5.60,45.05,'hills',2],
 ['alsace','Alsace',7.55,48.30,'hills',2], ['luxembourg','Luxembourg',6.10,49.65,'hills',1],
 ['hainaut','Hainaut',3.95,50.42,'plains',2], ['meissen','Meissen',13.30,51.10,'forest',1],
 ['brandenburg','Brandenburg',13.20,52.45,'plains',1], ['lusatia','Lusatia',14.75,51.55,'forest',1],
 ['salzburg','Salzburg',13.10,47.75,'hills',1], ['styria','Styria',15.44,47.07,'hills',1],
 ['carniola','Carniola',14.50,46.05,'hills',1], ['tyrol','Tyrol',11.40,47.10,'hills',1],
 ['montferrat','Montferrat',8.10,44.95,'hills',2], ['modena','Modena',10.90,44.65,'plains',3],
 ['ancona','Ancona',13.20,43.40,'hills',2], ['abruzzo','Abruzzo',13.90,42.10,'hills',1],
 ['benevento','Benevento',14.85,41.10,'hills',2], ['salerno','Salerno',15.30,40.55,'hills',2],
 ['coimbra','Coimbra',-8.35,40.20,'hills',2], ['lisbon','Lisbon',-8.90,38.85,'plains',2],
 ['murcia','Murcia',-1.13,37.99,'plains',2], ['granada','Granada',-3.60,37.18,'hills',3],
 ['mallorca','Mallorca',2.90,39.60,'plains',1],
 ['thessaly','Thessaly',22.30,39.55,'plains',2], ['morea','Morea',22.30,37.40,'hills',2],
 ['vidin','Vidin',22.85,43.80,'hills',1], ['dobruja','Dobruja',28.10,44.20,'plains',1],
 ['rascia','Rascia',20.50,43.10,'hills',1],
 ['ankyra','Ankyra',33.40,39.20,'plains',2], ['ikonion','Ikonion',32.50,37.87,'plains',1],
 ['melitene','Melitene',38.30,38.35,'hills',1],
 ['halych','Halych',24.70,49.10,'forest',1], ['chernigov','Chernigov',31.30,51.50,'forest',1],
 ['smolensk','Smolensk',32.05,54.78,'forest',1], ['novgorod','Novgorod',31.30,58.50,'forest',2],
 ['polotsk','Polotsk',28.80,55.50,'forest',1], ['prussia','Prussia',20.50,54.20,'forest',1],
 ['lithuania','Lithuania',24.30,54.90,'forest',1], ['livonia','Livonia',24.80,57.10,'forest',1],
 ['halland','Halland',12.90,56.90,'plains',1], ['finland','Finland',23.80,60.90,'forest',1],
 // ===== densified North & East =====
 // Norway
 ['telemark','Telemark',8.60,59.40,'hills',1], ['oppland','Oppland',9.90,61.30,'hills',1],
 ['halogaland','Hålogaland',15.00,64.30,'hills',1],
 // Sweden & Finland
 ['varmland','Värmland',13.40,59.70,'forest',1], ['norrland','Norrland',16.80,63.00,'forest',1],
 ['gotland','Gotland',18.50,57.50,'plains',1], ['tavastia','Tavastia',24.80,61.40,'forest',1],
 ['karelia','Karelia',30.50,62.20,'forest',1],
 // The Baltic
 ['estonia','Estonia',25.80,58.90,'forest',1], ['semgallia','Semgallia',23.80,56.60,'forest',1],
 ['samogitia','Samogitia',22.00,55.60,'forest',1],
 // Poland
 ['silesia','Silesia',17.00,51.10,'plains',2], ['sandomierz','Sandomierz',21.70,50.70,'plains',1],
 // The Rus
 ['pskov','Pskov',28.50,57.80,'forest',1], ['turov','Turov',27.50,52.00,'marsh',1],
 ['pereyaslavl','Pereyaslavl',31.80,50.00,'plains',1], ['ryazan','Ryazan',40.00,54.50,'forest',1],
 ['vladimir','Vladimir',40.30,56.10,'forest',2], ['rostov','Rostov',39.30,57.30,'forest',1],
 ['murom','Murom',42.20,55.60,'forest',1], ['beloozero','Beloozero',37.80,60.00,'forest',1],
 // the Pontic steppe
 ['cumans','the Cuman Steppe',34.00,48.00,'plains',1],
 // ===== North Africa: the Maghreb (Berber) =====
 ['marrakesh','Marrakesh',-8.00,31.63,'plains',3], ['fez','Fez',-5.00,34.03,'hills',3],
 ['sus','Sus',-9.20,30.42,'hills',1], ['tangier','Tangier',-5.80,35.55,'hills',2],
 ['sijilmasa','Sijilmasa',-4.30,31.35,'plains',2], ['tlemcen','Tlemcen',-1.32,34.88,'hills',2],
 ['oran','Oran',-0.60,35.60,'plains',2], ['tahert','Tahert',1.32,35.37,'hills',1],
 ['algiers','Algiers',3.06,36.60,'hills',2], ['bejaia','Bejaïa',5.08,36.65,'hills',2],
 ['constantine','Constantine',6.61,36.30,'hills',2], ['tunis','Tunis',10.17,36.80,'plains',3],
 ['kairouan','Kairouan',10.10,35.55,'plains',2], ['sfax','Sfax',10.70,34.74,'plains',2],
 ['tozeur','Tozeur',8.13,33.92,'plains',1], ['gabes','Gabès',9.90,33.90,'plains',1],
 ['tripoli','Tripoli',13.18,32.89,'plains',2], ['barca','Barca',20.07,32.11,'hills',1],
 ['tobruk','Marmarica',23.60,31.60,'hills',1],
 // ===== Egypt (the Nile) =====
 ['alexandria','Alexandria',29.72,31.05,'plains',4], ['damietta','Damietta',31.81,31.42,'marsh',3],
 ['cairo','Cairo',31.25,30.05,'plains',5], ['fayyum','Fayyum',30.80,29.30,'plains',3],
 ['sinai','Sinai',33.80,29.90,'hills',1], ['asyut','Asyut',31.20,27.20,'plains',2],
 ['said','Upper Egypt',32.55,25.70,'plains',2], ['aswan','Aswan',32.90,24.09,'hills',1],
 // ===== The Levant =====
 ['antioch','Antioch',36.16,36.20,'hills',3], ['aleppo','Aleppo',37.16,36.10,'plains',3],
 ['latakia','Latakia',35.90,35.52,'hills',2], ['tripolis','Tripoli',35.85,34.44,'hills',2],
 ['homs','Homs',36.72,34.73,'plains',2], ['baalbek','Baalbek',36.21,33.99,'hills',1],
 ['damascus','Damascus',36.30,33.51,'plains',4], ['acre','Acre',35.07,32.92,'plains',3],
 ['hauran','Hauran',36.30,32.62,'plains',1], ['jerusalem','Jerusalem',35.22,31.78,'hills',3],
 ['ascalon','Ascalon',34.57,31.62,'plains',2], ['kerak','Kerak',35.70,31.18,'hills',1],
 // ===== Mesopotamia (the Jazira & Iraq) =====
 ['edessa','Edessa',38.80,37.15,'hills',2], ['jazira','Jazira',40.20,37.00,'plains',2],
 ['sinjar','Sinjar',41.86,36.32,'hills',1], ['mosul','Mosul',43.13,36.34,'plains',3],
 ['samarra','Samarra',43.70,34.40,'plains',2], ['baghdad','Baghdad',44.36,33.31,'plains',5],
 ['kufa','Kufa',44.40,32.03,'plains',2], ['wasit','Wasit',45.90,32.30,'marsh',2],
 ['basra','Basra',47.80,30.50,'marsh',3],
 // ===== Arabia =====
 ['taima','Taima',38.55,27.63,'hills',1], ['medina','Medina',39.60,24.47,'plains',2],
 ['khaybar','Khaybar',39.29,25.70,'hills',1], ['jedda','Jedda',39.20,21.60,'plains',2],
 ['mecca','Mecca',39.83,21.43,'hills',3], ['hail','Ha’il',41.70,27.30,'hills',1],
 ['nejd','Nejd',45.00,25.30,'plains',1], ['yamama','Yamama',46.60,24.60,'plains',1],
 ['hasa','al-Hasa',49.30,25.40,'plains',2], ['qatif','Qatif',49.90,26.80,'plains',1],
 // ===== impassable deserts =====
 ['sahara_w','The Sahara',-3.00,27.20,'desert',0], ['sahara_m','The Sahara',7.00,26.00,'desert',0],
 ['sahara_c','The Sahara',15.50,25.50,'desert',0], ['libyan','The Libyan Desert',25.50,25.20,'desert',0],
 ['nafud','The Great Nafud',42.00,28.60,'desert',0], ['rubalkhali','The Empty Quarter',46.00,21.20,'desert',0],
 ['syriandes','The Syrian Waste',38.80,32.30,'desert',0],
 // ===== further seats: real towns of the age, at their true coordinates =====
 // Britain and Ireland
 ['norwich','Norwich',1.30,52.63,'plains',3], ['bristol','Bristol',-2.59,51.45,'plains',3],
 ['durham','Durham',-1.58,54.78,'hills',2], ['nottingham','Nottingham',-1.15,52.95,'forest',2],
 ['shrewsbury','Shrewsbury',-2.75,52.71,'hills',2], ['carlisle','Carlisle',-2.94,54.89,'hills',1],
 ['dublin','Dublin',-6.27,53.35,'plains',3], ['waterford','Waterford',-7.11,52.26,'plains',2],
 // France and the Low Countries
 ['reims','Reims',4.03,49.26,'plains',3], ['amiens','Amiens',2.30,49.89,'plains',2],
 ['bourges','Bourges',2.40,47.08,'plains',2], ['bordeaux','Bordeaux',-0.58,44.84,'plains',3],
 ['nantes','Nantes',-1.55,47.22,'plains',2], ['montpellier','Montpellier',3.88,43.61,'hills',2],
 ['narbonne','Narbonne',3.00,43.18,'hills',2], ['bruges','Bruges',3.22,51.21,'marsh',4],
 ['utrecht','Utrecht',5.12,52.09,'marsh',3], ['liege','Liège',5.57,50.63,'hills',3],
 // the Empire: Rhine, Danube and the north
 ['mainz','Mainz',8.27,49.99,'plains',3], ['trier','Trier',6.64,49.76,'hills',2],
 ['wurzburg','Würzburg',9.93,49.79,'hills',2], ['bamberg','Bamberg',10.89,49.89,'hills',2],
 ['regensburg','Regensburg',12.10,49.01,'plains',3], ['augsburg','Augsburg',10.90,48.37,'plains',3],
 ['konstanz','Konstanz',9.17,47.66,'hills',2], ['basel','Basel',7.59,47.56,'hills',2],
 ['zurich','Zürich',8.54,47.38,'hills',2], ['chur','Chur',9.53,46.85,'hills',1],
 ['magdeburg','Magdeburg',11.63,52.13,'plains',2], ['bremen','Bremen',8.81,53.08,'marsh',3],
 ['hamburg','Hamburg',9.99,53.55,'marsh',3], ['lubeck','Lübeck',10.69,53.87,'marsh',3],
 ['munster','Münster',7.63,51.96,'plains',2], ['erfurt','Erfurt',11.03,50.98,'hills',2],
 ['passau','Passau',13.46,48.57,'hills',2], ['speyer','Speyer',8.43,49.32,'plains',2],
 // Italy
 ['milan','Milan',9.19,45.46,'plains',4], ['pavia','Pavia',9.16,45.19,'plains',3],
 ['cremona','Cremona',10.02,45.13,'plains',3], ['mantua','Mantua',10.79,45.16,'marsh',3],
 ['ferrara','Ferrara',11.62,44.84,'marsh',3], ['ravenna','Ravenna',12.20,44.42,'marsh',3],
 ['bologna','Bologna',11.34,44.49,'plains',4], ['florence','Florence',11.26,43.77,'hills',4],
 ['siena','Siena',11.33,43.32,'hills',3], ['perugia','Perugia',12.39,43.11,'hills',2],
 ['bari','Bari',16.87,41.12,'plains',3], ['palermo','Palermo',13.36,38.12,'hills',4],
 ['messina','Messina',15.55,38.19,'hills',3], ['cagliari','Cagliari',9.11,39.22,'hills',2],
 // Iberia
 ['burgos','Burgos',-3.70,42.34,'plains',3], ['zaragoza','Zaragoza',-0.88,41.65,'plains',3],
 ['santiago','Santiago',-8.54,42.88,'hills',2], ['porto','Porto',-8.61,41.15,'hills',3],
 ['sevilla','Seville',-5.99,37.39,'plains',4],
 // Poland, Bohemia, Hungary and the Balkans
 ['krakow','Kraków',19.94,50.06,'plains',3], ['gniezno','Gniezno',17.60,52.54,'plains',2],
 ['wroclaw','Wrocław',17.04,51.11,'plains',3], ['olomouc','Olomouc',17.25,49.59,'hills',2],
 ['esztergom','Esztergom',18.74,47.79,'plains',3], ['buda','Buda',19.04,47.50,'plains',3],
 ['zagreb','Zagreb',15.98,45.81,'hills',2], ['split','Split',16.44,43.51,'hills',2],
 ['belgrade','Belgrade',20.46,44.79,'plains',2], ['nis','Niš',21.90,43.32,'hills',2],
 // Scandinavia and the Baltic
 ['bergen','Bergen',5.32,60.39,'hills',2], ['lund','Lund',13.19,55.70,'plains',3],
 ['sigtuna','Sigtuna',17.72,59.62,'forest',2], ['turku','Turku',22.27,60.45,'forest',1],
 ['roskilde','Roskilde',12.08,55.64,'plains',3], ['ribe','Ribe',8.76,55.33,'marsh',2],
 // Byzantium and the East
 ['thessalonica','Thessalonica',22.94,40.64,'plains',4], ['athens','Athens',23.73,37.98,'hills',2],
 ['corinth','Corinth',22.93,37.94,'hills',2], ['ohrid','Ohrid',20.80,41.12,'hills',2],
 // ===== a further course of seats =====
 // France
 ['troyes','Troyes',4.07,48.30,'plains',3], ['dijon','Dijon',5.04,47.32,'hills',3],
 ['besancon','Besançon',6.02,47.24,'hills',2], ['cahors','Cahors',1.44,44.45,'hills',2],
 ['arles','Arles',4.63,43.68,'marsh',3], ['nice','Nice',7.27,43.70,'hills',2],
 ['bayonne','Bayonne',-1.48,43.49,'plains',2],
 // Iberia
 ['oviedo','Oviedo',-5.84,43.36,'hills',2], ['salamanca','Salamanca',-5.66,40.97,'plains',2],
 ['segovia','Segovia',-4.12,40.95,'hills',2], ['malaga','Málaga',-4.42,36.72,'hills',3],
 ['almeria','Almería',-2.46,36.84,'hills',2], ['lleida','Lleida',0.62,41.62,'plains',2],
 // the Empire and the Baltic
 ['aachen','Aachen',6.08,50.78,'hills',3], ['kassel','Kassel',9.50,51.31,'forest',2],
 ['stettin','Stettin',14.55,53.43,'marsh',2], ['danzig','Danzig',18.65,54.35,'marsh',3],
 ['riga','Riga',24.11,56.95,'marsh',2], ['reval','Reval',24.75,59.44,'forest',2],
 ['dorpat','Dorpat',26.72,58.38,'forest',1],
 // Italy
 ['turin','Turin',7.69,45.07,'plains',3], ['asti','Asti',8.21,44.90,'hills',2],
 ['piacenza','Piacenza',9.69,45.05,'plains',3], ['parma','Parma',10.33,44.80,'plains',3],
 ['padua','Padua',11.88,45.41,'plains',3], ['treviso','Treviso',12.24,45.67,'plains',2],
 ['trento','Trento',11.12,46.07,'hills',2], ['lucca','Lucca',10.50,43.84,'hills',3],
 ['capua','Capua',14.22,41.11,'plains',3], ['taranto','Taranto',17.24,40.47,'plains',2],
 ['reggio','Reggio',15.65,38.11,'hills',2],
 // Scandinavia
 ['oslo','Oslo',10.75,59.91,'forest',2], ['stavanger','Stavanger',5.73,58.97,'hills',2],
 ['uppsala','Uppsala',17.64,59.86,'forest',3], ['linkoping','Linköping',15.62,58.41,'plains',2],
 ['kalmar','Kalmar',16.36,56.66,'plains',2],
 // the Rus and the eastern marches
 ['suzdal','Suzdal',40.44,56.42,'forest',2], ['tver','Tver',35.90,56.86,'forest',2],
 ['minsk','Minsk',27.56,53.90,'marsh',2], ['grodno','Grodno',23.83,53.68,'forest',2],
 // the Balkans and Byzantium
 ['sofia','Sofia',23.32,42.70,'hills',2], ['varna','Varna',27.91,43.21,'plains',2],
 ['ragusa','Ragusa',18.09,42.65,'hills',3], ['skopje','Skopje',21.43,41.99,'hills',2],
 ['larissa','Larissa',22.42,39.64,'plains',2], ['patras','Patras',21.73,38.25,'hills',2],
];
const DUMMIES_NEW = [
 // Iberia / Africa fringe & the eastern Mediterranean
 [-7.0,38.5],[-2.5,36.9],[35.5,34.0],[36.2,33.5],[38.5,35.5],[40.5,37.0],[41.5,42.0],[44.0,40.0],
 [10.0,36.8],[3.0,36.7],[-6.8,34.0],[13.2,32.9],[22.6,32.1],
 // Crimea, the Caucasus and the deep Pontic–Caspian steppe (east of the Cumans)
 [34.0,44.6],[36.5,45.3],[35.8,48.8],[39.0,47.2],[37.0,49.3],[40.0,49.6],[43.0,48.2],[46.0,49.0],
 // deep Russia beyond the Volga–Oka lands, toward the Urals
 [45.0,57.0],[47.0,54.0],[48.0,58.0],[46.0,61.0],[44.0,63.0],[47.5,51.0],
 // the Arctic fringe above the northern provinces
 [22.0,64.6],[28.0,64.5],[34.0,64.3],[40.0,63.8],[45.0,63.0],
];
// absorb out-of-scope land at the new southern/eastern frontier (Persia, the Sudan, the deep desert edge)
const DUMMIES_SE = [
 [50.5,29.0],[50.8,31.5],[50.2,33.5],[49.5,35.5],[48.0,37.0],[46.5,38.5],[44.5,39.5],[42.5,40.0],
 [50.5,26.0],[50.7,23.0],[48.0,20.5],[44.0,19.5],[40.0,19.3],[36.0,19.4],[32.0,20.2],[27.0,21.0],
 [22.0,20.3],[16.0,20.4],[9.0,20.6],[2.0,21.2],[-4.0,22.0],[-9.0,25.0],[-10.2,29.0],
];
const DUMMIES = [...DUMMIES_NEW, ...DUMMIES_SE];
// ---- major rivers: geographic polylines, projected at build ----
const RIVERS = {
 Rhine:[[9.5,46.5],[8.3,47.6],[7.6,48.6],[8.2,49.0],[7.3,50.0],[6.9,50.9],[6.1,51.8],[6.0,51.95]],
 Danube:[[8.3,48.0],[10.9,48.7],[13.0,48.3],[16.4,48.1],[18.9,47.9],[19.0,45.9],[21.0,45.2],[22.9,44.05],[25.4,44.1],[27.9,44.5],[29.7,45.2]],
 Loire:[[4.0,45.0],[3.0,46.6],[1.5,47.4],[0.0,47.4],[-1.5,47.3],[-2.1,47.28]],
 Seine:[[4.6,47.7],[3.5,48.4],[2.3,48.9],[1.1,49.4],[0.2,49.5]],
 Po:[[7.2,44.9],[8.9,45.1],[10.9,45.05],[12.0,45.0],[12.5,44.97]],
 Thames:[[-1.7,51.7],[-0.9,51.5],[0.1,51.5],[0.7,51.5]],
 Elbe:[[14.4,50.1],[13.0,51.0],[11.6,52.0],[10.0,53.0],[9.0,53.6],[8.7,53.9]],
 Ebro:[[-3.5,42.85],[-1.8,42.6],[-0.5,41.6],[0.6,41.1],[0.87,40.72]],
 Tagus:[[-1.8,40.4],[-4.0,39.9],[-6.0,39.6],[-8.0,39.35],[-9.2,38.7]],
 Dnieper:[[31.0,53.5],[30.5,52.1],[31.0,50.4],[33.0,49.0],[34.8,47.6],[32.5,46.6],[31.9,46.55]],
 Vistula:[[19.5,49.9],[20.0,50.9],[21.0,52.2],[19.3,53.5],[18.8,54.35]],
 Rhone:[[6.1,46.2],[5.3,45.8],[4.8,45.3],[4.65,44.3],[4.6,43.9],[4.85,43.35]],
 Volga:[[36.5,57.5],[38.5,56.0],[40.0,55.0]],
 Oder:[[17.6,49.9],[17.9,51.0],[15.0,52.0],[14.6,53.0],[14.3,53.9]],
 Nile:[[32.9,29.8],[31.2,30.4],[31.5,31.4],[30.0,31.5]],
 NileUp:[[32.9,24.1],[32.8,26.5],[32.9,29.8]],
 Euphrates:[[38.7,37.0],[39.8,36.0],[41.0,35.0],[42.5,34.0],[44.4,33.2],[46.1,31.8],[47.4,31.0]],
 Tigris:[[42.4,37.3],[43.1,36.3],[43.9,34.6],[44.4,33.3],[45.8,32.0],[47.4,31.0]],
};

// ---- projection fitted to region (canvas height derived to preserve the region's aspect) ----
const bbox = { type: 'Polygon', coordinates: [[[-11,20],[-11,64.8],[50,64.8],[50,20],[-11,20]]] };
const proj = geoConicConformal().parallels([40,60]).rotate([-15,0]);
proj.fitWidth(W - 2*PAD, bbox);
{ const b = geoPath(proj).bounds(bbox); H = Math.round(b[1][1] - b[0][1] + 2*PAD); }
proj.fitExtent([[PAD,PAD],[W-PAD,H-PAD]], bbox);
console.log('canvas H =', H);

// ---- land polygons (projected, clipped to viewport) ----
const world = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json'));
const land = topojson.feature(world, world.objects.land);
const viewRect = [[[PAD,PAD],[W-PAD,PAD],[W-PAD,H-PAD],[PAD,H-PAD],[PAD,PAD]]];
function ringArea(r){ let a=0; for(let i=0;i<r.length-1;i++) a += r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1]; return Math.abs(a/2); }
let landMP = [];
const geoRect = [[[-11,20],[50,20],[50,64.8],[-11,64.8],[-11,20]]];
const geom = land.type==='FeatureCollection' ? land.features[0].geometry : land.geometry;
console.log('land polygons in source:', geom.coordinates.length);
for(const poly of geom.coordinates){
  let clipped;
  try{ clipped = pc.intersection([poly], [geoRect]); }catch(e){ continue; }
  for(const p of clipped){
    const projPoly = p.map(ring => ring.map(pt => proj(pt)));
    if(projPoly[0] && projPoly[0].length>3 && ringArea(projPoly[0]) > 30) landMP.push(projPoly);
  }
}
console.log('land pieces:', landMP.length);

// ---- voronoi over all seeds ----
const pts = [...SEEDS.map(s=>proj([s[2],s[3]])), ...DUMMIES.map(d=>proj(d))];
console.log('pts valid:', pts.every(p=>p&&isFinite(p[0])&&isFinite(p[1])), 'count', pts.length);
pts.forEach((p,i)=>{ if(!p||!isFinite(p[0])||!isFinite(p[1])) console.log('BAD PT', i, i<SEEDS.length?SEEDS[i][0]:'dummy'+(i-SEEDS.length), p); });
const delaunay = Delaunay.from(pts);
const vor = delaunay.voronoi([0,0,W,H]);

function dpSimplify(ring, eps){
  const n = ring.length;
  if(n<5) return ring;
  const keep = new Array(n).fill(false);
  keep[0]=keep[n-1]=true;
  const stack=[];
  const closed = ring[0][0]===ring[n-1][0] && ring[0][1]===ring[n-1][1];
  if(closed){ const m=Math.floor(n/2); keep[m]=true; stack.push([0,m],[m,n-1]); }
  else stack.push([0,n-1]);
  while(stack.length){
    const [a,b]=stack.pop();
    let dm=0, im=-1;
    const [ax,ay]=ring[a], [bx,by]=ring[b];
    const dx=bx-ax, dy=by-ay, len=Math.hypot(dx,dy)||1e-9;
    for(let i=a+1;i<b;i++){
      const d=Math.abs(dy*ring[i][0]-dx*ring[i][1]+bx*ay-by*ax)/len;
      if(d>dm){dm=d;im=i;}
    }
    if(dm>eps){keep[im]=true;stack.push([a,im],[im,b]);}
  }
  return ring.filter((_,i)=>keep[i]);
}

const out = {};
const edgeKeys = {}; // provId -> Set of vertex keys
for(let i=0;i<SEEDS.length;i++){
  const [id,name,lon,lat,terr,dev] = SEEDS[i];
  const cell = vor.cellPolygon(i);
  if(!cell){ console.log('NO CELL', id); continue; }
  let pieces;
  try{ pieces = pc.intersection([[cell]], landMP); }catch(e){ console.log('clip fail', id, e.message); pieces=[]; }
  const rings = [];
  const keys = new Set();
  let landArea = 0;
  for(const poly of pieces){
    for(const ring of poly){
      const a = ringArea(ring);
      if(a < 40) continue;
      landArea += a;
      for(const p of ring) keys.add(Math.round(p[0]*2)+','+Math.round(p[1]*2));
      let r = dpSimplify(ring, 0.85).map(p=>[Math.round(p[0]*10)/10, Math.round(p[1]*10)/10]);
      if(r.length>=4) rings.push(r);
    }
  }
  if(!rings.length){ console.log('EMPTY', id); continue; }
  const cellArea = ringArea(cell);
  const coast = landArea < cellArea*0.985 ? 1 : 0;
  const lp = proj([lon,lat]).map(v=>Math.round(v));
  out[id] = { n:name, t:terr, d:dev, lbl:lp, coast, polys:rings, adj:[] };
  if(WASTE.has(id)) out[id].waste = 1;
  edgeKeys[id] = keys;
}

// ---- adjacency: voronoi neighbours that share >=2 boundary vertices ----
const ids = SEEDS.map(s=>s[0]);
for(let i=0;i<SEEDS.length;i++){
  const a = ids[i]; if(!out[a]) continue;
  for(const j of delaunay.neighbors(i)){
    if(j>=SEEDS.length || j<0) continue;
    const b = ids[j]; if(!out[b] || out[a].adj.includes(b)) continue;
    let shared=0;
    for(const k of edgeKeys[a]) if(edgeKeys[b].has(k)){ shared++; if(shared>=2) break; }
    if(shared>=2){ out[a].adj.push(b); out[b].adj.push(a); }
  }
}
// ---- manual straits (crossable like land) ----
for(const [a,b] of [['jylland','fyn'],['slesvig','fyn'],['fyn','sjaelland'],['sjaelland','skane'],['sicily','calabria'],['thrace','nicaea'],['crete','hellas'],['cyprus','cilicia'],['mallorca','barcelona'],['mallorca','valencia'],['cagliari','palermo'],['cagliari','pisa'],['cagliari','mallorca'],
  // the new south: straits & desert-margin crossings
  ['andalusia','fez'],['granada','fez'],['sicily','tunis'],['tunis','kairouan'],['cyprus','acre'],['cyprus','antioch'],
  ['acre','jerusalem'],['jerusalem','kerak'],['basra','hasa'],['nejd','medina'],
  ['tripoli','barca'],['jazira','mosul'],['aleppo','damascus'],
  // densified south: coastal chains & desert-margin crossings
  ['tangier','fez'],['tangier','andalusia'],['tangier','granada'],['sfax','tripoli'],['gabes','sfax'],['tobruk','barca'],['tobruk','alexandria'],
  ['sinai','ascalon'],['sinai','damietta'],['sinai','cairo'],['aswan','said'],['said','medina'],['jedda','mecca'],['mecca','medina'],
  ['ascalon','jerusalem'],['kerak','medina'],['hauran','kerak'],['latakia','antioch'],['latakia','tripolis'],
  ['edessa','antioch'],['edessa','jazira'],['kufa','baghdad'],['wasit','baghdad'],['wasit','basra'],['qatif','hasa'],
  ['hasa','yamama'],['yamama','nejd'],['taima','medina'],['taima','hail'],['hail','nejd'],['khaybar','medina'],
  // northern & eastern isles/crossings
  ['gotland','gotaland'],['gotland','ostergotland'],['halogaland','trondelag'],['estonia','livonia']]){
  if(out[a]&&out[b]&&!out[a].adj.includes(b)){ out[a].adj.push(b); out[b].adj.push(a); }
}
const sizeKB = Math.round(JSON.stringify(out).length/1024);
console.log('provinces:', Object.keys(out).length, '| size', sizeKB, 'KB');
console.log('landlocked:', Object.entries(out).filter(([,v])=>!v.coast).map(([k])=>k).join(','));
console.log('isolated (no adj):', Object.entries(out).filter(([,v])=>!v.adj.length).map(([k])=>k).join(',')||'none');
// project rivers, clipped to viewport, rounded
const riversOut = {};
for(const [name, pts] of Object.entries(RIVERS)){
  const pr = pts.map(pt=>proj(pt)).filter(p=>p && isFinite(p[0]) && isFinite(p[1]))
    .map(p=>[Math.round(p[0]*10)/10, Math.round(p[1]*10)/10]);
  if(pr.length>=2) riversOut[name] = pr;
}
writeFileSync('rivers.json', JSON.stringify(riversOut));
console.log('rivers:', Object.keys(riversOut).length);
writeFileSync('provdata.json', JSON.stringify(out));
// preview page
let svg = `<svg viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg" style="background:#a9bdb1">`;
const cols = ['#8c2f39','#3d5a76','#5b4a7d','#a5622a','#3e6b4f','#4e7a45','#6e5340','#7a6a3a','#6d4b30','#44518f','#a8862a','#4f6b6b','#7f9a4e','#467d8f','#5d5d70','#96604e','#7d4e7a'];
let ci=0;
for(const [id,p] of Object.entries(out)){
  const col = cols[(ci++)%cols.length];
  const d = p.polys.map(r=>'M'+r.map(pt=>pt.join(',')).join('L')+'Z').join(' ');
  svg += `<path d="${d}" fill="${col}" stroke="#3a2c18" stroke-width="1" opacity=".92"/>`;
  svg += `<text x="${p.lbl[0]}" y="${p.lbl[1]}" font-size="9" text-anchor="middle" fill="#fff">${p.n}</text>`;
}
svg += '</svg>';
writeFileSync('preview.html', '<!doctype html><body style="margin:0">'+svg);
console.log('preview written');
