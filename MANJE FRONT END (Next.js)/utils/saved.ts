const STORAGE_KEY = "manje_saved_listings";

export function getSavedListings() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveListing(listing: any) {
  if (typeof window === "undefined") return;

  const saved = getSavedListings();

  if (!saved.find((l) => l.id === listing.id)) {
    saved.push(listing);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
}

export function removeListing(id: string) {
  if (typeof window === "undefined") return;

  const updated = getSavedListings().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function isListingSaved(id: string) {
  return getSavedListings().some((l) => l.id === id);
}
