export function getSavedListings() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("saved") || "[]" );
}

export function saveListing(listing: any) {
  if (typeof window === "undefined") return;

  const saved = JSON.parse(localStorage.getItem("saved") || "[]");

  saved.push({
    ...listing,
    savedAt: Date.now(),
  });

  localStorage.setItem("saved", JSON.stringify(saved));
}

export function removeListing(id: string | number) {
  if (typeof window === "undefined") return;

  let saved = getSavedListings();
  saved = saved.filter((item: any) => item.id !== id);

  localStorage.setItem("saved", JSON.stringify(saved));
}
