"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, FileText, Save } from "lucide-react";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { apiClient } from "@/lib/api";

interface ResourceMetadata {
    id: string;
    title: string;
    description: string | null;
    resource_type: string;
    course_id: string | null;
    course_code: string;
    course_title: string | null;
    category_id: string | null;
    category: string;
    file_type: string;
    file_size: number;
    original_filename: string | null;
    keywords: string[];
    status: string;
    updated_at: string | null;
    downloads: number;
    uploader_name: string;
}

interface ResourceOptions {
    categories: { id: string; name: string; slug: string }[];
    courses: { id: string; course_code: string; title: string }[];
}

function getErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = error.response;
        if (typeof response === "object" && response !== null && "data" in response) {
            const data = response.data;
            if (typeof data === "object" && data !== null && "detail" in data && typeof data.detail === "string") {
                return data.detail;
            }
        }
    }
    return error instanceof Error ? error.message : "Unable to update resource metadata.";
}

const resourceTypes = [
    { value: "lecture_note", label: "Lecture notes" },
    { value: "past_question", label: "Past questions" },
    { value: "project", label: "Project" },
    { value: "code_preview", label: "Code sample" },
    { value: "other", label: "Other" },
];

export default function EditResourceMetadataPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-[#64708C]">Loading resource editor…</div>}>
            <EditResourceMetadataContent />
        </Suspense>
    );
}

