/**
 * Google Places Autocomplete Component
 *
 * Address search with auto-population of address fields, built on the
 * **new** Places API ("Places API (New)") Autocomplete Data API
 * (`AutocompleteSuggestion.fetchAutocompleteSuggestions` + `Place.fetchFields`).
 *
 * The legacy `google.maps.places.Autocomplete` widget was retired for new
 * Google Cloud projects on 2025-03-01 (ApiNotActivatedMapError / "not
 * available to new customers"). This implementation keeps a controlled
 * <input> and renders its own suggestions dropdown, so the surrounding form
 * still owns the field value (free-text site names keep working) and there is
 * no body-level `.pac-container` to fight modal stacking contexts.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";

// Load the Google Maps JS script (places library). Kept as-is: it only loads
// the SDK; the autocomplete calls below use the new Places API classes.
const loadGooglePlacesScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve(window.google);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google));
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Parse address components from a NEW Places API `Place` object.
// The new API uses `addressComponents` with `longText`/`shortText`
// (vs the legacy `address_components` with `long_name`/`short_name`).
const parseAddressComponents = (place) => {
  const result = {
    name: place.displayName || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    fullAddress: place.formattedAddress || "",
  };

  const components = place.addressComponents || [];
  let streetNumber = "";
  let route = "";

  for (const component of components) {
    const types = component.types || [];

    if (types.includes("street_number")) {
      streetNumber = component.longText || "";
    }
    if (types.includes("route")) {
      route = component.longText || "";
    }
    if (types.includes("locality") || types.includes("sublocality")) {
      result.city = component.longText || result.city;
    }
    if (types.includes("administrative_area_level_1")) {
      result.state = component.shortText || ""; // e.g. "CA"
    }
    if (types.includes("postal_code")) {
      result.zipCode = component.longText || "";
    }
  }

  if (streetNumber && route) {
    result.address = `${streetNumber} ${route}`;
  } else if (route) {
    result.address = route;
  }

  return result;
};

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for a location...",
  className = "",
  disabled = false,
  label,
  required = false,
}) {
  const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

  const inputRef = useRef(null);
  const placesRef = useRef(null); // { AutocompleteSessionToken, AutocompleteSuggestion }
  const sessionTokenRef = useRef(null);
  const debounceRef = useRef(null);
  const blurTimerRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Selecting a suggestion with Enter must not submit the surrounding <form>.
  // Load the SDK and resolve the new Places API classes once.
  useEffect(() => {
    if (!apiKey) {
      setError("Google Places API key not configured");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    loadGooglePlacesScript(apiKey)
      .then(async () => {
        const g = window.google;
        const lib = g.maps.importLibrary
          ? await g.maps.importLibrary("places")
          : g.maps.places;
        placesRef.current = {
          AutocompleteSessionToken: lib.AutocompleteSessionToken,
          AutocompleteSuggestion: lib.AutocompleteSuggestion,
        };
        if (!cancelled) {
          setIsLoaded(true);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load Google Places API:", err);
        if (!cancelled) {
          setError("Failed to load location search");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const fetchPredictions = useCallback(async (input) => {
    const P = placesRef.current;
    if (!P?.AutocompleteSuggestion || !input || input.trim().length < 2) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    // One session token spans the keystrokes leading to a selection (billing).
    if (!sessionTokenRef.current && P.AutocompleteSessionToken) {
      sessionTokenRef.current = new P.AutocompleteSessionToken();
    }

    try {
      const { suggestions } =
        await P.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: input.trim(),
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ["us"],
        });

      const preds = (suggestions || [])
        .map((s) => s.placePrediction)
        .filter(Boolean)
        .map((p) => ({
          id: p.placeId,
          text: p.text?.toString?.() ?? String(p.text ?? ""),
          prediction: p,
        }));

      setPredictions(preds);
      setOpen(preds.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Autocomplete fetch failed:", err);
      setPredictions([]);
      setOpen(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const v = e.target.value;
      if (onChange) onChange(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchPredictions(v), 250);
    },
    [onChange, fetchPredictions],
  );

  const handleSelect = useCallback(
    async (pred) => {
      try {
        const place = pred.prediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "addressComponents"],
        });
        const parsed = parseAddressComponents(place);
        if (onChange) onChange(parsed.name || pred.text);
        if (onPlaceSelect) onPlaceSelect(parsed);
      } catch (err) {
        console.error("Failed to fetch place details:", err);
      } finally {
        setPredictions([]);
        setOpen(false);
        setActiveIndex(-1);
        sessionTokenRef.current = null; // selection ends the billing session
      }
    },
    [onChange, onPlaceSelect],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        // Never let a selection/Enter submit the surrounding class form.
        e.preventDefault();
        if (open && activeIndex >= 0 && predictions[activeIndex]) {
          handleSelect(predictions[activeIndex]);
        }
      } else if (e.key === "ArrowDown" && predictions.length) {
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
      } else if (e.key === "ArrowUp" && predictions.length) {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [open, activeIndex, predictions, handleSelect],
  );

  const handleClear = useCallback(() => {
    if (onChange) onChange("");
    setPredictions([]);
    setOpen(false);
    if (inputRef.current) inputRef.current.focus();
  }, [onChange]);

  // Cleanup timers on unmount.
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    },
    [],
  );

  // If no API key, show a plain manual-entry input.
  if (!apiKey) {
    return (
      <div>
        {label && (
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold ${className}`}
        />
        <p className="text-xs text-amber-600 mt-1">
          Location search unavailable - enter address manually
        </p>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length) setOpen(true);
          }}
          onBlur={() => {
            blurTimerRef.current = setTimeout(() => setOpen(false), 150);
          }}
          placeholder={isLoading ? "Loading..." : placeholder}
          disabled={disabled || isLoading}
          autoComplete="off"
          className={`w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold ${
            disabled ? "bg-gray-100" : ""
          } ${className}`}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {open && predictions.length > 0 && (
          <ul className="absolute left-0 right-0 z-[100000] mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {predictions.map((p, idx) => (
              <li
                key={p.id || idx}
                // onMouseDown (not onClick) so the selection fires before the
                // input's onBlur closes the dropdown.
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(p);
                }}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  idx === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                {p.text}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {isLoaded && !error && (
        <p className="text-xs text-gray-500 mt-1">
          Type to search locations - address will auto-fill
        </p>
      )}
    </div>
  );
}
