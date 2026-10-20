let cached;
export function clearPublicCache() {
  cached = undefined;
}
export async function publicContent(loader) {
  if (cached && cached.until > Date.now()) return cached.value;
  const value = await loader();
  cached = { until: Date.now() + 20000, value };
  return value;
}
