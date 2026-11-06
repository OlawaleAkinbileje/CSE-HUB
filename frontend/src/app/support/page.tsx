"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Search,
    BookOpen,
    FolderSearch,
    DownloadCloud,
    Share2,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    FileUp,
    X,
    CheckSquare,
    Square,
    ShieldAlert,
    ArrowRight,
    Clock,
    Mail,
    HelpCircle,
} from "lucide-react";
import { useCurrentUser } from '@/lib/useCurrentUser';

interface FAQItem {
    id: string;
    question: string;
    answerText1: string;
    answerText2?: string;
    linkText?: string;
    linkHref?: string;
}

export default function HelpAndSupportPage() {
    const currentUser = useCurrentUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

    // Contact Form State
    const [formState, setFormState] = useState({
        subject: "Unable to download CS201 lecture notes",
        category: "Downloads & Access",
        message:
            "I receive an Access denied message when downloading Introduction to Algorithms — Lecture Notes 2024 (CS201). I am enrolled in CS201 and signed in with my university email. I tried refreshing and using another browser, but the issue remains.",
        includeDeviceInfo: true,
    });

    // Attachment Error State (reflecting the Figma design specs)
    const [attachment, setAttachment] = useState<{
        name: string;
        size: string;
        error: string;
    } | null>({
        name: "download-error.png",
        size: "6.2 MB",
        error: "File too large",
    });

    const faqs: FAQItem[] = [
        {
            id: "faq-1",
            question: "Why can’t I download a resource?",
            answerText1:
                "Make sure you are signed in with your verified university email. Some resources are restricted to enrolled students or staff. If the download still fails, try refreshing the page or using another browser.",
            answerText2:
                "If you see “Access denied” for a course you are enrolled in, contact support with the resource title, course code and a screenshot. Do not include your password.",
            linkText: "Contact support about download issues →",
            linkHref: "mailto:support@cse.edu.ng?subject=Download%20troubleshooting",
        },
        {
            id: "faq-2",
            question: "How do I save a resource for later?",
            answerText1:
                "You can save any resource to your personal list by clicking the bookmark or 'Save Resource' icon on any resource page. Access your saved items anytime under 'My Resources' in the sidebar navigation.",
        },
        {
            id: "faq-3",
            question: "Can I upload my own lecture notes?",
            answerText1:
                "Students can upload course materials for approval if peer contributions are enabled by your department. Staff members can upload files directly through the Staff Workspace.",
        },
        {
            id: "faq-4",
            question: "How do I report an incorrect or inaccessible file?",
            answerText1:
                "If a file is broken, corrupted, or contains inaccurate content, use the 'Report File' button located on the resource detail view, or submit a request using the contact form below with the category set to 'Downloads & Access'.",
        },
    ];

    const categories = [
        {
            title: "Getting Started",
            description: "Account setup and navigation",
            articleCount: "8 articles →",
            icon: BookOpen,
            href: "#",
        },
        {
            title: "Finding Resources",
            description: "Search, filters and courses",
            articleCount: "12 articles →",
            icon: FolderSearch,
            href: "/student/search",
        },
        {
            title: "Downloads & Access",
            description: "Files, permissions and saving",
            articleCount: "9 articles →",
            icon: DownloadCloud,
            href: "#",
        },
        {
            title: "Sharing & Reviews",
            description: "Uploads and approval guidance",
            articleCount: "7 articles →",
            icon: Share2,
            href: "#",
        },
    ];

    const handleFaqToggle = (id: string) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    const isFormDisabled = !!(attachment && attachment.error);

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Shared Navbar */}
            <Navbar userRole="student" />

            {/* Main Container */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Shared Sidebar */}
                <Sidebar userRole="student" />

                {/* Content Area */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6 max-w-5xl mx-auto w-full">
                        {/* Header Title Section */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                Help &amp; Support
                            </h1>
                            <p className="text-sm text-[#64708C] mt-1">
                                Find answers, solve common issues or contact the CSE Hub team.
                            </p>
                        </div>

                        {/* Gradient Search Banner */}
                        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#DDF7FE] via-[#E7DCFF] to-[#D6F6FF] space-y-4 border border-[#E1E6F3]/50">
                            <h2 className="text-xl md:text-2xl font-bold text-[#0B123D]">
                                How can we help you?
                            </h2>
                            <div className="h-11 px-4 bg-white rounded-lg border border-[#E1E6F3] flex items-center gap-3 shadow-sm max-w-2xl">
                                <Search className="w-4 h-4 text-[#64708C]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search help articles, guides or questions..."
                                    className="w-full bg-transparent text-sm text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                                />
                            </div>
                            <p className="text-xs text-[#64708C]">
                                Popular: download issues · account access · saving resources
                            </p>
                        </div>

                        {/* Help Topics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {categories.map((cat, idx) => (
                                <a
                                    key={idx}
                                    href={cat.href}
                                    className="p-5 bg-white rounded-xl border border-[#E1E6F3] hover:border-[#245CFF] transition-all flex flex-col justify-between gap-4 shadow-sm group"
                                >
                                    <div className="space-y-2">
                                        <div className="w-10 h-10 rounded-lg bg-[#E9EDFF] flex items-center justify-center">
                                            <cat.icon className="w-5 h-5 text-[#245CFF]" />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#0B123D] group-hover:text-[#245CFF] transition-colors">
                                            {cat.title}
                                        </h3>
                                        <p className="text-xs text-[#64708C]">{cat.description}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-[#245CFF]">
                                        {cat.articleCount}
                                    </span>
                                </a>
                            ))}
                        </div>

                        {/* Frequently Asked Questions */}
                        <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-4">
                            <h2 className="text-lg font-bold text-[#0B123D]">
                                Frequently Asked Questions
                            </h2>

                            <div className="divide-y divide-[#E1E6F3]">
                                {faqs.map((faq) => {
                                    const isOpen = openFaqId === faq.id;
                                    return (
                                        <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
                                            <button
                                                onClick={() => handleFaqToggle(faq.id)}
                                                className="w-full flex items-center justify-between text-left gap-4"
                                            >
                                                <span
                                                    className={`text-sm font-semibold transition-colors ${isOpen ? "text-[#245CFF]" : "text-[#0B123D]"
                                                        }`}
                                                >
                                                    {faq.question}
                                                </span>
                                                {isOpen ? (
                                                    <ChevronUp className="w-4 h-4 text-[#64708C] shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-[#64708C] shrink-0" />
                                                )}
                                            </button>

                                            {isOpen && (
                                                <div className="mt-3 space-y-2.5 text-xs text-[#64708C] leading-relaxed">
                                                    <p>{faq.answerText1}</p>
                                                    {faq.answerText2 && <p>{faq.answerText2}</p>}
                                                    {faq.linkText && faq.linkHref && (
                                                        <a
                                                            href={faq.linkHref}
                                                            className="text-[#245CFF] font-semibold hover:underline inline-block pt-1"
                                                        >
                                                            {faq.linkText}
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contact Support & Info Split Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Form */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-5">
                                <div>
                                    <h2 className="text-lg font-bold text-[#0B123D]">
                                        Contact Support
                                    </h2>
                                    <p className="text-xs text-[#64708C] mt-0.5">
                                        Tell us what happened so we can help. Required fields are marked *.
                                    </p>
                                </div>

                                {/* Sender Context Pill */}
                                <div className="p-3 bg-[#F6F8FF] rounded-lg border border-[#E1E6F3] flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-[#E9EDFF] text-[#245CFF] text-xs font-semibold rounded-full">
                                        {currentUser.full_name || currentUser.username || 'User'}
                                    </span>
                                    <span className="text-xs text-[#64708C]">
                                        john.doe@student.cse.edu.ng
                                    </span>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    {/* Subject Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.subject}
                                            onChange={(e) =>
                                                setFormState({ ...formState, subject: e.target.value })
                                            }
                                            className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                        />
                                    </div>

                                    {/* Category Selection */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Category *
                                        </label>
                                        <div className="relative w-full">
                                            <select
                                                value={formState.category}
                                                onChange={(e) =>
                                                    setFormState({ ...formState, category: e.target.value })
                                                }
                                                className="w-full h-11 pl-3.5 pr-8 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] cursor-pointer"
                                            >
                                                <option value="Downloads & Access">
                                                    Downloads &amp; Access
                                                </option>
                                                <option value="Account Issues">Account Issues</option>
                                                <option value="Resource Feedback">Resource Feedback</option>
                                                <option value="Accessibility">Accessibility</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Message *
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={formState.message}
                                            onChange={(e) =>
                                                setFormState({ ...formState, message: e.target.value })
                                            }
                                            className="w-full p-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF] resize-none"
                                        />
                                        <p className="text-[11px] text-[#64708C]">
                                            Include the resource title, course code and steps you have already tried.
                                        </p>
                                    </div>

                                    {/* Attachment Section with Error State */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Attachment (optional)
                                        </label>

                                        {attachment ? (
                                            <div className="p-3.5 bg-[#FFF0F4] border border-[#DF365B] rounded-lg space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <AlertCircle className="w-5 h-5 text-[#DF365B] shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-[#0B123D] truncate">
                                                                {attachment.name}
                                                            </p>
                                                            <p className="text-[11px] text-[#DF365B] font-medium">
                                                                {attachment.size} · {attachment.error}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setAttachment(null)}
                                                        className="text-xs font-semibold text-[#DF365B] hover:underline shrink-0"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : null}

                                        {attachment?.error && (
                                            <p className="text-[11px] text-[#DF365B]">
                                                Attachment must be 5 MB or smaller. Replace or remove this file before sending.
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 pt-1">
                                            <label className="h-9 px-3.5 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#F6F8FF] transition-colors">
                                                <FileUp className="w-4 h-4 text-[#245CFF]" />
                                                <span>Replace Attachment</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={() =>
                                                        setAttachment({
                                                            name: "error-screen.png",
                                                            size: "2.1 MB",
                                                            error: "",
                                                        })
                                                    }
                                                />
                                            </label>
                                            <span className="text-[11px] text-[#64708C]">
                                                PNG, JPG or PDF · Max 5 MB
                                            </span>
                                        </div>
                                    </div>

                                    {/* Checkbox */}
                                    <div className="flex items-center gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormState({
                                                    ...formState,
                                                    includeDeviceInfo: !formState.includeDeviceInfo,
                                                })
                                            }
                                            className="text-[#245CFF]"
                                        >
                                            {formState.includeDeviceInfo ? (
                                                <CheckSquare className="w-4 h-4 text-[#245CFF]" />
                                            ) : (
                                                <Square className="w-4 h-4 text-[#64708C]" />
                                            )}
                                        </button>
                                        <span className="text-xs text-[#0B123D]">
                                            Include my browser and device information to help troubleshoot
                                        </span>
                                    </div>

                                    {/* Submit Button & Validation Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E1E6F3]">
                                        <span className="text-xs text-[#64708C]">
                                            {isFormDisabled
                                                ? "Resolve the attachment issue to continue."
                                                : "Ready to submit."}
                                        </span>

                                        <button
                                            disabled={isFormDisabled}
                                            onClick={() => alert("Support ticket submitted!")}
                                            className={`h-11 px-6 rounded-lg text-xs font-semibold transition-all ${isFormDisabled
                                                ? "bg-[#E1E6F3] text-[#64708C] cursor-not-allowed"
                                                : "bg-[#245CFF] text-white hover:bg-blue-700 shadow-sm"
                                                }`}
                                        >
                                            Send Request
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar: Details & Instructions */}
                            <div className="space-y-5">
                                {/* Hours Box */}
                                <div className="bg-white p-5 rounded-xl border border-[#E1E6F3] shadow-sm space-y-3">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Support hours
                                    </h3>
                                    <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-xs font-semibold rounded-full w-fit inline-block">
                                        Monday–Friday
                                    </span>
                                    <p className="text-xs font-semibold text-[#0B123D]">
                                        9:00 AM–5:00 PM WAT
                                    </p>
                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        We usually reply within 1–2 working days. You’ll receive a reference number and updates by email.
                                    </p>
                                    <hr className="border-[#E1E6F3]" />
                                    <p className="text-xs font-semibold text-[#0B123D]">
                                        Email the platform team
                                    </p>
                                    <a
                                        href="mailto:support@cse.edu.ng"
                                        className="text-xs text-[#245CFF] hover:underline block"
                                    >
                                        support@cse.edu.ng
                                    </a>
                                </div>

                                {/* Before You Send Checklist */}
                                <div className="bg-white p-5 rounded-xl border border-[#E1E6F3] shadow-sm space-y-3">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Before you send
                                    </h3>
                                    <ul className="space-y-2 text-xs text-[#64708C]">
                                        <li>• Include the resource title and course code.</li>
                                        <li>• Describe the issue and any error message.</li>
                                        <li>• Attach a screenshot with private details hidden.</li>
                                        <li>• For enrolment changes, contact your department office.</li>
                                    </ul>
                                </div>

                                {/* Privacy Reminder Banner */}
                                <div className="p-4 bg-[#F0F3FF] rounded-lg border border-[#E1E6F3] flex items-start gap-3">
                                    <ShieldAlert className="w-4 h-4 text-[#245CFF] shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#245CFF] leading-relaxed">
                                        Never share passwords, verification codes or sensitive personal data with support.
                                    </p>
                                </div>

                                {/* Accessibility Box */}
                                <div className="bg-white p-5 rounded-xl border border-[#E1E6F3] shadow-sm space-y-3">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Accessibility support
                                    </h3>
                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        Need an accessible document or assistance using the platform? Choose Accessibility as your request category.
                                    </p>
                                    <a
                                        href="/about"
                                        className="text-xs font-semibold text-[#245CFF] hover:underline flex items-center gap-1 pt-1"
                                    >
                                        <span>About CSE Hub</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
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