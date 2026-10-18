'use strict';
/* =============================================================================================================================
   44zzd-campus-books.js  --  LONGNECK UNIVERSITY: the books in the library (the lectures are in 44zzc).
   A book has five pages, a pool of three questions (two are asked when she has read it) and one fact that is written into her notebook
   the first time she reads it. Each faculty has three books, one for each tier (a book opens at the faculty level 0, 5 and 10).
   ============================================================================================================================= */
const UNI_BOOKS = [], UNI_BOOK_BY_ID = {};
(function(){
  const X = uqFactory(false);
  let n = 0;
  const B = function(f, t, title, author, col, pages, qs, fact){ n++; const o = { id: 'b' + n, f: f, t: t, title: title, author: author, col: col, pages: pages, q: qs, fact: fact }; UNI_BOOKS.push(o); UNI_BOOK_BY_ID[o.id] = o; return o; };

  /* ---- Giraffe Studies ---- */
  B('giraffe', 1, "Up Where the Leaves Are", "Tilly Longshanks", '#C9772E', [
    "Tilly was a very tall giraffe. She was so tall that she could see over every tree on the savanna.",
    "Every morning she ate leaves from the top of an acacia. Her long dark tongue curled round each branch and pulled the leaves off, thorns and all.",
    "Her neck had seven bones, just like yours. But every one of them was as long as a ruler.",
    "At the waterhole Tilly had to spread her front legs wide to reach the water. It looked silly, but it worked.",
    "When night came, Tilly slept for only a few minutes at a time. A tall giraffe has to keep watch."
  ], [
    X.mc('giraffe', 1, "What did Tilly eat each morning?", ["Leaves from an acacia", "Fish", "Grass only", "Fruit from the ground"]),
    X.mc('giraffe', 1, "How many bones are in Tilly's neck?", ["Seven", "Five", "Twelve", "Twenty"]),
    X.mc('giraffe', 1, "How did Tilly reach the water?", ["She spread her front legs wide", "She lay down", "She jumped", "She asked a friend"])
  ], "A giraffe's neck has seven bones, the same as yours, but each one is about as long as a school ruler.");
  B('giraffe', 2, "The Heart of a Tall Animal", "Dr. Hart Stag", '#B5502A', [
    "How does blood get all the way up a giraffe's neck? The answer is a very big heart, about eleven kilograms of muscle.",
    "A giraffe's blood pressure is about twice as high as yours. Strong walls in the arteries keep it from bursting.",
    "When a giraffe bends down to drink, valves and a web of tiny vessels stop too much blood rushing to its head.",
    "Giraffes are fast. For short sprints they reach about sixty kilometres an hour, which would outrun most hunters.",
    "And if a lion does get close, a giraffe's kick is one of the most powerful in the savanna."
  ], [
    X.mc('giraffe', 2, "About how heavy is a giraffe's heart?", ["About 11 kilograms", "About 1 kilogram", "About 100 grams", "About 50 kilograms"]),
    X.mc('giraffe', 2, "How fast can a giraffe sprint?", ["About 60 km/h", "About 10 km/h", "About 30 km/h", "About 100 km/h"]),
    X.tf('giraffe', 2, "A giraffe's blood pressure is lower than a human's.", false)
  ], "A giraffe's heart weighs about 11 kilograms, and its blood pressure is roughly double a human's.");
  B('giraffe', 3, "Towers of the Savanna", "A. Okapi", '#8A6A44', [
    "Giraffes belong to the family Giraffidae. Its only living members are the giraffe and a shy forest cousin called the okapi.",
    "The okapi has stripes on its legs like a zebra, but it is no relation to the zebra at all.",
    "Long ago there were other giraffids, such as Palaeotragus. It had a shorter neck, and it shows how the giraffe's long neck grew slowly over time.",
    "Giraffes do not live in fixed herds. Groups meet, split and mix again, which scientists call fission-fusion.",
    "Wild giraffes need space. Habitat loss and poaching are their biggest dangers today, and people are working to protect them."
  ], [
    X.mc('giraffe', 3, "Which animal is the giraffe's closest living relative?", ["The okapi", "The zebra", "The antelope", "The horse"]),
    X.mc('giraffe', 3, "What is the changing group system of giraffes called?", ["Fission-fusion", "A hive", "A colony", "A pyramid"]),
    X.mc('giraffe', 3, "Which extinct animal was a short-necked giraffe relative?", ["Palaeotragus", "Smilodon", "The mammoth", "The dodo"])
  ], "The giraffe's only living relative is the okapi, a shy forest animal with striped legs.");

  /* ---- Earth & Weather ---- */
  B('earth', 1, "Why the Wind Blows", "Gale Breezeway", '#6BB8E8', [
    "The Sun warms the Earth, but not evenly. The land near the equator gets much more heat than the poles.",
    "Warm air is light, so it rises. Cooler air rushes in to take its place. That moving air is the wind.",
    "When warm damp air rises high, it cools and the water vapour turns into tiny droplets. That is how clouds form.",
    "When droplets get heavy they fall as rain. In very cold, tall clouds they can freeze and fall as hail.",
    "Lightning heats the air so quickly that the air booms. The boom is thunder, and light is faster than sound, so you see the flash first."
  ], [
    X.mc('earth', 1, "What is moving air called?", ["Wind", "Fog", "Dew", "Frost"]),
    X.mc('earth', 1, "What makes the sound of thunder?", ["Lightning heating the air very quickly", "Clouds bumping", "Rain falling hard", "Wind in tunnels"]),
    X.mc('earth', 1, "What do we see first in a storm?", ["The lightning flash", "The thunder", "Both at once", "The rain"])
  ], "Thunder is the sound of air being heated by lightning so fast that it expands with a boom.");
  B('earth', 2, "The Restless Planet", "Terra Firma", '#B5602A', [
    "Deep inside the Earth, a solid iron heart is wrapped in liquid metal, then a thick layer of hot rock called the mantle.",
    "The thin crust we live on is broken into plates. They float on the mantle and drift a few centimetres a year, about as fast as your fingernails grow.",
    "Where plates push together, mountains rise. Where they slip past each other, earthquakes shake the ground.",
    "Many volcanoes sit along plate edges. The Ring of Fire around the Pacific has hundreds of them.",
    "Three hundred million years ago all the land was one supercontinent, Pangaea. The plates carried the pieces apart."
  ], [
    X.mc('earth', 2, "What is the Earth's crust broken into?", ["Plates", "Layers of ice", "Islands only", "Stripes"]),
    X.mc('earth', 2, "What was the supercontinent called?", ["Pangaea", "Atlantis", "Eurasia", "Mu"]),
    X.tf('earth', 2, "Plates move a few centimetres a year.", true)
  ], "The Earth's plates drift about as fast as your fingernails grow.");
  B('earth', 3, "Reading the Sky", "Professor Barometer", '#7A8AFF', [
    "Our air is in layers. The troposphere is where weather happens; above it the stratosphere holds the ozone layer that shields us from ultraviolet light.",
    "Pressure tells a story. A barometer that is falling warns of rain, while a rising one often means clearer skies.",
    "Because the Earth spins, moving air in the north curves to the right. This Coriolis effect helps swirl hurricanes.",
    "Hurricanes are rated from category 1 to 5 on the Saffir-Simpson scale, while the Beaufort scale rates wind from 0 to 12.",
    "Every few years the Pacific warms in an event called El Nino, and weather changes around the world."
  ], [
    X.mc('earth', 3, "Which instrument warns of coming rain by falling?", ["A barometer", "A compass", "A ruler", "A telescope"]),
    X.mc('earth', 3, "Hurricanes are rated on which scale?", ["Saffir-Simpson", "Richter", "Kelvin", "Mohs"]),
    X.mc('earth', 3, "Which way does the Coriolis effect turn air in the north?", ["To the right", "To the left", "Upward", "Backwards"])
  ], "A falling barometer reading usually means bad weather is on its way.");

  /* ---- Biology ---- */
  B('bio', 1, "A Green World", "Fern Greenleaf", '#6BD88A', [
    "Every plant is a tiny factory. In the leaves, sunlight, water and air are turned into sugar.",
    "The sugar feeds the plant. The leftover oxygen goes into the air, ready for you to breathe.",
    "A bee visits a flower for sweet nectar. While it feeds, grains of pollen stick to its fur.",
    "The bee carries the pollen to another flower. That is how plants make seeds.",
    "Seeds fall, or are blown, or are carried by animals. Wherever they land, a new plant may start to grow."
  ], [
    X.mc('bio', 1, "What does a bee visit a flower for?", ["Nectar", "Roots", "Leaves", "Rain"]),
    X.mc('bio', 1, "Which gas do plants release?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Smoke"]),
    X.mc('bio', 1, "What sticks to a bee's fur and makes seeds?", ["Pollen", "Soil", "Sap", "Dew"])
  ], "Bees carry pollen from flower to flower, and that is how many plants make seeds.");
  B('bio', 2, "Little Lives", "Dr. Cella Nucleus", '#4DB8A0', [
    "Look closely at any living thing and you find it is built of cells, the smallest units of life.",
    "Most cells have a nucleus, which holds DNA. In humans there are 46 chromosomes in each cell.",
    "Mitochondria are tiny powerhouses inside cells. They release energy from the food you eat.",
    "White blood cells patrol your body and attack germs. Red blood cells carry oxygen.",
    "A plant cell has an extra: green chloroplasts, where photosynthesis happens."
  ], [
    X.mc('bio', 2, "Which part of a cell contains its DNA?", ["The nucleus", "The membrane", "The chloroplast", "The vacuole"]),
    X.mc('bio', 2, "Which cells fight germs?", ["White blood cells", "Red blood cells", "Skin cells", "Bone cells"]),
    X.tf('bio', 2, "Mitochondria release energy from food.", true)
  ], "Every human cell has 46 chromosomes, arranged in 23 pairs.");
  B('bio', 3, "The Long Chain", "C. Darwin Jr.", '#B58AE8', [
    "Charles Darwin noticed that living things vary, and that those fitted to their surroundings tend to survive and have more young. He called this natural selection.",
    "DNA stores the instructions in four letters: A, T, C and G. Copying errors can change them, making new traits.",
    "When one cell copies itself into two identical cells, the process is mitosis. It is how you heal a cut.",
    "A bee and a flower both benefit from each other, which is called mutualism. A parasite, by contrast, takes without giving.",
    "A virus is not a cell. It cannot reproduce by itself, and needs to take over a living cell to make copies."
  ], [
    X.mc('bio', 3, "Who described natural selection?", ["Charles Darwin", "Gregor Mendel", "Marie Curie", "Louis Pasteur"]),
    X.mc('bio', 3, "What do we call a relationship that helps both species?", ["Mutualism", "Parasitism", "Predation", "Competition"]),
    X.mc('bio', 3, "What does a virus need in order to reproduce?", ["A host cell", "Sunlight", "Soil", "Nothing"])
  ], "A virus cannot reproduce on its own: it has to take over a living cell.");

  /* ---- Chemistry ---- */
  B('chem', 1, "Everything Is Made of Something", "Atom Anne", '#B58AE8', [
    "Look at your hand. Look at the air. Look at a stone. All of it is made of atoms, so small you cannot see them.",
    "Atoms of one kind make an element. Gold is an element, and so are oxygen and iron.",
    "When atoms join up, they make molecules. Two hydrogen atoms and one oxygen atom make water.",
    "Water is the only common thing on Earth found as a solid, a liquid and a gas.",
    "Ice is a solid. Heat it past zero degrees Celsius and it melts. Heat it to one hundred and it boils into steam."
  ], [
    X.mc('chem', 1, "What is the chemical formula of water?", ["H2O", "CO2", "O2", "NaCl"]),
    X.mc('chem', 1, "At what temperature does ice melt?", ["0 degrees Celsius", "100 degrees Celsius", "10 degrees Celsius", "50 degrees Celsius"]),
    X.mc('chem', 1, "Which of these is an element?", ["Gold", "Water", "Salt", "Sugar"])
  ], "Water is made of two hydrogen atoms and one oxygen atom, which is why its formula is H2O.");
  B('chem', 2, "Fizz, Bubble, Bang", "Professor Beaker", '#FF8A3D', [
    "When baking soda meets vinegar, the mixture fizzes. The bubbles are carbon dioxide gas.",
    "Acids taste sour and have a pH below 7. Bases feel slippery and have a pH above 7. Pure water sits in the middle at 7.",
    "Litmus paper is an indicator: it goes red in acid and blue in a base.",
    "Rust is a slow reaction. Iron slowly combines with oxygen and water to make a brittle orange coating.",
    "A catalyst helps a reaction along without being used up. The enzymes in your body are catalysts."
  ], [
    X.mc('chem', 2, "What gas makes the fizz of baking soda and vinegar?", ["Carbon dioxide", "Oxygen", "Hydrogen", "Helium"]),
    X.mc('chem', 2, "What is the pH of pure water?", ["7", "1", "10", "14"]),
    X.mc('chem', 2, "What is the orange coating on old iron called?", ["Rust", "Soot", "Mould", "Verdigris"])
  ], "Rust is iron slowly combining with oxygen and water.");
  B('chem', 3, "The Electron's Diary", "E. Lectron", '#FF6A6A', [
    "Dear diary: today I moved house. I was part of a sodium atom, and now I live on a chlorine atom. That is an ionic bond.",
    "Dear diary: today I was shared. A hydrogen atom and an oxygen atom both hold me. That is a covalent bond.",
    "Dear diary: the oxygen is very pleased. Atoms of fluorine pull on electrons harder than any other element.",
    "Dear diary: today I met an isotope. Same element, but it has a different number of neutrons.",
    "Dear diary: today they said oxidation is the loss of electrons. I think they mean losing me."
  ], [
    X.mc('chem', 3, "What kind of bond involves transferring electrons?", ["An ionic bond", "A covalent bond", "A magnetic bond", "A hydrogen bomb"]),
    X.mc('chem', 3, "What is oxidation?", ["The loss of electrons", "The gain of protons", "A change of state", "A kind of rust-proofing"]),
    X.mc('chem', 3, "Which element pulls on electrons hardest?", ["Fluorine", "Oxygen", "Carbon", "Gold"])
  ], "Fluorine is the most electronegative element: nothing else pulls on electrons harder.");

  /* ---- Maths ---- */
  B('maths', 1, "The Number Garden", "Sum Plenty", '#F2A23C', [
    "In the number garden, every flower grew in rows. Seven rows of eight made fifty-six petals.",
    "A gardener split a pie of ten roses into halves, then quarters. A quarter is 25 percent.",
    "The path was a square with sides of five paces. Walking all the way round took twenty.",
    "Some numbers could only be divided by one and themselves. Those were the prime numbers, and the smallest was two.",
    "Zero sat quietly at the gate. It is an even number too, because it divides by two with nothing left over."
  ], [
    X.mc('maths', 1, "What is 7 x 8?", ["56", "54", "63", "48"]),
    X.mc('maths', 1, "What percentage is a quarter?", ["25 percent", "10 percent", "40 percent", "75 percent"]),
    X.mc('maths', 1, "What is the smallest prime number?", ["2", "1", "3", "0"])
  ], "Two is the smallest prime number, and the only even one.");
  B('maths', 2, "Shapes and Secrets", "Geo Metrica", '#6BD88A', [
    "Every triangle has angles that add up to 180 degrees. Draw one and measure them, and you will always find it true.",
    "A pentagon has five sides and a hexagon six. A decagon has ten.",
    "A circle's circumference is about 3.14 times as long as its width. That number is called pi.",
    "To find the area of a rectangle, multiply the length by the width. A 6 by 4 rectangle has an area of 24.",
    "A trapezium has just one pair of parallel sides. A parallelogram has two."
  ], [
    X.mc('maths', 2, "What do the angles in a triangle add up to?", ["180 degrees", "90 degrees", "360 degrees", "270 degrees"]),
    X.mc('maths', 2, "Roughly what is pi?", ["3.14", "2.71", "1.62", "4.13"]),
    X.mc('maths', 2, "What is the area of a 6 by 4 rectangle?", ["24", "10", "20", "28"])
  ], "Pi, about 3.14, is the circumference of any circle divided by its width.");
  B('maths', 3, "The Unsolved Cupboard", "Prof. Enigma", '#7A8AFF', [
    "Behind the cupboard door, a puzzle waited: 3x + 4 = 19. Take away 4, divide by 3, and the answer is five.",
    "Another shelf held a triangle with sides of 5 and 12. By Pythagoras, the longest side must be 13.",
    "A box of Fibonacci numbers: 1, 1, 2, 3, 5, 8. Each is the sum of the two before. The next is 13.",
    "A jar of dice. The chance of rolling a six is one in six.",
    "And in the very back, the area of a circle of radius 3. It is pi times 3 squared: nine pi."
  ], [
    X.mc('maths', 3, "What is x in 3x + 4 = 19?", ["5", "4", "6", "7"]),
    X.mc('maths', 3, "What comes after 1, 1, 2, 3, 5, 8?", ["13", "11", "12", "16"]),
    X.mc('maths', 3, "A right triangle has short sides 5 and 12. The longest side is...", ["13", "15", "17", "11"])
  ], "In the Fibonacci sequence, each number is the sum of the two before: 1, 1, 2, 3, 5, 8, 13...");

  /* ---- Physics ---- */
  B('phys', 1, "Push and Pull", "Newt Tonne", '#FF6A6A', [
    "A force is a push or a pull. Kick a ball and you give it a push. Drop an apple and gravity gives it a pull.",
    "Heavy things and light things fall at the same speed if there is no air to slow them. A feather and a hammer fell together on the Moon.",
    "Rubbing two surfaces together makes friction. That is why your hands warm up when you rub them.",
    "Light is much faster than sound. In a storm you see the lightning first and hear the thunder later.",
    "A magnet pulls on iron without even touching it. Force can act across a gap."
  ], [
    X.mc('phys', 1, "What pulls an apple to the ground?", ["Gravity", "Friction", "Wind", "Magnetism"]),
    X.mc('phys', 1, "What makes your hands warm when you rub them?", ["Friction", "Gravity", "Light", "Sound"]),
    X.mc('phys', 1, "Which is faster: light or sound?", ["Light", "Sound", "They are equal", "It varies"])
  ], "On the Moon, where there is no air, a feather and a hammer dropped together hit the ground at the same time.");
  B('phys', 2, "The Speed of Everything", "Dr. Velocity", '#FFB84D', [
    "Speed is distance divided by time. A car that goes 100 kilometres in two hours averages 50 kilometres an hour.",
    "Sound travels at about 343 metres a second in air. Light is almost a million times faster.",
    "Newton's second law: force equals mass times acceleration. Push a heavy trolley and it speeds up slowly.",
    "Near the ground, falling things speed up by about 9.8 metres a second every second.",
    "Energy is never made or destroyed. A wind turbine just changes the wind's movement into electricity."
  ], [
    X.mc('phys', 2, "How do you calculate speed?", ["Distance divided by time", "Time divided by distance", "Mass times force", "Force plus mass"]),
    X.mc('phys', 2, "About how fast does sound travel in air?", ["343 metres per second", "34 metres per second", "3,430 metres per second", "300,000 km/s"]),
    X.tf('phys', 2, "Energy can be created from nothing.", false)
  ], "Sound travels at about 343 metres per second in air; light is almost a million times faster.");
  B('phys', 3, "Very Small, Very Fast", "Quark Quantum", '#6BB8E8', [
    "Einstein showed that mass and energy are the same thing in different forms. His equation is E = mc squared.",
    "Light comes in tiny packets called photons. Nothing with mass can go faster than light in a vacuum.",
    "An ambulance siren sounds higher as it comes towards you and lower as it goes away. That is the Doppler effect.",
    "Doubling your speed quadruples your kinetic energy, because it depends on speed squared.",
    "Cool some metals close to absolute zero and they become superconductors: electricity flows without any resistance."
  ], [
    X.mc('phys', 3, "If you double your speed, kinetic energy is multiplied by...", ["4", "2", "8", "It stays the same"]),
    X.mc('phys', 3, "What is a packet of light called?", ["A photon", "An electron", "A proton", "A quark"]),
    X.mc('phys', 3, "Whose famous equation is E = mc squared?", ["Albert Einstein's", "Isaac Newton's", "Marie Curie's", "Niels Bohr's"])
  ], "Doubling your speed quadruples your kinetic energy, because it depends on speed squared.");

  /* ---- Space ---- */
  B('space', 1, "Up and Away", "Rocky Rider", '#7A8AFF', [
    "The Sun is a star, a huge ball of hot gas. Eight planets travel around it.",
    "Mercury is closest to the Sun. Venus comes next and is the hottest. Then Earth, and then rusty red Mars.",
    "Jupiter is the biggest planet of all. More than a thousand Earths would fit inside it.",
    "Saturn has the brightest rings. They are made of countless pieces of ice.",
    "Our Moon travels around the Earth. In 1969 Neil Armstrong was the first person to walk on it."
  ], [
    X.mc('space', 1, "Which is the hottest planet?", ["Venus", "Mercury", "Mars", "Jupiter"]),
    X.mc('space', 1, "Which planet has the brightest rings?", ["Saturn", "Mars", "Earth", "Mercury"]),
    X.mc('space', 1, "Who first walked on the Moon?", ["Neil Armstrong", "Yuri Gagarin", "Buzz Lightyear", "John Glenn"])
  ], "More than a thousand Earths would fit inside Jupiter.");
  B('space', 2, "Neighbours in the Dark", "Orbit Starr", '#B58AE8', [
    "Mars has the tallest volcano in the solar system, Olympus Mons. It is about two and a half times as tall as Everest.",
    "Venus turns so slowly that a single day there lasts longer than its whole year.",
    "Uranus is tipped on its side, so it seems to roll around the Sun instead of spinning upright.",
    "The asteroid belt between Mars and Jupiter holds millions of rocky leftovers from the early solar system.",
    "A comet is a ball of ice and dust. As it nears the Sun the ice melts and streams out as a long tail."
  ], [
    X.mc('space', 2, "Which planet has Olympus Mons?", ["Mars", "Venus", "Earth", "Neptune"]),
    X.mc('space', 2, "Which planet is tipped on its side?", ["Uranus", "Mars", "Earth", "Jupiter"]),
    X.mc('space', 2, "What is a comet mainly made of?", ["Ice and dust", "Iron", "Hot gas", "Water"])
  ], "On Venus, one day lasts longer than one year.");
  B('space', 3, "A Billion Suns", "Stella Nova", '#FFD84D', [
    "The Sun is only one of hundreds of billions of stars in the Milky Way galaxy.",
    "A light-year is the distance that light travels in a year, nearly ten trillion kilometres.",
    "The closest star to the Sun is Proxima Centauri, about 4.2 light-years away.",
    "When a very massive star dies in a supernova, its core may collapse into a neutron star or a black hole.",
    "Distant galaxies are moving away from us, because space itself is expanding. The universe is about 13.8 billion years old."
  ], [
    X.mc('space', 3, "How old is the universe?", ["About 13.8 billion years", "About 4.5 billion years", "About 100 million years", "About 1 trillion years"]),
    X.mc('space', 3, "Which star is closest to the Sun?", ["Proxima Centauri", "Sirius", "Polaris", "Betelgeuse"]),
    X.mc('space', 3, "A light-year is a unit of...", ["Distance", "Time", "Speed", "Brightness"])
  ], "A light-year is nearly ten trillion kilometres, the distance light travels in a year.");

  /* ---- History & Geography ---- */
  B('geo', 1, "Around the World in Ten Pages", "Atlas Wanderer", '#E8D070', [
    "Our world has seven continents. We start in Africa, where the Nile flows north towards the sea.",
    "We cross to Europe. Paris is the capital of France, and London is the capital of the United Kingdom.",
    "In Asia, Tokyo is the capital of Japan, and the Great Wall winds across China.",
    "Down in Australia, kangaroos hop. Australia is both a country and a continent.",
    "In South America the great Amazon rainforest grows, mostly in Brazil. Then home, over the big Atlantic."
  ], [
    X.mc('geo', 1, "What is the capital of France?", ["Paris", "Lyon", "Nice", "Marseille"]),
    X.mc('geo', 1, "In which country is the Great Wall?", ["China", "Japan", "India", "Mongolia"]),
    X.mc('geo', 1, "The Amazon rainforest is mostly in which country?", ["Brazil", "Peru", "Colombia", "Argentina"])
  ], "Australia is the only place that is both a country and a continent.");
  B('geo', 2, "Old Roads", "Marco Walker", '#C9772E', [
    "The Romans built straight roads across their empire, and at its heart stood the great Colosseum.",
    "In 1492 Columbus sailed west across the Atlantic and reached the Americas.",
    "In 1519 Magellan set out with five ships. His expedition became the first to sail all the way round the world.",
    "The Renaissance began in Italy. Painters and thinkers there revived ideas from ancient Greece and Rome.",
    "In Britain in the 1700s, steam engines and factories began the Industrial Revolution."
  ], [
    X.mc('geo', 2, "Where did the Renaissance begin?", ["Italy", "England", "France", "Spain"]),
    X.mc('geo', 2, "Which explorer reached the Americas in 1492?", ["Christopher Columbus", "Ferdinand Magellan", "James Cook", "Marco Polo"]),
    X.mc('geo', 2, "Where did the Industrial Revolution begin?", ["Britain", "Japan", "Russia", "France"])
  ], "Magellan's expedition was the first to sail round the world, though he did not survive the trip himself.");
  B('geo', 3, "The Long Memory", "Chronos Page", '#8A6A44', [
    "The Silk Road joined China with the Mediterranean. Along it travelled silk, spices, paper and ideas.",
    "Genghis Khan united the Mongol tribes and founded the largest land empire in history.",
    "In 1215 King John of England agreed to the Magna Carta, a promise that even the king was under the law.",
    "In 79 AD Vesuvius erupted and buried the Roman town of Pompeii under ash.",
    "In 1989 the Berlin Wall came down, and soon afterwards Germany was united again."
  ], [
    X.mc('geo', 3, "Which Roman town was buried by Vesuvius?", ["Pompeii", "Athens", "Carthage", "Alexandria"]),
    X.mc('geo', 3, "Who founded the Mongol Empire?", ["Genghis Khan", "Attila", "Alexander", "Cleopatra"]),
    X.mc('geo', 3, "In which year did the Berlin Wall come down?", ["1989", "1961", "1975", "2001"])
  ], "Pompeii was buried by ash when Vesuvius erupted in 79 AD, and the ash preserved it for nearly two thousand years.");
})();
