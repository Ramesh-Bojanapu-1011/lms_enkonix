import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import {
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  Menu,
  Plus,
  X,
} from "lucide-react";
import Head from "next/head";
import { useMemo, useState } from "react";

type ViewMode = "month" | "week" | "day";

type CalendarEvent = {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  color: "yellow" | "green" | "red" | "purple";
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const eventColorStyles: Record<CalendarEvent["color"], string> = {
  yellow: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  green: "bg-green-50 text-green-700 border border-green-200",
  red: "bg-red-50 text-red-600 border border-red-200",
  purple: "bg-purple-50 text-purple-600 border border-purple-200",
};

const events: CalendarEvent[] = [
  { id: 1, title: "Design Review", date: "2023-09-02", color: "red" },
  {
    id: 2,
    title: "Meeting",
    date: "2023-09-05",
    time: "11:30 - 13:00",
    color: "yellow",
  },
  {
    id: 3,
    title: "Design Review",
    date: "2023-09-09",
    time: "10:00 - 11:00",
    color: "red",
  },
  {
    id: 4,
    title: "Discussion",
    date: "2023-09-09",
    time: "10:00 - 11:00",
    color: "purple",
  },
  {
    id: 5,
    title: "Market Research",
    date: "2023-09-14",
    color: "green",
  },
  { id: 6, title: "Discussion", date: "2023-09-14", color: "purple" },
  { id: 7, title: "Design Review", date: "2023-09-19", color: "red" },
  { id: 8, title: "New Deals", date: "2023-09-19", color: "purple" },
  { id: 9, title: "Meeting", date: "2023-09-22", color: "yellow" },
  { id: 10, title: "Design Review", date: "2023-09-22", color: "red" },
  { id: 11, title: "Meeting", date: "2023-09-28", color: "yellow" },
  { id: 12, title: "Design Review", date: "2023-09-28", color: "red" },
  { id: 13, title: "New Deals", date: "2023-09-28", color: "purple" },
  { id: 14, title: "Discussion", date: "2023-09-28", color: "purple" },
  { id: 15, title: "Meeting", date: "2023-09-30", color: "yellow" },
  { id: 16, title: "Design Review", date: "2023-09-30", color: "red" },
  { id: 17, title: "New Deals", date: "2023-09-30", color: "purple" },
  { id: 18, title: "Discussion", date: "2023-09-30", color: "purple" },
];

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const startOfWeek = (date: Date) => addDays(date, -date.getDay());

const buildMonthGrid = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }
  return days;
};

