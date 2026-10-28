'use strict';
/* =============================================================================================================================
   44zzb-campus-questions2.js  --  LONGNECK UNIVERSITY: the question bank, part 2 (Maths, Physics, Space, History & Geography).
   The format is described in 44zza. In an mc question the first option is the right one.
   ============================================================================================================================= */
(function(){
  const Q = uqFactory(true);
  /* ---------------------------------------------- MATHS ---------------------------------------------- */
  Q.mc('maths', 1, "What is 7 x 8?", ["56", "54", "63", "48"], "Seven eights are fifty-six.");
  Q.mc('maths', 1, "How many sides does a hexagon have?", ["Six", "Five", "Eight", "Ten"], "Hex means six.");
  Q.mc('maths', 1, "What is half of 90?", ["45", "40", "50", "35"], "Divide by two.");
  Q.mc('maths', 1, "Which of these is a prime number?", ["13", "15", "21", "27"], "13 can only be divided by 1 and itself.");
  Q.mc('maths', 1, "How many degrees are in a right angle?", ["90", "45", "180", "360"], "A square corner is a right angle.");
  Q.mc('maths', 1, "What is 100 divided by 4?", ["25", "20", "40", "50"], "Four twenty-fives make a hundred.");
  Q.mc('maths', 1, "How many minutes are in two hours?", ["120", "100", "90", "60"], "Two lots of sixty.");
  Q.tf('maths', 1, "Zero is an even number.", true, "It divides by two with nothing left over.");
  Q.mc('maths', 1, "What comes next: 2, 4, 8, 16, ...?", ["32", "24", "30", "20"], "Each number doubles.");
  Q.mc('maths', 1, "What is the perimeter of a square with sides of 5 cm?", ["20 cm", "10 cm", "25 cm", "15 cm"], "Four sides of five.");
  Q.mc('maths', 1, "What is 3 squared?", ["9", "6", "12", "27"], "Three times three.");
  Q.mc('maths', 1, "What is 0.5 written as a fraction?", ["1/2", "1/5", "5/100", "2/1"], "Half.");
  Q.mc('maths', 1, "Which shape has four equal sides and four right angles?", ["A square", "A rectangle", "A rhombus", "A triangle"], "A rectangle's sides need not be equal.");
  Q.tf('maths', 1, "A circle has corners.", false, "A circle is smooth all the way round.");
  Q.mc('maths', 1, "What is 1000 divided by 10?", ["100", "10", "1", "1000"], "Move the digits one place.");
  Q.mc('maths', 1, "Which Roman numeral means ten?", ["X", "V", "L", "C"], "V is five, L fifty, C a hundred.");

  Q.mc('maths', 2, "What is 25 percent of 80?", ["20", "25", "40", "16"], "A quarter of 80.");
  Q.mc('maths', 2, "What do the angles in any triangle add up to?", ["180 degrees", "90 degrees", "360 degrees", "270 degrees"], "True in a flat plane.");
  Q.mc('maths', 2, "What is the square root of 144?", ["12", "14", "11", "72"], "Twelve times twelve is 144.");
  Q.mc('maths', 2, "What is the area of a rectangle that is 6 long and 4 wide?", ["24", "10", "20", "28"], "Length times width.");
  Q.mc('maths', 2, "What is two thirds plus one third?", ["1", "3/6", "2/9", "5/3"], "Three thirds make a whole.");
  Q.ord('maths', 2, "Put these in order, smallest to largest.", ["0.25", "1/3", "0.5", "3/4"], "As decimals they are 0.25, 0.33, 0.5 and 0.75.");
  Q.match('maths', 2, "Match each shape to its number of sides.", [["Pentagon", "5"], ["Heptagon", "7"], ["Octagon", "8"], ["Decagon", "10"]], "The Greek prefixes give it away.");
  Q.mc('maths', 2, "Roughly what is the value of pi?", ["3.14", "2.71", "1.62", "4.13"], "It is the circumference divided by the diameter of any circle.");
  Q.tf('maths', 2, "All prime numbers are odd.", false, "Two is prime, and even.");
  Q.mc('maths', 2, "What is 7 x 13?", ["91", "81", "93", "87"], "Ten sevens and three sevens.");
  Q.est('maths', 2, "How many days are in a leap year?", 366, 1, "days", 300, 400, "Leap years add February 29.");
  Q.mc('maths', 2, "What is the median of 3, 5 and 9?", ["5", "3", "9", "6"], "The middle value.");
  Q.mc('maths', 2, "What is the smallest prime number?", ["2", "1", "3", "0"], "One is not prime.");
  Q.mc('maths', 2, "Which four-sided shape has just one pair of parallel sides?", ["A trapezium", "A parallelogram", "A square", "A rhombus"], "Trapezium (or trapezoid in American English).");

  Q.mc('maths', 3, "Solve 3x + 4 = 19. What is x?", ["5", "4", "6", "7"], "Subtract 4, then divide by 3.");
  Q.mc('maths', 3, "What is 2 to the power of 10?", ["1024", "512", "2048", "100"], "Ten doublings.");
  Q.mc('maths', 3, "What is the chance of rolling a 6 on a fair die?", ["1 in 6", "1 in 3", "1 in 12", "1 in 2"], "One face out of six.");
  Q.mc('maths', 3, "What do the interior angles of a pentagon add up to?", ["540 degrees", "360 degrees", "720 degrees", "450 degrees"], "(5 - 2) x 180.");
  Q.tf('maths', 3, "The square root of a negative number is a real number.", false, "It is an imaginary number.");
  Q.mc('maths', 3, "A right-angled triangle has short sides of 5 and 12. How long is the longest side?", ["13", "15", "17", "11"], "5 squared plus 12 squared is 169.");
  Q.mc('maths', 3, "What is 15 percent of 200?", ["30", "15", "20", "25"], "Ten percent is 20, five percent is 10.");
  Q.mc('maths', 3, "What comes next in the Fibonacci sequence: 1, 1, 2, 3, 5, 8, ...?", ["13", "11", "12", "16"], "Add the two before.");
  Q.mc('maths', 3, "Expand (x + 2)(x + 3).", ["x squared + 5x + 6", "x squared + 6", "2x + 5", "x squared + 5"], "Four products, two like terms.");
  Q.mc('maths', 3, "What is the area of a circle of radius 3?", ["9 pi", "6 pi", "3 pi", "18 pi"], "Pi times the radius squared.");

  /* ---------------------------------------------- PHYSICS ---------------------------------------------- */
  Q.mc('phys', 1, "Which force pulls objects toward the Earth?", ["Gravity", "Magnetism", "Friction", "Static"], "Gravity keeps us on the ground.");
  Q.mc('phys', 1, "Roughly how fast does light travel?", ["300,000 km per second", "300 km per second", "3,000 km per second", "30 million km per second"], "It could circle the Earth about seven times in a second.");
  Q.mc('phys', 1, "Which travels faster: light or sound?", ["Light", "Sound", "They are equal", "It depends on the weather"], "You see lightning before you hear thunder.");
  Q.mc('phys', 1, "What do we call energy of movement?", ["Kinetic energy", "Potential energy", "Chemical energy", "Nuclear energy"], "Anything moving has kinetic energy.");
  Q.mc('phys', 1, "Which metal is attracted to a magnet?", ["Iron", "Gold", "Aluminum", "Copper"], "Iron, nickel and cobalt are magnetic.");
  Q.tf('phys', 1, "In a vacuum, a heavy ball and a feather fall at the same speed.", true, "Without air, gravity pulls everything equally.");
  Q.tf('phys', 1, "Sound can travel through the vacuum of space.", false, "Sound needs a material to travel through.");
  Q.mc('phys', 1, "What is a push or a pull called?", ["A force", "A wave", "A current", "A field"], "Forces change how things move.");
  Q.mc('phys', 1, "What does a thermometer measure?", ["Temperature", "Weight", "Speed", "Pressure"], "How hot or cold something is.");
  Q.mc('phys', 1, "A battery stores which kind of energy?", ["Chemical energy", "Sound energy", "Kinetic energy", "Gravitational energy"], "It is released as electricity.");
  Q.mc('phys', 1, "What do mirrors do to light?", ["Reflect it", "Absorb it", "Bend it round corners", "Make it slower"], "Light bounces off a smooth surface.");
  Q.mc('phys', 1, "Which material is a good conductor of electricity?", ["Copper", "Rubber", "Wood", "Glass"], "Wires are made of copper.");
  Q.mc('phys', 1, "An echo is sound that has done what?", ["Bounced off a surface", "Been absorbed", "Gone faster", "Been created by wind"], "Sound reflects like light does.");
  Q.mc('phys', 1, "What is friction?", ["A force that resists sliding", "A kind of light", "A type of energy store", "The speed of sound"], "It slows things down and makes heat.");
  Q.mc('phys', 1, "What does the Sun give us?", ["Light and heat", "Only light", "Only heat", "Sound"], "Most of our energy comes from the Sun.");
  Q.mc('phys', 1, "A kettle turns electrical energy mainly into which kind of energy?", ["Heat", "Sound", "Light", "Movement"], "That is what boils the water.");

  Q.mc('phys', 2, "Newton's first law says an object keeps still or moves steadily unless what happens?", ["A force acts on it", "It gets hot", "It runs out of energy", "It is touched"], "That tendency is called inertia.");
  Q.mc('phys', 2, "What is the unit of force?", ["The newton", "The joule", "The watt", "The pascal"], "Named for Isaac Newton.");
  Q.mc('phys', 2, "Which equation links force, mass and acceleration?", ["F = ma", "E = mc squared", "V = IR", "P = IV"], "Newton's second law.");
  Q.mc('phys', 2, "How do you work out speed?", ["Distance divided by time", "Time divided by distance", "Mass times time", "Force times distance"], "Meters per second, miles per hour...");
  Q.mc('phys', 2, "What kind of wave is sound?", ["A longitudinal (pressure) wave", "A transverse wave", "An electromagnetic wave", "A gamma wave"], "It squeezes and stretches the air.");
  Q.ord('phys', 2, "Put these in order of increasing frequency.", ["Radio waves", "Microwaves", "Visible light", "X-rays"], "From long, low-energy waves to short, high-energy ones.");
  Q.match('phys', 2, "Match each unit to what it measures.", [["Newton", "Force"], ["Joule", "Energy"], ["Watt", "Power"], ["Volt", "Electrical potential"]], "SI units named after scientists.");
  Q.tf('phys', 2, "Energy can be created from nothing.", false, "Energy is conserved: it only changes form.");
  Q.mc('phys', 2, "What does a prism do to white light?", ["Splits it into colors", "Makes it brighter", "Makes it vanish", "Turns it to sound"], "Different colors bend by different amounts.");
  Q.mc('phys', 2, "Near the Earth's surface, a falling object accelerates at about...", ["9.8 meters per second every second", "1 meter per second every second", "98 meters per second every second", "It falls at constant speed"], "That is g.");
  Q.est('phys', 2, "About how fast does sound travel in air, in meters per second?", 343, 45, "m/s", 0, 1000, "Around 343 m/s at room temperature.");
  Q.mc('phys', 2, "Which color of visible light has the longest wavelength?", ["Red", "Violet", "Green", "Blue"], "Violet is the shortest.");
  Q.mc('phys', 2, "In which unit is electric current measured?", ["Amperes", "Volts", "Ohms", "Watts"], "Often called amps.");
  Q.mc('phys', 2, "A wind turbine turns kinetic energy of the wind into what?", ["Electrical energy", "Chemical energy", "Nuclear energy", "Sound only"], "The blades drive a generator.");

  Q.mc('phys', 3, "Who developed the famous equation E = mc squared?", ["Albert Einstein", "Isaac Newton", "Niels Bohr", "Galileo Galilei"], "It says mass and energy are two forms of the same thing.");
  Q.mc('phys', 3, "Which particle carries the electromagnetic force, such as light?", ["The photon", "The electron", "The neutron", "The quark"], "Light comes in packets called photons.");
  Q.mc('phys', 3, "Ohm's law links which three quantities?", ["Voltage, current and resistance", "Force, mass and acceleration", "Energy, mass and light speed", "Pressure, volume and temperature"], "V = I x R.");
  Q.tf('phys', 3, "According to physics as we know it, nothing with mass can travel faster than light in a vacuum.", true, "It is the universe's speed limit.");
  Q.mc('phys', 3, "The Doppler effect describes what?", ["A change in frequency when a source and observer move relative to each other", "The bending of light by gravity", "The slowing of time", "The splitting of atoms"], "An ambulance siren sounds higher as it approaches.");
  Q.mc('phys', 3, "Heisenberg's uncertainty principle belongs to which branch of physics?", ["Quantum mechanics", "Thermodynamics", "Optics", "Fluid mechanics"], "You cannot know both position and momentum exactly.");
  Q.mc('phys', 3, "If you double an object's speed, its kinetic energy is multiplied by...", ["4", "2", "8", "It stays the same"], "Kinetic energy depends on speed squared.");
  Q.mc('phys', 3, "What is the name for the radiation given off when unstable atomic nuclei decay?", ["Radioactivity", "Convection", "Refraction", "Diffraction"], "Alpha, beta and gamma radiation.");
  Q.mc('phys', 3, "A superconductor has what property?", ["Zero electrical resistance", "Infinite mass", "No magnetism at all", "It cannot be cooled"], "It carries current without losing energy as heat.");
  Q.mc('phys', 3, "What is the SI unit of frequency?", ["The hertz", "The decibel", "The tesla", "The lumen"], "One cycle per second.");

  /* ---------------------------------------------- SPACE ---------------------------------------------- */
  Q.mc('space', 1, "Which planet is closest to the Sun?", ["Mercury", "Venus", "Earth", "Mars"], "It is also the smallest planet.");
  Q.mc('space', 1, "Which is the largest planet in the solar system?", ["Jupiter", "Saturn", "Neptune", "Earth"], "More than 1,300 Earths would fit inside it.");
  Q.mc('space', 1, "What is the Moon?", ["Earth's natural satellite", "A small star", "A planet", "A comet"], "It orbits the Earth about every 27 days.");
  Q.mc('space', 1, "Which planet is known as the Red Planet?", ["Mars", "Mercury", "Jupiter", "Venus"], "Iron oxide, or rust, makes its soil red.");
  Q.mc('space', 1, "What is the name of our star?", ["The Sun", "Sirius", "Polaris", "Proxima"], "It holds the solar system together with its gravity.");
  Q.tf('space', 1, "The Sun is a planet.", false, "It is a star, a huge ball of hot gas.");
  Q.mc('space', 1, "How many planets are in our solar system?", ["Eight", "Seven", "Nine", "Ten"], "Pluto is now classed as a dwarf planet.");
  Q.mc('space', 1, "Which planet is famous for its bright rings?", ["Saturn", "Mars", "Venus", "Mercury"], "The other giant planets have faint rings too.");
  Q.mc('space', 1, "Who was the first human in space?", ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "John Glenn"], "He orbited the Earth once in 1961.");
  Q.mc('space', 1, "Who was the first person to walk on the Moon?", ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "Michael Collins"], "In July 1969.");
  Q.mc('space', 1, "What is a 'shooting star' really?", ["A meteor burning up in the air", "A star falling", "A comet's tail", "A satellite"], "A tiny bit of rock glowing as it falls.");
  Q.mc('space', 1, "Which planet is the hottest?", ["Venus", "Mercury", "Mars", "Jupiter"], "Its thick atmosphere traps heat.");
  Q.mc('space', 1, "How long does the Earth take to go once around the Sun?", ["One year", "One day", "One month", "Ten years"], "About 365 and a quarter days.");
  Q.mc('space', 1, "Which force keeps the planets in orbit around the Sun?", ["Gravity", "Magnetism", "Wind", "Friction"], "The Sun's gravity is strongest.");
  Q.mc('space', 1, "What is the name of our galaxy?", ["The Milky Way", "Andromeda", "The Whirlpool", "The Sombrero"], "It holds hundreds of billions of stars.");
  Q.tf('space', 1, "There is air to breathe on the Moon.", false, "It has almost no atmosphere.");

  Q.mc('space', 2, "Which planet has Olympus Mons, the tallest volcano in the solar system?", ["Mars", "Venus", "Earth", "Mercury"], "It is about two and a half times the height of Everest.");
  Q.mc('space', 2, "About how long does sunlight take to reach Earth?", ["About 8 minutes", "About 8 seconds", "About 8 hours", "About 8 days"], "Light crosses 150 million km in about 500 seconds.");
  Q.ord('space', 2, "Put these planets in order from the Sun.", ["Mercury", "Venus", "Earth", "Mars"], "My Very Easy Method: Mercury, Venus, Earth, Mars...");
  Q.mc('space', 2, "A light-year is a measure of what?", ["Distance", "Time", "Brightness", "Speed"], "It is how far light travels in a year.");
  Q.match('space', 2, "Match each planet to its famous feature.", [["Jupiter", "The Great Red Spot"], ["Saturn", "Bright rings"], ["Mars", "Olympus Mons"], ["Venus", "Thick, hot, cloudy atmosphere"]], "Each world is different.");
  Q.mc('space', 2, "Between which two planets is the main asteroid belt?", ["Mars and Jupiter", "Earth and Mars", "Jupiter and Saturn", "Venus and Earth"], "Millions of rocky fragments orbit there.");
  Q.mc('space', 2, "The Moon's gravity is roughly what fraction of Earth's?", ["About one sixth", "About one half", "About the same", "About one tenth"], "Astronauts bounced along.");
  Q.mc('space', 2, "Which planet spins tipped almost on its side?", ["Uranus", "Mars", "Earth", "Jupiter"], "Its axis is tilted about 98 degrees.");
  Q.tf('space', 2, "A day on Venus is longer than its year.", true, "Venus turns very slowly: one spin takes longer than one orbit.");
  Q.mc('space', 2, "What was the first artificial satellite?", ["Sputnik 1", "Explorer 1", "Apollo 1", "Vostok 1"], "The Soviet Union launched it in 1957.");
  Q.est('space', 2, "About how far away is the Moon, in thousands of kilometers?", 384, 50, "thousand km", 100, 1000, "About 384,000 km.");
  Q.mc('space', 2, "A comet is mostly made of what?", ["Ice and dust", "Solid iron", "Hot gas", "Liquid water"], "Its tail forms as the ice melts near the Sun.");
  Q.mc('space', 2, "Which space telescope, launched in 1990, has taken famous deep-space photographs?", ["Hubble", "Kepler", "Spitzer", "Voyager"], "It orbits Earth above the blurring atmosphere.");
  Q.mc('space', 2, "What was the name of the Apollo 11 lunar module that landed on the Moon?", ["Eagle", "Columbia", "Odyssey", "Falcon"], "Columbia was the command module.");

  Q.mc('space', 3, "A neutron star is what remains after...", ["A massive star explodes as a supernova", "A planet cools", "Two moons collide", "A comet melts"], "The core is crushed into an extremely dense ball.");
  Q.mc('space', 3, "Which star is closest to the Sun?", ["Proxima Centauri", "Sirius", "Betelgeuse", "Polaris"], "About 4.2 light-years away.");
  Q.mc('space', 3, "Which planet is farthest from the Sun?", ["Neptune", "Uranus", "Saturn", "Pluto"], "Pluto is a dwarf planet.");
  Q.mc('space', 3, "What is the boundary around a black hole called, beyond which nothing can escape?", ["The event horizon", "The corona", "The singularity belt", "The photosphere"], "Even light cannot get out.");
  Q.mc('space', 3, "Hubble's observations showed that distant galaxies are doing what?", ["Moving away from us", "Moving toward us", "Standing still", "Spinning faster"], "The universe is expanding.");
  Q.mc('space', 3, "What is Saturn's largest moon?", ["Titan", "Europa", "Ganymede", "Triton"], "It has a thick atmosphere and lakes of liquid methane.");
  Q.mc('space', 3, "Which planet's moon Europa is thought to hide an ocean under its ice?", ["Jupiter", "Saturn", "Mars", "Neptune"], "A target in the search for life.");
  Q.mc('space', 3, "In which year did humans first land on the Moon?", ["1969", "1961", "1972", "1957"], "Apollo 11, July 1969.");
  Q.est('space', 3, "How many moons does Mars have?", 2, 0.5, "moons", 0, 10, "Phobos and Deimos.");
  Q.mc('space', 3, "About how old is the universe?", ["About 13.8 billion years", "About 4.5 billion years", "About 100 million years", "About 1 trillion years"], "The Earth is much younger, around 4.5 billion.");

  /* ---------------------------------------------- HISTORY & GEOGRAPHY ---------------------------------------------- */
  Q.mc('geo', 1, "What is the capital of France?", ["Paris", "Lyon", "Marseille", "Nice"], "It sits on the River Seine.");
  Q.mc('geo', 1, "Which country is the largest by area?", ["Russia", "Canada", "China", "The USA"], "It spans eleven time zones.");
  Q.mc('geo', 1, "On which continent is Egypt?", ["Africa", "Asia", "Europe", "South America"], "It is in the north-east of Africa.");
  Q.mc('geo', 1, "What is the capital of Japan?", ["Tokyo", "Osaka", "Kyoto", "Seoul"], "Kyoto was the old capital.");
  Q.mc('geo', 1, "Which ocean lies between Africa and Australia?", ["The Indian Ocean", "The Pacific", "The Atlantic", "The Arctic"], "It is named after India.");
  Q.mc('geo', 1, "In which country is the Great Wall?", ["China", "Japan", "India", "Mongolia"], "It was built over many centuries.");
  Q.mc('geo', 1, "What is the capital of the United States?", ["Washington, D.C.", "New York", "Los Angeles", "Chicago"], "Named after the first president.");
  Q.mc('geo', 1, "Which country is shaped like a boot?", ["Italy", "Spain", "Greece", "Portugal"], "It has a heel and a toe.");
  Q.mc('geo', 1, "Which ancient people built the pyramids of Giza?", ["The Egyptians", "The Romans", "The Greeks", "The Maya"], "About 4,500 years ago.");
  Q.mc('geo', 1, "What is the tallest mountain on Earth above sea level?", ["Mount Everest", "K2", "Kilimanjaro", "Mont Blanc"], "It is 8,849 meters high.");
  Q.tf('geo', 1, "Australia is both a country and a continent.", true, "It is the only one that is.");
  Q.mc('geo', 1, "Which animal is a symbol of Australia?", ["The kangaroo", "The giraffe", "The lion", "The bison"], "It appears on the coat of arms.");
  Q.mc('geo', 1, "What is the capital of the United Kingdom?", ["London", "Edinburgh", "Cardiff", "Dublin"], "On the River Thames.");
  Q.mc('geo', 1, "The Amazon rainforest lies mostly in which country?", ["Brazil", "Peru", "Colombia", "Argentina"], "Brazil holds about 60 percent of it.");
  Q.mc('geo', 1, "What is the part of a map that explains the symbols called?", ["The key (or legend)", "The scale", "The compass rose", "The grid"], "It tells you what the pictures mean.");
  Q.mc('geo', 1, "How many years are in a century?", ["100", "10", "50", "1000"], "A hundred.");

  Q.mc('geo', 2, "Which empire built the Colosseum?", ["The Roman Empire", "The Greek city-states", "The Ottoman Empire", "The Persian Empire"], "It opened in 80 AD in Rome.");
  Q.mc('geo', 2, "Who sailed across the Atlantic to the Americas in 1492?", ["Christopher Columbus", "Ferdinand Magellan", "James Cook", "Marco Polo"], "He was looking for a route to Asia.");
  Q.mc('geo', 2, "What is the capital of Australia?", ["Canberra", "Sydney", "Melbourne", "Perth"], "Not Sydney, though many people guess it.");
  Q.mc('geo', 2, "Which river flows through Cairo?", ["The Nile", "The Congo", "The Tigris", "The Niger"], "It flows north to the sea.");
  Q.ord('geo', 2, "Put these in order, earliest first.", ["The pyramids of Giza", "The Roman Colosseum", "Columbus's voyage", "The Moon landing"], "About 2500 BC, 80 AD, 1492 and 1969.");
  Q.match('geo', 2, "Match each country to its capital.", [["Kenya", "Nairobi"], ["Canada", "Ottawa"], ["Brazil", "Brasilia"], ["Turkey", "Ankara"]], "None of them are the biggest city.");
  Q.mc('geo', 2, "Which ancient civilization built Machu Picchu?", ["The Inca", "The Aztec", "The Maya", "The Olmec"], "It sits high in the Andes of Peru.");
  Q.mc('geo', 2, "In which country did the Renaissance begin?", ["Italy", "England", "France", "Germany"], "Florence was its birthplace.");
  Q.tf('geo', 2, "The Berlin Wall came down in 1989.", true, "It marked the end of a divided Germany.");
  Q.mc('geo', 2, "Which continent has the most countries?", ["Africa", "Asia", "Europe", "South America"], "Fifty-four.");
  Q.est('geo', 2, "In which year did the Second World War end?", 1945, 1, "", 1900, 2000, "1945.");
  Q.mc('geo', 2, "Which sea lies between Europe and Africa?", ["The Mediterranean", "The Baltic", "The Black Sea", "The Red Sea"], "Its name means 'middle of the land'.");
  Q.mc('geo', 2, "Who was the first President of the United States?", ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"], "He took office in 1789.");
  Q.mc('geo', 2, "Where did the Industrial Revolution begin in the 1700s?", ["Britain", "France", "Russia", "Japan"], "Steam power and factories spread from there.");

  Q.mc('geo', 3, "Which king agreed to the Magna Carta in 1215?", ["King John", "Henry VIII", "Richard the Lionheart", "Edward I"], "It limited the king's power.");
  Q.mc('geo', 3, "Which Roman town was buried by the eruption of Vesuvius in 79 AD?", ["Pompeii", "Athens", "Carthage", "Alexandria"], "The ash preserved it.");
  Q.mc('geo', 3, "What is the smallest country in the world?", ["Vatican City", "Monaco", "Liechtenstein", "San Marino"], "It is inside the city of Rome.");
  Q.mc('geo', 3, "The Silk Road linked China with which region?", ["The Mediterranean and Europe", "Australia", "North America", "Antarctica"], "Goods and ideas traveled along it for centuries.");
  Q.mc('geo', 3, "Whose expedition was the first to sail all the way around the world, starting in 1519?", ["Ferdinand Magellan's", "Christopher Columbus's", "Vasco da Gama's", "Captain Cook's"], "Magellan died on the way; part of his crew finished the trip.");
  Q.tf('geo', 3, "The Nile flows from south to north.", true, "It runs from central Africa to the Mediterranean.");
  Q.mc('geo', 3, "Which line of longitude is 0 degrees?", ["The Prime Meridian", "The equator", "The International Date Line", "The Tropic of Cancer"], "It passes through Greenwich in London.");
  Q.mc('geo', 3, "Which great empire was founded by Genghis Khan?", ["The Mongol Empire", "The Ottoman Empire", "The Persian Empire", "The Byzantine Empire"], "It became the largest land empire in history.");
  Q.est('geo', 3, "How many countries are there in Africa?", 54, 4, "countries", 20, 80, "Fifty-four.");
  Q.mc('geo', 3, "Which desert covers much of southern Mongolia and northern China?", ["The Gobi", "The Sahara", "The Atacama", "The Thar"], "It is a cold desert.");
})();
