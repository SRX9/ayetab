import type { ToolResult } from "../types";

/**
 * Shavian transliteration.
 *
 * Shavian is phonemic, so a faithful transliteration needs pronunciation data.
 * This module pairs a hand-checked dictionary of the most common English words
 * with a rule-based grapheme-to-phoneme fallback for everything else. The
 * fallback is an approximation — output for unusual or loan words is flagged.
 */

// ── Alphabet ────────────────────────────────────────────────────────────────

/** Phoneme → Shavian letter. Keys use a simplified ARPAbet. */
const PHONEME_TO_SHAVIAN: Record<string, string> = {
  // Consonants (tall/deep pairs)
  P: "𐑐", B: "𐑚",
  T: "𐑑", D: "𐑛",
  K: "𐑒", G: "𐑜",
  F: "𐑓", V: "𐑝",
  TH: "𐑔", DH: "𐑞",
  S: "𐑕", Z: "𐑟",
  SH: "𐑖", ZH: "𐑠",
  CH: "𐑗", JH: "𐑡",
  Y: "𐑘", W: "𐑢",
  NG: "𐑙", HH: "𐑣",
  L: "𐑤", R: "𐑮",
  M: "𐑥", N: "𐑯",
  // Vowels (short/long pairs)
  IH: "𐑦", IY: "𐑰",
  EH: "𐑧", EY: "𐑱",
  AE: "𐑨", AY: "𐑲",
  AX: "𐑩", AH: "𐑳",
  AO: "𐑪", OW: "𐑴",
  UH: "𐑫", UW: "𐑵",
  AW: "𐑬", OY: "𐑶",
  AA: "𐑭", AOO: "𐑷",
  // R-coloured
  AAR: "𐑸", AOR: "𐑹",
  EHR: "𐑺", ER: "𐑻",
  AXR: "𐑼", IHR: "𐑽",
  IA: "𐑾", YUW: "𐑿",
};

export const SHAVIAN_ALPHABET: Array<{ letter: string; name: string; sound: string }> = [
  { letter: "𐑐", name: "peep", sound: "p" },
  { letter: "𐑚", name: "bib", sound: "b" },
  { letter: "𐑑", name: "tot", sound: "t" },
  { letter: "𐑛", name: "dead", sound: "d" },
  { letter: "𐑒", name: "kick", sound: "k" },
  { letter: "𐑜", name: "gag", sound: "g" },
  { letter: "𐑓", name: "fee", sound: "f" },
  { letter: "𐑝", name: "vow", sound: "v" },
  { letter: "𐑔", name: "thigh", sound: "th (voiceless)" },
  { letter: "𐑞", name: "they", sound: "th (voiced)" },
  { letter: "𐑕", name: "so", sound: "s" },
  { letter: "𐑟", name: "zoo", sound: "z" },
  { letter: "𐑖", name: "sure", sound: "sh" },
  { letter: "𐑠", name: "measure", sound: "zh" },
  { letter: "𐑗", name: "church", sound: "ch" },
  { letter: "𐑡", name: "judge", sound: "j" },
  { letter: "𐑘", name: "yea", sound: "y" },
  { letter: "𐑢", name: "woe", sound: "w" },
  { letter: "𐑙", name: "hung", sound: "ng" },
  { letter: "𐑣", name: "ha-ha", sound: "h" },
  { letter: "𐑤", name: "loll", sound: "l" },
  { letter: "𐑮", name: "roar", sound: "r" },
  { letter: "𐑥", name: "mime", sound: "m" },
  { letter: "𐑯", name: "nun", sound: "n" },
  { letter: "𐑦", name: "if", sound: "i" },
  { letter: "𐑰", name: "eat", sound: "ee" },
  { letter: "𐑧", name: "egg", sound: "e" },
  { letter: "𐑱", name: "age", sound: "ay" },
  { letter: "𐑨", name: "ash", sound: "a" },
  { letter: "𐑲", name: "ice", sound: "eye" },
  { letter: "𐑩", name: "ado", sound: "schwa" },
  { letter: "𐑳", name: "up", sound: "u" },
  { letter: "𐑪", name: "on", sound: "o" },
  { letter: "𐑴", name: "oak", sound: "oh" },
  { letter: "𐑫", name: "wool", sound: "uu" },
  { letter: "𐑵", name: "ooze", sound: "oo" },
  { letter: "𐑬", name: "out", sound: "ow" },
  { letter: "𐑶", name: "oil", sound: "oy" },
  { letter: "𐑭", name: "ah", sound: "ah" },
  { letter: "𐑷", name: "awe", sound: "aw" },
  { letter: "𐑸", name: "are", sound: "ar" },
  { letter: "𐑹", name: "or", sound: "or" },
  { letter: "𐑺", name: "air", sound: "air" },
  { letter: "𐑻", name: "err", sound: "er (stressed)" },
  { letter: "𐑼", name: "array", sound: "er (unstressed)" },
  { letter: "𐑽", name: "ear", sound: "ear" },
  { letter: "𐑾", name: "Ian", sound: "ia" },
  { letter: "𐑿", name: "yew", sound: "yoo" },
];

