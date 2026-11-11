'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, FileUp, LoaderCircle, UploadCloud } from 'lucide-react';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';

interface ResourceOptions {
    categories: { id: string; name: string; slug: string }[];
    courses: { id: string; course_code: string; title: string }[];
}

function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = error.response;
        if (typeof response === 'object' && response !== null && 'data' in response) {
            const data = response.data;
            if (typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string') {
                return data.detail;
            }
        }
    }
    return error instanceof Error ? error.message : 'Resource upload failed.';
}

export default function UploadResourcePage() {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [resourceType, setResourceType] = useState('lecture_note');
    const [courseCode, setCourseCode] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [programmingLanguage, setProgrammingLanguage] = useState('');
    const [keywords, setKeywords] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const {
        data: options,
        isLoading: isLoadingOptions,
        error: optionsError,
    } = useQuery({
        queryKey: ['resources', 'options'],
        queryFn: async () => {
            const response = await apiClient.get<ResourceOptions>('/resources/options');
            return response.data;
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!file) {
                throw new Error('Choose a file to upload.');
            }
            const form = new FormData();
            form.append('file', file);
            form.append('title', title.trim());
            form.append('description', description.trim());
            form.append('resource_type', resourceType);
            form.append('course_code', courseCode);
            form.append('category_id', categoryId);
            form.append('programming_language', programmingLanguage.trim());
            form.append('keywords', keywords);

            const response = await apiClient.post('/resources/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data as { status: string };
        },
        onSuccess: async () => {
            setSuccessMessage('Resource submitted for review.');
            setFile(null);
            setTitle('');
            setDescription('');
            setKeywords('');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['staff', 'submissions'] }),
                queryClient.invalidateQueries({ queryKey: ['staff', 'managed-resources'] }),
            ]);
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSuccessMessage('');
        uploadMutation.mutate();
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar userRole="staff" />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar userRole="staff" />
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto w-full max-w-3xl space-y-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Upload a Resource</h1>
                            <p className="mt-1 text-sm text-[#64708C]">
                                Add an academic file. It will be reviewed before it becomes visible to students.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#E1E6F3] bg-white p-5 sm:p-7">
                            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C7D2FE] bg-[#F8FAFF] p-5 text-center hover:border-[#245CFF]">
                                <UploadCloud className="mb-2 h-8 w-8 text-[#245CFF]" />
                                <span className="text-sm font-semibold">
                                    {file ? file.name : 'Choose a PDF, office document, text, or source-code file'}
                                </span>
                                <span className="mt-1 text-xs text-[#64708C]">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Maximum file size: 20 MB'}
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.py,.js,.jsx,.ts,.tsx,.java,.c,.h,.cpp,.sql,.html,.css,.json"
                                    className="sr-only"
                                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                                    Title
                                    <input
                                        required
                                        maxLength={255}
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3 text-sm focus:border-[#245CFF] focus:outline-none"
                                    />
                                </label>
                                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                                    Description
                                    <textarea
                                        rows={4}
                                        maxLength={10000}
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        className="w-full rounded-lg border border-[#E1E6F3] p-3 text-sm focus:border-[#245CFF] focus:outline-none"
                                    />
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Resource type
                                    <select
                                        value={resourceType}
                                        onChange={(event) => setResourceType(event.target.value)}
                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3 text-sm"
                                    >
                                        <option value="lecture_note">Lecture notes</option>
                                        <option value="past_question">Past questions</option>
                                        <option value="project">Project</option>
                                        <option value="code_preview">Code sample</option>
                                        <option value="other">Other</option>
                                    </select>
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Course
                                    <select
                                        value={courseCode}
                                        onChange={(event) => setCourseCode(event.target.value)}
                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3 text-sm"
                                    >
                                        <option value="">No course selected</option>
                                        {(options?.courses || []).map((course) => (
                                            <option key={course.id} value={course.course_code}>
                                                {course.course_code} — {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Category
                                    <select
                                        value={categoryId}
                                        onChange={(event) => setCategoryId(event.target.value)}
                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3 text-sm"
                                    >
                                        <option value="">No category selected</option>
                                        {(options?.categories || []).map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Programming language
                                    <input
                                        value={programmingLanguage}
                                        onChange={(event) => setProgrammingLanguage(event.target.value)}
                                        placeholder="e.g. Python"
                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3 text-sm"
                                    />
                                </label>
                                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                                    Keywords <span className="font-normal text-[#64708C]">(comma-separated)</span>
                                    <input
                                        value={keywords}
                                        onChange={(event) => setKeywords(event.target.value)}
                                        placeholder="algorithms, data structures"
                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3 text-sm"
                                    />
                                </label>
                            </div>

                            {optionsError && (
                                <p role="alert" className="text-sm text-red-600">
                                    Could not load course and category options: {optionsError.message}
                                </p>
                            )}
                            {uploadMutation.error && (
                                <p role="alert" className="text-sm text-red-600">
                                    {getErrorMessage(uploadMutation.error)}
                                </p>
                            )}
                            {successMessage && (
                                <p role="status" className="flex items-center gap-2 text-sm text-green-700">
                                    <CheckCircle className="h-4 w-4" /> {successMessage}
                                </p>
                            )}

                            <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#E1E6F3] pt-5 sm:flex-row sm:items-center">
                                {isLoadingOptions ? (
                                    <span className="text-xs text-[#64708C]">Loading course and category options…</span>
                                ) : <span className="text-xs text-[#64708C]">Submissions remain pending until reviewed.</span>}
                                <button
                                    type="submit"
                                    disabled={!file || !title.trim() || uploadMutation.isPending}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#245CFF] px-5 text-sm font-semibold text-white hover:bg-[#1d4bd8] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {uploadMutation.isPending
                                        ? <LoaderCircle className="h-4 w-4 animate-spin" />
                                        : <FileUp className="h-4 w-4" />}
                                    {uploadMutation.isPending ? 'Submitting…' : 'Submit for review'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