function EditResourceMetadataContent() {
    const searchParams = useSearchParams();
    const resourceId = searchParams.get("id");
    const queryClient = useQueryClient();
    const [isDirty, setIsDirty] = useState(false);

    const resourceQuery = useQuery({
        queryKey: ["resources", "metadata", resourceId],
        enabled: Boolean(resourceId),
        queryFn: async () => {
            const response = await apiClient.get<ResourceMetadata>(`/resources/${resourceId}`);
            return response.data;
        },
    });
    const optionsQuery = useQuery({
        queryKey: ["resources", "options"],
        queryFn: async () => {
            const response = await apiClient.get<ResourceOptions>("/resources/options");
            return response.data;
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (metadata: {
            title: string;
            description: string;
            course_code: string | null;
            category_id: string | null;
            resource_type: string;
            keywords: string[];
        }) => {
            if (!resourceId) throw new Error("No resource was selected.");
            const response = await apiClient.patch<ResourceMetadata>(`/resources/${resourceId}`, {
                ...metadata,
            });
            return response.data;
        },
        onSuccess: async (updatedResource) => {
            queryClient.setQueryData(["resources", "metadata", resourceId], updatedResource);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["staff", "managed-resources"] }),
                queryClient.invalidateQueries({ queryKey: ["staff", "submissions"] }),
                queryClient.invalidateQueries({ queryKey: ["resources"] }),
            ]);
            setIsDirty(false);
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        saveMutation.mutate({
            title: String(formData.get("title") || ""),
            description: String(formData.get("description") || ""),
            course_code: String(formData.get("course_code") || "") || null,
            category_id: String(formData.get("category_id") || "") || null,
            resource_type: String(formData.get("resource_type") || "other"),
            keywords: String(formData.get("keywords") || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 20),
        });
    };

    const resource = resourceQuery.data;
    const error = resourceQuery.error || optionsQuery.error || saveMutation.error;

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-5xl space-y-6">
                        <Link
                            href="/staff/manage-resources"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245CFF] hover:underline"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Manage Resources
                        </Link>

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Edit Resource Metadata</h1>
                            <p className="mt-1 text-sm text-[#64708C]">
                                Update the details attached to this uploaded resource.
                            </p>
                        </div>

                        {!resourceId && (
                            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                Choose a resource from Manage Resources to edit its metadata.
                            </div>
                        )}
                        {error && (
                            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{getErrorMessage(error)}</span>
                            </div>
                        )}
                        {(resourceQuery.isLoading || optionsQuery.isLoading) && (
                            <div className="rounded-xl border border-[#E1E6F3] bg-white p-8 text-center text-sm text-[#64708C]">
                                Loading resource details…
                            </div>
                        )}

                        {resource && optionsQuery.data && (
                            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                                <div className="space-y-6">
                                    <section className="rounded-xl border border-[#E1E6F3] bg-white p-5 sm:p-6">
                                        <div className="mb-5 flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E9EDFF] text-[#245CFF]">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="truncate font-semibold">{resource.original_filename || resource.title}</h2>
                                                <p className="text-xs text-[#64708C]">
                                                    {resource.file_type} · {(resource.file_size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block space-y-1.5 text-sm font-medium">
                                                Title
                                                <input
                                                    name="title"
                                                    required
                                                    maxLength={255}
                                                    defaultValue={resource.title}
                                                    onChange={() => setIsDirty(true)}
                                                    className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3 text-sm focus:border-[#245CFF] focus:outline-none"
                                                />
                                            </label>

                                            <label className="block space-y-1.5 text-sm font-medium">
                                                Description
                                                <textarea
                                                    name="description"
                                                    rows={5}
                                                    maxLength={10000}
                                                    defaultValue={resource.description || ""}
                                                    onChange={() => setIsDirty(true)}
                                                    className="w-full rounded-lg border border-[#E1E6F3] p-3 text-sm focus:border-[#245CFF] focus:outline-none"
                                                />
                                            </label>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <label className="block space-y-1.5 text-sm font-medium">
                                                    Course
                                                    <select
                                                        name="course_code"
                                                        defaultValue={resource.course_code || ""}
                                                        onChange={() => setIsDirty(true)}
                                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3 text-sm"
                                                    >
                                                        <option value="">No course assigned</option>
                                                        {optionsQuery.data.courses.map((course) => (
                                                            <option key={course.id} value={course.course_code}>
                                                                {course.course_code} — {course.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <label className="block space-y-1.5 text-sm font-medium">
                                                    Category
                                                    <select
                                                        name="category_id"
                                                        defaultValue={resource.category_id || ""}
                                                        onChange={() => setIsDirty(true)}
                                                        className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3 text-sm"
                                                    >
                                                        <option value="">No category assigned</option>
                                                        {optionsQuery.data.categories.map((category) => (
                                                            <option key={category.id} value={category.id}>{category.name}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>

                                            <label className="block space-y-1.5 text-sm font-medium">
                                                Resource type
                                                <select
                                                    name="resource_type"
                                                    defaultValue={resource.resource_type || "other"}
                                                    onChange={() => setIsDirty(true)}
                                                    className="h-11 w-full rounded-lg border border-[#E1E6F3] bg-white px-3 text-sm"
                                                >
                                                    {resourceTypes.map((type) => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <div className="space-y-2">
                                                <label htmlFor="resource-tags" className="block text-sm font-medium">Keywords</label>
                                                <input
                                                    id="resource-tags"
                                                    name="keywords"
                                                    defaultValue={(resource.keywords || []).join(", ")}
                                                    onChange={() => setIsDirty(true)}
                                                    maxLength={1300}
                                                    placeholder="Separate keywords with commas"
                                                    className="h-11 w-full rounded-lg border border-[#E1E6F3] px-3 text-sm focus:border-[#245CFF] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
                                        <span className="text-sm text-[#64708C]">
                                            {isDirty ? "Unsaved changes" : "All changes saved"}
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={!isDirty || saveMutation.isPending}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#7148FF] to-[#245CFF] px-6 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                        >
                                            <Save className="h-4 w-4" />
                                            {saveMutation.isPending ? "Saving…" : "Save Changes"}
                                        </button>
                                    </div>
                                    {saveMutation.isSuccess && (
                                        <p role="status" className="text-sm font-medium text-emerald-700">
                                            Resource metadata saved successfully.
                                        </p>
                                    )}
                                </div>

                                <aside className="h-fit space-y-4 rounded-xl border border-[#E1E6F3] bg-white p-5 text-sm">
                                    <h2 className="font-bold">Resource details</h2>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-[#64708C]">Status</dt>
                                            <dd className="font-medium">{resource.status.replaceAll("_", " ")}</dd>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-[#64708C]">Uploaded by</dt>
                                            <dd className="text-right font-medium">{resource.uploader_name}</dd>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-[#64708C]">Downloads</dt>
                                            <dd className="font-medium">{resource.downloads}</dd>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-[#64708C]">Updated</dt>
                                            <dd className="text-right font-medium">
                                                {resource.updated_at ? new Date(resource.updated_at).toLocaleString() : "—"}
                                            </dd>
                                        </div>
                                    </dl>
                                    <Link
                                        href={`/resources/${resource.id}`}
                                        className="block rounded-lg border border-[#E1E6F3] px-3 py-2 text-center font-semibold text-[#245CFF] hover:bg-[#F6F8FF]"
                                    >
                                        View resource
                                    </Link>
                                </aside>
                            </form>
                        )}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