const groupEventsByDate = (items: CalendarEvent[]) => {
  return items.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = event.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const SchedulePage = () => {
  const [currentView, setCurrentView] = useState<ViewMode>("month");
  const [focusDate, setFocusDate] = useState<Date>(new Date(2023, 8, 1));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const eventsByDate = useMemo(() => groupEventsByDate(events), []);
  const monthGrid = useMemo(() => buildMonthGrid(focusDate), [focusDate]);
  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(() => {
    const start = startOfWeek(focusDate);
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
  }, [focusDate]);

  const changeStep = (direction: number) => {
    if (currentView === "month") {
      setFocusDate(
        new Date(focusDate.getFullYear(), focusDate.getMonth() + direction, 1),
      );
      return;
    }
    if (currentView === "week") {
      setFocusDate(addDays(focusDate, 7 * direction));
      return;
    }
    setFocusDate(addDays(focusDate, direction));
  };

  const handleToday = () => setFocusDate(new Date());

  const headerLabel = useMemo(() => {
    if (currentView === "month") {
      return `${monthNames[focusDate.getMonth()]} ${focusDate.getFullYear()}`;
    }
    if (currentView === "week") {
      const start = weekDays[0];
      const end = weekDays[6];
      const startLabel = `${monthNames[start.getMonth()].slice(
        0,
        3,
      )} ${start.getDate()}`;
      const endLabel = `${monthNames[end.getMonth()].slice(
        0,
        3,
      )} ${end.getDate()}`;
      return `${startLabel} - ${endLabel}`;
    }
    const dayLabel = `${
      monthNames[focusDate.getMonth()]
    } ${focusDate.getDate()}, ${focusDate.getFullYear()}`;
    return dayLabel;
  }, [currentView, focusDate, weekDays]);

  const renderEventChip = (event: CalendarEvent) => (
    <div
      key={event.id}
      className={`mt-1 text-[11px] font-medium px-2 py-1 rounded ${
        eventColorStyles[event.color]
      }`}
    >
      <div className="leading-tight">{event.title}</div>
      {event.time && <div className="text-[10px] opacity-80">{event.time}</div>}
    </div>
  );

  const MonthView = () => (
    <div className="">
      <div className="grid grid-cols-7 gap-2 mt-6  py-2 rounded-[3.55px] bg-[#E4E4E4]">
        {weekdayNames.map((day) => (
          <div
            key={day}
            className="text-xs flex justify-center items-center font-semibold text-gray-500 text-center pb-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-6">
        {monthGrid.map((day) => {
          const key = formatDateKey(day);
          const dayEvents = eventsByDate[key] || [];
          const isCurrentMonth = day.getMonth() === focusDate.getMonth();
          const highlightToday = isSameDay(day, today);

          return (
            <div
              key={key}
              className={`min-h-30 rounded-lg border border-gray-200 p-2 text-sm transition-colors ${
                highlightToday ? "bg-orange-50 border-orange-200" : "bg-white"
              } ${isCurrentMonth ? "" : "text-gray-300"}`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>{day.getDate()}</span>
                {highlightToday && (
                  <span className="text-[10px] text-orange-500 font-semibold">
                    Today
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => renderEventChip(event))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const WeekView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
      {weekDays.map((day) => {
        const key = formatDateKey(day);
        const dayEvents = eventsByDate[key] || [];
        const highlightToday = isSameDay(day, today);

        return (
          <div
            key={key}
            className={`rounded-lg border p-4 min-h-35 ${
              highlightToday
                ? "border-orange-300 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-semibold text-gray-800">
                {day.getDate()}
              </span>
              <span className="text-xs text-gray-500">
                {weekdayNames[day.getDay()]}
              </span>
            </div>
            <div className="space-y-2">
              {dayEvents.length === 0 && (
                <div className="text-xs text-gray-400">No events</div>
              )}
              {dayEvents.map((event) => renderEventChip(event))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const DayView = () => {
    const key = formatDateKey(focusDate);
    const dayEvents = eventsByDate[key] || [];

    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xl font-semibold text-gray-800">
                {monthNames[focusDate.getMonth()]} {focusDate.getDate()}
              </div>
              <div className="text-sm text-gray-500">
                {weekdayNames[focusDate.getDay()]}, {focusDate.getFullYear()}
              </div>
            </div>
            <div className="text-sm text-orange-500 font-semibold">
              Timeline
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 10 }, (_, idx) => 8 + idx).map((hour) => {
              const label = `${hour}:00`;
              const matchingEvents = dayEvents.filter((event) =>
                event.time
                  ? event.time.startsWith(String(hour).padStart(2, "0"))
                  : false,
              );

              return (
                <div key={hour} className="py-3 flex items-start gap-4">
                  <div className="w-16 text-xs text-gray-400">{label}</div>
                  <div className="flex-1 space-y-2">
                    {matchingEvents.length === 0 ? (
                      <div className="h-4 bg-gray-50 rounded"></div>
                    ) : (
                      matchingEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            eventColorStyles[event.color]
                          }`}
                        >
                          <div>{event.title}</div>
                          {event.time && (
                            <div className="text-[11px] opacity-80">
                              {event.time}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Today's Events</span>
            <span className="text-xs text-gray-500">
              {dayEvents.length} items
            </span>
          </div>
          {dayEvents.length === 0 && (
            <div className="text-sm text-gray-400">No events scheduled.</div>
          )}
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className={`px-3 py-2 rounded-lg ${
                eventColorStyles[event.color]
              }`}
            >
              <div className="text-sm font-semibold">{event.title}</div>
              {event.time && (
                <div className="text-[11px] opacity-80">{event.time}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Schedule - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out bg-white lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">ESS Student Hub</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
                  <div className="flex items-center gap-6 text-sm font-semibold text-gray-500">
                    {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setCurrentView(mode)}
                        className={`pb-1 border-b-2 transition-colors ${
                          currentView === mode
                            ? "text-orange-500 border-orange-500"
                            : "border-transparent hover:text-orange-500"
                        }`}
                      >
                        {mode === "month"
                          ? "Monthly"
                          : mode === "week"
                            ? "Weekly"
                            : "Daily"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border-[0.89px] border-[#FF4B00]  text-orange-500 rounded-lg hover:bg-orange-50 text-sm font-semibold">
                    <FilterIcon size={16} />
                    Filter
                  </button>
                  {/* seperator */}
                  <div className="w-px h-8 bg-gray-300" />
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-semibold">
                    <Plus size={16} />
                    Add Event
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center   gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => changeStep(-1)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button className="flex items-center gap-2 text-orange-500 font-semibold text-lg hover:opacity-80">
                    <span>{headerLabel}</span>
                  </button>

                  <button
                    onClick={() => changeStep(1)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <button
                  onClick={handleToday}
                  className="px-6 py-2 rounded bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
                >
                  Today
                </button>
              </div>

              {currentView === "month" && <MonthView />}
              {currentView === "week" && <WeekView />}
              {currentView === "day" && <DayView />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SchedulePage;
