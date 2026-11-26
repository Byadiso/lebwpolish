// Validate untrusted values before saving them or using them as link destinations.
export function safeExternalUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) && url.hostname ? url.href : null;
  } catch { return null; }
}
export function boundedText(value, maxLength = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
export function safeDrafts(value, keys, maxLength = 10000) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(keys.filter(key => typeof value[key] === 'string').map(key => [key, value[key].slice(0, maxLength)]));
}
