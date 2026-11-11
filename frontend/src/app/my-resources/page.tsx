"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Search,
    Download,
    Bookmark,
    Trash2,
    ExternalLink,
    ChevronDown,
    FileText,
} from "lucide-react";
import { useMyResources } from "@/lib/queries";
import DataContainer from "@/components/ui/DataContainer";
import { apiClient } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function StudentResourcesPage() {
    const currentUser = useCurrentUser();
    const [selectedTab, setSelectedTab] = useState<"saved" | "downloaded" | "uploads" | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All resource types");
    const [sortBy, setSortBy] = useState("Recently saved");

    const router = useRouter();
    const queryClient = useQueryClient();
    const isStaff = currentUser.role === "staff" || currentUser.role === "admin";
    const activeTab = selectedTab ?? (isStaff ? "uploads" : "saved");
    const { data: userResources, isLoading, error } = useMyResources(activeTab);
    const resourcesList = userResources || [];
    const removeMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/resources/${id}/bookmark`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", "my-resources"] }),
    });

    const filteredResources = resourcesList.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
            selectedType === "All resource types" || item.category === selectedType;
        return matchesSearch && matchesType;
    }).sort((left, right) => {
        if (sortBy === "Course (A-Z)") return left.course.localeCompare(right.course);
        if (sortBy === "Title (A-Z)") return left.title.localeCompare(right.title);
        return new Date(right.savedDate).getTime() - new Date(left.savedDate).getTime();
    });

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Standard Shared Navbar */}
            <Navbar userRole={currentUser.role} />

            {/* Main Layout Shell */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Standard Shared Sidebar */}
                <Sidebar userRole={currentUser.role} />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6 max-w-7xl mx-auto w-full">
                        {/* Header Title Section & Quick Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                    {isStaff ? "My Resource Contributions" : "My Resources"}
                                </h1>
                                <p className="text-sm text-[#64708C] mt-1">
                                    {isStaff
                                        ? "Review your uploaded resources, saved materials and downloads."
                                        : "Your saved materials, downloads and reading list — all in one place."}
                                </p>
                            </div>

                            <button
                                onClick={() => router.push(isStaff ? "/staff/manage-resources" : "/search")}
                                className="h-11 px-5 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#F6F8FF] transition-colors shadow-sm self-start sm:self-auto"
                            >
                                <Search className="w-4 h-4 text-[#245CFF]" />
                                <span>{isStaff ? "Manage Resources" : "Browse Resources"}</span>
                            </button>
                        </div>

                        {/* Sub-Navigation Tabs */}
                        <div className="border-b border-[#E1E6F3] flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setSelectedTab("saved")}
                                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === "saved"
                                    ? "border-[#245CFF] text-[#245CFF]"
                                    : "border-transparent text-[#64708C] hover:text-[#0B123D]"
                                    }`}
                            >
                                Saved ({activeTab === "saved" ? resourcesList.length : 0})
                            </button>
                            <button
                                onClick={() => setSelectedTab("downloaded")}
                                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === "downloaded"
                                    ? "border-[#245CFF] text-[#245CFF]"
                                    : "border-transparent text-[#64708C] hover:text-[#0B123D]"
                                    }`}
                            >
                                Downloaded ({activeTab === "downloaded" ? resourcesList.length : 0})
                            </button>
                            <button
                                onClick={() => setSelectedTab("uploads")}
                                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === "uploads"
                                    ? "border-[#245CFF] text-[#245CFF]"
                                    : "border-transparent text-[#64708C] hover:text-[#0B123D]"
                                    }`}
                            >
                                My Uploads ({activeTab === "uploads" ? resourcesList.length : 0})
                            </button>
                        </div>

                        {/* Filter & Search Toolbar */}
                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                            {/* Search Bar Input */}
                            <div className="w-full flex-1 relative">
                                <Search className="w-4 h-4 text-[#64708C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search your saved resources..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] placeholder-[#64708C] focus:outline-none focus:border-[#245CFF]"
                                />
                            </div>

                            {/* Dropdown Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="relative flex-1 sm:flex-initial sm:w-48">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full h-11 pl-3.5 pr-8 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] cursor-pointer"
                                    >
                                        <option value="All resource types">All resource types</option>
                                        <option value="Lecture Notes">Lecture Notes</option>
                                        <option value="Past Questions">Past Questions</option>
                                        <option value="Code Samples">Code Samples</option>
                                        <option value="Projects">Projects</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <div className="relative flex-1 sm:flex-initial sm:w-44">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full h-11 pl-3.5 pr-8 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] cursor-pointer"
                                    >
                                        <option value="Recently saved">Recently saved</option>
                                        <option value="Course (A-Z)">Course (A-Z)</option>
                                        <option value="Title (A-Z)">Title (A-Z)</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* TAB CONTENT: SAVED RESOURCES */}
                        {(activeTab === "saved" || activeTab === "uploads") && (
                            <DataContainer
                                isLoading={isLoading}
                                data={filteredResources}
                                errorMessage={error?.message}
                                emptyIcon={activeTab === "saved" ? Bookmark : FileText}
                                emptyTitle={searchQuery ? "No Matching Resources" : (activeTab === "saved" ? "No Saved Resources Yet" : "No Uploaded Resources Yet")}
                                emptyDescription={
                                    searchQuery
                                        ? `No resources matched "${searchQuery}".`
                                        : (activeTab === "saved" ? "You haven't saved any academic resources yet." : "You haven't uploaded any resources yet.")
                                }
                                emptyAction={{
                                    label: "Browse All Resources",
                                    href: "/search",
                                }}
                                skeletonCount={6}
                            >
                                {(items) => (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-5 bg-white rounded-2xl border border-[#E1E6F3] flex flex-col justify-between hover:border-[#245CFF] hover:shadow-sm transition-all group"
                                                >
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2.5 py-1 bg-[#F6F8FF] text-[#64708C] font-semibold text-[11px] rounded-md border border-[#E1E6F3]">
                                                                    {item.course}
                                                                </span>
                                                                <span className="text-xs text-[#64708C]">
                                                                    {item.category}
                                                                </span>
                                                            </div>
                                                            {activeTab === "saved" && (
                                                                <button
                                                                    onClick={() => removeMutation.mutate(item.id)}
                                                                    disabled={removeMutation.isPending}
                                                                    aria-label={`Remove ${item.title} from saved resources`}
                                                                    className="text-[#64708C] hover:text-[#DF365B] p-1 rounded-md transition-colors disabled:opacity-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <h3 className="text-sm font-bold text-[#0B123D] leading-snug line-clamp-2 group-hover:text-[#245CFF] transition-colors">
                                                            {item.title}
                                                        </h3>

                                                        <p className="text-xs text-[#64708C]">
                                                            Uploaded by {item.author}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 border-t border-[#F0F3FA] mt-4 flex items-center justify-between text-xs text-[#64708C]">
                                                        <span>{item.savedDate}</span>
                                                        <Link
                                                            href={`/resources/${item.id}`}
                                                            className="text-[#245CFF] font-semibold flex items-center gap-1 hover:underline"
                                                        >
                                                            <span>Open</span>
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </DataContainer>
                        )}

                        {/* TAB CONTENT: DOWNLOADED RESOURCES */}
                        {activeTab === "downloaded" && (
                            <DataContainer
                                isLoading={isLoading}
                                data={filteredResources}
                                errorMessage={error?.message}
                                emptyIcon={Download}
                                emptyTitle="No Downloads Yet"
                                emptyDescription="You have not downloaded any study materials or files to your device yet."
                                emptyAction={{
                                    label: "Search Resources",
                                    href: "/search",
                                }}
                                skeletonCount={4}
                                skeletonType="rows"
                            >
                                {(items) => (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-bold text-[#0B123D]">Downloaded Resources</h3>
                                            <span className="text-xs text-[#64708C]">
                                                Showing {items.length} downloaded files
                                            </span>
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm divide-y divide-[#E1E6F3]">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-9 h-9 bg-[#E9EDFF] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                                            <FileText className="w-4 h-4 text-[#245CFF]" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-[#0B123D]">{item.title}</h4>
                                                            <p className="text-[11px] text-[#64708C] mt-1">
                                                                {item.category} · {item.format} · {item.size} · {item.savedDate}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                                        <Link
                                                            href={`/resources/${item.id}`}
                                                            className="h-9 px-3 border border-[#E1E6F3] bg-white text-[#245CFF] text-xs font-semibold rounded-lg hover:bg-[#F6F8FF] transition-colors flex items-center"
                                                        >
                                                            Open file
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </DataContainer>
                        )}

                        {removeMutation.error && <p role="alert" className="text-sm text-red-600">{removeMutation.error.message}</p>}
                    </div>

                    {/* Standard Shared Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
