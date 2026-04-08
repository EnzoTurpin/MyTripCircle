import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { ApiService } from "../services/ApiService";
import { useTrips } from "../contexts/TripsContext";
import { searchPlaceByText } from "../services/PlacesService";

export const DESTINATIONS_BASE = [
  { id: "1",  category: "beach",    image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400&q=80&fit=crop" },
  { id: "2",  category: "nature",   image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80&fit=crop" },
  { id: "3",  category: "culture",  image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80&fit=crop" },
  { id: "4",  category: "culture",  image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80&fit=crop" },
  { id: "5",  category: "mountain", image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80&fit=crop" },
  { id: "6",  category: "beach",    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80&fit=crop" },
  { id: "7",  category: "city",     image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80&fit=crop" },
  { id: "8",  category: "culture",  image: "https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=400&q=80&fit=crop" },
  { id: "9",  category: "nature",   image: "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=400&q=80&fit=crop" },
  { id: "10", category: "beach",    image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&q=80&fit=crop" },
  { id: "11", category: "culture",  image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80&fit=crop" },
  { id: "12", category: "city",     image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80&fit=crop" },
  { id: "13", category: "city",     image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80&fit=crop" },
  { id: "14", category: "culture",  image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80&fit=crop" },
  { id: "15", category: "culture",  image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80&fit=crop" },
  { id: "16", category: "beach",    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&q=80&fit=crop" },
  { id: "17", category: "beach",    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80&fit=crop" },
  { id: "18", category: "nature",   image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80&fit=crop" },
  { id: "19", category: "city",     image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80&fit=crop" },
  { id: "20", category: "culture",  image: "https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=400&q=80&fit=crop" },
];

const extractCityCountry = (formattedAddress: string, fallbackCity: string) => {
  const parts = formattedAddress.split(", ").map((p) => p.trim()).filter(Boolean);
  const country = parts.length >= 1 ? parts[parts.length - 1] : fallbackCity;
  const city = parts.length >= 2 ? parts[parts.length - 2] : fallbackCity;
  return { city, country };
};

export const useIdeas = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { createTrip, createBooking, createAddress } = useTrips();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [daysInput, setDaysInput] = useState("3");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [showCreateStep, setShowCreateStep] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [creating, setCreating] = useState(false);

  const DESTINATIONS = DESTINATIONS_BASE.map((d) => ({
    ...d,
    name:    (t(`ideas.destinations.${d.id}.name`,    { defaultValue: d.id }) as string),
    country: (t(`ideas.destinations.${d.id}.country`, { defaultValue: "" })  as string),
  }));

  const CATEGORIES = [
    { id: "all",      label: t("ideas.categories.all") },
    { id: "beach",    label: t("ideas.categories.beach") },
    { id: "mountain", label: t("ideas.categories.mountain") },
    { id: "nature",   label: t("ideas.categories.nature") },
    { id: "culture",  label: t("ideas.categories.culture") },
    { id: "city",     label: t("ideas.categories.city") },
  ];

  const filtered = DESTINATIONS.filter((d) => {
    const matchCat = activeCategory === "all" || d.category === activeCategory;
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openModal = () => {
    setItinerary(null);
    setCityInput("");
    setDaysInput("3");
    setShowCreateStep(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowCreateStep(false);
  };

  const generateItinerary = async () => {
    const days = Number.parseInt(daysInput, 10);
    if (!cityInput.trim() || Number.isNaN(days) || days < 1 || days > 30) return;
    setLoading(true);
    setItinerary(null);
    try {
      const result = await ApiService.generateItinerary({ city: cityInput.trim(), days });
      setItinerary(result.itinerary);
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("daily_limit_reached")) {
        Alert.alert(t("ideas.itinerary.limitTitle"), t("ideas.itinerary.limitMessage"));
      } else if (msg.includes("ai_not_configured")) {
        Alert.alert(t("ideas.itinerary.errorTitle"), t("ideas.itinerary.notConfiguredMessage"));
      } else {
        Alert.alert(t("ideas.itinerary.errorTitle"), msg || t("ideas.itinerary.errorMessage"));
      }
    } finally {
      setLoading(false);
    }
  };

  const createBookingsFromItinerary = async (
    tripId: string,
    itineraryData: any,
    tripStart: Date,
    tripEnd: Date,
  ) => {
    const city: string = itineraryData.city || "";
    const days: any[] = itineraryData.days || [];

    try {
      let hotelAddress: string | undefined;
      let hotelName: string | undefined;
      let hotelRating: number | undefined;
      let hotelPhotoUrl: string | undefined;
      try {
        const place = await searchPlaceByText(`hotel ${city}`);
        if (place) {
          hotelAddress = place.formattedAddress;
          hotelName = place.name;
          hotelRating = place.rating;
          hotelPhotoUrl = place.photoUrl;
        }
      } catch { /* échec silencieux */ }

      await createBooking({
        tripId,
        type: "hotel",
        title: hotelName || `Hébergement – ${city}`,
        address: hotelAddress,
        date: tripStart,
        endDate: tripEnd,
        currency: "€",
        status: "pending",
      });

      if (hotelAddress && hotelName) {
        const { city: placeCity, country: placeCountry } = extractCityCountry(hotelAddress, city);
        await createAddress({
          type: "hotel",
          name: hotelName,
          address: hotelAddress,
          city: placeCity,
          country: placeCountry,
          rating: hotelRating,
          photoUrl: hotelPhotoUrl,
          tripId,
        }).catch(() => { /* échec silencieux */ });
      }
    } catch { /* échec silencieux */ }

    const slots = [
      { key: "morning" },
      { key: "afternoon" },
      { key: "evening" },
    ];

    for (const day of days) {
      const dayDate = new Date(tripStart.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000);
      for (const slot of slots) {
        const slotData = day[slot.key];
        if (!slotData?.activity) continue;
        const activityTitle: string = slotData.activity;
        let realAddress: string | undefined;
        let placeName: string | undefined;
        let placeRating: number | undefined;
        let placePhotoUrl: string | undefined;
        try {
          const place = await searchPlaceByText(`${activityTitle} ${city}`);
          if (place) {
            realAddress = place.formattedAddress;
            placeName = place.name;
            placeRating = place.rating;
            placePhotoUrl = place.photoUrl;
          }
        } catch { /* échec silencieux */ }

        try {
          await createBooking({
            tripId,
            type: "activity",
            title: activityTitle,
            address: realAddress,
            date: dayDate,
            currency: "€",
            status: "pending",
          });
        } catch { /* échec silencieux */ }

        if (realAddress && placeName) {
          const { city: placeCity, country: placeCountry } = extractCityCountry(realAddress, city);
          await createAddress({
            type: "activity",
            name: placeName,
            address: realAddress,
            city: placeCity,
            country: placeCountry,
            rating: placeRating,
            photoUrl: placePhotoUrl,
            tripId,
          }).catch(() => { /* échec silencieux */ });
        }
      }
    }
  };

  const resetItinerary = () => {
    setItinerary(null);
    setShowCreateStep(false);
  };

  const handleCreateTrip = async () => {
    if (!itinerary) return;
    setCreating(true);
    try {
      const days = Number.parseInt(daysInput, 10) || 1;
      const endDate = new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
      const newTrip = await createTrip({
        title: `${itinerary.city}`,
        description: "",
        destination: itinerary.city,
        startDate,
        endDate,
        collaborators: [],
        isPublic: false,
        visibility: "private",
        status: "draft",
        stats: { totalBookings: 0, totalAddresses: 0, totalCollaborators: 0 },
        location: { type: "Point", coordinates: [0, 0] },
      });
      await createBookingsFromItinerary(newTrip.id, itinerary, startDate, endDate);
      closeModal();
      setItinerary(null);
      navigation.navigate("TripDetails", { tripId: newTrip.id, showToast: true });
    } catch {
      Alert.alert(t("ideas.itinerary.errorTitle"), t("ideas.itinerary.createError"));
    } finally {
      setCreating(false);
    }
  };

  return {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    modalVisible,
    openModal,
    closeModal,
    cityInput,
    setCityInput,
    daysInput,
    setDaysInput,
    loading,
    itinerary,
    showCreateStep,
    setShowCreateStep,
    startDate,
    setStartDate,
    showDatePicker,
    setShowDatePicker,
    creating,
    DESTINATIONS,
    CATEGORIES,
    filtered,
    generateItinerary,
    handleCreateTrip,
    resetItinerary,
  };
};
