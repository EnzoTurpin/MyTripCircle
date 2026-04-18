import { useState } from "react";
import { getAddressSuggestions, type AddressSuggestion } from "../services/PlacesService";

type Field = "origin" | "destination";

interface FieldState {
  suggestions: AddressSuggestion[];
  show: boolean;
}

const EMPTY: FieldState = { suggestions: [], show: false };

export default function useTransportAutocomplete() {
  const [origin, setOrigin] = useState<FieldState>(EMPTY);
  const [destination, setDestination] = useState<FieldState>(EMPTY);

  const setter = (field: Field) => (field === "origin" ? setOrigin : setDestination);

  const handleChange = async (
    field: Field,
    text: string,
    onTextChange: (t: string) => void,
    transportType: "flight" | "train",
  ) => {
    onTextChange(text);
    if (!text.trim()) {
      setter(field)(EMPTY);
      return;
    }
    const placeType = transportType === "flight" ? "airport" : "train_station";
    try {
      const results = await getAddressSuggestions(text.trim(), undefined, undefined, placeType);
      setter(field)({ suggestions: results, show: results.length > 0 });
    } catch (e) {
      if (__DEV__) console.warn("[useTransportAutocomplete] Erreur autocomplétion transport:", e);
      setter(field)(EMPTY);
    }
  };

  const handleSelect = (
    field: Field,
    suggestion: AddressSuggestion,
    onSelect: (desc: string) => void,
  ) => {
    onSelect(suggestion.description);
    setter(field)(EMPTY);
  };

  return {
    originSuggestions:          origin.suggestions,
    showOriginSuggestions:      origin.show,
    destinationSuggestions:     destination.suggestions,
    showDestinationSuggestions: destination.show,
    handleOriginChange:      (text: string, cb: (t: string) => void, type: "flight" | "train") =>
      handleChange("origin", text, cb, type),
    handleDestinationChange: (text: string, cb: (t: string) => void, type: "flight" | "train") =>
      handleChange("destination", text, cb, type),
    handleSelectOrigin:      (s: AddressSuggestion, cb: (d: string) => void) => handleSelect("origin", s, cb),
    handleSelectDestination: (s: AddressSuggestion, cb: (d: string) => void) => handleSelect("destination", s, cb),
  };
}
