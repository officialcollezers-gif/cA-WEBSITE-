const legacyBrand = /\bFinCore(?:\s+Advisors|\s+Advisory)?\b/gi;
// Preserve existing Sheet records while displaying the requested replacement
// for starter-brand text. Subsequent admin saves persist the displayed values.
export function rebrandLegacyContent(value) {
  if (typeof value === 'string') return value.replace(legacyBrand, 'RAHUL G & ASSOCIATES');
  if (Array.isArray(value)) return value.map(rebrandLegacyContent);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, ['id','slug'].includes(key) ? item : rebrandLegacyContent(item)]));
  return value;
}
