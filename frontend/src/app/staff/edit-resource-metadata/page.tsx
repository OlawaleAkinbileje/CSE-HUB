"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    ChevronLeft,
    AlertTriangle,
    FileText,
    UploadCloud,
    ChevronDown,
    X,
    Check,
    Info,
    Download,
    ExternalLink,
    Save,
} from "lucide-react";

export default function EditResourceMetadataPage() {
    // Form State
    const [title, setTitle] = useState(
        "Introduction to Algorithms — Lecture Notes 2024 (Revised)"
    );
    const [description, setDescription] = useState(
        "Comprehensive lecture notes covering sorting, graph algorithms, dynamic programming and complexity analysis. Revised with worked examples and source citations for Year 2 students."
    );
    const [course, setCourse] = useState("CS201 — Data Structures & Algorithms");
    const [category, setCategory] = useState("Lecture Notes");
    const [academicYear, setAcademicYear] = useState("2024 / 2025");
    const [resourceType, setResourceType] = useState("Document");
    const [tags, setTags] = useState([
        "algorithms",
        "data-structures",
        "CS201",
        "Year 2",
    ]);
    const [tagInput, setTagInput] = useState("");
    const [visibility, setVisibility] = useState<
        "public" | "course" | "staff"
    >("public");
    const [notifyStudents, setNotifyStudents] = useState(true);
    const [isDirty, setIsDirty] = useState(true);

    // Tag Handlers
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/^#/, "");
            if (tags.length < 10 && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setTagInput("");
                setIsDirty(true);
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
        setIsDirty(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDirty(false);
        alert("Resource metadata successfully saved!");
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Shared Navbar */}
            <Navbar userRole="staff" />

            {/* Main Container */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Shared Sidebar */}
                <Sidebar userRole="staff" />

                {/* Main Content Workspace */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Back Navigation */}
                        <Link
                            href="/staff/manage-resources"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245CFF] hover:underline"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Manage Resources</span>
                        </Link>

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                    Edit Resource Metadata
                                </h1>
                                <p className="text-sm text-[#64708C] mt-1">
                                    Update resource details without losing its download history or saved links.
                                </p>
                            </div>

                            {isDirty && (
                                <span className="px-3 py-1 bg-[#FFF5EB] text-[#B86A17] text-xs font-semibold rounded-full self-start sm:self-auto">
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        {/* Unsaved Changes Banner */}
                        {isDirty && (
                            <div className="p-3.5 bg-[#FFF5EB] rounded-lg border border-[#FFE3C6] flex items-start gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-[#B86A17] shrink-0 mt-0.5" />
                                <p className="text-xs text-[#B86A17] leading-relaxed">
                                    You have unsaved changes to the title and description. Save your changes before leaving this page.
                                </p>
                            </div>
                        )}

                        {/* Layout Grid: Main Form (Left) + Sidebar Context (Right) */}
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                            {/* Left Column: Form Controls */}
                            <form onSubmit={handleSave} className="flex-1 w-full space-y-6">
                                {/* File Card & Version Status */}
                                <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-14 bg-[#E6FAF4] rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="w-6 h-6 text-[#009F75]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-[#0B123D] truncate">
                                                Introduction_to_Algorithms_2024.pdf
                                            </h3>
                                            <p className="text-xs text-[#64708C] mt-0.5">
                                                PDF · 3.4 MB · 24 pages · Version 2
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-xs font-semibold rounded-full shrink-0">
                                            Published
                                        </span>
                                    </div>

                                    <hr className="border-[#E1E6F3]" />

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <span className="text-[#64708C]">
                                            Replacing the file creates a new version.
                                        </span>
                                        <button
                                            type="button"
                                            className="h-9 px-3.5 bg-white border border-[#E1E6F3] text-[#245CFF] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors self-start sm:self-auto"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            <span>Replace file</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Resource Details Form */}
                                <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] space-y-5">
                                    <h2 className="text-lg font-bold text-[#0B123D]">
                                        Resource Details
                                    </h2>

                                    {/* Title Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value);
                                                setIsDirty(true);
                                            }}
                                            required
                                            className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                        />
                                    </div>

                                    {/* Description Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Description *
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={description}
                                            onChange={(e) => {
                                                setDescription(e.target.value);
                                                setIsDirty(true);
                                            }}
                                            maxLength={500}
                                            required
                                            className="w-full p-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] leading-relaxed focus:outline-none focus:border-[#245CFF]"
                                        />
                                        <div className="text-[11px] text-[#64708C]">
                                            {description.length} / 500 characters
                                        </div>
                                    </div>

                                    {/* Course & Category Dropdowns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Course *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={course}
                                                    onChange={(e) => {
                                                        setCourse(e.target.value);
                                                        setIsDirty(true);
                                                    }}
                                                    className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] pr-8"
                                                >
                                                    <option>CS201 — Data Structures & Algorithms</option>
                                                    <option>CS204 — Database Management Systems</option>
                                                    <option>CS302 — Computer Networks</option>
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Category *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={category}
                                                    onChange={(e) => {
                                                        setCategory(e.target.value);
                                                        setIsDirty(true);
                                                    }}
                                                    className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] pr-8"
                                                >
                                                    <option>Lecture Notes</option>
                                                    <option>Practice Set</option>
                                                    <option>Code Samples</option>
                                                    <option>Revision Guide</option>
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Academic Year & Resource Type */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Academic Year
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={academicYear}
                                                    onChange={(e) => {
                                                        setAcademicYear(e.target.value);
                                                        setIsDirty(true);
                                                    }}
                                                    className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] pr-8"
                                                >
                                                    <option>2024 / 2025</option>
                                                    <option>2025 / 2026</option>
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Resource Type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={resourceType}
                                                    onChange={(e) => {
                                                        setResourceType(e.target.value);
                                                        setIsDirty(true);
                                                    }}
                                                    className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] pr-8"
                                                >
                                                    <option>Document</option>
                                                    <option>Code Archive</option>
                                                    <option>Presentation</option>
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Tags
                                        </label>
                                        <div className="p-2.5 bg-white border border-[#E1E6F3] rounded-lg flex flex-wrap items-center gap-2 min-h-[44px]">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 bg-[#E9EDFF] text-[#245CFF] text-xs font-semibold rounded-full flex items-center gap-1"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:text-[#0B123D]"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder={tags.length < 10 ? "Add tag..." : "Max tags reached"}
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleAddTag}
                                                disabled={tags.length >= 10}
                                                className="bg-transparent text-xs text-[#0B123D] placeholder-[#64708C] focus:outline-none flex-1 min-w-[100px]"
                                            />
                                        </div>
                                        <p className="text-[11px] text-[#64708C]">
                                            Press Enter or comma to add a tag. Max 10 tags.
                                        </p>
                                    </div>

                                    {/* Visibility Selectors */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Visibility
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div
                                                onClick={() => {
                                                    setVisibility("public");
                                                    setIsDirty(true);
                                                }}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors space-y-1 ${visibility === "public"
                                                    ? "bg-[#F0F3FF] border-[#245CFF]"
                                                    : "bg-white border-[#E1E6F3] hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div
                                                    className={`text-xs font-semibold flex items-center gap-1.5 ${visibility === "public"
                                                        ? "text-[#245CFF]"
                                                        : "text-[#0B123D]"
                                                        }`}
                                                >
                                                    <span>{visibility === "public" ? "◉" : "○"}</span>
                                                    <span>Public</span>
                                                </div>
                                                <p className="text-[11px] text-[#64708C]">
                                                    All registered users
                                                </p>
                                            </div>

                                            <div
                                                onClick={() => {
                                                    setVisibility("course");
                                                    setIsDirty(true);
                                                }}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors space-y-1 ${visibility === "course"
                                                    ? "bg-[#F0F3FF] border-[#245CFF]"
                                                    : "bg-white border-[#E1E6F3] hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div
                                                    className={`text-xs font-semibold flex items-center gap-1.5 ${visibility === "course"
                                                        ? "text-[#245CFF]"
                                                        : "text-[#0B123D]"
                                                        }`}
                                                >
                                                    <span>{visibility === "course" ? "◉" : "○"}</span>
                                                    <span>Course Only</span>
                                                </div>
                                                <p className="text-[11px] text-[#64708C]">
                                                    Enrolled in CS201
                                                </p>
                                            </div>

                                            <div
                                                onClick={() => {
                                                    setVisibility("staff");
                                                    setIsDirty(true);
                                                }}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors space-y-1 ${visibility === "staff"
                                                    ? "bg-[#F0F3FF] border-[#245CFF]"
                                                    : "bg-white border-[#E1E6F3] hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div
                                                    className={`text-xs font-semibold flex items-center gap-1.5 ${visibility === "staff"
                                                        ? "text-[#245CFF]"
                                                        : "text-[#0B123D]"
                                                        }`}
                                                >
                                                    <span>{visibility === "staff" ? "◉" : "○"}</span>
                                                    <span>Staff Only</span>
                                                </div>
                                                <p className="text-[11px] text-[#64708C]">
                                                    Staff members only
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notification Checkbox */}
                                    <label className="flex items-center gap-3 cursor-pointer text-xs text-[#0B123D] pt-1">
                                        <input
                                            type="checkbox"
                                            checked={notifyStudents}
                                            onChange={() => {
                                                setNotifyStudents(!notifyStudents);
                                                setIsDirty(true);
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-[#245CFF] focus:ring-[#245CFF]"
                                        />
                                        <span>
                                            Notify students who saved this resource about the update
                                        </span>
                                    </label>
                                </div>

                                {/* Form Action Controls */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <span className="text-xs text-[#64708C]">
                                        Last saved 24 Oct 2026 at 10:42 AM
                                    </span>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link
                                            href="/staff/manage-resources"
                                            className="flex-1 sm:flex-none h-11 px-5 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="submit"
                                            className="flex-1 sm:flex-none h-11 px-6 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-95 shadow-sm"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Save Changes</span>
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Right Column: Publication & Version Sidebars */}
                            <div className="w-full lg:w-[292px] shrink-0 space-y-6">
                                {/* Publication Details */}
                                <div className="bg-white p-5 rounded-xl border border-[#E1E6F3] space-y-4">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Publication
                                    </h3>

                                    <div className="divide-y divide-[#E1E6F3] text-xs">
                                        <div className="py-2.5 flex justify-between">
                                            <span className="text-[#64708C]">Owner</span>
                                            <span className="font-medium text-[#0B123D]">
                                                CSE Hub Staff
                                            </span>
                                        </div>

                                        <div className="py-2.5 flex justify-between">
                                            <span className="text-[#64708C]">Created</span>
                                            <span className="font-medium text-[#0B123D]">
                                                12 Sep 2024
                                            </span>
                                        </div>

                                        <div className="py-2.5 flex justify-between">
                                            <span className="text-[#64708C]">Updated</span>
                                            <span className="font-medium text-[#0B123D]">
                                                24 Oct 2026
                                            </span>
                                        </div>

                                        <div className="py-2.5 flex justify-between">
                                            <span className="text-[#64708C]">Downloads</span>
                                            <span className="font-medium text-[#0B123D]">
                                                248 total
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        Metadata updates are applied immediately. Replaced files are reviewed before the new version is published.
                                    </p>

                                    <button
                                        type="button"
                                        className="w-full h-9 px-3.5 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>View resource</span>
                                    </button>
                                </div>

                                {/* Version History Side-Card */}
                                <div className="bg-white p-5 rounded-xl border border-[#E1E6F3] space-y-4">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Version history
                                    </h3>

                                    {/* Version 2 */}
                                    <div className="space-y-2">
                                        <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-[10px] font-semibold rounded-full inline-block">
                                            Version 2 · Current
                                        </span>
                                        <div className="text-xs font-semibold text-[#0B123D]">
                                            24 Oct 2026 · CSE Hub Staff
                                        </div>
                                        <p className="text-xs text-[#64708C] leading-relaxed">
                                            Improved diagrams and added graph algorithm examples.
                                        </p>
                                        <div className="text-[11px] text-[#64708C]">
                                            PDF · 3.4 MB
                                        </div>
                                        <button
                                            type="button"
                                            className="w-full h-9 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download v2</span>
                                        </button>
                                    </div>

                                    <hr className="border-[#E1E6F3]" />

                                    {/* Version 1 */}
                                    <div className="space-y-2">
                                        <div className="text-xs font-semibold text-[#0B123D]">
                                            Version 1
                                        </div>
                                        <div className="text-[11px] text-[#64708C]">
                                            12 Sep 2024 · CSE Hub Staff
                                        </div>
                                        <p className="text-xs text-[#64708C] leading-relaxed">
                                            Original lecture notes.
                                        </p>
                                        <div className="text-[11px] text-[#64708C]">
                                            PDF · 2.8 MB
                                        </div>
                                        <button
                                            type="button"
                                            className="w-full h-9 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download v1</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Information Banner */}
                                <div className="p-3.5 bg-[#F0F3FF] rounded-lg border border-[#D9E2FF] flex items-start gap-2.5">
                                    <Info className="w-4 h-4 text-[#245CFF] shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#245CFF] leading-relaxed">
                                        Existing bookmarks and resource links stay the same when you save changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shared Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}