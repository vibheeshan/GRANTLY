import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  ExternalLink,
  Bookmark,
  Download,
  CalendarDays,
  ListTodo,
  CalendarPlus,
  ChevronDown
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Input } from "../components/ui/Input.jsx";
import { formatDate, formatCurrency, getDaysRemaining } from "../utils/formatters.js";
import { buildAllDeadlinesIcs, buildIcsEvent, downloadIcsFile } from "../utils/ics.js";
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from "../utils/links.js";

export function CalendarPage() {
  const { allScholarships, reminders, addReminder, toggleReminder, deleteReminder } = useScholarships();

  // Calendar month state (defaults to Nov 2026 per current local time)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed: 10 is November
  const [calendarView, setCalendarView] = useState("month"); // "month" | "week" | "agenda"
  const [selectedDateStr, setSelectedDateStr] = useState("2026-11-28");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("2026-11-20");
  const [activeCalDropdownId, setActiveCalDropdownId] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Build grid days for Month view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    // Blank cells before month starts
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ blank: true, key: `blank-${i}` });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const deadlinesOnDay = allScholarships.filter(s => s.deadline === dayStr);
      const remindersOnDay = reminders.filter(r => r.date === dayStr);

      days.push({
        dayNumber: d,
        dateStr: dayStr,
        deadlines: deadlinesOnDay,
        reminders: remindersOnDay,
        hasEvents: deadlinesOnDay.length > 0 || remindersOnDay.length > 0
      });
    }

    return days;
  }, [currentYear, currentMonth, allScholarships, reminders]);

  // Build 7-day schedule for Week view based on selectedDateStr
  const weekDays = useMemo(() => {
    const baseDate = new Date(selectedDateStr || "2026-11-20");
    const dayOfWeek = baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const deadlines = allScholarships.filter(s => s.deadline === dateStr);
      const taskList = reminders.filter(r => r.date === dateStr);
      days.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        deadlines,
        reminders: taskList
      });
    }
    return days;
  }, [selectedDateStr, allScholarships, reminders]);

  // Build chronological timeline for Agenda view
  const agendaItems = useMemo(() => {
    const items = [];
    allScholarships.forEach(s => {
      items.push({
        id: `sch-${s.id}`,
        type: "deadline",
        title: s.title,
        provider: s.provider,
        awardAmount: s.awardAmount,
        currency: s.currency,
        date: s.deadline,
        scholarshipId: s.id
      });
    });
    reminders.forEach(r => {
      items.push({
        id: `rem-${r.id}`,
        type: "task",
        title: r.title,
        completed: r.completed,
        date: r.date,
        reminderId: r.id
      });
    });
    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allScholarships, reminders]);

  // Selected date events
  const selectedDayDeadlines = allScholarships.filter(s => s.deadline === selectedDateStr);
  const selectedDayReminders = reminders.filter(r => r.date === selectedDateStr);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addReminder(newTaskTitle.trim(), newTaskDate);
    setNewTaskTitle("");
    setIsNewTaskModalOpen(false);
  };

  const handleExportICS = () => {
    const icsContent = buildAllDeadlinesIcs(allScholarships);
    downloadIcsFile("grantly_scholarship_deadlines.ics", icsContent);
  };

  const handleDownloadSingleIcs = (sch) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GRANTLY//Deadline//EN",
      buildIcsEvent({
        id: sch.id,
        title: sch.title,
        provider: sch.provider,
        deadline: sch.deadline,
        awardAmount: sch.awardAmount,
        currency: sch.currency || "INR",
        url: sch.applicationUrl || "https://grantly.app"
      }),
      "END:VCALENDAR"
    ].join("\r\n");
    downloadIcsFile(`deadline-${sch.id}.ics`, icsContent);
    setActiveCalDropdownId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Deadline Calendar &amp; Tasks
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track key application milestones, document collection deadlines, and official dates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: Month / Week / Agenda */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCalendarView("month")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                calendarView === "month"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarView("week")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                calendarView === "week"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView("agenda")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                calendarView === "agenda"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Agenda
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportICS}
            title="Download iCalendar file to sync with Google Calendar or Apple Calendar"
          >
            Export .ICS
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setNewTaskDate(selectedDateStr || "2026-11-20");
              setIsNewTaskModalOpen(true);
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* View 1: Month View (Default) */}
      {calendarView === "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Monthly Interactive Calendar (7 cols on lg) */}
          <div className="lg:col-span-7">
            <Card className="p-4 sm:p-6 shadow-sm">
              {/* Month Navigator Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {monthNames[currentMonth]} {currentYear}
                </h3>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentYear(2026);
                      setCurrentMonth(10);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekdays Row */}
              <div className="grid grid-cols-7 gap-1 text-center py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, idx) => {
                  if (day.blank) {
                    return (
                      <div
                        key={day.key}
                        className="h-20 sm:h-24 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 border border-transparent"
                      />
                    );
                  }

                  const isSelected = day.dateStr === selectedDateStr;
                  const isToday = day.dateStr === "2026-11-20";

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedDateStr(day.dateStr)}
                      className={`h-20 sm:h-24 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative group ${
                        isSelected
                          ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 ring-2 ring-violet-500/20"
                          : day.hasEvents
                          ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                          : "border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold leading-none ${
                            isToday
                              ? "w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center font-mono"
                              : isSelected
                              ? "text-violet-600 dark:text-violet-400 font-bold"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {day.deadlines.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>

                      {/* Pill previews */}
                      <div className="space-y-0.5 mt-1 overflow-hidden">
                        {day.deadlines.slice(0, 1).map((d) => (
                          <div
                            key={d.id}
                            className="text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 truncate"
                          >
                            ⚠️ {d.title}
                          </div>
                        ))}
                        {day.reminders.slice(0, 1).map((rem) => (
                          <div
                            key={rem.id}
                            className="text-[9px] font-semibold px-1 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 truncate"
                          >
                            ✓ {rem.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700" />
                  <span>Scholarship Deadline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-700" />
                  <span>Action Reminder Task</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Selected Date Detail & Reminders List (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Selected Date Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle subtitle="Agenda for selected calendar date">
                    {formatDate(selectedDateStr)}
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedDayDeadlines.length + selectedDayReminders.length} item(s)
                </span>
              </CardHeader>

              <CardBody className="space-y-4">
                {/* Deadlines Section */}
                {selectedDayDeadlines.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      Scholarship Submissions Due
                    </span>
                    {selectedDayDeadlines.map((sch) => {
                      const isDropdownOpen = activeCalDropdownId === sch.id;
                      const googleUrl = getGoogleCalendarUrl({
                        title: sch.title,
                        deadline: sch.deadline,
                        provider: sch.provider,
                        details: `Award: ${sch.currency || "INR"} ${sch.awardAmount}. Deadline: ${sch.deadline}`
                      });
                      const outlookUrl = getOutlookCalendarUrl({
                        title: sch.title,
                        deadline: sch.deadline,
                        provider: sch.provider,
                        details: `Award: ${sch.currency || "INR"} ${sch.awardAmount}. Deadline: ${sch.deadline}`
                      });

                      return (
                        <div
                          key={sch.id}
                          className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 text-xs flex items-start justify-between gap-3 relative"
                        >
                          <div>
                            <Link
                              to={`/scholarship/${sch.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 block leading-snug"
                            >
                              {sch.title}
                            </Link>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                              {sch.provider} • Award: {formatCurrency(sch.awardAmount, sch.currency)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setActiveCalDropdownId(isDropdownOpen ? null : sch.id)}
                                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-0.5"
                                title="Add to calendar"
                              >
                                <CalendarPlus className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                              </button>

                              {isDropdownOpen && (
                                <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-[#1E293B] shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                                  <a
                                    href={googleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveCalDropdownId(null)}
                                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3 h-3 text-blue-500" />
                                    <span>Google Calendar</span>
                                  </a>
                                  <a
                                    href={outlookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveCalDropdownId(null)}
                                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3 h-3 text-sky-500" />
                                    <span>Outlook Web</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadSingleIcs(sch)}
                                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                                  >
                                    <Download className="w-3 h-3 text-teal-500" />
                                    <span>Download .ICS</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <Link to={`/scholarship/${sch.id}`}>
                              <Button size="xs" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reminders Section */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                    Action Tasks &amp; Reminders
                  </span>

                  {selectedDayReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center justify-between gap-2"
                    >
                      <button
                        onClick={() => toggleReminder(rem.id)}
                        className="flex items-center gap-2.5 text-left cursor-pointer flex-1 min-w-0"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            rem.completed
                              ? "bg-teal-500 border-teal-500 text-white"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {rem.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span
                          className={`font-semibold text-slate-800 dark:text-slate-200 truncate ${
                            rem.completed ? "line-through opacity-60" : ""
                          }`}
                        >
                          {rem.title}
                        </span>
                      </button>

                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {selectedDayReminders.length === 0 && (
                    <p className="text-xs text-slate-400 py-1">
                      No custom reminders scheduled for this date.
                    </p>
                  )}
                </div>

                {selectedDayDeadlines.length === 0 && selectedDayReminders.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                    <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p>No deadlines or tasks scheduled on this date.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* View 2: Week View */}
      {calendarView === "week" && (
        <Card className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              7-Day Weekly Planner (Week of {weekDays[0]?.dateStr})
            </h3>
            <span className="text-xs text-slate-400">
              Click any date column to view details
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((wd) => {
              const isSelected = wd.dateStr === selectedDateStr;
              return (
                <div
                  key={wd.dateStr}
                  onClick={() => setSelectedDateStr(wd.dateStr)}
                  className={`p-3 rounded-2xl border min-h-[16rem] flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-violet-500 bg-violet-50/40 dark:bg-violet-950/30 ring-2 ring-violet-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold uppercase text-slate-400">{wd.dayName}</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{wd.dayNum}</span>
                    </div>

                    <div className="space-y-1.5 mt-2.5">
                      {wd.deadlines.map((s) => (
                        <div
                          key={s.id}
                          className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800 text-[10px] text-amber-900 dark:text-amber-200 leading-tight font-semibold"
                        >
                          ⚠️ {s.title}
                        </div>
                      ))}
                      {wd.reminders.map((r) => (
                        <div
                          key={r.id}
                          className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/80 border border-teal-300/80 dark:border-teal-800 text-[10px] text-teal-900 dark:text-teal-200 leading-tight font-semibold"
                        >
                          ✓ {r.title}
                        </div>
                      ))}
                      {wd.deadlines.length === 0 && wd.reminders.length === 0 && (
                        <span className="text-[10px] text-slate-400 block text-center pt-6">No tasks</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 block text-center pt-2">
                    {wd.deadlines.length + wd.reminders.length} item(s)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* View 3: Chronological Agenda View */}
      {calendarView === "agenda" && (
        <Card className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Chronological Deadlines &amp; Task Agenda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sorted chronologically by impending due dates across all grants and action checklists.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              {agendaItems.length} Total Deadlines &amp; Tasks
            </span>
          </div>

          <div className="space-y-2.5">
            {agendaItems.map((item) => {
              const daysLeft = getDaysRemaining(item.date);
              const isPast = daysLeft !== null && daysLeft < 0;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    item.type === "deadline"
                      ? "border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      item.type === "deadline"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        : "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                    }`}>
                      {item.type === "deadline" ? "Official Deadline" : "Personal Task"}
                    </span>

                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">
                        {item.title}
                      </span>
                      {item.provider && (
                        <span className="text-[11px] text-slate-500">
                          {item.provider} • Award: {formatCurrency(item.awardAmount, item.currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {formatDate(item.date)}
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        isPast ? "text-rose-500" : daysLeft <= 14 ? "text-amber-500" : "text-slate-400"
                      }`}>
                        {isPast ? `${Math.abs(daysLeft)}d ago` : `${daysLeft} days remaining`}
                      </span>
                    </div>

                    {item.scholarshipId && (
                      <Link to={`/scholarship/${item.scholarshipId}`}>
                        <Button size="xs" variant="primary">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Task Creation Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title="Schedule a Preparation Task"
        subtitle="Add a milestone deadline to your personal calendar"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Description"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Request income certificate from Tahsildar"
            required
          />

          <Input
            label="Target Completion Date"
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsNewTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}