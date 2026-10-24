'use strict';
/* =============================================================================================================================
   44zzc-campus-lectures.js  --  LONGNECK UNIVERSITY: the lectures (the books are in 44zzd).
   A lecture is four slides (heading, text, picture) and a pool of four questions, three of which are asked afterwards. Every answer can be
   found in the slides. Each faculty has four: two at tier 1, one at tier 2 and one at tier 3 (a lecture opens at the faculty level
   0, 0, 5 and 10). The picture is a key that 44zzg draws (UNI_PICS).
   ============================================================================================================================= */
const UNI_LECTURES = [], UNI_LEC_BY_ID = {};
(function(){
  const X = uqFactory(false);
  let n = 0;
  const L = function(f, t, title, slides, qs){ n++; const o = { id: 'l' + n, f: f, t: t, title: title, slides: slides.map(function(s){ return { h: s[0], p: s[1], pic: s[2] }; }), q: qs }; UNI_LECTURES.push(o); UNI_LEC_BY_ID[o.id] = o; return o; };

  /* ---- Giraffe Studies ---- */
  L('giraffe', 1, "A Very Tall Animal", [
    ["The tallest of all", "Giraffes are the tallest land animals. A grown male can reach about 5.5 meters, as high as a two-story house, and weigh nearly 1,200 kilograms.", 'savanna'],
    ["Seven big bones", "A giraffe's neck has only seven bones, the same number as a human's. Each one is huge, about 28 centimeters long.", 'neck'],
    ["A coat like a fingerprint", "Every giraffe has its own pattern of patches. No two are exactly alike.", 'spots'],
    ["Dining at the top", "Giraffes eat leaves, especially acacia. Their dark purple tongue is about 45 centimeters long and can pick leaves between thorns.", 'tongue']
  ], [
    X.mc('giraffe', 1, "How many bones are in a giraffe's neck?", ["Seven", "Five", "Twelve", "Twenty"]),
    X.mc('giraffe', 1, "About how tall can a grown male giraffe be?", ["About 5.5 meters", "About 2 meters", "About 3 meters", "About 9 meters"]),
    X.tf('giraffe', 1, "Two giraffes can have exactly the same pattern.", false),
    X.mc('giraffe', 1, "What color is a giraffe's tongue?", ["Dark purple", "Bright pink", "Yellow", "White"])
  ]);
  L('giraffe', 1, "Calves and Towers", [
    ["Fifteen months", "A mother giraffe carries her baby for about fifteen months before it is born.", 'calf'],
    ["A tall start", "A newborn calf is already about 1.8 meters tall. It is born standing up and falls about two meters to the ground.", 'calf'],
    ["Up and running", "Within an hour a calf can stand and walk. Within a day it can run with the group.", 'run'],
    ["A tower of giraffes", "A group of giraffes is called a tower. Mothers often take turns watching the calves while the others feed.", 'savanna']
  ], [
    X.mc('giraffe', 1, "About how long is a giraffe's pregnancy?", ["About 15 months", "About 5 months", "About 9 months", "About 2 years"]),
    X.mc('giraffe', 1, "What is a group of giraffes called?", ["A tower", "A herd of ten", "A swarm", "A pod"]),
    X.tf('giraffe', 1, "A newborn giraffe cannot stand for several days.", false),
    X.mc('giraffe', 1, "About how tall is a newborn giraffe?", ["About 1.8 meters", "About 50 centimeters", "About 1 meter", "About 3 meters"])
  ]);
  L('giraffe', 2, "Built to Drink and Run", [
    ["A mighty heart", "A giraffe's heart weighs about 11 kilograms. It must push blood up a very long neck to the brain.", 'heart'],
    ["High pressure", "A giraffe's blood pressure is about twice a human's. Special valves in the neck help when it bends down to drink.", 'heart'],
    ["Awkward at the waterhole", "To drink, a giraffe has to splay its front legs or bend its knees. It is at its most vulnerable then, so it drinks only now and then.", 'savanna'],
    ["Faster than you think", "A giraffe can run about 60 kilometers an hour for short bursts. Its kick is strong enough to injure a lion.", 'run']
  ], [
    X.mc('giraffe', 2, "About how much does a giraffe's heart weigh?", ["About 11 kilograms", "About 1 kilogram", "About 50 kilograms", "About 100 grams"]),
    X.mc('giraffe', 2, "How does a giraffe's blood pressure compare with ours?", ["About twice as high", "Lower", "The same", "Ten times higher"]),
    X.mc('giraffe', 2, "How fast can a giraffe run in a short burst?", ["About 60 km/h", "About 10 km/h", "About 30 km/h", "About 100 km/h"]),
    X.mc('giraffe', 2, "What must a giraffe do to drink at a waterhole?", ["Splay its legs or bend its knees", "Lie down", "Use its tail", "Wait for rain"])
  ]);
  L('giraffe', 3, "The Family Tree", [
    ["Giraffe and okapi", "Giraffes and okapis are the only living members of the family Giraffidae. The okapi lives in forests and has striped legs.", 'family'],
    ["Ancient cousins", "Extinct relatives such as Palaeotragus had shorter necks. The long neck of today's giraffe evolved slowly over millions of years.", 'family'],
    ["Many towers, many names", "The genus name is Giraffa, from the Arabic word zarafa. Giraffes live in groups that keep changing members, called fission-fusion.", 'savanna'],
    ["A threatened future", "Wild giraffes are threatened mostly by loss of habitat and by poaching. Conservation work is helping some groups recover.", 'savanna']
  ], [
    X.mc('giraffe', 3, "Which animal is the giraffe's closest living relative?", ["The okapi", "The zebra", "The antelope", "The horse"]),
    X.mc('giraffe', 3, "What does fission-fusion mean for giraffes?", ["Groups keep changing members", "They live alone", "They live in fixed herds", "They hibernate"]),
    X.mc('giraffe', 3, "What are the main threats to wild giraffes?", ["Habitat loss and poaching", "Too much rain", "Lack of water in zoos", "Too many lions"]),
    X.mc('giraffe', 3, "The word giraffe comes from which language?", ["Arabic", "Latin", "Greek", "Swahili"])
  ]);

  /* ---- Earth & Weather ---- */
  L('earth', 1, "Layers of the Earth", [
    ["A thin shell", "We live on the crust, a thin outer layer of rock. Under the oceans it is only a few kilometers thick.", 'layers'],
    ["Hot, thick rock", "Under the crust lies the mantle, a thick layer of hot rock that slowly flows.", 'layers'],
    ["Liquid metal", "The outer core is liquid iron and nickel. Its movement helps make the Earth's magnetic field.", 'layers'],
    ["A solid heart", "The inner core is solid metal. It is extremely hot, but the huge pressure keeps it solid.", 'layers']
  ], [
    X.mc('earth', 1, "What is the Earth's thin outer layer called?", ["The crust", "The core", "The mantle", "The shell"]),
    X.mc('earth', 1, "What lies directly beneath the crust?", ["The mantle", "The inner core", "Water", "Air"]),
    X.tf('earth', 1, "The inner core is solid.", true),
    X.mc('earth', 1, "What is the outer core mostly made of?", ["Liquid iron and nickel", "Ice", "Solid gold", "Sand"])
  ]);
  L('earth', 1, "The Water Cycle", [
    ["Evaporation", "The Sun warms oceans, lakes and puddles. Water turns into an invisible gas called water vapour and rises.", 'watercycle'],
    ["Condensation", "High up, the vapour cools and turns back into tiny droplets. Together they make clouds.", 'watercycle'],
    ["Precipitation", "When the droplets grow heavy they fall as rain, hail, sleet or snow.", 'watercycle'],
    ["Water everywhere", "About 71 percent of the Earth's surface is covered by water, and most of it is in the oceans.", 'watercycle']
  ], [
    X.mc('earth', 1, "What is it called when water vapour turns into droplets?", ["Condensation", "Evaporation", "Erosion", "Freezing"]),
    X.mc('earth', 1, "What warms the water so that it evaporates?", ["The Sun", "The Moon", "The wind", "The tide"]),
    X.mc('earth', 1, "About how much of the Earth's surface is water?", ["About 71 percent", "About 10 percent", "About 30 percent", "About 99 percent"]),
    X.mc('earth', 1, "Which of these is a form of precipitation?", ["Hail", "Fog", "Dew", "Frost on a window"])
  ]);
  L('earth', 2, "Moving Plates", [
    ["A cracked shell", "The Earth's crust is broken into huge slabs called tectonic plates. They drift a few centimeters a year.", 'plates'],
    ["Earthquakes", "Earthquakes happen when plates slip and grind past each other. The point on the surface above where it starts is the epicentre.", 'plates'],
    ["Rings of fire", "Many volcanoes lie where plates meet. The Pacific Ocean is ringed by volcanoes, called the Ring of Fire.", 'plates'],
    ["Pangaea", "About 300 million years ago all the land was joined in one supercontinent, Pangaea. It slowly broke apart into today's continents.", 'plates']
  ], [
    X.mc('earth', 2, "What mainly causes earthquakes?", ["Plates shifting in the crust", "Storms", "Underground rivers", "The Moon"]),
    X.mc('earth', 2, "What is the point above an earthquake's origin called?", ["The epicentre", "The crater", "The core", "The fault"]),
    X.mc('earth', 2, "What was the ancient supercontinent called?", ["Pangaea", "Atlantis", "Eurasia", "Mu"]),
    X.mc('earth', 2, "What is the ring of volcanoes around the Pacific called?", ["The Ring of Fire", "The Rim of Heat", "The Lava Loop", "The Volcano Belt"])
  ]);
  L('earth', 3, "Air and Weather", [
    ["Layers of air", "The atmosphere has layers. We live in the troposphere; above it come the stratosphere, mesosphere and thermosphere.", 'atmos'],
    ["The ozone shield", "The ozone layer in the stratosphere absorbs most of the Sun's harmful ultraviolet light.", 'atmos'],
    ["Spinning world", "Because the Earth spins, moving air bends to the right in the northern hemisphere. This is the Coriolis effect.", 'storm'],
    ["Tilt makes seasons", "Seasons are caused by the tilt of the Earth's axis, not by its distance from the Sun. El Nino is a warming of the Pacific that changes weather worldwide.", 'storm']
  ], [
    X.mc('earth', 3, "In which layer is the ozone layer?", ["The stratosphere", "The troposphere", "The mesosphere", "The exosphere"]),
    X.mc('earth', 3, "What causes the seasons?", ["The tilt of the Earth's axis", "Distance from the Sun", "The Moon's phases", "Clouds"]),
    X.mc('earth', 3, "In the northern hemisphere, the Coriolis effect bends moving air which way?", ["To the right", "To the left", "Upward", "It does not"]),
    X.mc('earth', 3, "El Nino is a warming of which ocean?", ["The Pacific", "The Atlantic", "The Indian", "The Arctic"])
  ]);

  /* ---- Biology ---- */
  L('bio', 1, "Plants Make Food", [
    ["Sunshine kitchen", "Plants make their own food by photosynthesis. They use sunlight, water and carbon dioxide to make sugar.", 'leaf'],
    ["The green helper", "Chlorophyll is the green substance in leaves that catches sunlight. It is why leaves are green.", 'leaf'],
    ["Roots and leaves", "Roots take in water from the soil and hold the plant in place. The leaves are where most photosynthesis happens.", 'leaf'],
    ["A gift of air", "Photosynthesis gives off oxygen, the gas that we and other animals need to breathe.", 'leaf']
  ], [
    X.mc('bio', 1, "What is the process plants use to make food?", ["Photosynthesis", "Digestion", "Respiration", "Hibernation"]),
    X.mc('bio', 1, "Which gas do plants give off?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"]),
    X.mc('bio', 1, "What makes leaves green?", ["Chlorophyll", "Water", "Sugar", "Soil"]),
    X.mc('bio', 1, "What do roots mainly take in?", ["Water", "Sunlight", "Carbon dioxide", "Oxygen"])
  ]);
  L('bio', 1, "Animal Groups", [
    ["Mammals", "Mammals feed their young on milk and usually have hair or fur. Humans, giraffes and whales are mammals.", 'animals'],
    ["Birds and reptiles", "Birds have feathers and lay eggs. Reptiles, such as crocodiles and snakes, have dry scaly skin.", 'animals'],
    ["Amphibians and fish", "Amphibians, such as frogs, start life in water. Fish live in water all their lives and breathe with gills.", 'animals'],
    ["Insects and spiders", "Insects have six legs. Spiders are not insects: they have eight legs and belong to the arachnids.", 'animals']
  ], [
    X.mc('bio', 1, "What do mammals feed their babies?", ["Milk", "Insects", "Seeds", "Nectar"]),
    X.mc('bio', 1, "How many legs does an insect have?", ["Six", "Four", "Eight", "Ten"]),
    X.tf('bio', 1, "A spider is an insect.", false),
    X.mc('bio', 1, "Which of these is an amphibian?", ["A frog", "A snake", "A trout", "A robin"])
  ]);
  L('bio', 2, "Inside the Cell", [
    ["The unit of life", "Every living thing is made of cells. Some animals are a single cell; a human has trillions.", 'cell'],
    ["The control room", "The nucleus holds DNA, the instructions for the cell. Human cells have 46 chromosomes in 23 pairs.", 'cell'],
    ["Powerhouses", "Mitochondria release energy from food. They are often called the powerhouse of the cell.", 'cell'],
    ["Boundaries", "A thin membrane surrounds each cell and controls what goes in and out. Plant cells also have chloroplasts for photosynthesis.", 'cell']
  ], [
    X.mc('bio', 2, "What is the basic unit of life?", ["The cell", "The atom", "The organ", "The gene"]),
    X.mc('bio', 2, "Which part is the powerhouse of the cell?", ["The mitochondrion", "The nucleus", "The membrane", "The vacuole"]),
    X.tf('bio', 2, "Humans normally have 46 chromosomes.", true),
    X.mc('bio', 2, "What does the nucleus contain?", ["DNA", "Chlorophyll", "Starch only", "Water only"])
  ]);
  L('bio', 3, "Evolution and Genes", [
    ["The code", "DNA is written in just four letters: A, T, C and G. Their order carries the instructions for building a living thing.", 'dna'],
    ["Copies", "When a cell divides into two identical cells, the process is called mitosis. It is how you grow and heal.", 'dna'],
    ["Natural selection", "Charles Darwin explained that living things better suited to their surroundings are more likely to survive and pass on their traits.", 'foodchain'],
    ["Working together", "In mutualism both species benefit, like a bee and a flower. A virus, by contrast, cannot reproduce without taking over a host cell.", 'foodchain']
  ], [
    X.mc('bio', 3, "What are the four letters of the genetic code?", ["A, T, C and G", "A, B, C and D", "X, Y, Z and W", "H, O, N and C"]),
    X.mc('bio', 3, "What is cell division into two identical cells called?", ["Mitosis", "Osmosis", "Diffusion", "Evolution"]),
    X.mc('bio', 3, "Who explained natural selection?", ["Charles Darwin", "Isaac Newton", "Louis Pasteur", "Marie Curie"]),
    X.mc('bio', 3, "What do we call a relationship in which both species benefit?", ["Mutualism", "Parasitism", "Predation", "Competition"])
  ]);

  /* ---- Chemistry ---- */
  L('chem', 1, "States of Matter", [
    ["Three states", "Matter is usually a solid, a liquid or a gas. In a solid the particles are locked in place; in a gas they zoom about freely.", 'states'],
    ["Melting and boiling", "Heating a solid can melt it into a liquid, and heating a liquid can boil it into a gas.", 'states'],
    ["Water's numbers", "Pure water freezes at 0 degrees Celsius and boils at 100 degrees Celsius at sea level.", 'states'],
    ["Dissolving", "When sugar vanishes in tea it has dissolved, making a solution. It has not disappeared: you can taste it.", 'flask']
  ], [
    X.mc('chem', 1, "What state of matter is ice?", ["A solid", "A liquid", "A gas", "A plasma"]),
    X.mc('chem', 1, "At what temperature does water boil at sea level?", ["100 degrees Celsius", "0 degrees Celsius", "50 degrees Celsius", "212 degrees Celsius"]),
    X.mc('chem', 1, "What happens to sugar stirred into tea?", ["It dissolves", "It burns", "It evaporates", "It freezes"]),
    X.tf('chem', 1, "Water freezes at 0 degrees Celsius.", true)
  ]);
  L('chem', 1, "Atoms and Elements", [
    ["Tiny building blocks", "Everything is made of atoms. They are far too small to see, even with a normal microscope.", 'atom'],
    ["Elements", "An element contains only one kind of atom. There are 118 elements on the periodic table.", 'periodic'],
    ["Symbols", "Each element has a symbol: H for hydrogen, O for oxygen, C for carbon and Au for gold.", 'periodic'],
    ["Inside the atom", "An atom has a nucleus of protons and neutrons, with tiny electrons whizzing around it. Electrons are negative.", 'atom']
  ], [
    X.mc('chem', 1, "What is the chemical symbol for gold?", ["Au", "Ag", "Go", "Gd"]),
    X.mc('chem', 1, "How many elements are on the periodic table?", ["118", "26", "50", "250"]),
    X.mc('chem', 1, "What charge does an electron have?", ["Negative", "Positive", "None", "It changes"]),
    X.mc('chem', 1, "What is the symbol for carbon?", ["C", "Ca", "Co", "Cr"])
  ]);
  L('chem', 2, "Acids and Bases", [
    ["The pH scale", "The pH scale runs from 0 to 14. Pure water is neutral at 7; acids are below 7 and bases are above 7.", 'ph'],
    ["Spotting acids", "Blue litmus paper turns red in an acid. Lemon juice and vinegar are acids.", 'ph'],
    ["Strong stuff", "Your stomach makes hydrochloric acid to break down food and kill germs.", 'ph'],
    ["Fizz", "Baking soda and vinegar react to give off carbon dioxide gas. That is the fizz.", 'flask']
  ], [
    X.mc('chem', 2, "What is the pH of pure water?", ["7", "1", "10", "14"]),
    X.mc('chem', 2, "What does blue litmus do in an acid?", ["Turns red", "Turns green", "Turns yellow", "Stays blue"]),
    X.mc('chem', 2, "Which acid is in your stomach?", ["Hydrochloric acid", "Sulphuric acid", "Citric acid", "Nitric acid"]),
    X.mc('chem', 2, "Which gas is released when baking soda meets vinegar?", ["Carbon dioxide", "Oxygen", "Hydrogen", "Nitrogen"])
  ]);
  L('chem', 3, "Bonds and Reactions", [
    ["Ionic bonds", "In an ionic bond, electrons are passed from one atom to another. Sodium chloride, table salt, is the classic example.", 'bond'],
    ["Sharing", "In a covalent bond atoms share electrons. Water and methane are held together this way.", 'bond'],
    ["Speeding up", "A catalyst speeds up a reaction without being used up. Warming a reaction also makes it go faster.", 'flask'],
    ["Oxidation", "Oxidation is the loss of electrons. Isotopes are versions of an element with different numbers of neutrons.", 'atom']
  ], [
    X.mc('chem', 3, "What happens to electrons in an ionic bond?", ["They are transferred", "They are shared equally", "They are destroyed", "They turn into protons"]),
    X.mc('chem', 3, "What does a catalyst do?", ["Speeds a reaction up without being used up", "Slows it down", "Is always used up", "Stops it"]),
    X.mc('chem', 3, "Oxidation is the loss of what?", ["Electrons", "Protons", "Neutrons", "Heat"]),
    X.tf('chem', 3, "Isotopes of one element have different numbers of neutrons.", true)
  ]);

  /* ---- Math ---- */
  L('maths', 1, "Shapes Everywhere", [
    ["Counting sides", "A triangle has three sides, a square four, a pentagon five, a hexagon six and an octagon eight.", 'shapes'],
    ["Right angles", "A right angle is a square corner. It measures 90 degrees.", 'angles'],
    ["Going round", "The perimeter of a shape is the distance all the way round it. A square with 5 cm sides has a perimeter of 20 cm.", 'shapes'],
    ["Curves", "A circle has no corners and no straight sides. It is all one smooth curve.", 'circle']
  ], [
    X.mc('maths', 1, "How many sides does a hexagon have?", ["Six", "Five", "Eight", "Ten"]),
    X.mc('maths', 1, "How many degrees is a right angle?", ["90", "45", "180", "360"]),
    X.mc('maths', 1, "What is the perimeter of a square with 5 cm sides?", ["20 cm", "10 cm", "25 cm", "15 cm"]),
    X.tf('maths', 1, "A circle has corners.", false)
  ]);
  L('maths', 1, "Fractions and Percentages", [
    ["Parts of a whole", "A fraction shows part of a whole. One half is written 1/2, and it is the same as 0.5.", 'fractions'],
    ["Quarters", "One quarter is 1/4, which is 0.25 or 25 percent. Four quarters make a whole.", 'fractions'],
    ["Percent", "Percent means out of a hundred. 25 percent of 80 is 20, a quarter of 80.", 'fractions'],
    ["Adding thirds", "Two thirds plus one third make three thirds, which is exactly one whole.", 'fractions']
  ], [
    X.mc('maths', 1, "What is 0.5 as a fraction?", ["1/2", "1/5", "5/100", "2/1"]),
    X.mc('maths', 1, "What is 25 percent of 80?", ["20", "25", "40", "16"]),
    X.mc('maths', 1, "What is two thirds plus one third?", ["One whole", "A half", "Two ninths", "Five thirds"]),
    X.mc('maths', 1, "How many quarters make a whole?", ["Four", "Two", "Three", "Five"])
  ]);
  L('maths', 2, "Primes and Patterns", [
    ["Prime numbers", "A prime number can be divided only by 1 and itself. The first primes are 2, 3, 5, 7, 11 and 13.", 'primes'],
    ["An even prime", "Two is the smallest prime, and the only even one. One is not prime.", 'primes'],
    ["Squares and roots", "A square number is a number times itself, like 12 times 12 is 144. The square root of 144 is 12.", 'shapes'],
    ["Median", "The median is the middle value when numbers are in order. For 3, 5 and 9 the median is 5.", 'graph']
  ], [
    X.mc('maths', 2, "What is the smallest prime number?", ["2", "1", "3", "0"]),
    X.tf('maths', 2, "All prime numbers are odd.", false),
    X.mc('maths', 2, "What is the square root of 144?", ["12", "14", "11", "72"]),
    X.mc('maths', 2, "What is the median of 3, 5 and 9?", ["5", "3", "9", "6"])
  ]);
  L('maths', 3, "Algebra and Geometry", [
    ["Unknowns", "In algebra a letter stands for an unknown number. To solve 3x + 4 = 19, subtract 4, then divide by 3: x is 5.", 'graph'],
    ["Pythagoras", "In a right-angled triangle, the square on the longest side equals the sum of the squares on the others. A triangle with sides 5 and 12 has a longest side of 13.", 'pythag'],
    ["Circles", "The area of a circle is pi times the radius squared. A radius of 3 gives an area of 9 pi.", 'circle'],
    ["Angles in shapes", "The angles in a triangle add up to 180 degrees; in a pentagon they add up to 540 degrees.", 'angles']
  ], [
    X.mc('maths', 3, "Solve 3x + 4 = 19. What is x?", ["5", "4", "6", "7"]),
    X.mc('maths', 3, "A right-angled triangle has short sides 5 and 12. How long is the longest side?", ["13", "15", "17", "11"]),
    X.mc('maths', 3, "What is the area of a circle of radius 3?", ["9 pi", "6 pi", "3 pi", "18 pi"]),
    X.mc('maths', 3, "What do the angles of a pentagon add up to?", ["540 degrees", "360 degrees", "720 degrees", "450 degrees"])
  ]);

  /* ---- Physics ---- */
  L('phys', 1, "Forces", [
    ["Push and pull", "A force is a push or a pull. Forces can start things moving, stop them, or change their direction.", 'forces'],
    ["Gravity", "Gravity is the force that pulls everything toward the Earth. It is why things fall when you drop them.", 'forces'],
    ["Friction", "Friction is a force that resists sliding. It slows things down and turns movement into heat.", 'forces'],
    ["Moving energy", "Anything that moves has kinetic energy. The faster it goes, the more it has.", 'energy']
  ], [
    X.mc('phys', 1, "What is a push or a pull called?", ["A force", "A wave", "A current", "A field"]),
    X.mc('phys', 1, "Which force pulls things toward the Earth?", ["Gravity", "Friction", "Magnetism", "Static"]),
    X.mc('phys', 1, "What is the energy of movement called?", ["Kinetic energy", "Chemical energy", "Sound energy", "Heat only"]),
    X.mc('phys', 1, "What does friction do to sliding things?", ["Slows them down", "Speeds them up", "Makes them lighter", "Makes them glow"])
  ]);
  L('phys', 1, "Light and Sound", [
    ["Fast light", "Light travels about 300,000 kilometers every second, far faster than sound. That is why you see lightning before you hear thunder.", 'light'],
    ["Bouncing", "A mirror reflects light. An echo is sound that has bounced off a surface.", 'light'],
    ["Colors", "A prism splits white light into a rainbow of colors. Red has the longest wavelength and violet the shortest.", 'light'],
    ["Needing air", "Sound needs something to travel through, such as air, water or metal. In the vacuum of space there is no sound.", 'sound']
  ], [
    X.mc('phys', 1, "Which travels faster, light or sound?", ["Light", "Sound", "They are equal", "It varies"]),
    X.mc('phys', 1, "What is an echo?", ["Sound that has bounced off a surface", "Sound made louder", "A kind of light", "Silence"]),
    X.tf('phys', 1, "Sound can travel through the vacuum of space.", false),
    X.mc('phys', 1, "What does a prism do to white light?", ["Splits it into colors", "Makes it vanish", "Makes it hot", "Turns it to sound"])
  ]);
  L('phys', 2, "Newton's Laws", [
    ["Inertia", "Newton's first law: an object stays at rest, or keeps moving steadily, unless a force acts on it.", 'newton'],
    ["F equals m a", "Newton's second law: force equals mass times acceleration. The unit of force is the newton.", 'newton'],
    ["Falling", "Near the Earth's surface, a falling object speeds up by about 9.8 meters per second every second.", 'newton'],
    ["Conservation", "Energy cannot be created from nothing. It only changes from one form to another, like the wind's movement into electricity in a turbine.", 'energy']
  ], [
    X.mc('phys', 2, "What is the unit of force?", ["The newton", "The joule", "The watt", "The pascal"]),
    X.mc('phys', 2, "Which equation links force, mass and acceleration?", ["F = ma", "E = mc squared", "V = IR", "P = IV"]),
    X.mc('phys', 2, "At about what rate does a falling object speed up?", ["9.8 m/s every second", "1 m/s every second", "98 m/s every second", "It does not"]),
    X.tf('phys', 2, "Energy can be created from nothing.", false)
  ]);
  L('phys', 3, "Big Ideas", [
    ["Mass and energy", "Einstein's famous equation E = mc squared says that mass and energy are two forms of the same thing.", 'energy'],
    ["Packets of light", "Light and other electromagnetic waves come in packets called photons. Nothing with mass can go faster than light in a vacuum.", 'waves'],
    ["Moving sources", "The Doppler effect: the pitch of a siren rises as it comes toward you and falls as it moves away.", 'waves'],
    ["Very small and very cold", "Quantum mechanics describes the tiny world of atoms, where the uncertainty principle says you cannot know exactly both position and momentum. Superconductors have zero electrical resistance.", 'waves']
  ], [
    X.mc('phys', 3, "Who proposed E = mc squared?", ["Albert Einstein", "Isaac Newton", "Niels Bohr", "Galileo"]),
    X.mc('phys', 3, "What is a packet of light called?", ["A photon", "An electron", "A neutron", "A quark"]),
    X.mc('phys', 3, "What does a superconductor have?", ["Zero electrical resistance", "Infinite mass", "No magnetism at all", "A fixed color"]),
    X.mc('phys', 3, "What happens to a siren's pitch as it moves away from you?", ["It gets lower", "It gets higher", "It stays the same", "It stops"])
  ]);

  /* ---- Space ---- */
  L('space', 1, "The Solar System", [
    ["Our star", "At the center is the Sun, a star. Its gravity holds eight planets in orbit.", 'solar'],
    ["Inner planets", "In order from the Sun: Mercury, Venus, Earth and Mars. Mercury is the closest to the Sun and Venus is the hottest.", 'solar'],
    ["Giants", "Beyond Mars come Jupiter, Saturn, Uranus and Neptune. Jupiter is the largest, and Saturn is famous for its rings.", 'planets'],
    ["Red and rusty", "Mars is called the Red Planet because iron oxide, or rust, covers its soil.", 'planets']
  ], [
    X.mc('space', 1, "Which planet is closest to the Sun?", ["Mercury", "Venus", "Earth", "Mars"]),
    X.mc('space', 1, "Which is the largest planet?", ["Jupiter", "Saturn", "Neptune", "Earth"]),
    X.mc('space', 1, "How many planets are in the solar system?", ["Eight", "Seven", "Nine", "Ten"]),
    X.mc('space', 1, "Which planet is the hottest?", ["Venus", "Mercury", "Mars", "Jupiter"])
  ]);
  L('space', 1, "The Moon and the First Steps", [
    ["Our neighbour", "The Moon is Earth's natural satellite. It has almost no air, and its gravity is about a sixth of Earth's.", 'moon'],
    ["Sputnik", "The first artificial satellite, Sputnik 1, was launched in 1957.", 'rocket'],
    ["First in space", "In 1961 Yuri Gagarin became the first human in space, orbiting the Earth once.", 'rocket'],
    ["Giant leap", "In July 1969 Neil Armstrong became the first person to walk on the Moon, after landing in the Apollo 11 lunar module, Eagle.", 'moon']
  ], [
    X.mc('space', 1, "Who was the first person to walk on the Moon?", ["Neil Armstrong", "Yuri Gagarin", "Buzz Aldrin", "John Glenn"]),
    X.mc('space', 1, "Who was the first human in space?", ["Yuri Gagarin", "Neil Armstrong", "Alan Shepard", "Valentina Tereshkova"]),
    X.mc('space', 1, "What was the first artificial satellite?", ["Sputnik 1", "Explorer 1", "Apollo 1", "Hubble"]),
    X.tf('space', 1, "There is air to breathe on the Moon.", false)
  ]);
  L('space', 2, "Worlds Apart", [
    ["Mars and its volcano", "Mars has Olympus Mons, the tallest volcano in the solar system. It is about two and a half times as high as Everest.", 'planets'],
    ["Slow Venus", "Venus spins so slowly that its day is longer than its year. Its thick clouds trap heat.", 'planets'],
    ["A tilted giant", "Uranus spins tipped almost on its side. Saturn's rings are mostly ice.", 'planets'],
    ["Rocks and snowballs", "The asteroid belt lies between Mars and Jupiter. Comets are mostly ice and dust, growing tails as they near the Sun.", 'solar']
  ], [
    X.mc('space', 2, "Which planet has the tallest volcano, Olympus Mons?", ["Mars", "Venus", "Earth", "Mercury"]),
    X.mc('space', 2, "Where is the main asteroid belt?", ["Between Mars and Jupiter", "Between Earth and Mars", "Beyond Neptune", "Between Venus and Earth"]),
    X.tf('space', 2, "A day on Venus is longer than its year.", true),
    X.mc('space', 2, "What is a comet mostly made of?", ["Ice and dust", "Solid iron", "Hot gas", "Liquid water"])
  ]);
  L('space', 3, "Stars and Galaxies", [
    ["Our galaxy", "The Sun is one of hundreds of billions of stars in the Milky Way galaxy. A light-year is the distance light travels in a year.", 'galaxy'],
    ["Nearest star", "The nearest star to the Sun is Proxima Centauri, about 4.2 light-years away.", 'galaxy'],
    ["Dying stars", "A very massive star ends in a supernova explosion. What remains can be a neutron star or a black hole.", 'blackhole'],
    ["An expanding universe", "Distant galaxies are moving away from us: the universe is expanding. It is about 13.8 billion years old.", 'galaxy']
  ], [
    X.mc('space', 3, "Which star is closest to the Sun?", ["Proxima Centauri", "Sirius", "Betelgeuse", "Polaris"]),
    X.mc('space', 3, "A light-year is a measure of what?", ["Distance", "Time", "Brightness", "Speed"]),
    X.mc('space', 3, "About how old is the universe?", ["About 13.8 billion years", "About 4.5 billion years", "About 100 million years", "About 1 trillion years"]),
    X.mc('space', 3, "What can remain after a massive star explodes?", ["A neutron star or a black hole", "A new planet", "A comet", "A moon"])
  ]);

  /* ---- History & Geography ---- */
  L('geo', 1, "Reading a Map", [
    ["The key", "A map's key, or legend, explains what the symbols and colors mean.", 'map'],
    ["Continents", "There are seven continents: Africa, Antarctica, Asia, Australia, Europe, North America and South America.", 'map'],
    ["Oceans", "The Pacific is the largest ocean. The Indian Ocean lies between Africa and Australia.", 'map'],
    ["The equator", "The equator is an imaginary line at zero degrees latitude. It divides the Earth into northern and southern halves.", 'map']
  ], [
    X.mc('geo', 1, "How many continents are there?", ["Seven", "Five", "Six", "Nine"]),
    X.mc('geo', 1, "What is the largest ocean?", ["The Pacific", "The Atlantic", "The Indian", "The Arctic"]),
    X.mc('geo', 1, "What does the equator divide the Earth into?", ["Northern and southern halves", "East and west", "Land and sea", "Day and night"]),
    X.mc('geo', 1, "What does the key on a map explain?", ["What the symbols mean", "How far it is", "Which way is north", "Who made it"])
  ]);
  L('geo', 1, "Ancient Wonders", [
    ["The pyramids", "The Egyptians built the pyramids of Giza about 4,500 years ago as tombs for their pharaohs.", 'pyramids'],
    ["The Colosseum", "The Romans built the Colosseum in Rome. It opened in 80 AD and could hold tens of thousands of people.", 'colosseum'],
    ["The Great Wall", "The Great Wall of China was built over many centuries to protect the north of the empire.", 'wall'],
    ["The lost city", "The Inca built Machu Picchu high in the Andes of Peru.", 'map']
  ], [
    X.mc('geo', 1, "Who built the pyramids of Giza?", ["The ancient Egyptians", "The Romans", "The Greeks", "The Maya"]),
    X.mc('geo', 1, "In which city is the Colosseum?", ["Rome", "Athens", "Paris", "Cairo"]),
    X.mc('geo', 1, "In which country is the Great Wall?", ["China", "Japan", "India", "Mongolia"]),
    X.mc('geo', 1, "Which people built Machu Picchu?", ["The Inca", "The Aztec", "The Maya", "The Romans"])
  ]);
  L('geo', 2, "Explorers and Empires", [
    ["1492", "In 1492 Christopher Columbus sailed across the Atlantic and reached the Americas.", 'ship'],
    ["Around the world", "The expedition started in 1519 by Ferdinand Magellan was the first to sail all the way round the world.", 'ship'],
    ["A new age", "The Renaissance, a rebirth of art and learning, began in Italy.", 'colosseum'],
    ["Machines", "The Industrial Revolution began in Britain in the 1700s, with steam power and factories.", 'wall']
  ], [
    X.mc('geo', 2, "Who sailed across the Atlantic in 1492?", ["Christopher Columbus", "Ferdinand Magellan", "James Cook", "Marco Polo"]),
    X.mc('geo', 2, "In which country did the Renaissance begin?", ["Italy", "England", "France", "Germany"]),
    X.mc('geo', 2, "Where did the Industrial Revolution begin?", ["Britain", "France", "Russia", "Japan"]),
    X.mc('geo', 2, "Whose expedition first sailed around the world?", ["Magellan's", "Columbus's", "Captain Cook's", "Nelson's"])
  ]);
  L('geo', 3, "Crossroads of the World", [
    ["The Silk Road", "The Silk Road linked China with the Mediterranean world. Silk, spices and ideas traveled along it for centuries.", 'silk'],
    ["The Mongols", "Genghis Khan founded the Mongol Empire, the largest land empire in history.", 'silk'],
    ["Limits on kings", "In 1215 King John agreed to the Magna Carta, which limited the power of the king.", 'colosseum'],
    ["Lines on a map", "The Prime Meridian, 0 degrees longitude, passes through Greenwich in London. The Berlin Wall came down in 1989.", 'map']
  ], [
    X.mc('geo', 3, "Who founded the Mongol Empire?", ["Genghis Khan", "Kublai Khan only", "Alexander", "Attila"]),
    X.mc('geo', 3, "What was the Magna Carta?", ["A charter that limited the king's power", "A map", "A sea route", "A treaty with France"]),
    X.mc('geo', 3, "What does the Prime Meridian mark?", ["Zero degrees longitude", "The equator", "The date line", "The north pole"]),
    X.mc('geo', 3, "The Silk Road linked China with which region?", ["The Mediterranean and Europe", "Australia", "North America", "Antarctica"])
  ]);
})();
