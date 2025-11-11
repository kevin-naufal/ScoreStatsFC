export function normalizeText(value) {
  if (value == null) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .trim();
}

export function nameMatchScore(name, query) {
  const n = normalizeText(name);
  const q = normalizeText(query);
  if (!n || !q) return 0;
  const tokens = n.split(/\s+/).filter(Boolean);
  const first = tokens[0] || '';
  const last = tokens.length > 1 ? tokens[tokens.length - 1] : '';
  if (first.startsWith(q)) return 3;           // 1) prefix di nama depan
  if (last.startsWith(q)) return 2;            // 2) prefix di nama belakang
  if (n.includes(q)) return 1;                 // 3) substring di mana saja
  return 0;
}


