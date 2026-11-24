'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KeyRound, LoaderCircle, RotateCw } from 'lucide-react';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';

interface Department {
    id: string;
    slug: string;
    name: string;
    faculty: string | null;
    program: string | null;
    has_access_code: boolean;
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
    return error instanceof Error ? error.message : 'The request failed.';
}

export default function DepartmentManagementPage() {
    const [revealedCode, setRevealedCode] = useState<{ department: string; code: string } | null>(null);
    const departments = useQuery({
        queryKey: ['departments', 'admin'],
        queryFn: async () => (await apiClient.get<{ data: Department[] }>('/departments/admin')).data.data,
    });
    const generateCode = useMutation({
        mutationFn: async (department: Department) => {
            const response = await apiClient.post<{ code: string }>(
                `/departments/${department.id}/access-code/generate`,
            );
            return { department: department.name, code: response.data.code };
        },
        onMutate: () => setRevealedCode(null),
        onSuccess: setRevealedCode,
        onSettled: () => departments.refetch(),
    });

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#F6F8FF] font-sans text-[#0B123D]">
            <Navbar userRole="admin" />
            <div className="flex flex-1 flex-col md:flex-row">
                <Sidebar userRole="admin" />
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-4xl space-y-6">
                        <header>
                            <h1 className="text-2xl font-bold md:text-3xl">Departments &amp; access codes</h1>
                            <p className="mt-1 text-sm text-[#64708C]">
                                Generate or rotate the reusable timetable access code for each department.
                            </p>
                        </header>

                        {departments.isLoading && <p className="text-sm text-[#64708C]">Loading departments…</p>}
                        {departments.error && <p role="alert" className="text-sm text-red-600">{errorText(departments.error)}</p>}
                        {generateCode.error && <p role="alert" className="text-sm text-red-600">{errorText(generateCode.error)}</p>}
                        {revealedCode && (
                            <section role="status" className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4">
                                <p className="text-sm font-semibold">New code for {revealedCode.department} — copy it now.</p>
                                <code className="block break-all rounded-lg bg-white px-3 py-2 font-mono text-lg">
                                    {revealedCode.code}
                                </code>
                                <p className="text-xs text-[#64708C]">
                                    The clear code is shown only in this response. Rotating it invalidates the previous code.
                                </p>
                            </section>
                        )}
                        <section className="divide-y divide-[#E1E6F3] overflow-hidden rounded-2xl border border-[#E1E6F3] bg-white">
                            {(departments.data || []).map((department) => (
                                <article key={department.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold">{department.name}</h2>
                                        <p className="mt-1 text-sm text-[#64708C]">
                                            {[department.faculty, department.program].filter(Boolean).join(' · ') || 'Faculty/program metadata not set'}
                                        </p>
                                        <span className="mt-2 inline-flex rounded-full bg-[#F1F4FA] px-2.5 py-1 text-xs text-[#64708C]">
                                            {department.has_access_code ? 'Code configured' : 'No code yet'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={generateCode.isPending}
                                        onClick={() => generateCode.mutate(department)}
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#245CFF] px-4 text-sm font-semibold text-white hover:bg-[#1d4bd8] disabled:opacity-50"
                                    >
                                        {generateCode.isPending && generateCode.variables?.id === department.id
                                            ? <LoaderCircle className="h-4 w-4 animate-spin" />
                                            : department.has_access_code ? <RotateCw className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                                        {department.has_access_code ? 'Rotate code' : 'Generate code'}
                                    </button>
                                </article>
                            ))}
                        </section>
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
