'use strict';
/* =============================================================================================================================
   44zza-campus-questions.js  --  LONGNECK UNIVERSITY: the question bank, part 1 (Giraffe Studies, Earth & Weather, Biology, Chemistry).
   Part 2 (Math, Physics, Space, History & Geography) is 44zzb, parts 3 to 6 (more of every faculty) are 44zzb1 to 44zzb4; the lectures and books are 44zzc.

   Every question has a faculty (f), a tier (t: 1 easy, 2 medium, 3 hard; it follows the faculty level, see uniTier), a type and an id.
   Types and what they hold:
     mc     q, o (the options: THE FIRST ONE IS RIGHT; the study screen shuffles them)
     tf     q, a (true or false)
     ord    q, o (the items, in the right order; shown shuffled)
     match  q, p (pairs [left, right]; the right-hand sides are shown shuffled)
     est    q, v (the answer), tol (how close counts as right), unit, min, max (the slider)
   e is the short explanation shown after an answer. Questions in the main bank (UNI_Q) are used by homework and exams; the ones inside
   a lecture or a book are only for that lecture or book (see 44zzc).
   ============================================================================================================================= */
const UNI_Q = [], UNI_Q_BY_ID = {}, UQ_N = {}, UQ_NY = {};                      /* UQ_N counts the main bank per faculty, shared by every part, so a part added later carries on the ids (q_geo41...) */
function uqFactory(register, later){                             /* later: a lecture or book part added after the first (ids y_giraffe1...), so the older x_ ids stay as they were */
  const n = register ? UQ_N : later ? UQ_NY : {};
  const add = function(o){ n[o.f] = (n[o.f] | 0) + 1; o.id = (register ? 'q_' : later ? 'y_' : 'x_') + o.f + n[o.f]; if (register){ UNI_Q.push(o); UNI_Q_BY_ID[o.id] = o; } return o; };
  return {
    mc: function(f, t, q, o, e){ return add({ f: f, t: t, type: 'mc', q: q, o: o, e: e || '' }); },
    tf: function(f, t, q, a, e){ return add({ f: f, t: t, type: 'tf', q: q, a: !!a, e: e || '' }); },
    ord: function(f, t, q, o, e){ return add({ f: f, t: t, type: 'ord', q: q, o: o, e: e || '' }); },
    match: function(f, t, q, p, e){ return add({ f: f, t: t, type: 'match', q: q, p: p, e: e || '' }); },
    est: function(f, t, q, v, tol, unit, min, max, e){ return add({ f: f, t: t, type: 'est', q: q, v: v, tol: tol, unit: unit, min: min, max: max, e: e || '' }); }
  };
}
(function(){
  const Q = uqFactory(true);
  /* ---------------------------------------------- GIRAFFE STUDIES ---------------------------------------------- */
  Q.mc('giraffe', 1, "Which animal is the tallest on land?", ["The giraffe", "The elephant", "The ostrich", "The camel"], "A male giraffe can stand about 5.5 meters tall.");
  Q.mc('giraffe', 1, "What do giraffes mostly eat?", ["Leaves, especially acacia", "Fish", "Meat", "Seeds only"], "They browse treetops with their long tongues.");
  Q.tf('giraffe', 1, "A giraffe has far more neck bones than a human.", false, "Both have seven neck bones. A giraffe's are just enormously long.");
  Q.mc('giraffe', 1, "How many bones are in a giraffe's neck?", ["Seven", "Five", "Twelve", "Twenty"], "Seven, the same as nearly every mammal.");
  Q.mc('giraffe', 1, "What is a baby giraffe called?", ["A calf", "A cub", "A pup", "A kid"], "Baby giraffes are calves.");
  Q.mc('giraffe', 1, "On which continent do wild giraffes live?", ["Africa", "Asia", "South America", "Australia"], "Wild giraffes live in the savannas and woodlands of Africa.");
  Q.mc('giraffe', 1, "About how long is a giraffe's tongue?", ["About 45 centimeters", "About 10 centimeters", "About 20 centimeters", "About 2 meters"], "It is long, dark and tough enough to handle thorns.");
  Q.tf('giraffe', 1, "Every giraffe has exactly the same pattern of spots.", false, "Spot patterns are as individual as fingerprints.");
  Q.mc('giraffe', 1, "What color is a giraffe's tongue?", ["Dark purple or blue-black", "Pink", "Bright yellow", "Green"], "The dark color is thought to protect it from sunburn.");
  Q.mc('giraffe', 1, "The two bumps on top of a giraffe's head are called what?", ["Ossicones", "Antlers", "Tusks", "Whiskers"], "Ossicones are made of bone-like cartilage covered in skin.");
  Q.mc('giraffe', 1, "About how much does a giraffe sleep in a day?", ["Under five hours, in short naps", "Twelve hours", "Sixteen hours", "Twenty hours"], "Giraffes sleep very little and often doze standing up.");
  Q.mc('giraffe', 1, "What is a group of giraffes called?", ["A tower", "A swarm", "A pod", "A pack"], "A group of giraffes is called a tower (or sometimes a journey).");
  Q.mc('giraffe', 1, "About how tall can an adult giraffe grow?", ["About 5.5 meters", "About 2 meters", "About 3 meters", "About 9 meters"], "The tallest males reach about 5.5 meters, as high as a two-story house.");
  Q.mc('giraffe', 1, "What is a giraffe's best defense against a lion?", ["A powerful kick", "Hiding in a burrow", "Swimming away", "Roaring"], "A giraffe's kick can seriously injure a lion.");
  Q.tf('giraffe', 1, "Giraffes chew the cud, like cows do.", true, "Giraffes are ruminants and bring food back up to chew again.");
  Q.mc('giraffe', 1, "Why is a giraffe's long neck useful?", ["It reaches leaves that other animals cannot", "It helps it swim", "It lets it dig", "It keeps it warm"], "Browsing high leaves means less competition for food.");

  Q.mc('giraffe', 2, "To drink at a waterhole, a giraffe usually has to do what?", ["Splay its front legs or bend its knees", "Lie down completely", "Use its tail as a straw", "Wait for rain"], "Its legs are so long that it must spread or bend them to reach the water.");
  Q.mc('giraffe', 2, "About how much does a giraffe's heart weigh?", ["About 11 kilograms", "About 1 kilogram", "About 50 kilograms", "About 100 grams"], "It has to push blood a very long way up to the brain.");
  Q.mc('giraffe', 2, "How does a giraffe's blood pressure compare with a human's?", ["About twice as high", "Lower", "The same", "Ten times higher"], "High pressure is needed to lift blood up a neck that long.");
  Q.tf('giraffe', 2, "Male giraffes sometimes fight by swinging their necks, called necking.", true, "Rivals swing their necks and ossicones at each other.");
  Q.mc('giraffe', 2, "About how long is a giraffe's pregnancy?", ["About 15 months", "About 5 months", "About 9 months", "About 24 months"], "A mother carries her calf for around fifteen months.");
  Q.mc('giraffe', 2, "About how tall is a newborn giraffe?", ["About 1.8 meters", "About 50 centimeters", "About 1 meter", "About 3 meters"], "A calf is already taller than most adult humans at birth.");
  Q.mc('giraffe', 2, "Which animal is the giraffe's closest living relative?", ["The okapi", "The zebra", "The antelope", "The horse"], "Okapis and giraffes are the only living members of their family.");
  Q.tf('giraffe', 2, "The okapi has striped legs like a zebra.", true, "Its legs are striped, but it is a forest relative of the giraffe, not a horse.");
  Q.mc('giraffe', 2, "What are a giraffe's ossicones made of?", ["Bone-like cartilage covered in skin", "Keratin, like a rhino's horn", "Solid ivory", "Hardened hair"], "Antlers and horns are different; ossicones stay covered in skin.");
  Q.mc('giraffe', 2, "About how fast can a giraffe run in short bursts?", ["About 60 km/h", "About 10 km/h", "About 30 km/h", "About 100 km/h"], "Despite those legs, giraffes are surprisingly fast.");
  Q.ord('giraffe', 2, "Put these in order, shortest to tallest (adult standing height).", ["Zebra", "Human", "Elephant", "Giraffe"], "A zebra is about 1.3 m, a human 1.7 m, an elephant 3 m at the shoulder and a giraffe up to 5.5 m.");
  Q.match('giraffe', 2, "Match each young animal to its name.", [["Giraffe", "Calf"], ["Lion", "Cub"], ["Zebra", "Foal"], ["Ostrich", "Chick"]], "Different animals have different names for their babies.");
  Q.est('giraffe', 2, "About how long is a giraffe's tongue, in centimeters?", 45, 12, "cm", 10, 100, "Around 45 cm: long enough to wrap around a branch and strip it.");
  Q.mc('giraffe', 2, "About how long does a wild giraffe live?", ["About 25 years", "About 5 years", "About 60 years", "About 100 years"], "Giraffes in the wild live about 25 years; in zoos a little longer.");

  Q.mc('giraffe', 3, "What is the giraffe's genus name?", ["Giraffa", "Okapia", "Camelus", "Equus"], "Giraffa is the genus, from the Arabic word for the animal.");
  Q.tf('giraffe', 3, "A nerve to a giraffe's voice box runs down the neck, loops round a blood vessel near the heart, and comes back up.", true, "That recurrent laryngeal nerve makes a famously long detour in giraffes.");
  Q.tf('giraffe', 3, "Valves and a network of fine vessels in a giraffe's neck help control blood flow when it lowers its head to drink.", true, "They stop the rush of blood to the brain.");
  Q.mc('giraffe', 3, "Giraffes and okapis belong to which family?", ["Giraffidae", "Bovidae", "Cervidae", "Equidae"], "Giraffidae is a small family with only two living genera.");
  Q.mc('giraffe', 3, "Which extinct animal was a short-necked relative of the giraffe?", ["Palaeotragus", "Smilodon", "The mammoth", "The dodo"], "Palaeotragus looked a bit like a giraffe-okapi blend.");
  Q.mc('giraffe', 3, "The word giraffe comes from which language?", ["Arabic", "Latin", "Greek", "Swahili"], "It comes from the Arabic zarafa.");
  Q.mc('giraffe', 3, "Giraffe groups keep changing their members. What is this kind of social system called?", ["Fission-fusion", "A hive", "A pyramid", "A colony"], "Giraffes join and leave groups often, unlike the fixed herds of other animals.");
  Q.est('giraffe', 3, "About how fast can a giraffe sprint? (km/h)", 56, 14, "km/h", 10, 120, "Close to 55-60 km/h for short bursts.");
  Q.mc('giraffe', 3, "What is the biggest threat to wild giraffes today?", ["Habitat loss and poaching", "Too much rain", "Lack of leaves in zoos", "Competition from camels"], "Their savanna homes are shrinking and they are hunted illegally.");
  Q.mc('giraffe', 3, "About how long is one neck bone of a giraffe?", ["About 28 centimeters", "About 3 centimeters", "About 80 centimeters", "About 1 meter"], "Seven bones, each about as long as a school ruler.");

  /* ---------------------------------------------- EARTH & WEATHER ---------------------------------------------- */
  Q.mc('earth', 1, "What do we call frozen rain that falls as hard balls of ice?", ["Hail", "Fog", "Dew", "Mist"], "Hail forms inside tall thunderclouds.");
  Q.mc('earth', 1, "Which layer of the atmosphere do we live in?", ["The troposphere", "The stratosphere", "The thermosphere", "The exosphere"], "It is the lowest layer, where weather happens.");
  Q.mc('earth', 1, "What makes the sound of thunder?", ["Lightning heating the air so it expands suddenly", "Clouds bumping together", "Wind in tunnels", "Rain falling hard"], "The air is heated so fast it booms.");
  Q.mc('earth', 1, "Which is the largest ocean?", ["The Pacific", "The Atlantic", "The Indian", "The Arctic"], "The Pacific covers about a third of the planet.");
  Q.mc('earth', 1, "How many continents are there?", ["Seven", "Five", "Six", "Nine"], "Africa, Antarctica, Asia, Australia, Europe, North America and South America.");
  Q.tf('earth', 1, "The Sun rises in the east.", true, "The Earth spins eastward, so the Sun appears to rise in the east.");
  Q.mc('earth', 1, "What is the Earth's thin outer layer called?", ["The crust", "The core", "The mantle", "The shell"], "We live on the crust.");
  Q.mc('earth', 1, "A rainbow appears when sunlight passes through what?", ["Water droplets", "Dust", "Clouds of ice", "Smoke"], "Droplets split the light into its colors.");
  Q.mc('earth', 1, "What is hot liquid rock called when it erupts from a volcano?", ["Lava", "Magma", "Ash", "Pumice"], "Underground it is called magma; on the surface it is lava.");
  Q.mc('earth', 1, "Which continent is the coldest?", ["Antarctica", "Asia", "Europe", "North America"], "Antarctica is the coldest, driest and windiest continent.");
  Q.tf('earth', 1, "A bolt of lightning is hotter than the surface of the Sun.", true, "Lightning can heat the air to around 30,000 degrees Celsius.");
  Q.mc('earth', 1, "In the water cycle, what is it called when vapor turns into droplets?", ["Condensation", "Evaporation", "Erosion", "Freezing"], "Condensation makes clouds.");
  Q.mc('earth', 1, "What is the longest river in Africa?", ["The Nile", "The Congo", "The Niger", "The Zambezi"], "The Nile flows north to the Mediterranean.");
  Q.mc('earth', 1, "Which instrument measures air pressure?", ["A barometer", "A thermometer", "An anemometer", "A compass"], "Falling pressure often means rain is coming.");
  Q.mc('earth', 1, "What do we call a spinning column of air touching the ground?", ["A tornado", "A drizzle", "A breeze", "A frost"], "Tornadoes can be very destructive.");
  Q.mc('earth', 1, "Which gas makes up most of Earth's air?", ["Nitrogen", "Oxygen", "Carbon dioxide", "Hydrogen"], "About 78 percent of air is nitrogen.");

  Q.mc('earth', 2, "What mainly causes earthquakes?", ["Shifting plates of the Earth's crust", "Thunderstorms", "The Moon's pull only", "Underground rivers"], "Plates slip and grind past each other.");
  Q.mc('earth', 2, "What layer lies directly below the Earth's crust?", ["The mantle", "The outer core", "The inner core", "The lithosphere"], "The mantle is hot, thick rock.");
  Q.mc('earth', 2, "Hurricanes are rated on which scale?", ["Saffir-Simpson", "Richter", "Beaufort", "Kelvin"], "Category 1 to 5 by wind speed.");
  Q.mc('earth', 2, "A monsoon is a seasonal change in what?", ["Wind direction, bringing heavy rain", "Ocean depth", "Temperature of the core", "The number of stars"], "Monsoon winds bring the rainy season.");
  Q.mc('earth', 2, "Which warm ocean current helps keep Western Europe mild?", ["The Gulf Stream", "The Humboldt Current", "The Labrador Current", "The Agulhas Current"], "It carries warm water across the Atlantic.");
  Q.ord('earth', 2, "Put the atmosphere's layers in order, from the ground up.", ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"], "Each layer sits above the last.");
  Q.match('earth', 2, "Match each cloud to what it looks like.", [["Cumulus", "Puffy and white"], ["Cirrus", "Thin and wispy, very high"], ["Stratus", "A flat gray blanket"], ["Cumulonimbus", "A towering storm cloud"]], "The names describe the shapes.");
  Q.mc('earth', 2, "What was the name of the great supercontinent that existed about 300 million years ago?", ["Pangaea", "Gondwana only", "Atlantis", "Laurasia only"], "Pangaea later broke apart into today's continents.");
  Q.tf('earth', 2, "Greenhouse gases trap heat in the atmosphere.", true, "That trapping keeps the planet warm, and too much of it warms it too much.");
  Q.mc('earth', 2, "Rock that forms from cooled magma is called what?", ["Igneous", "Sedimentary", "Metamorphic", "Fossil"], "Granite and basalt are igneous.");
  Q.est('earth', 2, "About what percentage of Earth's surface is covered by water?", 71, 8, "%", 0, 100, "About seven tenths of the planet is ocean.");
  Q.mc('earth', 2, "Which imaginary line divides the Earth into northern and southern halves?", ["The equator", "The prime meridian", "The Tropic of Cancer", "The date line"], "The equator is at zero degrees latitude.");
  Q.mc('earth', 2, "What is the largest hot desert in the world?", ["The Sahara", "The Gobi", "The Kalahari", "The Arabian"], "The Sahara is roughly the size of the United States.");
  Q.mc('earth', 2, "The point on the surface directly above an earthquake's origin is the...", ["Epicentre", "Fault line", "Crater", "Core"], "The epicentre is where the shaking is usually strongest.");

  Q.mc('earth', 3, "In the northern hemisphere, the Coriolis effect bends moving air and water which way?", ["To the right", "To the left", "Straight down", "It does not bend them"], "It comes from the Earth's rotation.");
  Q.mc('earth', 3, "El Nino is an unusual warming of the surface water in which ocean?", ["The Pacific", "The Atlantic", "The Indian", "The Southern"], "It changes weather around the world.");
  Q.mc('earth', 3, "In which layer of the atmosphere is the ozone layer?", ["The stratosphere", "The troposphere", "The mesosphere", "The exosphere"], "It absorbs much of the Sun's harmful ultraviolet light.");
  Q.mc('earth', 3, "The Mohs scale measures what?", ["The hardness of minerals", "Earthquake strength", "Wind speed", "Rainfall"], "Talc is 1 and diamond is 10.");
  Q.mc('earth', 3, "What is the deepest known point in the world's oceans?", ["The Challenger Deep", "The Puerto Rico Trench", "The Java Trench", "The Mid-Atlantic Ridge"], "It is in the Mariana Trench, nearly 11 kilometers down.");
  Q.tf('earth', 3, "Earth's inner core is solid even though it is extremely hot.", true, "The enormous pressure keeps it solid.");
  Q.mc('earth', 3, "What does the Beaufort scale measure?", ["Wind force", "Rainfall", "Temperature", "Humidity"], "It runs from 0 (calm) to 12 (hurricane force).");
  Q.mc('earth', 3, "Roughly what temperature is absolute zero?", ["About minus 273 degrees Celsius", "Minus 100 degrees Celsius", "Zero degrees Celsius", "Minus 459 degrees Celsius"], "It is 0 kelvin, the coldest anything can be.");
  Q.mc('earth', 3, "What causes the seasons?", ["The tilt of the Earth's axis", "The Earth being closer to the Sun in summer", "The Moon's phases", "Clouds blocking the Sun"], "Tilt changes how directly sunlight hits each half of the Earth.");
  Q.est('earth', 3, "About how old is the Earth, in billions of years?", 4.5, 0.9, "billion years", 0, 14, "Around 4.5 billion years.");

  /* ---------------------------------------------- BIOLOGY ---------------------------------------------- */
  Q.mc('bio', 1, "What process do plants use to make food from sunlight?", ["Photosynthesis", "Digestion", "Respiration", "Fermentation"], "They turn light, water and carbon dioxide into sugar.");
  Q.mc('bio', 1, "Which part of a plant mainly takes in water from the soil?", ["The roots", "The leaves", "The petals", "The seeds"], "Roots anchor the plant and soak up water.");
  Q.mc('bio', 1, "Which gas do plants release when they make food?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"], "Oxygen is a by-product of photosynthesis.");
  Q.mc('bio', 1, "Animals that feed their babies milk are called what?", ["Mammals", "Reptiles", "Amphibians", "Insects"], "Humans, giraffes and whales are all mammals.");
  Q.mc('bio', 1, "What does the heart do?", ["Pumps blood around the body", "Digests food", "Filters air", "Stores memories"], "It beats about 100,000 times a day in a human.");
  Q.mc('bio', 1, "How many legs does an insect have?", ["Six", "Four", "Eight", "Ten"], "All insects have six legs.");
  Q.tf('bio', 1, "Spiders are insects.", false, "Spiders have eight legs and belong to the arachnids.");
  Q.mc('bio', 1, "Which of these is a reptile?", ["A crocodile", "A frog", "A shark", "A dolphin"], "Reptiles have scaly skin and lay eggs on land.");
  Q.mc('bio', 1, "What do bees collect from flowers?", ["Nectar and pollen", "Seeds", "Water only", "Leaves"], "They turn nectar into honey.");
  Q.mc('bio', 1, "What does a frog start life as?", ["A tadpole", "A caterpillar", "A larva grub", "A chick"], "Tadpoles live in water and grow legs.");
  Q.mc('bio', 1, "What is the largest animal that has ever lived?", ["The blue whale", "The African elephant", "Tyrannosaurus rex", "The giraffe"], "A blue whale can be 30 meters long.");
  Q.mc('bio', 1, "What do herbivores eat?", ["Plants", "Meat", "Both plants and meat", "Insects only"], "Giraffes are herbivores.");
  Q.tf('bio', 1, "Bats are birds.", false, "Bats are the only mammals that can truly fly.");
  Q.mc('bio', 1, "Which organs do we use to breathe?", ["Lungs", "Kidneys", "Liver", "Stomach"], "Lungs take oxygen from the air into the blood.");
  Q.mc('bio', 1, "A caterpillar turns into a butterfly inside what?", ["A chrysalis", "An egg", "A nest", "A burrow"], "The chrysalis is the pupa stage.");
  Q.mc('bio', 1, "What carries blood around the body?", ["Blood vessels", "Bones", "Muscles", "Nerves"], "Arteries, veins and tiny capillaries.");

  Q.mc('bio', 2, "Which part of a cell is called its powerhouse?", ["The mitochondrion", "The nucleus", "The membrane", "The vacuole"], "Mitochondria release energy from food.");
  Q.mc('bio', 2, "What does DNA stand for?", ["Deoxyribonucleic acid", "Dinitrogen acid", "Dual nuclear acid", "Dense natural alkali"], "It carries the instructions for building living things.");
  Q.mc('bio', 2, "What is the basic unit of all living things?", ["The cell", "The atom", "The organ", "The gene"], "Every living thing is made of one or more cells.");
  Q.mc('bio', 2, "Which blood cells help fight infection?", ["White blood cells", "Red blood cells", "Platelets", "Plasma"], "They hunt germs.");
  Q.mc('bio', 2, "A food chain usually begins with what?", ["A plant (a producer)", "A predator", "A decomposer", "The Sun's heat"], "Plants make their own food, so everything else depends on them.");
  Q.ord('bio', 2, "Put the butterfly's life cycle in order.", ["Egg", "Caterpillar", "Chrysalis", "Adult butterfly"], "This change of body shape is called metamorphosis.");
  Q.match('bio', 2, "Match each animal to its class.", [["Salamander", "Amphibian"], ["Eagle", "Bird"], ["Trout", "Fish"], ["Python", "Reptile"]], "Each class shares key features.");
  Q.mc('bio', 2, "Which blood type is the universal donor for red blood cells?", ["O negative", "AB positive", "A positive", "B positive"], "O negative can be given to almost anyone.");
  Q.tf('bio', 2, "Humans normally have 46 chromosomes.", true, "That is 23 pairs.");
  Q.mc('bio', 2, "What does chlorophyll do?", ["Absorbs light for photosynthesis", "Carries water", "Makes seeds", "Stores minerals"], "It is also what makes leaves green.");
  Q.est('bio', 2, "How many bones does an adult human have?", 206, 25, "bones", 100, 400, "An adult has 206; babies have more because some fuse as they grow.");
  Q.mc('bio', 2, "An animal that eats both plants and meat is called what?", ["An omnivore", "A herbivore", "A carnivore", "A scavenger"], "Humans and bears are omnivores.");
  Q.mc('bio', 2, "Photosynthesis takes place mainly in which part of a plant?", ["The leaves", "The roots", "The flowers", "The bark"], "Leaves have lots of chloroplasts.");
  Q.mc('bio', 2, "Which vitamin does the skin make with the help of sunlight?", ["Vitamin D", "Vitamin C", "Vitamin K", "Vitamin B12"], "Vitamin D helps build strong bones.");

  Q.mc('bio', 3, "What are the four letters of the genetic code?", ["A, T, C and G", "A, B, C and D", "X, Y, Z and W", "H, O, N and C"], "Adenine, thymine, cytosine and guanine.");
  Q.mc('bio', 3, "What is the process by which a cell divides into two identical cells?", ["Mitosis", "Meiosis", "Osmosis", "Diffusion"], "Mitosis is how you grow and repair.");
  Q.mc('bio', 3, "Who proposed the theory of evolution by natural selection?", ["Charles Darwin", "Gregor Mendel", "Louis Pasteur", "Isaac Newton"], "Darwin published On the Origin of Species in 1859.");
  Q.tf('bio', 3, "A virus can reproduce on its own, without a host cell.", false, "Viruses need to take over a host cell to copy themselves.");
  Q.mc('bio', 3, "What is the largest organ of the human body?", ["The skin", "The liver", "The brain", "The heart"], "It covers the whole body.");
  Q.mc('bio', 3, "What do ribosomes make?", ["Proteins", "Fats", "Sugars", "Water"], "They read genetic instructions.");
  Q.mc('bio', 3, "Two species that both benefit from living together are in which relationship?", ["Mutualism", "Parasitism", "Predation", "Competition"], "A bee and a flower are a classic example.");
  Q.mc('bio', 3, "Which structure carries genes inside a cell's nucleus?", ["Chromosomes", "Ribosomes", "Vacuoles", "Mitochondria"], "Chromosomes are tightly coiled DNA.");
  Q.est('bio', 3, "How many hearts does an octopus have?", 3, 0.5, "hearts", 1, 10, "Two pump blood to the gills and one to the body.");
  Q.mc('bio', 3, "Which organ makes insulin?", ["The pancreas", "The liver", "The kidney", "The stomach"], "Insulin controls blood sugar.");

  /* ---------------------------------------------- CHEMISTRY ---------------------------------------------- */
  Q.mc('chem', 1, "What is the chemical formula of water?", ["H2O", "CO2", "O2", "NaCl"], "Two hydrogen atoms and one oxygen atom.");
  Q.mc('chem', 1, "What is the chemical symbol for gold?", ["Au", "Ag", "Go", "Gd"], "Au comes from the Latin word aurum.");
  Q.mc('chem', 1, "Which gas do we need to breathe in to live?", ["Oxygen", "Carbon dioxide", "Helium", "Methane"], "Our cells use it to release energy.");
  Q.mc('chem', 1, "What state of matter is ice?", ["A solid", "A liquid", "A gas", "A plasma"], "Particles in ice are locked in place.");
  Q.mc('chem', 1, "What is the chemical name of table salt?", ["Sodium chloride", "Calcium carbonate", "Potassium iodide", "Sodium sulfate"], "NaCl: one sodium and one chlorine.");
  Q.tf('chem', 1, "At sea level, water boils at 100 degrees Celsius.", true, "It boils at a lower temperature on a mountain top.");
  Q.mc('chem', 1, "Which of these is a metal?", ["Iron", "Oxygen", "Sulfur", "Carbon"], "Metals conduct heat and electricity.");
  Q.mc('chem', 1, "Which is the lightest element?", ["Hydrogen", "Helium", "Oxygen", "Carbon"], "Hydrogen has just one proton.");
  Q.mc('chem', 1, "What happens when ice melts?", ["It becomes liquid water", "It becomes a gas", "It becomes heavier", "It disappears"], "Melting is a change of state.");
  Q.mc('chem', 1, "Which gas do we breathe out more of than we breathe in?", ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], "Our bodies make it from food.");
  Q.mc('chem', 1, "What do we call the orange-brown coating that forms on iron in damp air?", ["Rust", "Mold", "Soot", "Tarnish"], "Iron reacts with oxygen and water.");
  Q.mc('chem', 1, "Which gas is used to make balloons float?", ["Helium", "Oxygen", "Carbon dioxide", "Nitrogen"], "It is lighter than air.");
  Q.mc('chem', 1, "When sugar disappears into a cup of tea, what has happened to it?", ["It has dissolved", "It has melted away", "It has burned", "It has evaporated"], "The result is a solution.");
  Q.mc('chem', 1, "What is the chemical symbol for carbon?", ["C", "Ca", "Co", "Cr"], "Carbon is the basis of all living things.");
  Q.tf('chem', 1, "Diamonds and the lead in a pencil are both made of carbon.", true, "The atoms are arranged differently.");
  Q.mc('chem', 1, "What color does blue litmus paper turn in an acid?", ["Red", "Green", "Yellow", "It stays blue"], "Litmus is an indicator.");

  Q.mc('chem', 2, "What is the atomic number of hydrogen?", ["1", "2", "8", "12"], "The atomic number is the number of protons.");
  Q.mc('chem', 2, "What are the noble gases like helium and neon known for?", ["Hardly reacting with anything", "Being very explosive", "Rusting metals", "Being heavy liquids"], "Their outer electron shells are full.");
  Q.mc('chem', 2, "What is the pH of pure water?", ["7", "1", "10", "14"], "7 is neutral.");
  Q.mc('chem', 2, "Which two particles are found in an atom's nucleus?", ["Protons and neutrons", "Electrons and protons", "Electrons and neutrons", "Photons and quarks"], "Electrons orbit around it.");
  Q.mc('chem', 2, "Which element is a liquid at normal room temperature?", ["Mercury", "Iron", "Carbon", "Sodium"], "Bromine is the other one.");
  Q.ord('chem', 2, "Put the states of matter in order as you heat a substance.", ["Solid", "Liquid", "Gas", "Plasma"], "Each needs more energy than the last.");
  Q.match('chem', 2, "Match each symbol to its element.", [["Fe", "Iron"], ["Na", "Sodium"], ["K", "Potassium"], ["Pb", "Lead"]], "Many symbols come from Latin names.");
  Q.mc('chem', 2, "What gas is released when you mix baking soda and vinegar?", ["Carbon dioxide", "Oxygen", "Hydrogen", "Nitrogen"], "That is the fizz.");
  Q.tf('chem', 2, "Acids have a pH lower than 7.", true, "Bases have a pH higher than 7.");
  Q.mc('chem', 2, "Which element is found in all organic (living) compounds?", ["Carbon", "Iron", "Gold", "Neon"], "Carbon can form long chains and rings.");
  Q.est('chem', 2, "About how many elements are on the periodic table?", 118, 8, "elements", 50, 200, "118 have been confirmed.");
  Q.mc('chem', 2, "What electric charge does an electron have?", ["Negative", "Positive", "None", "It changes"], "Protons are positive and neutrons are neutral.");
  Q.mc('chem', 2, "What is the most abundant gas in Earth's atmosphere?", ["Nitrogen", "Oxygen", "Argon", "Carbon dioxide"], "About 78 percent.");
  Q.mc('chem', 2, "What does a catalyst do?", ["Speeds up a reaction without being used up", "Slows a reaction down", "Turns into gas", "Makes a reaction impossible"], "Enzymes are biological catalysts.");

  Q.mc('chem', 3, "Which number is Avogadro's number, about?", ["6 x 10^23", "3 x 10^8", "9.8", "1.6 x 10^-19"], "The number of particles in one mole.");
  Q.mc('chem', 3, "Fluorine, chlorine and bromine belong to which group?", ["The halogens", "The alkali metals", "The noble gases", "The transition metals"], "They are very reactive non-metals.");
  Q.mc('chem', 3, "What generally happens to the rate of a reaction when you raise the temperature?", ["It increases", "It decreases", "It stops", "It stays the same"], "Particles collide harder and more often.");
  Q.mc('chem', 3, "An ionic bond involves what?", ["Transfer of electrons from one atom to another", "Sharing of electrons equally", "Sharing neutrons", "Splitting of nuclei"], "Sodium chloride is the classic ionic compound.");
  Q.tf('chem', 3, "Isotopes of the same element have different numbers of neutrons.", true, "Carbon-12 and carbon-14 are both carbon.");
  Q.mc('chem', 3, "Which is the most electronegative element?", ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"], "Fluorine pulls on electrons harder than any other.");
  Q.mc('chem', 3, "What is the chemical formula of methane?", ["CH4", "C2H6", "CO2", "H2O2"], "It is the main part of natural gas.");
  Q.mc('chem', 3, "Which acid is found in the human stomach?", ["Hydrochloric acid", "Sulfuric acid", "Nitric acid", "Citric acid"], "It helps break down food and kills germs.");
  Q.mc('chem', 3, "In chemistry, oxidation is the loss of what?", ["Electrons", "Protons", "Neutrons", "Heat"], "Remember: OIL RIG, oxidation is loss.");
  Q.mc('chem', 3, "A base is best described as a substance that...", ["Accepts protons or neutralizes acids", "Tastes sour", "Turns litmus red", "Always dissolves metals"], "Bases react with acids to form salts.");
})();
