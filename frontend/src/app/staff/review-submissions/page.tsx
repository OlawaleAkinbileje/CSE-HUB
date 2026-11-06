"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Search,
    ChevronDown,
    Check,
    AlertTriangle,
    FileText,
    User,
    History,
    Maximize2,
    CheckCircle,
    XCircle,
    RotateCcw,
    Clock,
    ChevronRight,
    Filter,
} from "lucide-react";
import { useStaffSubmissions, SubmissionItem } from "@/lib/queries";
import DataContainer from "@/components/ui/DataContainer";
import EmptyState from "@/components/ui/EmptyState";

export default function ReviewSubmissionsPage() {
    const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
    const [selectedSubId, setSelectedSubId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("Newest first");

    const { data: rawSubmissions, isLoading } = useStaffSubmissions(activeTab);
    const submissions = rawSubmissions || [];

    const filteredSubmissions = submissions.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.submitterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Review Checklist State
    const [checks, setChecks] = useState({
        relevance: true,
        fileReadable: true,
        noDuplicates: true,
        copyrightVerified: false,
    });

    // Action Feedback Input State
    const [feedback, setFeedback] = useState(
        "Please add the original source and citation for the diagram on page 12 before publication."
    );

    const selectedSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

    const handleCheckboxChange = (key: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDecision = (action: "approve" | "request-changes" | "reject") => {
        if (!selectedSub) return;
        alert(`Action "${action}" submitted for resource: ${selectedSub.title}`);
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Shared Navbar */}
            <Navbar userRole="staff" />

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Shared Sidebar */}
                <Sidebar userRole="staff" />

                {/* Workspace Area */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Header Title */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                Review Submissions
                            </h1>
                            <p className="text-sm text-[#64708C] mt-1">
                                Check resource quality and help students share reliable learning materials.
                            </p>
                        </div>

                        {/* Queue Filter Tabs */}
                        <div className="border-b border-[#E1E6F3] flex items-center gap-2 md:gap-8">
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={`py-3 px-2 md:px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "pending"
                                    ? "border-[#245CFF] text-[#245CFF]"
                                    : "border-transparent text-[#64708C] hover:text-[#0B123D]"
                                    }`}
                            >
                                <span>Pending ({activeTab === "pending" ? submissions.length : 0})</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("approved")}
                                className={`py-3 px-2 md:px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "approved"
                                    ? "border-[#245CFF] text-[#245CFF]"
                                    : "border-transparent text-[#64708C] hover:text-[#0B123D]"
                                    }`}
                            >
                                <span>Approved ({activeTab === "approved" ? submissions.length : 0})</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("rejected")}
                                className={`py-3 px-2 md:px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "rejected"
                                    ? "border-[#245CFF] text-[#245CFF]"
                                    : "border-transparent text-[#64708C] hover:text-[#0B123D]"
                                    }`}
                            >
                                <span>Rejected ({activeTab === "rejected" ? submissions.length : 0})</span>
                            </button>
                        </div>

                        {/* Split Screen Workspace: Queue List (Left) + Detailed Inspector (Right) */}
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                            {/* Left Column: Submissions Queue */}
                            <div className="w-full lg:w-[320px] shrink-0 space-y-4">
                                {/* Search & Sort Panel */}
                                <div className="bg-white p-4 rounded-xl border border-[#E1E6F3] space-y-3">
                                    <div className="flex items-center gap-2 px-3.5 h-10 bg-white border border-[#E1E6F3] rounded-lg">
                                        <Search className="w-4 h-4 text-[#64708C]" />
                                        <input
                                            type="text"
                                            placeholder="Search submissions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-transparent text-xs text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-[#0B123D]">Queue order</span>
                                        <div className="flex items-center gap-1 text-[#245CFF] font-medium cursor-pointer">
                                            <span>{sortOrder}</span>
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-[#64708C]">
                                        {filteredSubmissions.length} awaiting review
                                    </div>
                                </div>

                                {/* Submissions List wrapped in DataContainer */}
                                <div className="bg-white rounded-xl border border-[#E1E6F3] overflow-hidden divide-y divide-[#E1E6F3]">
                                    <DataContainer
                                        isLoading={isLoading}
                                        data={filteredSubmissions}
                                        emptyIcon={FileText}
                                        emptyTitle="Queue is Empty"
                                        emptyDescription="No pending submissions in this category."
                                        skeletonCount={3}
                                        skeletonType="rows"
                                    >
                                        {(items) => (
                                            <>
                                                {items.map((item) => {
                                                    const isSelected = item.id === (selectedSubId || items[0]?.id);
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => setSelectedSubId(item.id)}
                                                            className={`p-4 cursor-pointer transition-colors space-y-2 border-l-4 ${isSelected
                                                                ? "bg-[#F0F3FF] border-[#245CFF]"
                                                                : "bg-white border-transparent hover:bg-slate-50"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span
                                                                    className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#FFF5EB] text-[#B86A17]"
                                                                >
                                                                    {isSelected ? "Selected · Pending" : "Pending"}
                                                                </span>
                                                                {item.urgent && (
                                                                    <span className="text-[10px] font-medium text-[#DF365B] flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" /> &gt;48h
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <h4 className="text-xs font-semibold text-[#0B123D] line-clamp-2 leading-snug">
                                                                {item.title}
                                                            </h4>

                                                            <div className="text-[11px] text-[#64708C] flex items-center justify-between">
                                                                <span>
                                                                    {item.submitterName} · {item.course}
                                                                </span>
                                                            </div>

                                                            <div className="text-[10px] text-[#64708C]">
                                                                {item.submittedDate ? item.submittedDate.split(",")[0] : "Recently"}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </DataContainer>
                                </div>
                            </div>

                            {/* Right Column: Detailed Document Inspection & Verification */}
                            <div className="flex-1 w-full space-y-6">
                                {selectedSub ? (
                                    <>
                                        <div className="bg-white p-6 rounded-2xl border border-[#E1E6F3] space-y-6 shadow-sm">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 bg-[#FFF5EB] text-[#B86A17] text-xs font-semibold rounded-full">
                                                            Pending verification
                                                        </span>
                                                        <span className="text-xs text-[#64708C]">
                                                            Submitted {selectedSub.submittedDate}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-xl font-bold text-[#0B123D]">
                                                        {selectedSub.title}
                                                    </h2>
                                                    <p className="text-xs text-[#64708C]">
                                                        Course: <span className="font-semibold text-[#0B123D]">{selectedSub.course}</span> · {selectedSub.courseTitle}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDecision("approve")}
                                                        className="h-10 px-4 bg-[#009F75] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#008763] transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Approve</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecision("reject")}
                                                        className="h-10 px-4 border border-[#DF365B] text-[#DF365B] text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#FFF5F6] transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Submitter Info Card */}
                                            <div className="p-4 bg-[#F6F8FF] rounded-xl border border-[#E1E6F3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-sm">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[#0B123D]">{selectedSub.submitterName}</div>
                                                        <div className="text-xs text-[#64708C]">{selectedSub.submitterEmail} · {selectedSub.submitterId}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-[#64708C]">
                                                    Role: <span className="font-semibold text-[#0B123D]">{selectedSub.submitterRole}</span>
                                                </div>
                                            </div>

                                            {/* Checklist */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-[#0B123D] uppercase tracking-wider">Quality Checklist</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                    {Object.entries(checks).map(([key, val]) => (
                                                        <label key={key} className="flex items-center gap-2.5 p-3 rounded-lg border border-[#E1E6F3] bg-white cursor-pointer hover:bg-slate-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={val}
                                                                onChange={() => handleCheckboxChange(key as keyof typeof checks)}
                                                                className="rounded border-gray-300 text-[#245CFF] focus:ring-[#245CFF]"
                                                            />
                                                            <span className="capitalize text-[#0B123D]">
                                                                {key.replace(/([A-Z])/g, " $1")}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Feedback Box */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#0B123D] uppercase tracking-wider block">
                                                    Reviewer Feedback
                                                </label>
                                                <textarea
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    rows={3}
                                                    className="w-full p-3.5 bg-white border border-[#E1E6F3] rounded-xl text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <EmptyState
                                        icon={FileText}
                                        title="No Submission Selected"
                                        description="Select a submission from the review queue on the left to inspect its contents and issue an approval."
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
