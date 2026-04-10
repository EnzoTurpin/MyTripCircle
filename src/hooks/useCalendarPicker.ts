import { useState } from "react";
import { Keyboard } from "react-native";

interface UseCalendarPickerParams {
  startDate: Date;
  endDate: Date;
  onDatesChange: (start: Date, end: Date) => void;
}

export interface UseCalendarPickerReturn {
  showCalendar: boolean;
  calendarPickingFor: "start" | "end";
  calendarYear: number;
  calendarMonth: number;
  openCalendar: (type: "start" | "end") => void;
  closeCalendar: () => void;
  handleCalendarDayPress: (day: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
}

const useCalendarPicker = ({
  startDate,
  endDate,
  onDatesChange,
}: UseCalendarPickerParams): UseCalendarPickerReturn => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPickingFor, setCalendarPickingFor] = useState<"start" | "end">("start");
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const openCalendar = (type: "start" | "end") => {
    Keyboard.dismiss();
    if (showCalendar && calendarPickingFor === type) {
      setShowCalendar(false);
      return;
    }
    const ref = type === "start" ? startDate : endDate;
    setCalendarYear(ref.getFullYear());
    setCalendarMonth(ref.getMonth());
    setCalendarPickingFor(type);
    setShowCalendar(true);
  };

  const closeCalendar = () => setShowCalendar(false);

  const handleCalendarDayPress = (day: number) => {
    const selected = new Date(calendarYear, calendarMonth, day);
    if (calendarPickingFor === "start") {
      const newEnd = new Date(Math.max(selected.valueOf(), endDate.valueOf()));
      onDatesChange(selected, newEnd);
      setCalendarYear(newEnd.getFullYear());
      setCalendarMonth(newEnd.getMonth());
      setCalendarPickingFor("end");
    } else {
      if (selected < startDate) {
        onDatesChange(selected, startDate);
      } else {
        onDatesChange(startDate, selected);
      }
      setShowCalendar(false);
    }
  };

  const goToPrevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear((y) => y - 1); }
    else setCalendarMonth((m) => m - 1);
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear((y) => y + 1); }
    else setCalendarMonth((m) => m + 1);
  };

  return {
    showCalendar,
    calendarPickingFor,
    calendarYear,
    calendarMonth,
    openCalendar,
    closeCalendar,
    handleCalendarDayPress,
    goToPrevMonth,
    goToNextMonth,
  };
};

export default useCalendarPicker;
