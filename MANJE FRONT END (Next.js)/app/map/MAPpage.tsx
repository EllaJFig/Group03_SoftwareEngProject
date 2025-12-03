"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAllListings } from "@/utils/firestore";
import { smartLocalGeocode, extractPostal } from "@/utils/localGeocode";
import { useSavedListings } from "@/hooks/useSavedListings";

const ListingMap = dynamic(() => import("@/components/Map"), { ssr: false });

// ------------------------------------------------------
// PREVIEW SCRAPER + LOCAL CACHE
// ------------------------------------------------------
const PREVIEW_CACHE_KEY = "manje_preview_cache_v1";

function getCachedPreview(url?: string | null): string | null {
  if (typeof window === "undefined" || !url) return null;
  try {
    const raw = localStorage.getItem(PREVIEW_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const val = data[url];
    return typeof val === "string" && val.trim() ? val : null;
  } catch {
    return null;
  }
}

function setCachedPreview(url: string, preview: string) {
  if (typeof window === "undefined" || !url || !preview) return;
  try {
    const raw = localStorage.getItem(PREVIEW_CACHE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[url] = preview;
    localStorage.setItem(PREVIEW_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Browser scraper using corsproxy.io
async function fetchPreviewBrowser(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const proxy = "https://corsproxy.io/?";
    const fullURL = proxy + encodeURIComponent(url);

    const html = await fetch(fullURL).then((res) => res.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    const og = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
    const tw = doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") || "";

    const best = og || tw;
    if (best && best.trim()) return best.trim();
    return null;
  } catch {
    return null;
  }
}

async function getOrFetchPreview(url?: string | null): Promise<string | null> {
  const cached = getCachedPreview(url);
  if (cached) return cached;
  const preview = await fetchPreviewBrowser(url);
  if (preview && url) setCachedPreview(url, preview);
  return preview;
}

// ------------------------------------------------------
// UTIL HELPERS
// ------------------------------------------------------
function dedupeListings(list: any[]) {
  const seen = new Map<string, any>();
  for (const l of list) {
    const key =
      (l.URL || "").trim().toLowerCase() ||
      (l.Location || "").trim().toLowerCase() ||
      l.id;

    if (!seen.has(key)) seen.set(key, l);
  }
  return Array.from(seen.values());
}

function getImg(l: any) {
  if (!l) return null;
  if (typeof l.preview === "string" && l.preview.trim()) return l.preview;
  if (Array.isArray(l.Images) && l.Images[0]) return l.Images[0];
  if (typeof l.image === "string" && l.image.trim()) return l.image;
  return null;
}

// ------------------------------------------------------
// PAGE COMPONENT
// ------------------------------------------------------
export default function MapPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const { saveListing, removeListing, isSaved } = useSavedListings();

  const [priceFilter, setPriceFilter] = useState("Any");
  const [bedFilter, setBedFilter] = useState("Any");
  const [bathFilter, setBathFilter] = useState("Any");
  const [typeFilter, setTypeFilter] = useState("Any");

  // Save / Unsave listings per user (users collection)
  function toggleSave(listing: any) {
    if (isSaved(listing.id)) {
      removeListing(listing.id);
    } else {
      const payload = {
        id: listing.id,
        title: listing.Title || listing.title || null,
        price: Number(listing.Price) || 0,
        bedrooms: Number(listing.Bedrooms) || 0,
        bathrooms: Number(listing.Bathrooms) || 0,
        sqft: listing.Sqft || listing.sqft || null,
        address: listing.Location || listing.address || null,
        url: listing.URL || listing.url || null,
        preview: getImg(listing), // will be set from scraper
        savedAt: Date.now(),
      };

      saveListing(payload);
    }
  }

  // LOAD LISTINGS + ADD PREVIEWS
  useEffect(() => {
    async function load() {
      let raw = await getAllListings();
      raw = dedupeListings(raw);

      const processed = await Promise.all(
        raw.map(async (item: any) => {
          const postal = extractPostal(item.Location);
          const [lat, lon] = smartLocalGeocode(postal, item.City);

          const preview = await getOrFetchPreview(item.URL);

          return {
            ...item,
            latitude: lat,
            longitude: lon,
            preview, // <- attach preview here
          };
        })
      );

      setListings(processed);
      setFiltered(processed);
    }

    load();
  }, []);

  function applyFilters() {
    let data = [...listings];

    if (priceFilter !== "Any") {
      if (priceFilter === "$0 - $1000") data = data.filter((l) => Number(l.Price) <= 1000);
      if (priceFilter === "$1000 - $1500")
        data = data.filter((l) => Number(l.Price) >= 1000 && Number(l.Price) <= 1500);
      if (priceFilter === "$1500 - $2000")
        data = data.filter((l) => Number(l.Price) >= 1500 && Number(l.Price) <= 2000);
      if (priceFilter === "$2000+") data = data.filter((l) => Number(l.Price) >= 2000);
    }

    if (bedFilter !== "Any") {
      data = data.filter((l) =>
        bedFilter === "3+" ? Number(l.Bedrooms) >= 3 : l.Bedrooms === bedFilter
      );
    }

    if (bathFilter !== "Any") {
      data = data.filter((l) =>
        bathFilter === "3+" ? Number(l.Bathrooms) >= 3 : l.Bathrooms === bathFilter
      );
    }

    if (typeFilter !== "Any") {
      data = data.filter((l) =>
        (l.Type || "").toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    setFiltered(data);
  }

  return (
    <main className="flex min-h-screen bg-black text-white pt-24">
      {/* LEFT FILTERS */}
      <aside className="w-80 bg-gray-900 p-6 rounded-xl mr-4 h-fit space-y-6">
        <h2 className="text-xl font-bold uppercase mb-4">Filters</h2>

        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option>Any</option>
          <option>$0 - $1000</option>
          <option>$1000 - $1500</option>
          <option>$1500 - $2000</option>
          <option>$2000+</option>
        </select>

        <select
          value={bedFilter}
          onChange={(e) => setBedFilter(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option>Any</option>
          <option>1</option>
          <option>2</option>
          <option>3+</option>
        </select>

        <select
          value={bathFilter}
          onChange={(e) => setBathFilter(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option>Any</option>
          <option>1</option>
          <option>2</option>
          <option>3+</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option>Any</option>
          <option>House</option>
          <option>Apartment</option>
          <option>Condo</option>
        </select>

        <button
          onClick={applyFilters}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
        >
          Apply Filters
        </button>
      </aside>

      {/* MAP */}
      <section className="flex-1 border border-gray-800 rounded-xl overflow-hidden">
        <ListingMap listings={filtered} onSelectListing={setSelected} />
      </section>

      {/* RIGHT PANEL */}
      <aside className="w-80 bg-gray-900 p-6 rounded-xl ml-4 overflow-y-auto max-h-[85vh]">
        {!selected ? (
          <p className="text-gray-400">Click a marker to view details.</p>
        ) : selected.multi ? (
          <>
            <h2 className="text-xl font-bold mb-4">
              {selected.listings.length} listings here:
            </h2>

            <div className="space-y-4">
              {selected.listings.map((l: any) => {
                const img = getImg(l);
                const savedStatus = isSaved(l.id);

                return (
                  <div key={l.id} className="bg-gray-800 p-3 rounded-lg">
                    {img && (
                      <img
                        src={img}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        alt={l.Title}
                      />
                    )}

                    <h3 className="font-bold text-sm">{l.Title}</h3>
                    <p className="text-sm">
                      ${l.Price} • {l.Bedrooms} bd • {l.Bathrooms} ba
                    </p>

                    <button
                      onClick={() => toggleSave(l)}
                      className={`mt-2 px-3 py-1 rounded-lg text-sm ${
                        savedStatus ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {savedStatus ? "Unsave" : "Save"}
                    </button>

                    <a
                      href={l.URL}
                      target="_blank"
                      className="block text-xs text-blue-400 underline mt-2"
                      rel="noreferrer"
                    >
                      View Listing
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          (() => {
            const l = selected;
            const img = getImg(l);
            const savedStatus = isSaved(l.id);

            return (
              <>
                {img && (
                  <img
                    src={img}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    alt={l.Title}
                  />
                )}

                <h2 className="text-2xl font-bold">{l.Title}</h2>
                <p>
                  <strong>Price:</strong> ${l.Price}
                </p>
                <p>
                  <strong>Beds:</strong> {l.Bedrooms}
                </p>
                <p>
                  <strong>Baths:</strong> {l.Bathrooms}
                </p>
                <p>
                  <strong>Sqft:</strong> {l.Sqft}
                </p>
                <p>
                  <strong>Location:</strong> {l.Location}
                </p>

                <button
                  onClick={() => toggleSave(l)}
                  className={`w-full py-2 rounded-lg ${
                    savedStatus ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {savedStatus ? "Unsave Listing" : "Save Listing"}
                </button>

                <a
                  href={l.URL}
                  target="_blank"
                  className="block text-center mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  rel="noreferrer"
                >
                  View Original Listing
                </a>
              </>
            );
          })()
        )}
      </aside>
    </main>
  );
}
