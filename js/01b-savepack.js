'use strict';
/* Save compression. */
/* ========================= 4b. SAVE PACKING ========================= */
/* The save used to be stored as plain JSON. It is now stored compressed, with a small lossless compressor written here (no libraries,
   and synchronous, so Save.write() stays simple). The text kept in localStorage is a JSON string literal holding the packed code:

       "GR2:" + Base64( [format 1 byte] [length of the JSON text, 4 bytes, big endian] [payload] )

   format 0 = the JSON text as UTF-8 bytes (used only if compressing would not make it smaller);
   format 1 = LZW: the same bytes as a stream of codes, 9 bits wide to start and one bit wider each time the dictionary doubles,
              up to 16 bits; the dictionary is emptied after 65,280 entries. The width of each code depends only on how many codes
              have been written since the last emptying, so no widths are stored. There are no clear or end codes: the length
              in the header says how many bytes to produce.

   Why a JSON string literal and not the bare code: anything that already reads localStorage["giraffe_rampage_save_v1"] and runs
   JSON.parse on it (the Lovable save bridge does) still gets valid JSON, and can store and give back that value unchanged. An
   old, uncompressed save (a JSON object) is still read, and is rewritten in the new form the next time the game saves.

   GR3 (newer, much smaller): "GR3:" + base 91 text of [length of the JSON text, a 7-bit varint] [16-bit check of the text] [arithmetic-coded body]. The body comes from a
   context-mixing model that has first read a frozen sample save (PRIMER), so it already knows the field names. It is explained above the model code below. A write is stored
   as GR2 at once and repacked as GR3 a few seconds later (see "Writing"); GR2 and plain JSON saves are still read. Anything that does not come back
   exactly (or fails its check) is not used: the writer keeps GR2, the reader says "unreadable" and the game keeps the raw text aside.

   window.GRSave is the public face of this, for the hosting page and for tests:
       GRSave.key            the localStorage key
       GRSave.encode(obj)    object -> "GR3:..." string (slow: a few hundred ms; Save.write uses the fast GR2 and repacks later)
       GRSave.decode(str)    "GR3:..." or "GR2:..." string, a JSON string literal of one, or a JSON object text -> object (or null)
       GRSave.read()         the current save in localStorage as an object (or null)
       GRSave.flush()        repack the last write as GR3 now (true if it did)
       GRSave.stats(obj)     { json, packed, ratio } sizes in characters, for the given object (default: the live save) */
