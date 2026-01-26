/**
 * Google Places Autocomplete Component
 * Provides address search with auto-population of address fields
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";

// Load Google Places API script
const loadGooglePlacesScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve(window.google);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google));
      existingScript.addEventListener("error", reject);
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Parse address components from Google Places result
const parseAddressComponents = (place) => {
  const result = {
    name: place.name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    fullAddress: place.formatted_address || "",
  };

  if (!place.address_components) {
    return result;
  }

  const components = place.address_components;

  // Build street address from street number and route
  let streetNumber = "";
  let route = "";

  for (const component of components) {
    const types = component.types;

    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    }
    if (types.includes("route")) {
      route = component.long_name;
    }
    if (types.includes("locality") || types.includes("sublocality")) {
      result.city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      result.state = component.short_name; // Use short name for state (e.g., "CA" instead of "California")
    }
    if (types.includes("postal_code")) {
      result.zipCode = component.long_name;
    }
  }

  // Combine street number and route for address
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
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

  // Initialize Google Places
  useEffect(() => {
    if (!apiKey) {
      setError("Google Places API key not configured");
      setIsLoading(false);
      return;
    }

    loadGooglePlacesScript(apiKey)
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load Google Places API:", err);
        setError("Failed to load location search");
        setIsLoading(false);
      });
  }, [apiKey]);

  // Initialize Autocomplete when script is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "us" },
          fields: [
            "name",
            "address_components",
            "formatted_address",
            "geometry",
          ],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place || !place.address_components) {
          return;
        }

        const parsedAddress = parseAddressComponents(place);

        // Update the input value with the place name
        if (onChange) {
          onChange(parsedAddress.name || place.name || "");
        }

        // Notify parent with all parsed address data
        if (onPlaceSelect) {
          onPlaceSelect(parsedAddress);
        }
      });
    } catch (err) {
      console.error("Failed to initialize Google Places Autocomplete:", err);
      setError("Failed to initialize location search");
    }
  }, [isLoaded, onChange, onPlaceSelect]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  const handleClear = useCallback(() => {
    if (onChange) {
      onChange("");
    }
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, [onChange]);

  // If no API key, show regular input
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
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={isLoading ? "Loading..." : placeholder}
          disabled={disabled || isLoading}
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