// ── Dictionary ──────────────────────────────────────────────────────────────

/**
 * Shavian spellings for high-frequency words, where rule-based conversion is
 * least reliable. Covers roughly the top 300 words of written English plus
 * common irregulars.
 */
const DICTIONARY: Record<string, string> = {
  a: "𐑩", about: "𐑩𐑚𐑬𐑑", above: "𐑩𐑚𐑳𐑝", after: "𐑭𐑓𐑑𐑼", again: "𐑩𐑜𐑧𐑯", against: "𐑩𐑜𐑧𐑯𐑕𐑑",
  all: "𐑷𐑤", almost: "𐑷𐑤𐑥𐑴𐑕𐑑", also: "𐑷𐑤𐑕𐑴", although: "𐑷𐑤𐑞𐑴", always: "𐑷𐑤𐑢𐑱𐑟",
  am: "𐑨𐑥", among: "𐑩𐑥𐑳𐑙", an: "𐑩𐑯", and: "𐑯", another: "𐑩𐑯𐑳𐑞𐑼", answer: "𐑭𐑯𐑕𐑼",
  any: "𐑧𐑯𐑦", anything: "𐑧𐑯𐑦𐑔𐑦𐑙", are: "𐑸", around: "𐑩𐑮𐑬𐑯𐑛", as: "𐑨𐑟", ask: "𐑭𐑕𐑒",
  at: "𐑨𐑑", away: "𐑩𐑢𐑱", back: "𐑚𐑨𐑒", bad: "𐑚𐑨𐑛", be: "𐑚𐑰", because: "𐑚𐑦𐑒𐑪𐑟",
  become: "𐑚𐑦𐑒𐑳𐑥", been: "𐑚𐑰𐑯", before: "𐑚𐑦𐑓𐑹", begin: "𐑚𐑦𐑜𐑦𐑯", behind: "𐑚𐑦𐑣𐑲𐑯𐑛",
  being: "𐑚𐑰𐑦𐑙", believe: "𐑚𐑦𐑤𐑰𐑝", best: "𐑚𐑧𐑕𐑑", better: "𐑚𐑧𐑑𐑼", between: "𐑚𐑦𐑑𐑢𐑰𐑯",
  big: "𐑚𐑦𐑜", body: "𐑚𐑪𐑛𐑦", book: "𐑚𐑫𐑒", both: "𐑚𐑴𐑔", boy: "𐑚𐑶", bring: "𐑚𐑮𐑦𐑙",
  build: "𐑚𐑦𐑤𐑛", business: "𐑚𐑦𐑟𐑯𐑦𐑕", but: "𐑚𐑳𐑑", buy: "𐑚𐑲", by: "𐑚𐑲", call: "𐑒𐑷𐑤",
  can: "𐑒𐑨𐑯", car: "𐑒𐑸", care: "𐑒𐑺", carry: "𐑒𐑨𐑮𐑦", case: "𐑒𐑱𐑕", catch: "𐑒𐑨𐑗",
  change: "𐑗𐑱𐑯𐑡", child: "𐑗𐑲𐑤𐑛", children: "𐑗𐑦𐑤𐑛𐑮𐑩𐑯", city: "𐑕𐑦𐑑𐑦", class: "𐑒𐑤𐑭𐑕",
  clear: "𐑒𐑤𐑽", close: "𐑒𐑤𐑴𐑟", come: "𐑒𐑳𐑥", company: "𐑒𐑳𐑥𐑐𐑩𐑯𐑦", could: "𐑒𐑫𐑛",
  country: "𐑒𐑳𐑯𐑑𐑮𐑦", course: "𐑒𐑹𐑕", create: "𐑒𐑮𐑦𐑱𐑑", cut: "𐑒𐑳𐑑", day: "𐑛𐑱",
  do: "𐑛𐑵", does: "𐑛𐑳𐑟", done: "𐑛𐑳𐑯", down: "𐑛𐑬𐑯", draw: "𐑛𐑮𐑷", during: "𐑛𐑿𐑼𐑦𐑙",
  each: "𐑰𐑗", early: "𐑻𐑤𐑦", eat: "𐑰𐑑", eight: "𐑱𐑑", either: "𐑲𐑞𐑼", end: "𐑧𐑯𐑛",
  enough: "𐑦𐑯𐑳𐑓", even: "𐑰𐑝𐑩𐑯", ever: "𐑧𐑝𐑼", every: "𐑧𐑝𐑮𐑦", example: "𐑦𐑜𐑟𐑭𐑥𐑐𐑩𐑤",
  eye: "𐑲", face: "𐑓𐑱𐑕", fact: "𐑓𐑨𐑒𐑑", family: "𐑓𐑨𐑥𐑦𐑤𐑦", far: "𐑓𐑭", father: "𐑓𐑭𐑞𐑼",
  feel: "𐑓𐑰𐑤", few: "𐑓𐑿", find: "𐑓𐑲𐑯𐑛", first: "𐑓𐑻𐑕𐑑", follow: "𐑓𐑪𐑤𐑴", food: "𐑓𐑵𐑛",
  for: "𐑓", form: "𐑓𐑹𐑥", found: "𐑓𐑬𐑯𐑛", four: "𐑓𐑹", friend: "𐑓𐑮𐑧𐑯𐑛", from: "𐑓𐑮𐑪𐑥",
  full: "𐑓𐑫𐑤", game: "𐑜𐑱𐑥", general: "𐑡𐑧𐑯𐑼𐑩𐑤", get: "𐑜𐑧𐑑", girl: "𐑜𐑻𐑤", give: "𐑜𐑦𐑝",
  go: "𐑜𐑴", going: "𐑜𐑴𐑦𐑙", good: "𐑜𐑫𐑛", got: "𐑜𐑪𐑑", government: "𐑜𐑳𐑝𐑼𐑯𐑥𐑩𐑯𐑑",
  great: "𐑜𐑮𐑱𐑑", group: "𐑜𐑮𐑵𐑐", grow: "𐑜𐑮𐑴", had: "𐑣𐑨𐑛", hand: "𐑣𐑨𐑯𐑛", happen: "𐑣𐑨𐑐𐑩𐑯",
  hard: "𐑣𐑭𐑛", has: "𐑣𐑨𐑟", have: "𐑣𐑨𐑝", he: "𐑣𐑰", head: "𐑣𐑧𐑛", hear: "𐑣𐑽", help: "𐑣𐑧𐑤𐑐",
  her: "𐑣𐑻", here: "𐑣𐑽", high: "𐑣𐑲", him: "𐑣𐑦𐑥", his: "𐑣𐑦𐑟", hold: "𐑣𐑴𐑤𐑛", home: "𐑣𐑴𐑥",
  hour: "𐑬𐑼", house: "𐑣𐑬𐑕", how: "𐑣𐑬", however: "𐑣𐑬𐑧𐑝𐑼", i: "𐑲", idea: "𐑲𐑛𐑽",
  if: "𐑦𐑓", important: "𐑦𐑥𐑐𐑹𐑑𐑩𐑯𐑑", in: "𐑦𐑯", include: "𐑦𐑯𐑒𐑤𐑵𐑛", information: "𐑦𐑯𐑓𐑼𐑥𐑱𐑖𐑩𐑯",
  interest: "𐑦𐑯𐑑𐑮𐑩𐑕𐑑", into: "𐑦𐑯𐑑𐑵", is: "𐑦𐑟", it: "𐑦𐑑", its: "𐑦𐑑𐑕", just: "𐑡𐑳𐑕𐑑",
  keep: "𐑒𐑰𐑐", kind: "𐑒𐑲𐑯𐑛", know: "𐑯𐑴", knew: "𐑯𐑿", land: "𐑤𐑨𐑯𐑛", large: "𐑤𐑭𐑡",
  last: "𐑤𐑭𐑕𐑑", late: "𐑤𐑱𐑑", laugh: "𐑤𐑭𐑓", lead: "𐑤𐑰𐑛", learn: "𐑤𐑻𐑯", leave: "𐑤𐑰𐑝",
  left: "𐑤𐑧𐑓𐑑", less: "𐑤𐑧𐑕", let: "𐑤𐑧𐑑", letter: "𐑤𐑧𐑑𐑼", life: "𐑤𐑲𐑓", light: "𐑤𐑲𐑑",
  like: "𐑤𐑲𐑒", line: "𐑤𐑲𐑯", listen: "𐑤𐑦𐑕𐑩𐑯", little: "𐑤𐑦𐑑𐑩𐑤", live: "𐑤𐑦𐑝", long: "𐑤𐑪𐑙",
  look: "𐑤𐑫𐑒", lot: "𐑤𐑪𐑑", love: "𐑤𐑳𐑝", made: "𐑥𐑱𐑛", make: "𐑥𐑱𐑒", man: "𐑥𐑨𐑯",
  many: "𐑥𐑧𐑯𐑦", may: "𐑥𐑱", me: "𐑥𐑰", mean: "𐑥𐑰𐑯", might: "𐑥𐑲𐑑", mind: "𐑥𐑲𐑯𐑛",
  money: "𐑥𐑳𐑯𐑦", month: "𐑥𐑳𐑯𐑔", more: "𐑥𐑹", morning: "𐑥𐑹𐑯𐑦𐑙", most: "𐑥𐑴𐑕𐑑",
  mother: "𐑥𐑳𐑞𐑼", move: "𐑥𐑵𐑝", much: "𐑥𐑳𐑗", music: "𐑥𐑿𐑟𐑦𐑒", must: "𐑥𐑳𐑕𐑑", my: "𐑥𐑲",
  name: "𐑯𐑱𐑥", near: "𐑯𐑽", need: "𐑯𐑰𐑛", never: "𐑯𐑧𐑝𐑼", new: "𐑯𐑿", news: "𐑯𐑿𐑟",
  next: "𐑯𐑧𐑒𐑕𐑑", night: "𐑯𐑲𐑑", no: "𐑯𐑴", not: "𐑯𐑪𐑑", nothing: "𐑯𐑳𐑔𐑦𐑙", now: "𐑯𐑬",
  number: "𐑯𐑳𐑥𐑚𐑼", of: "𐑝", off: "𐑪𐑓", offer: "𐑪𐑓𐑼", office: "𐑪𐑓𐑦𐑕", often: "𐑪𐑓𐑩𐑯",
  old: "𐑴𐑤𐑛", on: "𐑪𐑯", once: "𐑢𐑳𐑯𐑕", one: "𐑢𐑳𐑯", only: "𐑴𐑯𐑤𐑦", open: "𐑴𐑐𐑩𐑯",
  or: "𐑹", order: "𐑹𐑛𐑼", other: "𐑳𐑞𐑼", our: "𐑬𐑼", out: "𐑬𐑑", over: "𐑴𐑝𐑼", own: "𐑴𐑯",
  page: "𐑐𐑱𐑡", part: "𐑐𐑭𐑑", pay: "𐑐𐑱", people: "𐑐𐑰𐑐𐑩𐑤", perhaps: "𐑐𐑼𐑣𐑨𐑐𐑕",
  person: "𐑐𐑻𐑕𐑩𐑯", place: "𐑐𐑤𐑱𐑕", play: "𐑐𐑤𐑱", point: "𐑐𐑶𐑯𐑑", possible: "𐑐𐑪𐑕𐑩𐑚𐑩𐑤",
  power: "𐑐𐑬𐑼", present: "𐑐𐑮𐑧𐑟𐑩𐑯𐑑", problem: "𐑐𐑮𐑪𐑚𐑤𐑩𐑥", program: "𐑐𐑮𐑴𐑜𐑮𐑨𐑥",
  provide: "𐑐𐑮𐑩𐑝𐑲𐑛", public: "𐑐𐑳𐑚𐑤𐑦𐑒", put: "𐑐𐑫𐑑", question: "𐑒𐑢𐑧𐑕𐑗𐑩𐑯", quite: "𐑒𐑢𐑲𐑑",
  rather: "𐑮𐑭𐑞𐑼", read: "𐑮𐑰𐑛", ready: "𐑮𐑧𐑛𐑦", real: "𐑮𐑽𐑤", really: "𐑮𐑽𐑤𐑦",
  reason: "𐑮𐑰𐑟𐑩𐑯", remember: "𐑮𐑦𐑥𐑧𐑥𐑚𐑼", right: "𐑮𐑲𐑑", room: "𐑮𐑵𐑥", run: "𐑮𐑳𐑯",
  said: "𐑕𐑧𐑛", same: "𐑕𐑱𐑥", saw: "𐑕𐑷", say: "𐑕𐑱", school: "𐑕𐑒𐑵𐑤", second: "𐑕𐑧𐑒𐑩𐑯𐑛",
  see: "𐑕𐑰", seem: "𐑕𐑰𐑥", send: "𐑕𐑧𐑯𐑛", service: "𐑕𐑻𐑝𐑦𐑕", set: "𐑕𐑧𐑑",
  several: "𐑕𐑧𐑝𐑼𐑩𐑤", shall: "𐑖𐑨𐑤", she: "𐑖𐑰", should: "𐑖𐑫𐑛", show: "𐑖𐑴", side: "𐑕𐑲𐑛",
  since: "𐑕𐑦𐑯𐑕", small: "𐑕𐑥𐑷𐑤", so: "𐑕𐑴", some: "𐑕𐑳𐑥", something: "𐑕𐑳𐑥𐑔𐑦𐑙",
  sometimes: "𐑕𐑳𐑥𐑑𐑲𐑥𐑟", soon: "𐑕𐑵𐑯", sound: "𐑕𐑬𐑯𐑛", speak: "𐑕𐑐𐑰𐑒", start: "𐑕𐑑𐑭𐑑",
  state: "𐑕𐑑𐑱𐑑", still: "𐑕𐑑𐑦𐑤", stop: "𐑕𐑑𐑪𐑐", story: "𐑕𐑑𐑹𐑦", study: "𐑕𐑑𐑳𐑛𐑦",
  such: "𐑕𐑳𐑗", sure: "𐑖𐑹", system: "𐑕𐑦𐑕𐑑𐑩𐑥", take: "𐑑𐑱𐑒", talk: "𐑑𐑷𐑒", teach: "𐑑𐑰𐑗",
  tell: "𐑑𐑧𐑤", than: "𐑞𐑨𐑯", thank: "𐑔𐑨𐑙𐑒", that: "𐑞𐑨𐑑", the: "𐑞", their: "𐑞𐑺",
  them: "𐑞𐑧𐑥", then: "𐑞𐑧𐑯", there: "𐑞𐑺", these: "𐑞𐑰𐑟", they: "𐑞𐑱", thing: "𐑔𐑦𐑙",
  think: "𐑔𐑦𐑙𐑒", this: "𐑞𐑦𐑕", those: "𐑞𐑴𐑟", though: "𐑞𐑴", thought: "𐑔𐑷𐑑",
  three: "𐑔𐑮𐑰", through: "𐑔𐑮𐑵", time: "𐑑𐑲𐑥", to: "𐑑", today: "𐑑𐑫𐑛𐑱", together: "𐑑𐑫𐑜𐑧𐑞𐑼",
  too: "𐑑𐑵", took: "𐑑𐑫𐑒", turn: "𐑑𐑻𐑯", two: "𐑑𐑵", under: "𐑳𐑯𐑛𐑼", understand: "𐑳𐑯𐑛𐑼𐑕𐑑𐑨𐑯𐑛",
  until: "𐑳𐑯𐑑𐑦𐑤", up: "𐑳𐑐", upon: "𐑩𐑐𐑪𐑯", us: "𐑳𐑕", use: "𐑿𐑟", usually: "𐑿𐑠𐑵𐑩𐑤𐑦",
  very: "𐑝𐑧𐑮𐑦", want: "𐑢𐑪𐑯𐑑", war: "𐑢𐑹", was: "𐑢𐑪𐑟", watch: "𐑢𐑪𐑗", water: "𐑢𐑷𐑑𐑼",
  way: "𐑢𐑱", we: "𐑢𐑰", week: "𐑢𐑰𐑒", well: "𐑢𐑧𐑤", went: "𐑢𐑧𐑯𐑑", were: "𐑢𐑻", what: "𐑢𐑪𐑑",
  when: "𐑢𐑧𐑯", where: "𐑢𐑺", whether: "𐑢𐑧𐑞𐑼", which: "𐑢𐑦𐑗", while: "𐑢𐑲𐑤", white: "𐑢𐑲𐑑",
  who: "𐑣𐑵", whole: "𐑣𐑴𐑤", why: "𐑢𐑲", will: "𐑢𐑦𐑤", with: "𐑢𐑦𐑞", within: "𐑢𐑦𐑞𐑦𐑯",
  without: "𐑢𐑦𐑞𐑬𐑑", woman: "𐑢𐑫𐑥𐑩𐑯", women: "𐑢𐑦𐑥𐑦𐑯", word: "𐑢𐑻𐑛", work: "𐑢𐑻𐑒",
  world: "𐑢𐑻𐑤𐑛", would: "𐑢𐑫𐑛", write: "𐑮𐑲𐑑", wrote: "𐑮𐑴𐑑", year: "𐑘𐑽", yes: "𐑘𐑧𐑕",
  yet: "𐑘𐑧𐑑", you: "𐑿", young: "𐑘𐑳𐑙", your: "𐑿𐑼",
};