const GRPack = (function(){
  const MAGIC = 'GR2:', MAGIC3 = 'GR3:', LIMIT = 65536 - 256;
  const bitLen = function(v){ return 32 - Math.clz32(v); };
  const widthFor = function(j){ return Math.max(9, bitLen(256 + j - 1)); };            /* width of the j-th code since the dictionary was last emptied */
  function b64(bytes){
    let s = '';
    for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return btoa(s);
  }
  function unb64(str){
    const s = atob(str), out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function lzw(bytes){
    const out = [];
    let cur = 0, nbits = 0;
    const put = function(code, w){
      for (let i = w - 1; i >= 0; i--){
        cur = (cur << 1) | ((code >> i) & 1);
        if (++nbits === 8){ out.push(cur); cur = 0; nbits = 0; }
      }
    };
    if (!bytes.length) return new Uint8Array(0);
    let dict = new Map(), next = 256, j = 0, w = bytes[0];
    for (let i = 1; i < bytes.length; i++){
      const c = bytes[i], key = w * 256 + c, hit = dict.get(key);
      if (hit !== undefined){ w = hit; continue; }
      put(w, widthFor(j)); j++;
      dict.set(key, next++);
      if (j >= LIMIT){ dict = new Map(); next = 256; j = 0; }
      w = c;
    }
    put(w, widthFor(j));
    if (nbits) out.push((cur << (8 - nbits)) & 255);
    return Uint8Array.from(out);
  }
  function unlzw(data, len){
    const out = new Uint8Array(len), prefix = new Int32Array(65536), suffix = new Uint8Array(65536), stack = new Uint8Array(65536 + 8);
    let pos = 0, p = 0, j = 0, nextDec = 256, prev = -1, prevFirst = 0;
    const total = data.length * 8;
    const read = function(w){
      if (p + w > total) return -1;
      let v = 0;
      for (let i = 0; i < w; i++, p++) v = (v << 1) | ((data[p >> 3] >> (7 - (p & 7))) & 1);
      return v;
    };
    while (pos < len){
      const code = read(widthFor(j));
      if (code < 0) throw new Error('short');
      let sp = 0, first;
      if (j === 0){ stack[sp++] = code; first = code; }
      else {
        let c = code;
        if (c > nextDec) throw new Error('bad code');
        if (c === nextDec){ stack[sp++] = prevFirst; c = prev; }               /* the code for the entry not yet written: previous string plus its own first byte */
        while (c >= 256){ stack[sp++] = suffix[c]; c = prefix[c]; }
        stack[sp++] = c; first = c;
        prefix[nextDec] = prev; suffix[nextDec] = first; nextDec++;
      }
      while (sp > 0 && pos < len) out[pos++] = stack[--sp];
      prev = code; prevFirst = first; j++;
      if (j >= LIMIT){ j = 0; nextDec = 256; prev = -1; }
    }
    return out;
  }

  /* ---- GR3: a context-mixing model driving an arithmetic coder (the family of compressors behind PAQ and lpaq) ----
     The JSON text is coded one bit at a time. Before each bit, several models each guess how likely a 1 is, using what came just before:
     the last 0, 1, 2, 3, 4 and 6 bytes, the name of the field we are inside, and a "match model" that spots long repeats. A small
     neural mixer blends the guesses (learning, as it goes, which model to trust), two refiners (APMs) correct the blend, and an
     arithmetic coder turns the final probability into bits: a bit the model was sure about costs almost nothing.
     Everything is integer arithmetic (no Math.exp, no floats in the model), so every browser makes exactly the same guesses, which
     the decoder needs. The model is "primed" by running it over PRIMER (a frozen sample of save text) first, so even the first field
     of a small save is already predicted well. PRIMER must never change: every GR3 save depends on it. */
  /* PRIMER: a frozen sample of a late-game save (every key the game writes, with small stand-in values). NEVER EDIT IT: every GR3 save is coded against it. */
  const PRIMER =
    '{\"inputMode\":\"mouse\",\"gold\":48213977,\"gems\":3120,\"meta\":{\"hooves\":5,\"hide\":6,\"strides\":4,\"prospect\":1,\"learner\":7,\"deck\":5,\"instinct\":1,\"magnet\"' +
    ':3,\"wind\":3,\"starcharm\":3,\"reach\":4,\"regen\":3,\"luckypaws\":3,\"thunder\":6,\"steady\":2,\"swimlegs\":3,\"ripkick\":2,\"brine\":5,\"steadyeyes\":1,\"antcap\":3,\"' +
    'anthp\":1,\"antblast\":3,\"antdmg\":1,\"antrespawn\":3,\"engspeed\":2,\"engturhp\":1,\"engrange\":3},\"gear\":{\"herdhide:cape\":1,\"herdhide:weapon\":1,\"herdhide:armor\"' +
    ':1,\"thornweave:weapon\":1,\"thornweave:armor\":1,\"stoneplate:cape\":1,\"stoneplate:weapon\":1,\"stoneplate:armor\":1,\"frostbite:cape\":1,\"frostbite:weapon\":1,\"frost' +
    'bite:armor\":1,\"acacia:cape\":1,\"acacia:weapon\":1,\"acacia:armor\":1,\"twinsoul:cape\":1,\"twinsoul:armor\":1,\"glacierguard:cape\":1,\"glacierguard:weapon\":1,\"glaci' +
    'erguard:armor\":1,\"sunforged:cape\":1,\"sunforged:weapon\":1,\"sunforged:armor\":1,\"aurora:cape\":1,\"aurora:weapon\":1,\"aurora:armor\":1,\"starborn:cape\":1,\"starbor' +
    'n:weapon\":1,\"starborn:armor\":1,\"tideshell:cape\":1,\"tideshell:weapon\":1,\"tideshell:armor\":1,\"riptide:cape\":1,\"riptide:weapon\":1,\"riptide:armor\":1,\"abyssal:' +
    'cape\":1,\"abyssal:weapon\":1,\"abyssal:armor\":1,\"canopy:weapon\":1,\"canopy:armor\":1,\"jaguar:cape\":1,\"jaguar:weapon\":1,\"jaguar:armor\":1,\"leviathan:weapon\":1,\"' +
    'leviathan:armor\":1,\"cinder:cape\":1,\"cinder:weapon\":1,\"cinder:armor\":1,\"rooftop:cape\":1,\"rooftop:weapon\":1,\"rooftop:armor\":1,\"moondust:cape\":1,\"moondust:we' +
    'apon\":1,\"moondust:armor\":1,\"rustwalker:cape\":1,\"rustwalker:weapon\":1,\"rustwalker:armor\":1,\"sitezero:cape\":1,\"sitezero:weapon\":1,\"sitezero:armor\":1,\"worlds' +
    'pire:cape\":1,\"worldspire:weapon\":1},\"equipped\":{\"cape\":\"herdhide:cape\",\"weapon\":\"spurs:weapon\",\"armor\":\"herdhide:armor\"},\"equippedTrinkets\":[],\"best\"' +
    ':912345,\"bestWave\":360,\"runs\":842,\"totalKills\":1845231,\"chaptersComplete\":15,\"chapter1Complete\":true,\"chapter2Complete\":true,\"chapter3Complete\":true,\"chapt' +
    'er4Complete\":true,\"chapter5Complete\":true,\"chapter6Complete\":true,\"chapter7Complete\":true,\"chapter8Complete\":true,\"chapter9Complete\":true,\"chapter10Complete\"' +
    ':true,\"enginePart\":false,\"spaceplane\":13810,\"homecoming\":false,\"grubs\":5120,\"city\":{\"c_anthp\":7,\"c_antdmg\":10,\"c_antspd\":5,\"c_antrate\":4,\"c_antcap\":3,' +
    '\"c_acid\":3,\"c_venom\":2,\"c_sticky\":1,\"t_lanternoil\":1,\"t_echochime\":1,\"t_mosswreath\":1,\"t_burrowboots\":1,\"c_dmg\":1,\"c_hp\":10,\"c_spd\":2,\"c_xp\":5,\"c_g' +
    'old\":1,\"c_neck\":1,\"c_card\":1,\"c_fusion\":1},\"chapter11Complete\":true,\"chapter12Complete\":true,\"chapter13Complete\":true,\"chapter14Complete\":true,\"chapter15C' +
    'omplete\":true,\"mutationVial\":false,\"iron\":8123,\"argon\":3321,\"marsUp\":{},\"mutations\":{\"m_gut\":1,\"m_luck\":1,\"m_hide\":1,\"m_iron\":1,\"m_stomach\":1,\"m_cel' +
    'ls\":1,\"m_gland\":1,\"m_bone\":1,\"m_ants\":1,\"m_res\":1},\"mutUses\":8560,\"vials\":16972,\"vialGiven\":false,\"squad\":{\"0\":1,\"1\":1,\"2\":1,\"3\":1,\"4\":1,\"5\":' +
    '1},\"sulfur\":17619,\"basalt\":9367,\"venusUp\":{\"hab1\":4,\"hab2\":1,\"hab3\":1,\"col1\":3,\"col2\":4,\"col3\":1,\"forge\":1,\"t_lantern\":1,\"t_plate\":5,\"t_bellows\"' +
    ':1,\"t_heart\":2,\"rover\":3,\"deflector\":1,\"garage\":4},\"antsUnlocked\":false,\"food\":5851,\"ants\":{\"soldier\":0,\"distractor\":0,\"shooter\":0},\"cratesOpened\":3' +
    '681,\"wheelKeys\":14620,\"lastWheelKeyAt\":17667,\"spottedKeys\":19582,\"lastSpottedKeyAt\":6166,\"runSave\":null,\"combos\":{\"neck_whip|hoof_quake\":1,\"neck_whip|spit\"' +
    ':1,\"neck_whip|weaponry\":1,\"neck_whip|starfall\":1,\"hoof_quake|spit\":1,\"hoof_quake|weaponry\":1,\"hoof_quake|speed\":1,\"spit|weaponry\":1,\"spit|starfall\":1,\"thor' +
    'n_halo|dung_mine\":1,\"thorn_halo|frenzy\":1,\"thorn_halo|starfall\":1,\"sun_beam|stampede\":1,\"sun_beam|lightning\":1,\"sun_beam|thorn_crown\":1,\"sun_beam|deflector\":' +
    '1,\"sun_beam|dust_devils\":1,\"sun_beam|cavern_echo\":1,\"stampede|lightning\":1,\"stampede|fleece\":1,\"stampede|thorn_crown\":1,\"stampede|dust_devils\":1,\"dung_mine|f' +
    'east\":1,\"lightning|starfall\":1,\"lightning|thorn_crown\":1,\"lightning|sunfire_flies\":1,\"weaponry|iron_hide\":1,\"speed|iron_hide\":1,\"feast|starfall\":1,\"fleece|t' +
    'horn_crown\":1,\"fleece|deflector\":1,\"fleece|dust_devils\":1,\"starfall|thorn_crown\":1,\"starfall|deflector\":1,\"starfall|dust_devils\":1,\"thorn_crown|deflector\":1,' +
    '\"sunfire_flies|deflector\":1,\"sunfire_flies|dust_devils\":1,\"deflector|dust_devils\":1,\"dust_devils|cavern_echo\":1},\"fusions\":13102,\"mastered\":{\"hoof_quake\":1,' +
    '\"spit\":1,\"thorn_halo\":1,\"sun_beam\":1,\"dung_mine\":1,\"weaponry\":1,\"speed\":1,\"feast\":1,\"frenzy\":1,\"fleece\":1,\"starfall\":1,\"thorn_crown\":1,\"sunfire_fli' +
    'es\":1,\"deflector\":1,\"dust_devils\":1,\"cavern_echo\":1},\"comboClaims\":{\"5\":1,\"10\":1},\"bestiary\":{\"creatures\":{\"1:hyena\":964,\"1:jackal\":1451,\"1:baboon\"' +
    ':1901,\"1:vulture\":1510,\"1:mamba\":984,\"1:termite\":298,\"1:grub\":1705,\"1:lion\":845,\"1:matriarch\":1057,\"1:wildfire\":994,\"1:iceheart\":535,\"2:hyena\":209,\"2:j' +
    'ackal\":204,\"2:rhino\":1564,\"2:grub\":1522,\"2:wildfire\":715,\"2:thawed\":160,\"3:baboon\":98,\"3:honeybadger\":167,\"3:vulture\":721,\"3:mamba\":415,\"3:termite\":147' +
    '2,\"3:grub\":812,\"3:lion\":1633,\"3:matriarch\":1539,\"3:buffalo\":988,\"3:crocodile\":1803,\"3:thawed\":1790,\"4:hyena\":1490,\"4:cheetah\":211,\"4:rhino\":1904,\"4:bab' +
    'oon\":155,\"4:honeybadger\":690,\"4:vulture\":753,\"4:mamba\":86,\"4:ember\":1501,\"4:lion\":404,\"4:buffalo\":321,\"4:crocodile\":826,\"4:wildfire\":798,\"4:thawed\":128' +
    '8,\"4:iceheart\":1784,\"5:hyena\":1740,\"5:rhino\":247,\"5:baboon\":1404,\"5:vulture\":1882,\"5:mamba\":1463,\"5:termite\":832,\"5:lion\":857,\"5:buffalo\":1117,\"5:thawe' +
    'd\":1456,\"6:hyena\":1631,\"6:cheetah\":225,\"6:warthog\":1776,\"6:grub\":1617,\"6:ember\":253,\"6:buffalo\":1519,\"6:crocodile\":1585,\"6:wildfire\":1966,\"6:iceheart\":' +
    '602,\"7:hyena\":307,\"7:cheetah\":1969,\"7:warthog\":1305,\"7:baboon\":1073,\"7:vulture\":792,\"7:termite\":628,\"7:ember\":474,\"7:lion\":930,\"7:buffalo\":1915,\"7:thaw' +
    'ed\":380,\"7:iceheart\":986,\"8:hyena\":626,\"8:jackal\":1218,\"8:cheetah\":1198,\"8:warthog\":578,\"8:baboon\":94,\"8:vulture\":1537,\"8:mamba\":1994,\"8:grub\":483,\"8:' +
    'matriarch\":1448,\"8:crocodile\":1860,\"8:iceheart\":644,\"9:rhino\":57,\"9:baboon\":1753,\"9:honeybadger\":1033,\"9:vulture\":383,\"9:mamba\":922,\"9:termite\":1927,\"9:' +
    'buffalo\":540,\"9:crocodile\":97,\"9:wildfire\":97,\"9:iceheart\":1927,\"10:hyena\":746,\"10:jackal\":1316,\"10:cheetah\":83,\"10:warthog\":108,\"10:rhino\":180,\"10:babo' +
    'on\":1702,\"10:honeybadger\":464,\"10:mamba\":1376,\"10:termite\":1929,\"10:grub\":1902,\"10:ember\":1685,\"10:lion\":1714,\"10:matriarch\":1825,\"10:buffalo\":737,\"10:c' +
    'rocodile\":465,\"10:wildfire\":1174,\"10:thawed\":662,\"10:iceheart\":1868,\"11:hyena\":1349,\"11:jackal\":206,\"11:cheetah\":1744,\"11:warthog\":1998,\"11:baboon\":2,\"1' +
    '1:honeybadger\":1129,\"11:mamba\":527,\"11:termite\":1572,\"11:ember\":1869,\"11:lion\":923,\"11:matriarch\":1927,\"11:buffalo\":349,\"11:crocodile\":539,\"11:wildfire\":' +
    '905,\"11:thawed\":521,\"12:jackal\":1371,\"12:warthog\":1501,\"12:rhino\":83,\"12:baboon\":1289,\"12:honeybadger\":179,\"12:vulture\":907,\"12:matriarch\":1161,\"12:buffa' +
    'lo\":382,\"12:wildfire\":33,\"12:iceheart\":1409,\"13:jackal\":1158,\"13:cheetah\":1076,\"13:rhino\":466,\"13:baboon\":984,\"13:buffalo\":1360,\"13:wildfire\":1841,\"13:i' +
    'ceheart\":678,\"14:jackal\":624,\"14:cheetah\":941,\"14:warthog\":936,\"14:vulture\":1361,\"14:termite\":1522,\"14:grub\":1323,\"14:buffalo\":421,\"14:crocodile\":1402,\"' +
    '14:wildfire\":852,\"14:iceheart\":1149,\"15:jackal\":1336,\"15:warthog\":1675,\"15:baboon\":931,\"15:grub\":1528,\"15:ember\":628,\"15:iceheart\":153},\"cards\":{\"neck_w' +
    'hip\":1,\"hoof_quake\":1,\"spit\":1,\"thorn_halo\":1,\"sun_beam\":1,\"dung_mine\":1,\"lightning\":1,\"weaponry\":1,\"speed\":1,\"iron_hide\":1,\"frenzy\":1,\"fleece\":1,\"' +
    'starfall\":1,\"thorn_crown\":1,\"dust_devils\":1,\"cavern_echo\":1}},\"lastForageAt\":15625,\"menuChapter\":6032,\"muted\":false,\"autoKick\":true,\"aimMode\":\"cursor\",' +
    '\"ach\":{\"kills100\":2322185182800,\"kills1k\":1979219103000,\"runs1\":2529447222100,\"runs10\":2090366029900,\"runs50\":2399926835600,\"runs200\":2208098912400,\"score1' +
    'm\":2480487847700,\"score100m\":2322129273700,\"wave10\":2191061043900,\"wave50\":1820010238900,\"wave100\":2381468499000,\"wave250\":2622600937300,\"ch1\":1707321578200,' +
    '\"ch5\":2333277786000,\"ch10\":2538052970500,\"ch135\":2556066298900,\"ch14\":2581475043700,\"home\":2338748717600,\"gold1m\":1984808707300,\"gems500\":2465150618900,\"cr' +
    'ate1\":2275563025700,\"crate50\":2442596221300,\"gear10\":1764100337000,\"gear30\":2283801698900,\"trinket1\":1718484544700,\"trinketAll\":1934023940600,\"best50\":165817' +
    '1260300,\"best150\":1691477859000,\"bestAll\":1941431069500,\"cardsAll\":2054916912500,\"combo1\":1920228386000,\"combo10\":2247754478700,\"fuse10\":2526666069400,\"meta1' +
    '50\":2289702797200,\"mini1\":1951747322200,\"mini25\":2409781867600,\"hats10\":1986407542300,\"hats40\":2227998996000,\"stars20\":1971566462600,\"colours10\":232495906380' +
    '0,\"colours30\":2456084514000,\"photo1\":2589002871900,\"photo24\":2593770289800,\"photo48\":1920032793400,\"films8\":2054637128300,\"found10\":2438763642600,\"found100\"' +
    ':2582414532100,\"vis4\":1866411113800,\"vis8\":1854619348100,\"err5\":2099662924000,\"err20\":2459352636700,\"loaf25\":1883999014000,\"oven3\":1867974841600,\"sail1\":250' +
    '3155255700,\"sail25\":2404599690700,\"boats4\":1726675534200,\"fishAll\":2516287708600,\"rings20\":2564207935700,\"gym3\":1802863025700,\"gymMax\":2487245881900,\"deg1\":' +
    '2149161035000,\"deg5\":2311771893800,\"books12\":2211690479700,\"booksAll\":2647566253400,\"ship4\":1789657523500,\"ants1\":2431061679400,\"ants100\":2343590551900,\"city' +
    '5\":2431766176500,\"venus5\":2606317186800,\"mars5\":2183196717700,\"mut1\":1833272481000,\"fish20\":2620729351400,\"fish35\":2412904644300,\"fishBig\":2310060435800,\"fi' +
    'shLeg\":2410432631100,\"seaCast\":2524778062500},\"hintsSeen\":{\"move\":1,\"cards\":1,\"combo\":1,\"lowhp\":1,\"boss\":1,\"cleared\":1},\"gearLv\":{\"herdhide:cape\":5,\"' +
    'herdhide:weapon\":8,\"herdhide:armor\":2,\"thornweave:weapon\":8,\"thornweave:armor\":2,\"stoneplate:cape\":6,\"stoneplate:weapon\":8,\"stoneplate:armor\":3,\"frostbite:c' +
    'ape\":8,\"frostbite:weapon\":9,\"frostbite:armor\":5,\"acacia:cape\":3,\"acacia:weapon\":9,\"acacia:armor\":3,\"twinsoul:cape\":9,\"twinsoul:armor\":3,\"glacierguard:cape' +
    '\":3,\"glacierguard:weapon\":8,\"glacierguard:armor\":5,\"sunforged:cape\":8,\"sunforged:weapon\":5,\"sunforged:armor\":3,\"aurora:cape\":3,\"aurora:weapon\":7,\"aurora:a' +
    'rmor\":3,\"starborn:cape\":6,\"starborn:weapon\":5,\"starborn:armor\":9,\"tideshell:cape\":4,\"tideshell:weapon\":8,\"tideshell:armor\":5,\"riptide:cape\":4,\"riptide:wea' +
    'pon\":8,\"riptide:armor\":9,\"abyssal:cape\":1,\"abyssal:weapon\":4,\"abyssal:armor\":4,\"canopy:weapon\":6,\"canopy:armor\":2,\"jaguar:cape\":1,\"jaguar:weapon\":1,\"jag' +
    'uar:armor\":5,\"leviathan:weapon\":3,\"leviathan:armor\":2,\"cinder:cape\":7,\"cinder:weapon\":2,\"cinder:armor\":4,\"rooftop:cape\":5,\"rooftop:weapon\":1,\"rooftop:armo' +
    'r\":1,\"moondust:cape\":3,\"moondust:weapon\":9,\"moondust:armor\":7,\"rustwalker:cape\":4,\"rustwalker:weapon\":8,\"rustwalker:armor\":5,\"sitezero:cape\":6,\"sitezero:w' +
    'eapon\":7,\"sitezero:armor\":4,\"worldspire:cape\":9,\"worldspire:weapon\":1},\"cratePity\":{},\"town\":{\"found\":{\"sq_c1\":1,\"sq_s1\":1,\"sq_tr\":1,\"mk_c1\":1,\"mk_c' +
    '2\":1,\"mk_g1\":1,\"mk_h1\":1,\"mk_s1\":1,\"mk_tr\":1,\"pk_c1\":1,\"pk_c2\":1,\"pk_c3\":1,\"pk_h1\":1,\"pk_b1\":1,\"pk_s1\":1,\"pk_tr\":1,\"hb_c1\":1,\"hb_c2\":1,\"hb_c3\"' +
    ':1,\"hb_h1\":1,\"hb_b1\":1,\"hb_s1\":1,\"hb_tr\":1,\"rf_c1\":1,\"rf_c3\":1,\"rf_g1\":1,\"rf_h1\":1,\"rf_sw\":1,\"rf_s1\":1,\"rf_s2\":1,\"ln_c1\":1,\"ln_c2\":1,\"ln_c3\":1' +
    ',\"ln_g1\":1,\"ln_b1\":1,\"ln_sw\":1,\"ln_s1\":1,\"ln_tr\":1,\"bw_c1\":1,\"bw_c2\":1,\"bw_c3\":1,\"bw_g1\":1,\"bw_g2\":1,\"bw_h1\":1,\"bw_sw\":1,\"bw_s1\":1,\"bw_tr\":1,\"' +
    'sq_c4\":1,\"sq_c5\":1,\"sq_g1\":1,\"ho_c1\":1,\"mk_c4\":1,\"mk_c5\":1,\"mk_s2\":1,\"ba_c1\":1,\"li_c1\":1,\"li_g1\":1,\"ga_c1\":1,\"pk_c4\":1,\"pk_c5\":1,\"pk_s2\":1,\"ho' +
    '_c2\":1,\"ar_c1\":1,\"hb_c4\":1,\"hb_c5\":1,\"hb_g2\":1,\"rf_c4\":1,\"ln_c4\":1,\"ln_g2\":1,\"bw_c4\":1,\"bw_g3\":1,\"rw_c1\":1,\"rw_c3\":1,\"rw_g1\":1,\"hg_c1\":1,\"fm_h' +
    '1\":1,\"fm_b1\":1,\"fm_sw1\":1,\"fm_sw2\":1,\"is_h1\":1,\"is_sw1\":1,\"cp_c1\":1,\"cp_c2\":1,\"cp_c3\":1,\"cp_g1\":1,\"tk_g1\":1,\"wh_c1\":1},\"bond\":{\"mayor\":29,\"til' +
    'ly\":38,\"barnaby\":21,\"penny\":24,\"rio\":21,\"gus\":36,\"marina\":51,\"skye\":33,\"nova\":22,\"ossi\":35,\"dot\":41,\"crumb\":6,\"torque\":22,\"dewey\":55,\"granny\":1' +
    '0,\"mim\":2,\"wingnut\":39,\"hollis\":4,\"marge\":11,\"brine\":53,\"pearl\":3,\"quill\":21,\"longshanks\":34,\"stack\":30,\"chalk\":4,\"tick\":48,\"bean\":44,\"fern\":59,' +
    '\"orbit\":43,\"pip\":39,\"cleat\":31,\"spoke\":7},\"err\":{\"m1\":1,\"m2\":2,\"m3\":2,\"t1\":1,\"t2\":2,\"t3\":1,\"b1\":2,\"b2\":1,\"b3\":2,\"p1\":2,\"p2\":1,\"p3\":2,\"r' +
    '1\":2,\"r2\":1,\"r3\":1,\"r4\":1,\"g1\":2,\"g2\":1,\"g3\":1,\"h1\":1,\"h2\":1,\"h3\":1,\"s1\":1,\"s2\":1,\"s3\":2,\"n1\":1,\"n2\":2,\"n3\":1,\"o1\":1,\"o2\":1,\"o3\":2,\"' +
    'cr1\":1,\"cr2\":1,\"tq1\":1,\"tq2\":1,\"dw1\":1,\"dw2\":1,\"gh1\":2,\"mm1\":2,\"wn1\":1,\"wn2\":2,\"fm1\":1,\"fm2\":2,\"fm3\":1,\"fm4\":2,\"sea1\":2,\"sea2\":2,\"sea3\":2' +
    ',\"sea4\":2,\"un1\":1,\"un2\":2,\"un3\":1,\"un4\":1,\"un5\":2,\"un6\":2,\"un7\":1,\"un8\":1,\"un9\":1,\"un10\":2,\"cl1\":2,\"cl2\":2},\"talk\":{\"mayor\":\"2026-06-15\",\"' +
    'tilly\":\"2026-05-15\",\"barnaby\":\"2026-05-12\",\"penny\":\"2026-07-13\",\"rio\":\"2026-03-18\",\"gus\":\"2026-04-17\",\"marina\":\"2026-06-16\",\"skye\":\"2026-05-14\"' +
    ',\"nova\":\"2026-03-18\",\"ossi\":\"2026-01-17\",\"dot\":\"2026-03-11\",\"crumb\":\"2026-03-10\",\"torque\":\"2026-01-13\",\"dewey\":\"2026-05-15\",\"granny\":\"2026-06-1' +
    '3\",\"mim\":\"2026-04-11\",\"wingnut\":\"2026-04-10\",\"hollis\":\"2026-08-10\",\"marge\":\"2026-05-15\",\"brine\":\"2026-04-14\",\"pearl\":\"2026-01-18\",\"quill\":\"202' +
    '6-08-16\",\"longshanks\":\"2026-04-17\",\"stack\":\"2026-06-11\",\"chalk\":\"2026-02-13\",\"tick\":\"2026-06-11\",\"bean\":\"2026-01-11\",\"fern\":\"2026-06-14\",\"orbit\"' +
    ':\"2026-08-15\",\"pip\":\"2026-04-11\",\"cleat\":\"2026-09-18\",\"spoke\":\"2026-07-16\"},\"gift\":{\"mayor\":\"2026-04-22\",\"tilly\":\"2026-06-26\",\"barnaby\":\"2026-0' +
    '7-21\",\"penny\":\"2026-01-27\",\"rio\":\"2026-07-26\",\"gus\":\"2026-04-25\",\"marina\":\"2026-04-27\",\"skye\":\"2026-06-25\",\"nova\":\"2026-06-28\",\"ossi\":\"2026-07' +
    '-25\",\"dot\":\"2026-03-24\",\"crumb\":\"2026-02-21\",\"torque\":\"2026-09-23\",\"dewey\":\"2026-04-20\",\"granny\":\"2026-06-24\",\"mim\":\"2026-02-27\",\"wingnut\":\"20' +
    '26-03-25\",\"hollis\":\"2026-05-26\",\"marge\":\"2026-01-20\",\"brine\":\"2026-07-26\",\"pearl\":\"2026-02-27\",\"quill\":\"2026-08-28\",\"longshanks\":\"2026-06-27\",\"s' +
    'tack\":\"2026-01-20\",\"chalk\":\"2026-05-21\",\"tick\":\"2026-03-24\",\"bean\":\"2026-04-23\",\"fern\":\"2026-02-22\",\"orbit\":\"2026-08-27\",\"pip\":\"2026-08-28\",\"c' +
    'leat\":\"2026-04-20\",\"spoke\":\"2026-08-20\"},\"vis\":{\"harbour\":1,\"market\":1,\"square\":1,\"park\":1,\"roofs\":1,\"launch\":1,\"runway\":1,\"burrows\":1},\"night\"' +
    ':{\"harbour\":1,\"park\":1,\"roofs\":1,\"launch\":1,\"runway\":1,\"burrows\":1},\"done\":{\"market\":1,\"roofs\":1,\"launch\":1,\"burrows\":1},\"tips\":{\"first\":1,\"nig' +
    'ht\":1,\"dig\":1},\"n\":{\"wish\":25,\"talks\":710},\"daily\":{\"d\":\"2026-10-25\",\"dig\":[1,2,4],\"got\":[7],\"dot\":1,\"n\":214},\"last\":\"park\"},\"mini\":{\"own\":' +
    '{},\"best\":{\"1\":592,\"2\":150,\"3\":403,\"4\":574,\"5\":817,\"6\":686,\"7\":164,\"8\":584,\"9\":188,\"10\":509,\"11\":513,\"12\":672,\"13\":68,\"14\":518,\"15\":49},\"' +
    'plays\":321,\"last\":1761400000000,\"hat\":\"cap\",\"boot\":\"red\"},\"album\":[{\"code\":\"E1JHsmuAyefriUiogd9rdJWTA7Kso_Kinx-cbcQ3QxRqKGtpIfwShK9rk6qu\",\"t\":176212963' +
    '5268,\"name\":\"Photo 1\"},{\"code\":\"BS3hSb_D_l3z1o9ht-0zKmmcRAgKjoYYR1FgSwh_37nLZODlP6O_4uqoELDt\",\"t\":1761688823992,\"name\":\"Photo 2\"},{\"code\":\"TM9gf1UOCPC4Qa' +
    'I5CUsBdrj9Xu_EPGKSiUprVQa2sOfEIOM8GdMzfg_W91vH\",\"t\":1762130469853,\"name\":\"Photo 3\"}],\"outfits\":[{\"s\":3,\"p\":2,\"t\":1,\"g\":4,\"n\":\"Sunday\"},{\"s\":1,\"p\"' +
    ':0,\"t\":3,\"g\":2,\"n\":\"Frost\"}],\"wardSeen\":{\"1\":1,\"2\":1,\"3\":1,\"4\":1,\"5\":1,\"6\":1,\"7\":1,\"8\":1,\"9\":1,\"10\":1,\"11\":1,\"12\":1,\"13\":1,\"14\":1,\"' +
    '15\":1},\"skinCol\":3,\"spotCol\":2,\"patCol\":1,\"gearCol\":4}';
  const PRIMER_BYTES = function(){ return new TextEncoder().encode(PRIMER); };
  const squashT = [1, 2, 3, 6, 10, 16, 27, 45, 73, 120, 194, 310, 488, 747, 1101, 1546, 2047, 2549, 2994, 3348, 3607, 3785, 3901, 3975, 4022, 4050, 4068, 4079, 4085, 4089, 4092, 4093, 4094];
  const squash = function(d){
    if (d > 2047) return 4095;
    if (d < -2047) return 0;
    const w = d & 127, i = (d >> 7) + 16;
    return (squashT[i] * (128 - w) + squashT[i + 1] * w + 64) >> 7;
  };
  const stretchT = new Int16Array(4096);
  (function(){ let pi = 0; for (let x = -2047; x <= 2047; x++){ const v = squash(x); for (let i = pi; i <= v; i++) stretchT[i] = x; pi = v + 1; } for (let i = pi; i < 4096; i++) stretchT[i] = 2047; })();
  const RATE = new Int32Array(256);
  for (let n = 0; n < 256; n++) RATE[n] = Math.round(32768 / (n + 1.5));
  const TB = 19, TSZ = 1 << TB, NCTX = 8, NIN = NCTX + 2, LIMIT_N = 127, MINLEN = 6, MTB = 18;
  const OFF = [0, 256, 256 + 65536], BUFMAX = (1 << 20) + (1 << 16);
  for (let i = 3; i < NCTX; i++) OFF.push(OFF[i - 1] + TSZ);
  const TOTAL = OFF[NCTX - 1] + TSZ;
  function makeModel(){
    const tp = new Uint32Array(TOTAL), base = new Int32Array(NCTX);                      /* a slot: probability in the top 16 bits, how often it was seen in the low 16 */
    const mixW = new Int32Array(256 * NIN), mixW2 = new Int32Array(1024 * NIN);
    const apm1 = new Uint16Array(65536 * 33), apm2 = new Uint16Array(65536 * 33);
    const mmp = new Uint16Array(64), mtab = new Int32Array(1 << MTB), buf = new Uint8Array(BUFMAX);
    const idx = new Int32Array(NCTX), hs = new Int32Array(NCTX), x = new Int32Array(NIN);
    let pos = 0, c0 = 1, bit = 0, mptr = 0, mlen = 0, kh = 0, vh = 0, vlen = 0, inStr = 0, esc = 0, lastStr = 0, sh = 0, c1 = 0, ph = 0, sp = 0;
    const stack = new Int32Array(64);
    let pm = 2048, pm2 = 2048, a1 = 0, a2 = 0, w1 = 0, mi = -1, mexp = 0, ws = 0, ws2 = 0;
    let snap = null;
    function resetAll(){
      tp.fill(0x80000000);
      for (let s = 0; s < 256; s++) for (let i = 0; i < NIN; i++) mixW[s * NIN + i] = 1 << 14;
      for (let s = 0; s < 1024; s++) for (let i = 0; i < NIN; i++) mixW2[s * NIN + i] = 1 << 14;
      for (let j = 0; j < 33; j++) apm1[j] = squash((j - 16) * 128) * 16;
      for (let n = 33; n < apm1.length; n *= 2) apm1.copyWithin(n, 0, Math.min(n, apm1.length - n));                  /* every context starts from the same curve */
      apm2.set(apm1);
      mmp.fill(49152); mtab.fill(0); buf.fill(0);
      pos = 0; c0 = 1; bit = 0; mptr = 0; mlen = 0; kh = 0; vh = 0; vlen = 0; inStr = 0; esc = 0; lastStr = 0; sh = 0; c1 = 0; ph = 0; sp = 0;
      byteContexts();
    }
    function byteContexts(){                                                  /* contexts that only change when a whole byte has been coded */
      c1 = pos > 0 ? buf[pos - 1] : 0;
      const c2 = pos > 1 ? buf[pos - 2] : 0, c3 = pos > 2 ? buf[pos - 3] : 0, c4 = pos > 3 ? buf[pos - 4] : 0;
      hs[2] = Math.imul(c1 | (c2 << 8) | 0x10000, 0x2545F491);
      hs[3] = Math.imul(c1 | (c2 << 8) | (c3 << 16) | 0x2000000, 0x2545F491) ^ 0x1B873593;
      hs[4] = Math.imul(Math.imul(c1 | (c2 << 8) | (c3 << 16) | (c4 << 24), 0x2545F491) ^ 0x3C6EF372, 0x85EBCA6B);
      hs[5] = Math.imul(Math.imul(ph ^ 0x3A9D1E57, 0x2545F491) + (inStr ? sh : vh) + (inStr << 1), 0x85EBCA6B);                /* the enclosing object's name + the key or value typed so far */
      hs[6] = Math.imul(kh + 0x1F3D5B79, 0x2545F491) ^ Math.imul(vlen + 1, 0x85EBCA6B);                 /* field name + how far into its value */
      hs[7] = Math.imul(Math.imul(kh ^ 0x7F4A7C15, 0x2545F491) + vh, 0x85EBCA6B) ^ Math.imul(c1, 0x1B873593);   /* field name + the value so far */
    }
    function ctxIndex(){
      idx[0] = c0; idx[1] = OFF[1] + (c1 << 8 | c0);
      if ((bit & 3) === 0){                                                   /* hashed contexts own a 16-slot block per half byte: one memory fetch for four bits */
        for (let i = 2; i < NCTX; i++) base[i] = OFF[i] + ((Math.imul(hs[i] + (bit ? c0 : 0), 0x9E3779B1) >>> (32 - TB + 4)) << 4);
      }
      const nib = bit < 4 ? c0 : ((c0 & ((1 << (bit - 4)) - 1)) | (1 << (bit - 4)));
      for (let i = 2; i < NCTX; i++) idx[i] = base[i] + nib;
    }
    function predict(){
      ctxIndex();
      for (let i = 0; i < NCTX; i++) x[i] = stretchT[tp[idx[i]] >>> 20];
      mi = -1; x[NCTX] = 0;
      if (mlen > 0){
        const pb = buf[mptr];
        if (((pb | 256) >> (8 - bit)) === c0){
          mexp = (pb >> (7 - bit)) & 1; mi = mlen > 63 ? 63 : mlen;
          const sv = stretchT[mmp[mi] >> 4]; x[NCTX] = mexp ? sv : -sv;
        }
      }
      x[NCTX + 1] = 256;
      ws = c0 * NIN;
      ws2 = ((mlen > 31 ? 3 : mlen > 15 ? 2 : mlen > 0 ? 1 : 0) << 8 | c1) * NIN;
      let d1 = 0, d2 = 0;
      for (let i = 0; i < NIN; i++){ const xi = x[i]; d1 += mixW[ws + i] * xi; d2 += mixW2[ws2 + i] * xi; }
      d1 = Math.floor(d1 / 65536); d2 = Math.floor(d2 / 65536);
      d1 = d1 > 2047 ? 2047 : d1 < -2047 ? -2047 : d1; d2 = d2 > 2047 ? 2047 : d2 < -2047 ? -2047 : d2;
      pm = squash(d1); pm2 = squash(d2);
      const dm = (d1 + d2) >> 1, sm = dm + 2048, lo = sm >> 7, w = sm & 127, c2 = pos > 1 ? buf[pos - 2] : 0;
      a1 = (c0 | (c1 << 8)) * 33 + lo; a2 = (Math.imul(c0 | (c1 << 8) | (c2 << 16), 0x9E3779B1) >>> 16) * 33 + lo; w1 = w;
      const p1 = (apm1[a1] * (128 - w) + apm1[a1 + 1] * w) >> 11, p2 = (apm2[a2] * (128 - w) + apm2[a2 + 1] * w) >> 11;
      const pr = (2 * squash(dm) + p1 + p2 + 2) >> 2;
      return pr < 1 ? 1 : pr > 4095 ? 4095 : pr;
    }
    function update(y){
      const t = y ? 65535 : 0;
      for (let i = 0; i < NCTX; i++){
        const j = idx[i], v = tp[j], c = v & 65535, pv = v >>> 16;
        tp[j] = ((pv + (((t - pv) * RATE[c]) >> 15)) << 16 | (c < LIMIT_N ? c + 1 : c)) >>> 0;
      }
      if (mi >= 0) mmp[mi] += (((y === mexp) ? 65535 : 0) - mmp[mi]) >> 6;
      const e1 = ((y << 12) - pm) * 6, e2 = ((y << 12) - pm2) * 6;
      for (let i = 0; i < NIN; i++){
        const xi = x[i];
        mixW[ws + i] += (xi * e1 + 0x8000) >> 16;
        mixW2[ws2 + i] += (xi * e2 + 0x8000) >> 16;
      }
      const k = w1 >> 6;
      apm1[a1 + k] += (t - apm1[a1 + k]) >> 6; apm2[a2 + k] += (t - apm2[a2 + k]) >> 6;
      c0 = (c0 << 1) | y; bit++;
      if (bit === 8) endByte(c0 & 255);
    }
    function endByte(c){
      buf[pos++] = c; c0 = 1; bit = 0;
      /* the JSON-aware part: which field are we in, and what has its value looked like so far */
      if (inStr){
        if (esc) esc = 0; else if (c === 92) esc = 1; else if (c === 34){ inStr = 0; lastStr = sh; }
        else sh = Math.imul(sh ^ c, 0x01000193);
      } else if (c === 34){ inStr = 1; sh = 0x811C9DC5 | 0; }
      if (c === 58){ kh = lastStr | 0; vh = 0; vlen = 0; }                                           /* a colon: the string before it was the field name */
      else if (c === 44 || c === 123 || c === 125 || c === 91 || c === 93){
        vh = 0; vlen = 0;
        if (c === 123 || c === 91){ if (sp < 63) stack[sp++] = ph; ph = kh; }                          /* going into an object or list: remember the name it hangs under */
        else if (c === 125 || c === 93){ ph = sp > 0 ? stack[--sp] : 0; }
      }
      else { vh = Math.imul(vh ^ c, 0x01000193); vlen = vlen < 255 ? vlen + 1 : 255; }
      if (mlen > 0 && buf[mptr] === c){ mlen++; mptr++; } else mlen = 0;
      if (pos >= MINLEN){
        let h = 0; for (let i = 1; i <= MINLEN; i++) h = Math.imul(h ^ buf[pos - i], 0x01000193);
        h = (h >>> 0) >>> (32 - MTB);
        if (mlen === 0){
          const cand = mtab[h];
          if (cand > 0){ let l = 0; while (l < 32 && cand - 1 - l >= 0 && buf[cand - 1 - l] === buf[pos - 1 - l]) l++; if (l >= MINLEN){ mlen = l; mptr = cand; } }
        }
        mtab[h] = pos;
      }
      byteContexts();
    }
    function prime(bytes){                                                      /* the primer only trains the counters and the match model: the mixer and refiners learn from the save itself */
      for (let k = 0; k < bytes.length; k++){
        const c = bytes[k];
        for (let i = 7; i >= 0; i--){
          ctxIndex();
          const y = (c >> i) & 1, t = y ? 65535 : 0;
          for (let q = 0; q < NCTX; q++){
            const j = idx[q], v = tp[j], cn = v & 65535, pv = v >>> 16;
            tp[j] = ((pv + (((t - pv) * RATE[cn]) >> 15)) << 16 | (cn < LIMIT_N ? cn + 1 : cn)) >>> 0;
          }
          c0 = (c0 << 1) | y; bit++;
          if (bit === 8) endByte(c0 & 255);
        }
      }
    }
    function vars(){ return [pos, c0, bit, mptr, mlen, kh, vh, vlen, inStr, esc, lastStr, sh, ph, sp, stack.slice()]; }
    return {
      begin: function(){ resetAll(); prime(PRIMER_BYTES()); },                    /* a fresh model that has read the primer */
      mark: function(){ snap = { tp: tp.slice(), mixW: mixW.slice(), mixW2: mixW2.slice(), apm1: apm1.slice(), apm2: apm2.slice(), mmp: mmp.slice(), mtab: mtab.slice(), buf: buf.slice(0, pos), v: vars() }; },
      rewind: function(){                                                         /* back to the marked state (the primed model), without reading the primer again */
        tp.set(snap.tp); mixW.set(snap.mixW); mixW2.set(snap.mixW2); apm1.set(snap.apm1); apm2.set(snap.apm2); mmp.set(snap.mmp); mtab.set(snap.mtab);
        buf.fill(0); buf.set(snap.buf); const v = snap.v;
        pos = v[0]; c0 = v[1]; bit = v[2]; mptr = v[3]; mlen = v[4]; kh = v[5]; vh = v[6]; vlen = v[7]; inStr = v[8]; esc = v[9]; lastStr = v[10]; sh = v[11]; ph = v[12]; sp = v[13]; stack.set(v[14]);
        byteContexts();
      },
      predict: predict, update: update
    };
  }
  /* arithmetic coder, 32-bit, carry-less. The decoder reads zeros past the end of the data, so the encoder drops trailing zero bytes. */
  function cmEncode(M, raw){
    const out = [];
    let x1 = 0, x2 = 0xFFFFFFFF;
    for (let k = 0; k < raw.length; k++){
      const c = raw[k];
      for (let i = 7; i >= 0; i--){
        const y = (c >> i) & 1, p = M.predict() << 4, range = x2 - x1;
        const xmid = x1 + Math.floor(range / 65536) * p + Math.floor(((range % 65536) * p) / 65536);
        if (y) x2 = xmid; else x1 = xmid + 1;
        M.update(y);
        while (((x1 ^ x2) & 0xFF000000) === 0){ out.push(x2 >>> 24); x1 = (x1 << 8) >>> 0; x2 = ((x2 << 8) | 255) >>> 0; }
      }
    }
    for (let nb = 1; nb <= 4; nb++){                                              /* the fewest bytes that still pin the final interval */
      const sh = 32 - 8 * nb, unit = Math.pow(2, sh), v = Math.ceil(x1 / unit) * unit;
      if (v <= x2){ for (let j = 0; j < nb; j++) out.push(Math.floor(v / Math.pow(2, 24 - 8 * j)) & 255); break; }
    }
    while (out.length && out[out.length - 1] === 0) out.pop();
    return Uint8Array.from(out);
  }
  function cmDecode(M, data, n){
    const out = new Uint8Array(n);
    let x1 = 0, x2 = 0xFFFFFFFF, x = 0, ip = 0;
    for (let j = 0; j < 4; j++) x = ((x << 8) | (ip < data.length ? data[ip++] : 0)) >>> 0;
    for (let k = 0; k < n; k++){
      let c = 0;
      for (let i = 7; i >= 0; i--){
        const p = M.predict() << 4, range = x2 - x1;
        const xmid = x1 + Math.floor(range / 65536) * p + Math.floor(((range % 65536) * p) / 65536);
        const y = x <= xmid ? 1 : 0;
        if (y) x2 = xmid; else x1 = xmid + 1;
        M.update(y); c = (c << 1) | y;
        while (((x1 ^ x2) & 0xFF000000) === 0){ x1 = (x1 << 8) >>> 0; x2 = ((x2 << 8) | 255) >>> 0; x = ((x << 8) | (ip < data.length ? data[ip++] : 0)) >>> 0; }
      }
      out[k] = c;
    }
    return out;
  }
  /* base 91 text: the printable ASCII characters that need no escaping inside a JSON string (not the quote, not the backslash), four bytes to five characters */
  const A91 = (function(){ let s = ''; for (let c = 35; c <= 126; c++) if (c !== 92) s += String.fromCharCode(c); return s; })();
  const D91 = (function(){ const m = {}; for (let i = 0; i < A91.length; i++) m[A91.charAt(i)] = i; return m; })();
  function toText(bytes){
    let s = '';
    for (let i = 0; i < bytes.length; i += 4){
      const r = Math.min(4, bytes.length - i);
      let v = 0; for (let j = 0; j < r; j++) v = v * 256 + bytes[i + j];
      let t = ''; for (let j = 0; j < r + 1; j++){ t = A91.charAt(v % 91) + t; v = Math.floor(v / 91); }
      s += t;
    }
    return s;
  }
  function fromText(s){
    const out = [];
    for (let i = 0; i < s.length; i += 5){
      const r = Math.min(5, s.length - i);
      let v = 0; for (let j = 0; j < r; j++){ const d = D91[s.charAt(i + j)]; if (d === undefined) throw new Error('char'); v = v * 91 + d; }
      for (let j = r - 2; j >= 0; j--) out.push(Math.floor(v / Math.pow(256, j)) % 256);
    }
    return Uint8Array.from(out);
  }
  function check16(b){ let h = 0x811C9DC5 | 0; for (let i = 0; i < b.length; i++) h = Math.imul(h ^ b[i], 0x01000193); return ((h >>> 16) ^ h) & 65535; }
  const MAXTEXT = 1 << 20;                                                      /* longer saves than this use GR2 (the model's history buffer is sized for it) */
  let lastJson = null, lastCode = null;
  function encode3(json){
    if (json === lastJson) return lastCode;
    const raw = new TextEncoder().encode(json), n = raw.length;
    if (n > MAXTEXT) return null;
    const m = makeModel();                                                    /* the model lives only for this call: its tables are about 20 MB, so they are not kept */
    m.begin(); m.mark();
    const body = cmEncode(m, raw);
    const head = []; for (let v = n; ; v = Math.floor(v / 128)){ head.push(v >= 128 ? (v % 128) | 128 : v); if (v < 128) break; }
    const sum = check16(raw);
    const code = MAGIC3 + toText(Uint8Array.from(head.concat([sum >> 8, sum & 255], Array.from(body))));
    m.rewind();
    if (readCode3(m, code) !== json) return null;                             /* never trust the new codec blindly: if it did not give the text back, use the old one */
    lastJson = json; lastCode = code;
    return code;
  }
  function readCode3(m, str){
    const bytes = fromText(str.slice(MAGIC3.length));
    let n = 0, mul = 1, i = 0;
    for (; i < bytes.length; i++){ n += (bytes[i] & 127) * mul; mul *= 128; if (!(bytes[i] & 128)) { i++; break; } }
    if (n > MAXTEXT || n > 65536 + 400 * (bytes.length - i)) throw new Error('size');                 /* a damaged length must not make the decoder run for seconds */
    const sum = (bytes[i] << 8) | bytes[i + 1], raw = cmDecode(m, bytes.subarray(i + 2), n);
    if (check16(raw) !== sum) throw new Error('check');                       /* a flipped character would otherwise decode to different, still valid, JSON */
    return new TextDecoder().decode(raw);
  }
  function decode3(str){
    const m = makeModel(); m.begin();
    return readCode3(m, str);
  }
  /* Writing. Save.write() runs often, and the GR3 model takes a few hundred milliseconds, so a write is stored at once in GR2 (fast) and the same text is
     repacked as GR3 later: after a quiet moment (not in the middle of a run), or as soon as the page is hidden. If anything else was written in between,
     or the repack does not give the text back, the GR2 copy simply stays. */
  const WRITE3 = false;                                                       /* false: read GR3 but only write GR2 by itself (the first release, so every copy of the game can read GR3 before any writes it); flush() still repacks on demand */
  let pendingJson = null, lastFast = null, timer = 0;
  function wrote(raw){
    if (!pendingJson) return;
    lastFast = raw;
    if (!WRITE3) return;
    clearTimeout(timer); timer = setTimeout(function(){ upgrade(false); }, 4000);
  }
  function upgrade(force){
    timer = 0;
    try {
      if (!lastFast) return false;
      if (!force && typeof G !== 'undefined' && (G.state === 'playing' || G.state === 'sail')){ timer = setTimeout(function(){ upgrade(false); }, 8000); return false; }
      const ls = window.localStorage;
      if (ls.getItem(SAVE_KEY) !== lastFast) { lastFast = null; return false; }           /* something else wrote since: leave it alone */
      const code = encode3(pendingJson);
      if (!code || ls.getItem(SAVE_KEY) !== lastFast) return false;
      ls.setItem(SAVE_KEY, JSON.stringify(code)); lastFast = null;
      return true;
    } catch (e) { return false; }
  }
  if (typeof document !== 'undefined' && document.addEventListener){
    document.addEventListener('visibilitychange', function(){ if (WRITE3 && document.hidden && lastFast) upgrade(true); });
    window.addEventListener('pagehide', function(){ if (WRITE3 && lastFast) upgrade(true); });
  }
  function encodeFast(obj){ pendingJson = JSON.stringify(obj); return encode2(pendingJson); }
  function encode(obj){
    const json = JSON.stringify(obj);
    try { const c3 = encode3(json); if (c3) return c3; } catch (e) { }
    return encode2(json);
  }
  function encode2(json){                                                     /* GR2: LZW, kept as the fallback and still read forever */
    const raw = new TextEncoder().encode(json), n = raw.length;
    const z = lzw(raw), useZ = z.length < raw.length, body = useZ ? z : raw;
    const buf = new Uint8Array(5 + body.length);
    buf[0] = useZ ? 1 : 0; buf[1] = (n >>> 24) & 255; buf[2] = (n >>> 16) & 255; buf[3] = (n >>> 8) & 255; buf[4] = n & 255;
    buf.set(body, 5);
    return MAGIC + b64(buf);
  }
  function decode(str){
    try {
      if (typeof str !== 'string') return (str && typeof str === 'object') ? str : null;
      let s = str.trim();
      if (s.charAt(0) === '"'){ const v = JSON.parse(s); return typeof v === 'string' ? decode(v) : (v && typeof v === 'object' ? v : null); }
      if (s.charAt(0) === '{' || s.charAt(0) === '[') return JSON.parse(s);
      if (s.indexOf(MAGIC3) === 0) return JSON.parse(decode3(s));
      if (s.indexOf(MAGIC) !== 0) return null;
      const buf = unb64(s.slice(MAGIC.length));
      const n = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0, body = buf.subarray(5);
      if (n > 64 * 1024 * 1024) return null;
      const raw = buf[0] === 1 ? unlzw(body, n) : body;
      if (raw.length !== n) return null;
      return JSON.parse(new TextDecoder().decode(raw));
    } catch (e) { return null; }
  }
  return { encode: encode, encodeFast: encodeFast, wrote: wrote, flush: function(){ return upgrade(true); }, decode: decode, MAGIC: MAGIC, MAGIC3: MAGIC3 };
})();

window.GRSave = {
  key: 'giraffe_rampage_save_v1',
  encode: GRPack.encode,
  decode: GRPack.decode,
  flush: GRPack.flush,                                                          /* repack the last write as GR3 right now (it happens by itself a few seconds after a write) */
  read: function(){ try { return GRPack.decode(window.localStorage.getItem(this.key)); } catch (e) { return null; } },
  stats: function(obj){
    obj = obj || (typeof Save !== 'undefined' ? Save.data : null) || {};
    const j = JSON.stringify(obj).length, p = GRPack.encode(obj).length;
    return { json: j, packed: p, ratio: j ? p / j : 1 };
  }
};
