'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';

interface TimetableEntry {
    id: string;
    entry_type: 'class' | 'exam' | 'event';
    title: string;
    course_code: string | null;
    day_of_week: number | null;
    day_name: string | null;
    schedule_date: string | null;
    start_time: string;
    end_time: string;
    location: string | null;
    notes: string | null;
}

interface StudentTimetable {
    department: { id: string; name: string; faculty: string | null; program: string | null };
    entries: TimetableEntry[];
}

function errorText(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = error.response;
        if (typeof response === 'object' && response !== null && 'data' in response) {
            const data = response.data;
            if (typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string') {
                return data.detail;
            }
        }
    }
    return error instanceof Error ? error.message : 'Could not load the timetable.';
}

export default function StudentTimetablePage() {
    const timetable = useQuery({
        queryKey: ['departments', 'student-timetable'],
        queryFn: async () => (await apiClient.get<StudentTimetable>('/departments/timetable')).data,
    });
    const classes = timetable.data?.entries.filter((entry) => entry.entry_type === 'class') || [];
    const datedEntries = timetable.data?.entries.filter((entry) => entry.schedule_date) || [];
    const datedGroups = datedEntries.reduce<Record<string, TimetableEntry[]>>((groups, entry) => {
        const dateKey = entry.schedule_date || '';
        groups[dateKey] = [...(groups[dateKey] || []), entry];
        return groups;
    }, {});

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#F6F8FF] font-sans text-[#0B123D]">
            <Navbar userRole="student" />
            <div className="flex flex-1 flex-col md:flex-row">
                <Sidebar userRole="student" />
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-5xl space-y-6">
                        <header>
                            <h1 className="text-2xl font-bold md:text-3xl">My department timetable</h1>
                            {timetable.data && (
                                <p className="mt-1 text-sm text-[#64708C]">
                                    {timetable.data.department.name}
                                    {[timetable.data.department.faculty, timetable.data.department.program].filter(Boolean).length
                                        ? ` · ${[timetable.data.department.faculty, timetable.data.department.program].filter(Boolean).join(' · ')}`
                                        : ''}
                                </p>
                            )}
                        </header>
                        {timetable.isLoading && <p className="text-sm text-[#64708C]">Loading your timetable…</p>}
                        {timetable.error && (
                            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errorText(timetable.error)}
                            </p>
                        )}
                        {timetable.data && (
                            <>
                                <section className="space-y-3">
                                    <h2 className="text-lg font-semibold">Weekly classes</h2>
                                    {classes.length ? classes.map((entry) => (
                                        <article key={entry.id} className="flex gap-3 rounded-xl border border-[#E1E6F3] bg-white p-4">
                                            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#245CFF]" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold">{entry.title}</h3>
                                                    {entry.course_code && <span className="text-xs text-[#64708C]">{entry.course_code}</span>}
                                                </div>
                                                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#64708C]">
                                                    <span>{entry.day_name}</span>
                                                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{entry.start_time}–{entry.end_time}</span>
                                                    {entry.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{entry.location}</span>}
                                                </p>
                                                {entry.notes && <p className="mt-2 text-sm text-[#64708C]">{entry.notes}</p>}
                                            </div>
                                        </article>
                                    )) : <p className="rounded-xl border border-dashed border-[#C7D2FE] bg-white p-5 text-sm text-[#64708C]">No recurring classes have been scheduled.</p>}
                                </section>
                                <section className="space-y-3">
                                    <h2 className="text-lg font-semibold">Exams &amp; events</h2>
                                    {Object.entries(datedGroups).length ? Object.entries(datedGroups).map(([date, entries]) => (
                                        <div key={date} className="space-y-2">
                                            <h3 className="text-sm font-semibold text-[#64708C]">
                                                {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </h3>
                                            {entries.map((entry) => (
                                                <article key={entry.id} className="flex gap-3 rounded-xl border border-[#E1E6F3] bg-white p-4">
                                                    <CalendarDays className={`mt-0.5 h-5 w-5 shrink-0 ${entry.entry_type === 'exam' ? 'text-[#DF365B]' : 'text-[#245CFF]'}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-semibold">{entry.title}</h4>
                                                            <span className="rounded-full bg-[#F1F4FA] px-2 py-0.5 text-xs capitalize text-[#64708C]">{entry.entry_type}</span>
                                                            {entry.course_code && <span className="text-xs text-[#64708C]">{entry.course_code}</span>}
                                                        </div>
                                                        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-[#64708C]">
                                                            <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{entry.start_time}–{entry.end_time}</span>
                                                            {entry.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{entry.location}</span>}
                                                        </p>
                                                        {entry.notes && <p className="mt-2 text-sm text-[#64708C]">{entry.notes}</p>}
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )) : <p className="rounded-xl border border-dashed border-[#C7D2FE] bg-white p-5 text-sm text-[#64708C]">No dated exams or events have been scheduled.</p>}
                                </section>
                            </>
                        )}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
