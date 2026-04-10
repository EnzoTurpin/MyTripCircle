import { useState, useEffect, useRef } from "react";
import { Trip } from "../types";

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useTripCountdown(trip: Trip | null) {
  const [countdown, setCountdown] = useState<CountdownValue | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progressPercent = (() => {
    if (!trip) return 0;
    const now = Date.now();
    const start = new Date(trip.startDate).getTime();
    const end = new Date(trip.endDate).getTime();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  })();

  const durationDays = trip
    ? Math.round(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const daysPassed = trip
    ? Math.max(
        0,
        Math.min(
          durationDays,
          Math.round(
            (Date.now() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24),
          ),
        ),
      )
    : 0;

  useEffect(() => {
    if (!trip) return;
    const updateCountdown = () => {
      const now = Date.now();
      const start = new Date(trip.startDate).getTime();
      const diff = start - now;
      if (diff <= 0) {
        setCountdown(null);
        if (countdownRef.current) clearInterval(countdownRef.current);
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [trip?.startDate]);

  return { countdown, progressPercent, durationDays, daysPassed };
}
