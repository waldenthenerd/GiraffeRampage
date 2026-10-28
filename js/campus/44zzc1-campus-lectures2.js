'use strict';
/* =============================================================================================================================
   44zzc1-campus-lectures2.js  --  LONGNECK UNIVERSITY: more lectures (two more for every faculty, one at tier 2 and one at tier 3, so the
   higher levels have new lectures to hear). Same shape as 44zzc; the ids carry on (l17 and up), and the questions are y_ ids.
   ============================================================================================================================= */
(function(){
  const X = uqFactory(false, true);
  let n = UNI_LECTURES.length;
  const L = function(f, t, title, slides, qs){ n++; const o = { id: 'l' + n, f: f, t: t, title: title, slides: slides.map(function(s){ return { h: s[0], p: s[1], pic: s[2] }; }), q: qs }; UNI_LECTURES.push(o); UNI_LEC_BY_ID[o.id] = o; return o; };

  /* ---- Giraffe Studies ---- */
  L('giraffe', 2, "Necks and Fights", [
    ["Necking", "Male giraffes settle disputes by necking: they swing their necks like clubs and hit each other with their heads. A big male's skull can be heavy and thick.", 'necking'],
    ["Mates and calves", "Males sniff the females to learn who is ready to mate. A mother gives birth to a single calf, almost always standing up.", 'calf'],
    ["Hiding the young", "A newborn calf spends its first weeks lying hidden in the grass while its mother feeds. Its spots help it blend in.", 'spots'],
    ["Learning the tower", "Calves are cared for by many adults. By about a year old they are eating leaves and no longer need milk.", 'savanna']
  ], [
    X.mc('giraffe', 2, "What is it called when male giraffes swing their necks at each other?", ["Necking", "Dancing", "Grazing", "Herding"]),
    X.mc('giraffe', 2, "How does a newborn calf stay safe in its first weeks?", ["It lies hidden in the grass", "It climbs a tree", "It swims", "It digs a hole"]),
    X.mc('giraffe', 2, "How many calves does a giraffe usually have at once?", ["One", "Two", "Four", "Six"]),
    X.mc('giraffe', 2, "At about what age do calves stop needing milk?", ["About one year", "One week", "One month", "Five years"])
  ]);
  L('giraffe', 3, "How Giraffes Survive", [
    ["Little sleep", "In the wild, giraffes sleep only a few hours a day, in short naps of a few minutes. They are most at risk from lions when lying down.", 'savanna'],
    ["Sharing the work", "While some feed, others keep watch. A giraffe sees danger from far away and may warn the others by its posture.", 'savanna'],
    ["A kick to fear", "A giraffe's kick can break a lion's skull. Lions usually target calves, or old and weak giraffes.", 'run'],
    ["Water from leaves", "Giraffes get most of their water from the leaves they eat, so they can go for days without drinking.", 'leaf']
  ], [
    X.mc('giraffe', 3, "How do giraffes get most of their water?", ["From the leaves they eat", "From the dew only", "From cactus", "From rivers each hour"]),
    X.mc('giraffe', 3, "Which giraffes do lions usually target?", ["Calves and weak adults", "The tallest males", "Groups of ten", "None"]),
    X.mc('giraffe', 3, "Why are giraffes most at risk when lying down?", ["They take longer to get up and run", "They are hungry", "They cannot see", "They are cold"]),
    X.tf('giraffe', 3, "Giraffes sleep for many hours in a row.", false)
  ]);

  /* ---- Earth & Weather ---- */
  L('earth', 2, "Rocks and Their Stories", [
    ["Three kinds of rock", "Igneous rock forms from cooled magma or lava. Sedimentary rock forms from layers of settled material. Metamorphic rock is changed by heat and pressure.", 'rocks'],
    ["The rock cycle", "Rocks do not stay the same. Weathering breaks them down, rivers carry the pieces, and over time they are buried and turned into new rock.", 'rocks'],
    ["Fossils", "Fossils are the remains or prints of ancient living things. They are found mostly in sedimentary rock, such as limestone.", 'animals'],
    ["Minerals", "Rocks are made of minerals. The Mohs scale rates a mineral's hardness from 1, talc, to 10, diamond.", 'rocks']
  ], [
    X.mc('earth', 2, "Which kind of rock forms from cooled magma?", ["Igneous", "Sedimentary", "Metamorphic", "Fossil"]),
    X.mc('earth', 2, "Where are fossils mostly found?", ["Sedimentary rock", "Lava", "Diamonds", "Ice only"]),
    X.mc('earth', 2, "What does the Mohs scale rate?", ["Hardness of minerals", "Earthquake size", "Wind speed", "Rock age"]),
    X.mc('earth', 2, "Which mineral is the hardest, at 10 on the Mohs scale?", ["Diamond", "Talc", "Quartz", "Gold"])
  ]);
  L('earth', 3, "Climate and Change", [
    ["Weather and climate", "Weather is what the air is doing today. Climate is the pattern of weather in a place over thirty years or more.", 'atmos'],
    ["The greenhouse effect", "Gases such as carbon dioxide and methane trap heat near the Earth. Without any, the planet would be far too cold for life as we know it.", 'greenhouse'],
    ["Ice cores", "Scientists drill deep into ice sheets. Tiny bubbles of old air in the ice show what the atmosphere was like thousands of years ago.", 'layers'],
    ["Rising seas", "As the planet warms, glaciers melt and ocean water expands. Both make the sea level rise.", 'watercycle']
  ], [
    X.mc('earth', 3, "What is climate?", ["The pattern of weather over many years", "Today's rain", "The wind right now", "A kind of cloud"]),
    X.mc('earth', 3, "What do ice cores show scientists?", ["The old atmosphere, in tiny bubbles", "Where oil is", "The age of the Moon", "Future weather"]),
    X.mc('earth', 3, "Which gases trap heat near the Earth?", ["Carbon dioxide and methane", "Helium and neon", "Argon only", "Hydrogen only"]),
    X.mc('earth', 3, "Besides melting glaciers, what else raises sea level?", ["Warm water expanding", "More fish", "Strong tides", "Cloud cover"])
  ]);

  /* ---- Biology ---- */
  L('bio', 2, "How the Body Works", [
    ["Digestion", "Food is broken down in the mouth and stomach. Most nutrients are absorbed in the small intestine, which is about six meters long.", 'body'],
    ["Breathing", "The lungs take in oxygen and release carbon dioxide. Air travels down the windpipe to tiny sacs called alveoli.", 'body'],
    ["Blood", "The heart pumps blood around the body. Red blood cells carry oxygen, white blood cells fight germs, and platelets help blood clot.", 'heart'],
    ["The brain", "The brain sends and receives messages along nerves. It controls thinking, movement and the beating of the heart.", 'body']
  ], [
    X.mc('bio', 2, "Where are most nutrients absorbed?", ["The small intestine", "The mouth", "The lungs", "The brain"]),
    X.mc('bio', 2, "What are the tiny air sacs in the lungs called?", ["Alveoli", "Villi", "Neurons", "Platelets"]),
    X.mc('bio', 2, "Which blood cells carry oxygen?", ["Red blood cells", "White blood cells", "Platelets", "Nerve cells"]),
    X.mc('bio', 2, "What do platelets do?", ["Help blood clot", "Fight germs", "Carry oxygen", "Make bones"])
  ]);
  L('bio', 3, "Evolution and Adaptation", [
    ["Natural selection", "Individuals with helpful traits survive and have more young. Over many generations those traits become common in the group.", 'dna'],
    ["Darwin's finches", "On the Galapagos Islands, Darwin saw finches whose beaks differed from island to island, each shaped for the food they ate.", 'finches'],
    ["Evidence", "Fossils, shared anatomy and DNA all show that living things are related. Humans share most of their DNA with chimpanzees.", 'dna'],
    ["Fast evolution", "Bacteria reproduce fast, so they can evolve resistance to medicines in just a few years.", 'cell']
  ], [
    X.mc('bio', 3, "What did Darwin notice about the Galapagos finches?", ["Their beaks differed between islands", "They could swim", "They were all the same", "They ate only fish"]),
    X.mc('bio', 3, "What is natural selection?", ["Helpful traits becoming more common", "Choosing a pet", "A kind of farming", "Animals changing color by will"]),
    X.mc('bio', 3, "Why can bacteria evolve resistance so quickly?", ["They reproduce fast", "They are large", "They are clever", "They live long"]),
    X.mc('bio', 3, "Which of these is evidence for evolution?", ["Fossils and DNA", "Only the weather", "Clouds", "Tides"])
  ]);

  /* ---- Chemistry ---- */
  L('chem', 2, "Reactions Everywhere", [
    ["What is a reaction?", "In a chemical reaction, substances called reactants change into new substances called products. Atoms are rearranged, not lost.", 'reaction'],
    ["Signs of a reaction", "Bubbles, a color change, heat or light, and a new solid forming can all show that a reaction has happened.", 'reaction'],
    ["Speeding up", "Heating, crushing a solid into powder, or adding a catalyst makes most reactions go faster.", 'energy'],
    ["Burning", "Burning is a reaction with oxygen. A fire needs three things: fuel, heat and oxygen. Remove one and it goes out.", 'flask']
  ], [
    X.mc('chem', 2, "What are the starting substances in a reaction called?", ["Reactants", "Products", "Catalysts", "Solvents"]),
    X.mc('chem', 2, "Which of these shows a reaction may have happened?", ["Bubbles forming", "Water standing still", "A shadow", "A label"]),
    X.mc('chem', 2, "What three things does a fire need?", ["Fuel, heat and oxygen", "Water, wind and soil", "Wood, smoke and ash", "Light, gas and ice"]),
    X.mc('chem', 2, "What does a catalyst do?", ["Speeds up a reaction", "Stops a reaction", "Makes it colder", "Adds mass"])
  ]);
  L('chem', 3, "Inside the Atom", [
    ["Protons, neutrons, electrons", "The nucleus holds protons, which are positive, and neutrons, which have no charge. Electrons, which are negative, move around the outside.", 'atom'],
    ["Shells", "Electrons sit in shells. The first holds up to two, the second up to eight. Atoms with full outer shells, like neon, are very unreactive.", 'atom'],
    ["Isotopes", "Atoms of the same element can have different numbers of neutrons. These are called isotopes. Carbon-14 is used to date old objects.", 'periodic'],
    ["Ions", "An atom that loses or gains electrons becomes an ion. Sodium loses one electron to become Na+, while chlorine gains one to become Cl-.", 'bond']
  ], [
    X.mc('chem', 3, "How many electrons does the first shell hold at most?", ["Two", "Eight", "Four", "Eighteen"]),
    X.mc('chem', 3, "What are atoms of the same element with different numbers of neutrons called?", ["Isotopes", "Ions", "Molecules", "Alloys"]),
    X.mc('chem', 3, "What is used to date old objects?", ["Carbon-14", "Neon", "Helium", "Chlorine"]),
    X.mc('chem', 3, "What does sodium do to become an ion?", ["Loses an electron", "Gains an electron", "Loses a proton", "Gains a neutron"])
  ]);

  /* ---- Math ---- */
  L('maths', 2, "Fractions, Decimals, Percentages", [
    ["Three names, one number", "Half can be written as 1/2, 0.5 or 50 percent. A fraction, a decimal and a percentage are different ways to write the same amount.", 'fractions'],
    ["Fractions to decimals", "To turn a fraction into a decimal, divide the top by the bottom. So 3/4 is 3 divided by 4, which is 0.75.", 'fractions'],
    ["Percent of a number", "To find 10 percent, divide by 10. For 20 percent, find 10 percent and double it. So 20 percent of 70 is 14.", 'percent'],
    ["Adding fractions", "To add fractions, first give them the same bottom number. 1/2 plus 1/4 is 2/4 plus 1/4, which makes 3/4.", 'fractions']
  ], [
    X.mc('maths', 2, "What is 1/2 as a percentage?", ["50 percent", "25 percent", "20 percent", "12 percent"]),
    X.mc('maths', 2, "How do you turn a fraction into a decimal?", ["Divide the top by the bottom", "Add top and bottom", "Multiply by ten", "Subtract"]),
    X.mc('maths', 2, "What is 20 percent of 70?", ["14", "7", "20", "35"]),
    X.mc('maths', 2, "What is 1/2 plus 1/4?", ["3/4", "2/6", "1/6", "1"])
  ]);
  L('maths', 3, "Algebra and Equations", [
    ["Letters for numbers", "In algebra a letter such as x stands for an unknown number. The equation x + 4 = 9 asks which number plus four makes nine.", 'equation'],
    ["Keeping it balanced", "An equation is a balance. Whatever you do to one side you must do to the other. To solve 2x = 10, divide both sides by 2 to get x = 5.", 'equation'],
    ["Two steps", "To solve 3x + 2 = 14, subtract 2 from both sides to get 3x = 12, then divide both sides by 3 to get x = 4.", 'equation'],
    ["Lines on a graph", "The equation y = 2x + 1 draws a straight line. The 2 is the slope, how steep the line is, and the 1 is where it crosses the vertical axis.", 'graph']
  ], [
    X.mc('maths', 3, "Solve x + 4 = 9. What is x?", ["5", "4", "13", "9"]),
    X.mc('maths', 3, "Solve 3x + 2 = 14. What is x?", ["4", "12", "5", "3"]),
    X.mc('maths', 3, "In y = 2x + 1, what is the slope?", ["2", "1", "3", "0"]),
    X.mc('maths', 3, "What must you do to both sides of an equation?", ["The same thing", "Nothing", "Add ten", "Different things"])
  ]);

  /* ---- Physics ---- */
  L('phys', 2, "Electricity and Circuits", [
    ["A circuit", "Electric current flows around a complete loop called a circuit. If there is a gap anywhere, the current stops, which is how a switch works.", 'circuit'],
    ["Voltage, current, resistance", "Voltage is the push, measured in volts. Current is the flow, measured in amperes. Resistance, measured in ohms, is how hard it is to flow.", 'circuit'],
    ["Series and parallel", "In a series circuit there is one path, so if one bulb breaks they all go out. In a parallel circuit each bulb has its own path.", 'circuit'],
    ["Conductors", "Metals conduct electricity well. Rubber, plastic and dry wood are insulators and do not.", 'atom']
  ], [
    X.mc('phys', 2, "What do we call a complete loop that current flows around?", ["A circuit", "A magnet", "A wave", "A lever"]),
    X.mc('phys', 2, "What is resistance measured in?", ["Ohms", "Volts", "Amperes", "Watts"]),
    X.mc('phys', 2, "What happens in a series circuit if one bulb breaks?", ["All the bulbs go out", "Only that one goes out", "They get brighter", "Nothing"]),
    X.mc('phys', 2, "Which of these is an insulator?", ["Rubber", "Copper", "Iron", "Silver"])
  ]);
  L('phys', 3, "Waves and Light", [
    ["Wave basics", "A wave carries energy without carrying matter. Its wavelength is the distance between peaks, and its frequency is how many peaks pass each second.", 'waves'],
    ["The spectrum", "Light is part of the electromagnetic spectrum, from radio waves, through visible light, to X-rays and gamma rays. All travel at the speed of light in a vacuum.", 'light'],
    ["Reflection and refraction", "A mirror reflects light. Glass and water refract it, which means the light bends as it changes speed.", 'light'],
    ["Why the sky is blue", "Air scatters short blue wavelengths of sunlight more than red ones, so blue light reaches our eyes from all over the sky.", 'atmos']
  ], [
    X.mc('phys', 3, "What is a wave's frequency?", ["How many peaks pass each second", "How tall it is", "How wide it is", "How heavy it is"]),
    X.mc('phys', 3, "What does refraction mean?", ["Light bends as it changes speed", "Light bounces off", "Light disappears", "Light speeds up in a vacuum"]),
    X.mc('phys', 3, "Why is the sky blue?", ["Air scatters blue light more", "It reflects the sea", "The Sun is blue", "Clouds are blue"]),
    X.mc('phys', 3, "Which has the highest energy?", ["Gamma rays", "Radio waves", "Visible light", "Microwaves"])
  ]);

  /* ---- Space ---- */
  L('space', 2, "Stars: Birth to Death", [
    ["A star is born", "Stars form inside nebulae, huge clouds of gas and dust. Gravity pulls the gas together until it is hot enough for fusion to start.", 'lifecycle'],
    ["A long, steady life", "A star like our Sun fuses hydrogen into helium for billions of years. The Sun is about halfway through a life of ten billion years.", 'solar'],
    ["Red giants", "When the hydrogen runs low, a Sun-like star swells into a red giant. Later it sheds its outer layers and shrinks to a white dwarf.", 'lifecycle'],
    ["Big stars end with a bang", "A very massive star ends as a supernova, a huge explosion. What is left may be a neutron star or a black hole.", 'blackhole']
  ], [
    X.mc('space', 2, "Where are stars born?", ["Nebulae", "Comets", "Black holes", "Moons"]),
    X.mc('space', 2, "What does the Sun fuse in its core?", ["Hydrogen into helium", "Oxygen into carbon", "Iron into gold", "Helium into hydrogen"]),
    X.mc('space', 2, "What does a Sun-like star shrink to at the end?", ["A white dwarf", "A supernova", "A pulsar", "A comet"]),
    X.mc('space', 2, "What is a supernova?", ["An exploding massive star", "A new planet", "A shooting star", "A moon"])
  ]);
  L('space', 3, "Exploring the Solar System", [
    ["First steps", "Sputnik 1 was the first artificial satellite in 1957. Yuri Gagarin became the first human in space in 1961.", 'rocket'],
    ["The Moon", "Apollo 11 landed the first people on the Moon in 1969. Twelve people have walked there in all.", 'moon'],
    ["Robot explorers", "Voyager 1 and 2 were launched in 1977. Voyager 1 is now in interstellar space, farther from Earth than any other human-made object.", 'solar'],
    ["Rovers on Mars", "Rovers such as Curiosity and Perseverance drive across Mars studying rocks and looking for signs of ancient life.", 'planets']
  ], [
    X.mc('space', 3, "What was the first artificial satellite?", ["Sputnik 1", "Apollo 11", "Voyager 1", "Hubble"]),
    X.mc('space', 3, "Who was the first human in space?", ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "John Glenn"]),
    X.mc('space', 3, "Which spacecraft is now in interstellar space?", ["Voyager 1", "Apollo 11", "Sputnik", "Curiosity"]),
    X.mc('space', 3, "What do Mars rovers look for?", ["Signs of ancient life", "Cities", "Oceans of lava", "Rings"])
  ]);

  /* ---- History & Geography ---- */
  L('geo', 2, "Ancient Egypt", [
    ["Gift of the Nile", "Egypt's farmland lay along the Nile. Every year the river flooded and left rich black soil, so farmers could grow crops in the desert.", 'egypt'],
    ["Pharaohs and pyramids", "Pharaohs ruled Egypt and were seen as gods on Earth. The Great Pyramid of Giza was built for the pharaoh Khufu about 4,500 years ago.", 'egypt'],
    ["Hieroglyphs", "The Egyptians wrote in pictures called hieroglyphs. The Rosetta Stone, found in 1799, helped scholars read them again.", 'egypt'],
    ["Mummies", "The Egyptians preserved their dead as mummies, because they believed the body was needed in the afterlife.", 'pyramids']
  ], [
    X.mc('geo', 2, "Which river gave life to ancient Egypt?", ["The Nile", "The Amazon", "The Thames", "The Danube"]),
    X.mc('geo', 2, "What did the Rosetta Stone help people do?", ["Read hieroglyphs", "Find gold", "Build pyramids", "Cross the desert"]),
    X.mc('geo', 2, "For which pharaoh was the Great Pyramid built?", ["Khufu", "Cleopatra", "Tutankhamun", "Ramses"]),
    X.mc('geo', 2, "What are the preserved bodies of the Egyptians called?", ["Mummies", "Statues", "Scrolls", "Idols"])
  ]);
  L('geo', 3, "The Age of Exploration", [
    ["Why explore?", "In the 1400s Europeans wanted a sea route to Asia for spices and silk. Better ships and the compass made long voyages possible.", 'ship'],
    ["Columbus", "In 1492 Christopher Columbus sailed west for Spain, hoping to reach Asia. He landed in the Caribbean, which was new to Europeans.", 'explorer'],
    ["Around the world", "Ferdinand Magellan led the first voyage to sail around the world, starting in 1519. He died on the way, but one of his ships returned in 1522.", 'explorer'],
    ["A changed world", "The voyages connected the continents. Foods such as potatoes, tomatoes and corn reached Europe, but contact also brought disease and conquest.", 'map']
  ], [
    X.mc('geo', 3, "What did Europeans want a sea route to?", ["Asia, for spices and silk", "Antarctica", "The Moon", "Australia"]),
    X.mc('geo', 3, "In which year did Columbus sail west for Spain?", ["1492", "1066", "1776", "1815"]),
    X.mc('geo', 3, "Whose expedition first sailed around the world?", ["Magellan's", "Columbus's", "Cook's", "Drake's"]),
    X.mc('geo', 3, "Which food reached Europe from the Americas?", ["Potatoes", "Rice", "Wheat", "Oranges"])
  ]);
})();
