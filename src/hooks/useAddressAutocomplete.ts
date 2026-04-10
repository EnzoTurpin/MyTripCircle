import { useState } from "react";
import {
  getAddressSuggestions,
  hasGooglePlacesApiKey,
  type AddressSuggestion,
} from "../services/PlacesService";
import { useCurrentLocation } from "./useCurrentLocation";

interface UseAddressAutocompleteReturn {
  addressSuggestions: AddressSuggestion[];
  showAddressSuggestions: boolean;
  handleAddressChange: (text: string, onTextChange: (text: string) => void) => Promise<void>;
  handleSelectAddress: (suggestion: AddressSuggestion, onSelect: (description: string) => void) => void;
}

const useAddressAutocomplete = (): UseAddressAutocompleteReturn => {
  const currentLocation = useCurrentLocation();
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const handleAddressChange = async (text: string, onTextChange: (text: string) => void) => {
    onTextChange(text);
    if (!hasGooglePlacesApiKey || !text.trim()) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    try {
      const controller = new AbortController();
      const results = await getAddressSuggestions(text.trim(), controller.signal, currentLocation ?? undefined);
      setAddressSuggestions(results);
      setShowAddressSuggestions(results.length > 0);
    } catch (error) {
      if ((error as Error).name !== "AbortError") console.error("Address suggestions error:", error);
    }
  };

  const handleSelectAddress = (suggestion: AddressSuggestion, onSelect: (description: string) => void) => {
    onSelect(suggestion.description);
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  return { addressSuggestions, showAddressSuggestions, handleAddressChange, handleSelectAddress };
};

export default useAddressAutocomplete;
