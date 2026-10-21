// Public reads and enquiry submissions can target the separate admin deployment.
// Only public URLs belong in VITE_ variables; credentials remain on the server.
export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  return `${base}${path}`;
}