/** Names and proper nouns take a leading naming dot in Shavian. */
const NAMING_DOT = "·";

// ── Rule-based fallback ─────────────────────────────────────────────────────

/**
 * Ordered grapheme rules. Longest patterns first; each maps a spelling chunk
 * to a phoneme key. `$` anchors the end of the word.
 */
const RULES: Array<[RegExp, string]> = [
  // Multi-letter endings
  [/^ough$/, "AOO"], [/^tion/, "SH+AX+N"], [/^sion/, "ZH+AX+N"], [/^ture$/, "CH+AXR"],
  [/^ough/, "OW"], [/^augh/, "AOO"], [/^eigh/, "EY"], [/^tch/, "CH"], [/^dge/, "JH"],
  [/^igh/, "AY"], [/^air/, "EHR"], [/^are$/, "EHR"], [/^ear/, "IHR"], [/^eer/, "IHR"],
  [/^ier/, "IHR"], [/^oor/, "AOR"], [/^our/, "AXR"], [/^ure/, "UH+R"], [/^ing$/, "IH+NG"],
  [/^ck/, "K"], [/^ch/, "CH"], [/^sh/, "SH"], [/^th/, "TH"], [/^ph/, "F"], [/^gh/, ""],
  [/^wh/, "W"], [/^qu/, "K+W"], [/^ng$/, "NG"], [/^nk/, "NG+K"], [/^wr/, "R"], [/^kn/, "N"],
  [/^ee/, "IY"], [/^ea/, "IY"], [/^ie/, "IY"], [/^oo/, "UW"], [/^ou/, "AW"], [/^ow/, "OW"],
  [/^oi/, "OY"], [/^oy/, "OY"], [/^au/, "AOO"], [/^aw/, "AOO"], [/^ai/, "EY"], [/^ay/, "EY"],
  [/^oa/, "OW"], [/^ue/, "UW"], [/^ui/, "UW"], [/^ew/, "YUW"], [/^ey/, "IY"],
  [/^ar/, "AAR"], [/^or/, "AOR"], [/^er/, "AXR"], [/^ir/, "ER"], [/^ur/, "ER"],
  // Single letters
  [/^a/, "AE"], [/^b/, "B"], [/^c/, "K"], [/^d/, "D"], [/^e/, "EH"], [/^f/, "F"],
  [/^g/, "G"], [/^h/, "HH"], [/^i/, "IH"], [/^j/, "JH"], [/^k/, "K"], [/^l/, "L"],
  [/^m/, "M"], [/^n/, "N"], [/^o/, "AO"], [/^p/, "P"], [/^q/, "K"], [/^r/, "R"],
  [/^s/, "S"], [/^t/, "T"], [/^u/, "AH"], [/^v/, "V"], [/^w/, "W"], [/^x/, "K+S"],
  [/^y/, "IH"], [/^z/, "Z"],
];

