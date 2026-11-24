'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';

interface Department {
    id: string;
    name: string;
}

interface Entry {
    id: string;
    department_id: string;
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

interface ScheduleForm {
    entry_type: Entry['entry_type'];
    title: string;
    course_code: string;
    day_of_week: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    location: string;
    notes: string;
}

const blankForm: ScheduleForm = {
    entry_type: 'class', title: '', course_code: '', day_of_week: '1',
    schedule_date: '', start_time: '09:00', end_time: '10:00', location: '', notes: '',
};
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    return error instanceof Error ? error.message : 'The request failed.';
}

function entryToForm(entry: Entry): ScheduleForm {
    return {
        entry_type: entry.entry_type,
        title: entry.title,
        course_code: entry.course_code || '',
        day_of_week: entry.day_of_week ? String(entry.day_of_week) : '',
        schedule_date: entry.schedule_date || '',
        start_time: entry.start_time,
        end_time: entry.end_time,
        location: entry.location || '',
        notes: entry.notes || '',
    };
}

export default function AdminTimetablePage() {
    const queryClient = useQueryClient();
    const [departmentId, setDepartmentId] = useState('');
    const [editing, setEditing] = useState<Entry | null>(null);
    const [form, setForm] = useState<ScheduleForm>(blankForm);
    const departments = useQuery({
        queryKey: ['departments', 'admin'],
        queryFn: async () => (await apiClient.get<{ data: Department[] }>('/departments/admin')).data.data,
    });
    const selectedDepartmentId = departmentId || departments.data?.[0]?.id || '';
    const timetable = useQuery({
        queryKey: ['departments', 'timetable', selectedDepartmentId],
        enabled: Boolean(selectedDepartmentId),
        queryFn: async () => (await apiClient.get<{ entries: Entry[] }>(`/departments/${selectedDepartmentId}/timetable`)).data.entries,
    });

    const saveEntry = useMutation({
        mutationFn: async (payload: ScheduleForm) => {
            const request = {
                entry_type: payload.entry_type,
                title: payload.title.trim(),
                course_code: payload.course_code.trim() || null,
                day_of_week: payload.entry_type === 'class' ? Number(payload.day_of_week) : null,
                schedule_date: payload.entry_type === 'class' ? null : payload.schedule_date,
                start_time: payload.start_time,
                end_time: payload.end_time,
                location: payload.location.trim() || null,
                notes: payload.notes.trim() || null,
            };
            if (editing) {
                await apiClient.put(`/departments/timetable/${editing.id}`, request);
            } else {
                await apiClient.post(`/departments/timetable?department_id=${encodeURIComponent(selectedDepartmentId)}`, request);
            }
        },
        onSuccess: async () => {
            setEditing(null);
            setForm(blankForm);
            await queryClient.invalidateQueries({ queryKey: ['departments', 'timetable', selectedDepartmentId] });
        },
    });
    const removeEntry = useMutation({
        mutationFn: async (id: string) => apiClient.delete(`/departments/timetable/${id}`),
        onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['departments', 'timetable', selectedDepartmentId] }),
    });

    const changeKind = (entry_type: Entry['entry_type']) => {
        setForm((current) => ({ ...current, entry_type, day_of_week: entry_type === 'class' ? '1' : '', schedule_date: '' }));
    };
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        saveEntry.mutate(form);
    };
    const startEdit = (entry: Entry) => {
        setEditing(entry);
        setForm(entryToForm(entry));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const cancelEdit = () => {
        setEditing(null);
        setForm(blankForm);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#F6F8FF] font-sans text-[#0B123D]">
            <Navbar userRole="admin" />
            <div className="flex flex-1 flex-col md:flex-row">
                <Sidebar userRole="admin" />
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-5xl space-y-6">
                        <header>
                            <h1 className="text-2xl font-bold md:text-3xl">Department timetable</h1>
                            <p className="mt-1 text-sm text-[#64708C]">Manage recurring weekly classes and dated exams or events.</p>
                        </header>
                        <label className="block max-w-xl space-y-1.5 text-sm font-medium">
                            Department
                            <select
                                value={selectedDepartmentId}
                                onChange={(event) => { setDepartmentId(event.target.value); cancelEdit(); }}
                                className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3"
                            >
                                {(departments.data || []).map((department) => (
                                    <option key={department.id} value={department.id}>{department.name}</option>
                                ))}
                            </select>
                        </label>

                        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#E1E6F3] bg-white p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-semibold">{editing ? 'Edit schedule entry' : 'Add schedule entry'}</h2>
                                {editing && <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1 text-sm text-[#64708C]"><X className="h-4 w-4" /> Cancel</button>}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-1.5 text-sm font-medium">
                                    Type
                                    <select value={form.entry_type} onChange={(event) => changeKind(event.target.value as Entry['entry_type'])} className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3">
                                        <option value="class">Weekly class</option><option value="exam">Exam</option><option value="event">Event</option>
                                    </select>
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Course code <span className="font-normal text-[#64708C]">(optional)</span>
                                    <input maxLength={20} value={form.course_code} onChange={(event) => setForm({ ...form, course_code: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3" />
                                </label>
                                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                                    Title
                                    <input required maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3" />
                                </label>
                                {form.entry_type === 'class' ? (
                                    <label className="space-y-1.5 text-sm font-medium">
                                        Weekday
                                        <select value={form.day_of_week} onChange={(event) => setForm({ ...form, day_of_week: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3">
                                            {weekdays.map((day, index) => <option key={day} value={index + 1}>{day}</option>)}
                                        </select>
                                    </label>
                                ) : (
                                    <label className="space-y-1.5 text-sm font-medium">
                                        Date
                                        <input required type="date" value={form.schedule_date} onChange={(event) => setForm({ ...form, schedule_date: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3" />
                                    </label>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="space-y-1.5 text-sm font-medium">Start time<input required type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3" /></label>
                                    <label className="space-y-1.5 text-sm font-medium">End time<input required type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3" /></label>
                                </div>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Location <span className="font-normal text-[#64708C]">(optional)</span>
                                    <input maxLength={200} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3" />
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Notes <span className="font-normal text-[#64708C]">(optional)</span>
                                    <input maxLength={2000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3" />
                                </label>
                            </div>
                            {saveEntry.error && <p role="alert" className="text-sm text-red-600">{errorText(saveEntry.error)}</p>}
                            <button type="submit" disabled={!selectedDepartmentId || saveEntry.isPending} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#245CFF] px-5 text-sm font-semibold text-white hover:bg-[#1d4bd8] disabled:opacity-50">
                                {saveEntry.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {editing ? 'Save changes' : 'Add to timetable'}
                            </button>
                        </form>

                        {timetable.error && <p role="alert" className="text-sm text-red-600">{errorText(timetable.error)}</p>}
                        {removeEntry.error && <p role="alert" className="text-sm text-red-600">{errorText(removeEntry.error)}</p>}
                        {timetable.isLoading && <p className="text-sm text-[#64708C]">Loading timetable…</p>}
                        <section className="space-y-3">
                            {(timetable.data || []).map((entry) => (
                                <article key={entry.id} className="flex flex-col gap-4 rounded-xl border border-[#E1E6F3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-3">
                                        <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#245CFF]" />
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">{entry.title}</h3>
                                                <span className="rounded-full bg-[#E9EDFF] px-2 py-0.5 text-xs capitalize text-[#245CFF]">{entry.entry_type}</span>
                                                {entry.course_code && <span className="text-xs text-[#64708C]">{entry.course_code}</span>}
                                            </div>
                                            <p className="mt-1 text-sm text-[#64708C]">
                                                {entry.day_name || entry.schedule_date} · {entry.start_time}–{entry.end_time}
                                                {entry.location ? ` · ${entry.location}` : ''}
                                            </p>
                                            {entry.notes && <p className="mt-1 text-sm text-[#64708C]">{entry.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => startEdit(entry)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#E1E6F3] px-3 text-sm hover:border-[#245CFF]"><Pencil className="h-4 w-4" /> Edit</button>
                                        <button type="button" disabled={removeEntry.isPending} onClick={() => removeEntry.mutate(entry.id)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete</button>
                                    </div>
                                </article>
                            ))}
                            {!timetable.isLoading && selectedDepartmentId && !timetable.data?.length && (
                                <p className="rounded-xl border border-dashed border-[#C7D2FE] bg-white p-6 text-center text-sm text-[#64708C]">No timetable entries for this department yet.</p>
                            )}
                        </section>
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
