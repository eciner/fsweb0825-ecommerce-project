export function requireBuildApiTarget(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Production build requires an explicit VITE_API_URL HTTP(S) API URL.");
  }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("VITE_API_URL must be an HTTP(S) API URL without credentials, query or fragment.");
  }
}
