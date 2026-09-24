export function getSanitizedName(rawName?: string | null, fallback = "این دوستمون"): string {
  if (!rawName) return fallback;
  
  // Strip emojis, invisible characters, control symbols, and unwanted punctuations
  const clean = rawName.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  
  // If only symbols/dots were entered or string is too short
  if (clean.length < 2) return fallback;
  
  return clean.length > 12 ? `${clean.slice(0, 12)}…` : clean;
}
