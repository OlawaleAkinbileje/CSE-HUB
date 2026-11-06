"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Search,
    ChevronDown,
    Plus,
    FileText,
    CheckCircle2,
    Clock,
    Download,
    Edit2,
    Archive,
    RotateCcw,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useStaffManagedResources, ManagedResourceItem } from "@/lib/queries";
import DataContainer from "@/components/ui/DataContainer";

export default function ManageResourcesPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");

    const { data: rawResources, isLoading } = useStaffManagedResources();
    const resources = rawResources || [];

    const filteredResources = resources.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.course.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "All statuses" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const publishedCount = resources.filter((r) => r.status === "Published").length;
    const pendingCount = resources.filter((r) => r.status === "Pending").length;
    const draftCount = resources.filter((r) => r.status === "Draft").length;
    const archivedCount = resources.filter((r) => r.status === "Archived").length;
    const totalDownloads = resources.reduce((acc, r) => acc + (r.downloads || 0), 0);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredResources.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredResources.map((r) => r.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const getStatusBadge = (status: ManagedResourceItem["status"]) => {
        switch (status) {
            case "Published":
                return (
                    <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-xs font-semibold rounded-full inline-flex items-center">
                        Published
                    </span>
                );
            case "Draft":
                return (
                    <span className="px-2.5 py-1 bg-[#F6F8FF] text-[#64708C] text-xs font-semibold rounded-full inline-flex items-center">
                        Draft
                    </span>
                );
            case "Pending":
                return (
                    <span className="px-2.5 py-1 bg-[#FFF5EB] text-[#B86A17] text-xs font-semibold rounded-full inline-flex items-center">
                        Pending
                    </span>
                );
            case "Archived":
                return (
                    <span className="px-2.5 py-1 bg-[#F6F8FF] text-[#64708C] text-xs font-semibold rounded-full inline-flex items-center">
                        Archived
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Top Navigation */}
            <Navbar userRole="staff" />

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Left Sidebar */}
                <Sidebar userRole="staff" />

                {/* Main Body */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                    Manage Resources
                                </h1>
                                <p className="text-sm text-[#64708C]">
                                    Organise, update and track your contributions to CSE Hub.
                                </p>
                            </div>
                            <Link
                                href="/staff/upload"
                                className="h-11 px-5 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Upload Resource</span>
                            </Link>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-[50px] h-[54px] bg-[rgba(36,92,255,0.09)] rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-[#245CFF]" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : resources.length}</div>
                                    <div className="text-xs text-[#64708C]">Your resources</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-[50px] h-[54px] bg-[rgba(0,159,117,0.09)] rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-[#009F75]" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : publishedCount}</div>
                                    <div className="text-xs text-[#64708C]">Published</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-[50px] h-[54px] bg-[rgba(184,106,23,0.09)] rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-[#B86A17]" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : pendingCount}</div>
                                    <div className="text-xs text-[#64708C]">Pending review</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-[50px] h-[54px] bg-[rgba(113,72,255,0.09)] rounded-xl flex items-center justify-center">
                                    <Download className="w-6 h-6 text-[#7148FF]" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : totalDownloads.toLocaleString()}</div>
                                    <div className="text-xs text-[#64708C]">Total downloads</div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white p-5 rounded-xl border border-[#E1E6F3] space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="md:col-span-2 relative">
                                    <Search className="w-4 h-4 text-[#64708C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search by title, course or keyword..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-11 pl-10 pr-4 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] placeholder-[#64708C] focus:outline-none focus:border-[#245CFF]"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full h-11 pl-3.5 pr-8 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] cursor-pointer"
                                    >
                                        <option value="All statuses">All statuses</option>
                                        <option value="Published">Published</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <button
                                    onClick={() => { setSearchTerm(""); setStatusFilter("All statuses"); }}
                                    className="col-span-2 md:col-span-1 h-11 px-4 bg-white border border-[#E1E6F3] rounded-lg text-[#245CFF] text-xs font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Reset filters
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-xs font-semibold rounded-full">
                                    Published {publishedCount}
                                </span>
                                <span className="px-2.5 py-1 bg-[#F6F8FF] text-[#64708C] text-xs font-semibold rounded-full">
                                    Draft {draftCount}
                                </span>
                                <span className="px-2.5 py-1 bg-[#FFF5EB] text-[#B86A17] text-xs font-semibold rounded-full">
                                    Pending {pendingCount}
                                </span>
                                <span className="px-2.5 py-1 bg-[#F6F8FF] text-[#64708C] text-xs font-semibold rounded-full">
                                    Archived {archivedCount}
                                </span>
                            </div>
                        </div>

                        {/* Resources Table with DataContainer */}
                        <div className="bg-white rounded-xl border border-[#E1E6F3] overflow-hidden">
                            {selectedIds.length > 0 && (
                                <div className="px-5 py-3.5 bg-[#E9EDFF] flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E6F3]">
                                    <div className="text-sm font-semibold text-[#245CFF]">
                                        {selectedIds.length} resources selected
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="h-9 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs font-semibold text-[#245CFF] hover:bg-slate-50">
                                            Change visibility
                                        </button>
                                        <button className="h-9 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs font-semibold text-[#245CFF] flex items-center gap-2 hover:bg-slate-50">
                                            <Archive className="w-3.5 h-3.5" />
                                            Archive selected
                                        </button>
                                        <button
                                            onClick={() => setSelectedIds([])}
                                            className="text-xs text-[#245CFF] underline hover:text-blue-700 ml-2"
                                        >
                                            Clear selection
                                        </button>
                                    </div>
                                </div>
                            )}

                            <DataContainer
                                isLoading={isLoading}
                                data={filteredResources}
                                emptyIcon={FileText}
                                emptyTitle={searchTerm ? "No Matching Resources" : "No Resources Yet"}
                                emptyDescription={
                                    searchTerm
                                        ? `No resources matched "${searchTerm}".`
                                        : "You have not uploaded or contributed any resources yet."
                                }
                                emptyAction={{
                                    label: "Upload Resource",
                                    href: "/staff/upload",
                                }}
                                skeletonCount={5}
                                skeletonType="rows"
                            >
                                {(items) => (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#F6F8FF] border-b border-[#E1E6F3] text-xs font-semibold text-[#64708C]">
                                                    <th className="p-4 w-12 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.length === items.length && items.length > 0}
                                                            onChange={toggleSelectAll}
                                                            className="rounded border-gray-300 text-[#245CFF] focus:ring-[#245CFF]"
                                                        />
                                                    </th>
                                                    <th className="p-4 text-xs font-semibold">Resource title ↑</th>
                                                    <th className="p-4 text-xs font-semibold">Course</th>
                                                    <th className="p-4 text-xs font-semibold">Type</th>
                                                    <th className="p-4 text-xs font-semibold">Status</th>
                                                    <th className="p-4 text-xs font-semibold">Updated</th>
                                                    <th className="p-4 text-xs font-semibold text-right">Downloads</th>
                                                    <th className="p-4 text-xs font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E1E6F3]">
                                                {items.map((item) => {
                                                    const isSelected = selectedIds.includes(item.id);
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className={`hover:bg-[#F9FAFF] transition-colors ${isSelected ? "bg-[#F0F3FF]" : "bg-white"
                                                                }`}
                                                        >
                                                            <td className="p-4 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleSelect(item.id)}
                                                                    className="rounded border-gray-300 text-[#245CFF] focus:ring-[#245CFF]"
                                                                />
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="font-semibold text-xs text-[#0B123D]">
                                                                    {item.title}
                                                                </div>
                                                                <div className="text-xs text-[#64708C]">
                                                                    {item.fileType} · {item.fileSize}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-xs text-[#0B123D]">{item.course}</td>
                                                            <td className="p-4 text-xs text-[#0B123D]">{item.category}</td>
                                                            <td className="p-4">{getStatusBadge(item.status)}</td>
                                                            <td className="p-4 text-xs text-[#64708C]">{item.updatedDate}</td>
                                                            <td className="p-4 text-xs text-[#0B123D] text-right">
                                                                {item.downloads}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <div className="flex items-center justify-end gap-3 text-[#64708C]">
                                                                    <Link href="/staff/edit-resource-metadata" title="Edit" className="text-[#245CFF] hover:opacity-80">
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </Link>
                                                                    <button title="Archive/Restore" className="hover:text-[#0B123D]">
                                                                        {item.status === "Archived" ? (
                                                                            <RotateCcw className="w-4 h-4 text-[#245CFF]" />
                                                                        ) : (
                                                                            <Archive className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                    <button title="More" className="hover:text-[#0B123D]">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </DataContainer>

                            {/* Pagination */}
                            <div className="p-4 border-t border-[#E1E6F3] flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-xs text-[#64708C]">
                                    Showing {filteredResources.length} resources
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled
                                        className="h-9 px-3 border border-[#E1E6F3] bg-white text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 hover:bg-[#F6F8FF] disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Previous</span>
                                    </button>
                                    <button
                                        disabled
                                        className="h-9 px-3 border border-[#E1E6F3] bg-white text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 hover:bg-[#F6F8FF] disabled:opacity-50 transition-colors"
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Standard Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