/** Convert a word to phoneme keys using the rule table. */
function ruleTransliterate(word: string): string {
  let rest = word.toLowerCase();
  const phonemes: string[] = [];

  // Silent trailing 'e' after a consonant lengthens the preceding vowel; the
  // rule table handles this crudely by just dropping it.
  const hasMagicE = /[a-z][b-df-hj-np-tv-z]e$/.test(rest);
  if (hasMagicE) rest = rest.slice(0, -1);

  while (rest.length > 0) {
    let matched = false;
    for (const [pattern, phoneme] of RULES) {
      const m = rest.match(pattern);
      if (m) {
        if (phoneme) phonemes.push(...phoneme.split("+"));
        rest = rest.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) rest = rest.slice(1);
  }

  // Apply magic-e vowel lengthening to the last vowel we emitted.
  if (hasMagicE) {
    const LONG: Record<string, string> = { AE: "EY", EH: "IY", IH: "AY", AO: "OW", AH: "YUW" };
    for (let i = phonemes.length - 1; i >= 0; i--) {
      if (LONG[phonemes[i]]) {
        phonemes[i] = LONG[phonemes[i]];
        break;
      }
    }
  }

  return phonemes.map((p) => PHONEME_TO_SHAVIAN[p] ?? "").join("");
}

// ── Entry point ─────────────────────────────────────────────────────────────

export interface ShavianResult extends ToolResult {
  meta: {
    total: number;
    fromDictionary: number;
    approximated: number;
    unknownWords: string[];
  };
}

export function toShavian(input: string, options: { namingDots?: boolean } = {}): ShavianResult {
  const { namingDots = true } = options;

  let total = 0;
  let fromDictionary = 0;
  const unknown = new Set<string>();

  // Split on word boundaries but keep punctuation and whitespace intact.
  const output = input.replace(/[A-Za-z][A-Za-z']*/g, (word) => {
    total++;
    const lower = word.toLowerCase().replace(/'/g, "");
    const isProperNoun = /^[A-Z]/.test(word) && word.length > 1;

    const known = DICTIONARY[lower];
    if (known) {
      fromDictionary++;
      return isProperNoun && namingDots && !DICTIONARY[lower.toLowerCase()] ? NAMING_DOT + known : known;
    }

    // Handle a regular plural / past tense by falling back to the stem.
    for (const [suffix, tail] of [["s", "S"], ["es", "IH+Z"], ["ed", "D"], ["ing", "IH+NG"]] as const) {
      if (lower.endsWith(suffix) && lower.length > suffix.length + 1) {
        const stem = DICTIONARY[lower.slice(0, -suffix.length)];
        if (stem) {
          fromDictionary++;
          return stem + tail.split("+").map((p) => PHONEME_TO_SHAVIAN[p] ?? "").join("");
        }
      }
    }

    unknown.add(lower);
    const approximated = ruleTransliterate(lower);
    return isProperNoun && namingDots ? NAMING_DOT + approximated : approximated;
  });

  return {
    output,
    meta: {
      total,
      fromDictionary,
      approximated: total - fromDictionary,
      unknownWords: [...unknown].slice(0, 50),
    },
  };
}
