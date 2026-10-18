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

   window.GRSave is the public face of this, for the hosting page and for tests:
       GRSave.key            the localStorage key
       GRSave.encode(obj)    object -> "GR2:..." string
       GRSave.decode(str)    "GR2:..." string, a JSON string literal of one, or a JSON object text -> object (or null)
       GRSave.read()         the current save in localStorage as an object (or null)
       GRSave.stats(obj)     { json, packed, ratio } sizes in characters, for the given object (default: the live save) */
const GRPack = (function(){
  const MAGIC = 'GR2:', LIMIT = 65536 - 256;
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
  function encode(obj){
    const raw = new TextEncoder().encode(JSON.stringify(obj)), n = raw.length;
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
      if (s.indexOf(MAGIC) !== 0) return null;
      const buf = unb64(s.slice(MAGIC.length));
      const n = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0, body = buf.subarray(5);
      if (n > 64 * 1024 * 1024) return null;
      const raw = buf[0] === 1 ? unlzw(body, n) : body;
      if (raw.length !== n) return null;
      return JSON.parse(new TextDecoder().decode(raw));
    } catch (e) { return null; }
  }
  return { encode: encode, decode: decode, MAGIC: MAGIC };
})();

window.GRSave = {
  key: 'giraffe_rampage_save_v1',
  encode: GRPack.encode,
  decode: GRPack.decode,
  read: function(){ try { return GRPack.decode(window.localStorage.getItem(this.key)); } catch (e) { return null; } },
  stats: function(obj){
    obj = obj || (typeof Save !== 'undefined' ? Save.data : null) || {};
    const j = JSON.stringify(obj).length, p = GRPack.encode(obj).length;
    return { json: j, packed: p, ratio: j ? p / j : 1 };
  }
};
