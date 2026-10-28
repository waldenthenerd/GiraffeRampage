'use strict';
/* =============================================================================================================================
   44zzd1-campus-books2.js  --  LONGNECK UNIVERSITY: more books for the library (two more for every faculty, one at tier 2 and one at tier 3).
   Same shape as 44zzd; the ids carry on (b25 and up), and the questions are y_ ids.
   ============================================================================================================================= */
(function(){
  const X = uqFactory(false, true);
  let n = UNI_BOOKS.length;
  const B = function(f, t, title, author, col, pages, qs, fact){ n++; const o = { id: 'b' + n, f: f, t: t, title: title, author: author, col: col, pages: pages, q: qs, fact: fact }; UNI_BOOKS.push(o); UNI_BOOK_BY_ID[o.id] = o; return o; };

  /* ---- Giraffe Studies ---- */
  B('giraffe', 2, "Spots, Stripes and Secrets", "Dr. Patch Dapple", '#B8863B', [
    "Dr. Dapple spent twenty years studying giraffe coats. Each giraffe, she found, has a pattern all of its own, and a calf's pattern looks a lot like its mother's.",
    "The spots are not just for show. The dark patches sit over a network of blood vessels, and some scientists think they help the giraffe lose extra heat.",
    "In the shade of an acacia the patches break up a giraffe's outline. A calf lying in the grass can be almost invisible.",
    "There are different looks in different places. The reticulated giraffe has sharp lines between large patches. The Masai giraffe has jagged, leaf-shaped patches.",
    "Dr. Dapple's last chapter is about the dark tongue. It is a purple-black color, which probably protects it from sunburn when it is out for hours each day."
  ], [
    X.mc('giraffe', 2, "What do some scientists think the patches help a giraffe lose?", ["Extra heat", "Water", "Weight", "Noise"]),
    X.mc('giraffe', 2, "Which giraffe has jagged, leaf-shaped patches?", ["The Masai giraffe", "The reticulated giraffe", "The okapi", "The zebra"]),
    X.mc('giraffe', 2, "Why is a giraffe's tongue probably dark?", ["To protect it from sunburn", "To hide from lions", "To taste better", "To glow"])
  ], "Every giraffe's pattern is unique, and a calf's pattern is a lot like its mother's.");
  B('giraffe', 3, "A Day on the Savanna", "Zuri Mwangi", '#9C5B2E', [
    "Dawn on the savanna is the best time for a giraffe to eat. The air is cool, and the leaves are fresh and full of water.",
    "By midday the heat builds. The giraffes stand in the shade of tall trees and chew the cud, bringing food back up to chew again.",
    "In the afternoon they walk to find new trees. Giraffes can walk many kilometers in a day, with a slow, swaying pace.",
    "At dusk they gather in loose groups. Some doze on their feet while the others keep watch, and the lookouts change through the night.",
    "A giraffe may lie down for a few minutes only, with its head resting on its rump. Then it is up again, ready to run."
  ], [
    X.mc('giraffe', 3, "When do giraffes chew the cud?", ["In the midday shade", "At dawn only", "At midnight", "Never"]),
    X.mc('giraffe', 3, "How long does a giraffe lie down at a time?", ["A few minutes", "Many hours", "A whole night", "A day"]),
    X.mc('giraffe', 3, "What do some giraffes do at dusk while others rest?", ["Keep watch", "Hunt", "Swim", "Dig"])
  ], "A giraffe lies down for only a few minutes at a time, because it is hardest to escape a lion from the ground.");

  /* ---- Earth & Weather ---- */
  B('earth', 2, "The Day the Mountain Woke", "Pele Marsh", '#C0562A', [
    "Mount Ember had been quiet for three hundred years, so nobody in the village worried when the ground began to tremble.",
    "Deep below, hot liquid rock called magma was rising. When magma reaches the surface it is called lava.",
    "On the morning of the eruption, gas and ash shot up into the sky in a huge cloud. Ash fell like gray snow on the village.",
    "Rivers of lava crept slowly down the slope. They burned everything in their path, but they moved slowly enough for people to get away.",
    "Years later, green plants grew on the cooled lava. Volcanic soil is rich in minerals, and farmers returned to the slopes."
  ], [
    X.mc('earth', 2, "What is magma called when it reaches the surface?", ["Lava", "Ash", "Granite", "Steam"]),
    X.mc('earth', 2, "What fell on the village like gray snow?", ["Ash", "Ice", "Sand", "Rain"]),
    X.mc('earth', 2, "Why did farmers return to the slopes?", ["Volcanic soil is rich in minerals", "The lava was warm", "The ash was sweet", "It was safe"])
  ], "Magma is called lava once it reaches the surface, and volcanic soil is some of the richest farmland.");
  B('earth', 3, "Oceans in Motion", "Capt. Marina Tidewell", '#2B7AA8', [
    "The ocean is never still. Wind pushes the surface into waves, and the Moon's gravity pulls the water into two tides each day.",
    "Deep below, water also moves in great loops called currents. Warm surface water flows from the equator toward the poles, and cold water sinks and flows back.",
    "The Gulf Stream is a warm current in the Atlantic. It carries heat north and keeps parts of western Europe milder than other places at the same latitude.",
    "Every few years in the Pacific, El Nino warms the sea surface. It shifts rain and storms around the world.",
    "The ocean also stores heat and carbon dioxide. Without it, the Earth's climate would swing much more wildly."
  ], [
    X.mc('earth', 3, "What causes the tides?", ["The Moon's gravity", "Fish", "Rivers", "Clouds"]),
    X.mc('earth', 3, "What does the Gulf Stream carry north?", ["Warm water", "Ice", "Sand", "Salt only"]),
    X.mc('earth', 3, "In which ocean does El Nino start?", ["The Pacific", "The Atlantic", "The Arctic", "The Indian"])
  ], "The Gulf Stream carries warm water across the Atlantic and keeps western Europe milder than its latitude suggests.");

  /* ---- Biology ---- */
  B('bio', 2, "The Tiny Town Inside You", "Dr. Cella Nucleus", '#4E9A5B', [
    "Your body is made of about thirty trillion cells. They are too small to see without a microscope.",
    "Each cell is like a tiny town. The nucleus is the town hall and holds the DNA, the instructions for building and running the body.",
    "The mitochondria are the power stations. They turn the food you eat into energy the cell can use.",
    "Different cells do different jobs. Nerve cells send messages, muscle cells contract, and red blood cells carry oxygen.",
    "Cells wear out and are replaced. The cells that line your stomach live only a few days, but some brain cells last a whole lifetime."
  ], [
    X.mc('bio', 2, "What does the nucleus hold?", ["DNA", "Food", "Water only", "Bones"]),
    X.mc('bio', 2, "What do the mitochondria do?", ["Turn food into energy", "Store DNA", "Make sound", "Digest bones"]),
    X.mc('bio', 2, "Which cells send messages?", ["Nerve cells", "Muscle cells", "Red blood cells", "Skin cells"])
  ], "The body is made of about thirty trillion cells, and each one has a nucleus with DNA.");
  B('bio', 3, "The Secret Life of Bees", "Buzz Honeycomb", '#E0A92B', [
    "A bee colony may hold fifty thousand bees, but only one queen. She lays up to two thousand eggs a day.",
    "Worker bees are all female. As they age they change jobs, from cleaning cells to feeding young to guarding the hive and finally collecting food.",
    "Drones are male bees. Their only job is to mate with a queen, and they do not have a sting.",
    "When a scout finds flowers she dances for the others. The angle of her waggle dance shows the direction of the food, and its length shows the distance.",
    "Bees pollinate a large share of the crops people eat. A single bee may visit hundreds of flowers in a day."
  ], [
    X.mc('bio', 3, "How many queens does a colony usually have?", ["One", "Ten", "A thousand", "None"]),
    X.mc('bio', 3, "What does the waggle dance tell other bees?", ["Where the food is", "That it is raining", "Where the queen is", "That a storm is coming"]),
    X.mc('bio', 3, "Which bees are male?", ["Drones", "Workers", "Queens", "Scouts"])
  ], "Bees tell each other where flowers are with a waggle dance: its angle shows the direction and its length the distance.");

  /* ---- Chemistry ---- */
  B('chem', 2, "The Kitchen Chemist", "Chef Pepper Sauce", '#D26A32', [
    "Chef Pepper's kitchen is a laboratory. Every recipe is a set of chemical reactions, if you look closely.",
    "When bread bakes, yeast makes carbon dioxide gas. The bubbles are trapped in the dough, which makes it rise.",
    "Heat changes proteins. An egg is runny when raw, but heat makes its proteins join together and set firm.",
    "Browning toast, searing meat and baking cookies all involve the Maillard reaction, which creates new flavors and a brown color.",
    "Acids and bases appear too. Lemon juice is acidic, baking soda is a base, and mixing them makes fizzing bubbles of carbon dioxide."
  ], [
    X.mc('chem', 2, "Which gas makes bread dough rise?", ["Carbon dioxide", "Oxygen", "Helium", "Hydrogen"]),
    X.mc('chem', 2, "What happens to an egg's proteins when heated?", ["They join together and set", "They vanish", "They turn to gas", "They freeze"]),
    X.mc('chem', 2, "What fizzes when lemon juice meets baking soda?", ["Carbon dioxide", "Steam only", "Smoke", "Helium"])
  ], "Bread rises because yeast makes carbon dioxide gas, which is trapped in bubbles in the dough.");
  B('chem', 3, "The Periodic Puzzle", "Prof. Dmitri Gapp", '#7A5BAE', [
    "In 1869 a chemist named Dmitri Mendeleev arranged the known elements by weight and found a pattern. Similar elements kept turning up at regular steps.",
    "He left gaps in his table for elements that had not yet been found, and predicted what they would be like. When gallium and germanium were found, they matched.",
    "Today the table is arranged by atomic number, the number of protons. The columns are groups, and elements in a group behave alike.",
    "The first group holds the alkali metals, soft metals that react fiercely with water. The last group holds the noble gases, which hardly react at all.",
    "Rows are called periods. Moving across a period from left to right, elements change from metals to non-metals."
  ], [
    X.mc('chem', 3, "Who arranged the first useful periodic table?", ["Mendeleev", "Newton", "Curie", "Darwin"]),
    X.mc('chem', 3, "How is the modern table arranged?", ["By atomic number", "By color", "By alphabet", "By age"]),
    X.mc('chem', 3, "Which group hardly reacts at all?", ["The noble gases", "The alkali metals", "The halogens", "The metals"])
  ], "Mendeleev left gaps in his table for elements nobody had found yet, and predicted what they would be like.");

  /* ---- Math ---- */
  B('maths', 2, "The Number Detective", "Inspector Digit", '#E0902B', [
    "Inspector Digit solves mysteries with numbers. Her first case: a thief left a note saying the safe code was the next number in the pattern 2, 4, 8, 16.",
    "Each number was double the one before, so the next was 32. The safe clicked open.",
    "Her second case needed the average. Five footprints measured 20, 22, 24, 26 and 28 centimeters. Added up they come to 120, and divided by five that makes 24.",
    "Case three was about angles. The three corners of a triangle always add up to 180 degrees, so if two angles are 60 and 80, the third must be 40.",
    "The inspector's rule is that every puzzle has a pattern. You only have to look at the numbers long enough."
  ], [
    X.mc('maths', 2, "What is the next number in 2, 4, 8, 16?", ["32", "24", "20", "18"]),
    X.mc('maths', 2, "What is the average of 20, 22, 24, 26 and 28?", ["24", "22", "26", "120"]),
    X.mc('maths', 2, "The angles of a triangle add up to how many degrees?", ["180", "90", "360", "100"])
  ], "The three angles of any triangle always add up to 180 degrees.");
  B('maths', 3, "Infinity and Beyond", "Prof. Ada Zero", '#9A4FB0', [
    "Some numbers never end. The number pi, the circle's circumference divided by its diameter, starts 3.14159 and goes on forever without repeating.",
    "Prime numbers also go on forever. Around 300 BC the Greek mathematician Euclid proved that there are infinitely many primes.",
    "Not all infinities are the same size. In the 1870s Georg Cantor showed that there are more real numbers than whole numbers, even though both are infinite.",
    "A famous sequence, the Fibonacci numbers, starts 1, 1, 2, 3, 5, 8, 13. Each number is the sum of the two before it, and the pattern turns up in flowers and shells.",
    "Zero was a late invention. Indian mathematicians developed it as a number, and it reached Europe through the Arab world."
  ], [
    X.mc('maths', 3, "Who proved that there are infinitely many primes?", ["Euclid", "Pythagoras", "Newton", "Galileo"]),
    X.mc('maths', 3, "What number comes after 8 in the Fibonacci sequence 1, 1, 2, 3, 5, 8?", ["13", "11", "12", "16"]),
    X.mc('maths', 3, "Which mathematician showed that some infinities are bigger than others?", ["Cantor", "Euclid", "Fibonacci", "Euler"])
  ], "There are infinitely many prime numbers, as Euclid proved around 300 BC.");

  /* ---- Physics ---- */
  B('phys', 2, "Big Ideas of Isaac Newton", "Anna Apple", '#B3402E', [
    "Isaac Newton lived in England about three hundred and fifty years ago. He wondered why an apple falls down and not sideways or up.",
    "His answer was gravity. He realized that the same force which pulls an apple to the ground also keeps the Moon in its orbit around the Earth.",
    "He wrote three laws of motion. The first says that an object keeps still, or keeps moving steadily, unless a force acts on it.",
    "The second law says that a heavier object needs a bigger force to speed it up. The third says that for every action there is an equal and opposite reaction.",
    "Newton also used a prism to show that white light is made of all the colors of the rainbow."
  ], [
    X.mc('phys', 2, "What did Newton wonder about?", ["Why an apple falls down", "Why ice is cold", "Why the sea is salty", "Why birds sing"]),
    X.mc('phys', 2, "What keeps the Moon in orbit around the Earth?", ["Gravity", "Wind", "Magnets", "Sound"]),
    X.mc('phys', 2, "What did Newton use to split white light?", ["A prism", "A telescope", "A mirror", "A magnet"])
  ], "Newton realized that the force which pulls an apple to the ground is the same one that holds the Moon in orbit.");
  B('phys', 3, "The Quantum Zoo", "Dr. Quark Wigglesworth", '#4A64B8', [
    "Atoms are made of smaller pieces. Protons and neutrons are made of even smaller particles called quarks.",
    "Light behaves both as a wave and as a stream of tiny packets of energy called photons. This strange double nature is a key idea of quantum physics.",
    "Quantum physics says that you cannot know both the exact position and the exact speed of a tiny particle at the same time. This is Heisenberg's uncertainty principle.",
    "Particles can also tunnel through barriers that, in everyday life, would stop them. This tunneling is how the Sun's core manages to fuse atoms.",
    "Quantum ideas run modern life. Lasers, computer chips and medical scanners all work because of them."
  ], [
    X.mc('phys', 3, "What are protons and neutrons made of?", ["Quarks", "Atoms", "Molecules", "Photons"]),
    X.mc('phys', 3, "What are tiny packets of light energy called?", ["Photons", "Quarks", "Neutrons", "Ions"]),
    X.mc('phys', 3, "Whose principle says you cannot know both position and speed exactly?", ["Heisenberg's", "Newton's", "Ohm's", "Boyle's"])
  ], "Light acts both as a wave and as a stream of tiny packets of energy called photons.");

  /* ---- Space ---- */
  B('space', 2, "Letters From the Moon", "Cmdr. Luna Rocket", '#6A7A92', [
    "Dear Earth, the Moon is quiet. There is no air here, so there is no wind and no sound, and the sky is black even in the daytime.",
    "Gravity is only about one sixth as strong as at home. I can jump six times as high, and my footprints will stay for millions of years.",
    "The days here are long. One full day and night take about a month, so the Sun stays up for around two weeks at a time.",
    "The surface is covered in craters, made by space rocks that hit long ago. With no weather, there is nothing to wear them away.",
    "Look up tonight and wave. From here, Earth is a bright blue marble hanging in the sky, and it never moves."
  ], [
    X.mc('space', 2, "Why is there no sound on the Moon?", ["There is no air", "It is too dark", "It is too cold", "It is too far"]),
    X.mc('space', 2, "How strong is the Moon's gravity compared with Earth's?", ["About one sixth", "The same", "Double", "None"]),
    X.mc('space', 2, "What made the Moon's craters?", ["Space rocks", "Rivers", "Wind", "Volcanoes only"])
  ], "The Moon's gravity is only about one sixth of Earth's, so an astronaut can jump about six times as high.");
  B('space', 3, "Journey to the Black Hole", "Capt. Event Horizon", '#2E2E4E', [
    "A black hole is a place where gravity is so strong that nothing can get out, not even light. Most are made when a huge star runs out of fuel and collapses.",
    "The edge of a black hole is called the event horizon. Anything that crosses it cannot return.",
    "As you fall in, time slows down for you compared with anyone watching from far away. Einstein's theory of gravity predicts this.",
    "Black holes cannot be seen directly, but we can see stars orbiting them and glowing gas swirling around them. In 2019 the first picture of a black hole's shadow was published.",
    "Nearly every big galaxy has a huge black hole at its center. The one at the center of our Milky Way is millions of times heavier than the Sun."
  ], [
    X.mc('space', 3, "What is the edge of a black hole called?", ["The event horizon", "The corona", "The crater", "The ring"]),
    X.mc('space', 3, "What do we see when we study a black hole?", ["Stars and gas orbiting it", "Its surface", "Its light", "Its mountains"]),
    X.mc('space', 3, "Where is a huge black hole found?", ["At the center of most big galaxies", "Inside the Sun", "On the Moon", "In Earth's core"])
  ], "Nearly every large galaxy, including ours, has a huge black hole at its center.");

  /* ---- History & Geography ---- */
  B('geo', 2, "The Road to Rome", "Marcus Viator", '#A8483A', [
    "Legend says Rome was founded in 753 BC by Romulus, who was raised by a wolf along with his twin brother, Remus.",
    "At first Rome was ruled by kings. Later the Romans chose officials and a Senate, and this was called the Republic.",
    "Rome grew by conquest. The legions marched along stone roads built straight and strong, and many of them can still be seen today.",
    "In 27 BC Augustus became the first emperor. At its height the empire stretched from Britain to Egypt around the Mediterranean Sea.",
    "The Romans built aqueducts to carry water to their cities, as well as arenas, baths and concrete domes such as the Pantheon."
  ], [
    X.mc('geo', 2, "Who was the first Roman emperor?", ["Augustus", "Romulus", "Nero", "Caesar"]),
    X.mc('geo', 2, "What did the Romans build to carry water to cities?", ["Aqueducts", "Pyramids", "Canals of gold", "Wells only"]),
    X.mc('geo', 2, "What was the Roman government called before the emperors?", ["The Republic", "The Dynasty", "The Kingdom", "The Council"])
  ], "The Romans built long straight roads and aqueducts; many of them can still be seen today.");
  B('geo', 3, "Mapmakers", "Cartia Compass", '#3C8C70', [
    "People have been drawing maps for thousands of years. Early maps showed only what the mapmaker knew, so faraway lands were guesses.",
    "A map is flat, but the Earth is round, so every flat map stretches something. The Mercator map, made in 1569 for sailors, makes places near the poles look huge.",
    "Latitude lines run east to west and measure how far north or south you are. Longitude lines run from pole to pole and measure east or west.",
    "For centuries sailors could find latitude from the Sun, but not longitude. In the 1700s John Harrison made a clock that kept accurate time at sea, which solved it.",
    "Today satellites in space send signals to a receiver, which works out your position anywhere on Earth. This is called GPS."
  ], [
    X.mc('geo', 3, "Which lines measure how far north or south you are?", ["Latitude", "Longitude", "Meridians only", "Tropics"]),
    X.mc('geo', 3, "What did John Harrison's clock help sailors find?", ["Longitude", "Latitude", "Treasure", "Storms"]),
    X.mc('geo', 3, "What does GPS use to find your position?", ["Satellites", "Compasses", "Lighthouses", "Paper maps"])
  ], "Sailors could find latitude from the Sun but needed an accurate clock to find longitude, which John Harrison built.");
})();
