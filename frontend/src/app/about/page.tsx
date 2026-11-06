"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    BookOpen,
    Users,
    GraduationCap,
    FileText,
    UserCheck,
    ShieldCheck,
    Search,
    BookMarked,
    UploadCloud,
    ArrowRight,
    HelpCircle,
    Sparkles,
} from "lucide-react";

export default function AboutPage() {
    const stats = [
        {
            value: "1,250",
            label: "Learning resources",
            icon: BookOpen,
        },
        {
            value: "450",
            label: "Registered users",
            icon: Users,
        },
        {
            value: "42",
            label: "Courses supported",
            icon: GraduationCap,
        },
    ];

    const roles = [
        {
            title: "Students",
            description:
                "Discover course materials, revise with past questions, save useful resources and plan your reading.",
            icon: BookMarked,
        },
        {
            title: "Staff",
            description:
                "Share learning materials, keep resources up to date and review student contributions.",
            icon: UserCheck,
        },
        {
            title: "Administrators",
            description:
                "Maintain course categories, manage user access and keep the platform running reliably.",
            icon: ShieldCheck,
        },
    ];

    const workflowSteps = [
        {
            step: 1,
            title: "Find what you need",
            description:
                "Search by title, course or keyword. Filter by category, academic year and file type.",
        },
        {
            step: 2,
            title: "Learn your way",
            description:
                "Preview materials, download files and organise saved resources in My Resources.",
        },
        {
            step: 3,
            title: "Contribute responsibly",
            description:
                "Upload useful content with clear metadata. Staff review submissions before publication.",
        },
    ];

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Shared Header Navigation */}
            <Navbar userRole="student" />

            {/* Main Layout Shell */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Shared Desktop Sidebar */}
                <Sidebar userRole="student" />

                {/* Workspace Container */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6 max-w-5xl mx-auto w-full">
                        {/* Header Title Section */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                About CSE Hub
                            </h1>
                            <p className="text-sm text-[#64708C] mt-1">
                                A shared resource hub for the Computer Science and Engineering community.
                            </p>
                        </div>

                        {/* Main Gradient Hero Banner */}
                        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#DDF7FE] via-[#E7DCFF] to-[#D6F6FF] space-y-4 border border-[#E1E6F3]/50">
                            <span className="px-3 py-1 bg-[#E9EDFF] text-[#245CFF] text-xs font-semibold rounded-full inline-block">
                                Department of Computer Science and Engineering
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#0B123D] leading-tight">
                                Learn, share and grow together.
                            </h2>
                            <p className="text-sm text-[#0B123D] leading-relaxed max-w-3xl">
                                CSE Hub brings lecture notes, past questions, projects and code samples into one organised departmental library. It helps our university’s students and staff find reliable learning materials and preserve knowledge for the next cohort.
                            </p>
                        </div>

                        {/* Department Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {stats.map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 bg-white rounded-xl border border-[#E1E6F3] shadow-sm flex items-center gap-4"
                                >
                                    <div className="w-11 h-11 rounded-lg bg-[#E9EDFF] flex items-center justify-center shrink-0">
                                        <stat.icon className="w-6 h-6 text-[#245CFF]" />
                                    </div>
                                    <div>
                                        <span className="text-2xl font-bold text-[#0B123D] block leading-none">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs text-[#64708C] mt-1 block">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Built for Our Department Section */}
                        <div className="bg-white p-6 md:p-8 rounded-xl border border-[#E1E6F3] shadow-sm space-y-6">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-[#0B123D]">
                                    Built for our department
                                </h2>
                                <p className="text-sm text-[#64708C] mt-1 leading-relaxed">
                                    CSE Hub supports teaching, independent study and collaboration within the university’s Computer Science and Engineering department. Course codes, academic years and categories keep materials connected to the curriculum — not scattered across personal drives and chat groups.
                                </p>
                            </div>

                            {/* Role Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {roles.map((role, idx) => (
                                    <div
                                        key={idx}
                                        className="p-5 bg-[#F6F8FF] rounded-xl space-y-2 border border-[#E1E6F3]/50"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-xs">
                                            <role.icon className="w-5 h-5 text-[#245CFF]" />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#0B123D]">
                                            {role.title}
                                        </h3>
                                        <p className="text-xs text-[#64708C] leading-relaxed">
                                            {role.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How CSE Hub Works Process Steps */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-[#0B123D]">
                                How CSE Hub Works
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {workflowSteps.map((item) => (
                                    <div
                                        key={item.step}
                                        className="p-5 bg-white rounded-xl border border-[#E1E6F3] shadow-sm space-y-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#245CFF] text-white font-bold text-sm flex items-center justify-center">
                                            {item.step}
                                        </div>
                                        <h3 className="text-sm font-bold text-[#0B123D]">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-[#64708C] leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Community & Accessibility Split Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Card 1: Resources & Community */}
                            <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Resources &amp; Community
                                    </h3>
                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        Explore Lecture Notes, Past Questions, Projects, Code Samples and the Knowledge Hub. Resources are contributed by members of the department and reviewed for relevance and quality.
                                    </p>
                                    <hr className="border-[#E1E6F3]" />
                                    <h4 className="text-xs font-semibold text-[#0B123D]">
                                        Share with care
                                    </h4>
                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        Credit original authors, respect copyright and avoid personal or confidential information. Past questions support revision and are not a substitute for attending classes or following course guidance.
                                    </p>
                                </div>

                                <Link
                                    href="/student/search"
                                    className="text-xs font-semibold text-[#245CFF] hover:underline flex items-center gap-1 pt-2"
                                >
                                    <span>Browse the resource library</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Card 2: Access & Accessibility */}
                            <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Access &amp; Accessibility
                                    </h3>
                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        Use your verified university email to sign in. Some materials are limited to a course or to staff; permissions follow your account role and enrolment.
                                    </p>
                                    <hr className="border-[#E1E6F3]" />
                                    <h4 className="text-xs font-semibold text-[#0B123D]">
                                        Learning should be accessible
                                    </h4>
                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        We encourage readable, searchable documents and clear descriptions. If you need an alternative format or encounter an accessibility barrier, contact the platform team through Help &amp; Support.
                                    </p>
                                </div>

                                <Link
                                    href="/support"
                                    className="text-xs font-semibold text-[#245CFF] hover:underline flex items-center gap-1 pt-2"
                                >
                                    <span>Get accessibility support</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* Bottom Support Callout Banner */}
                        <div className="p-6 rounded-xl bg-[#E9EDFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#E1E6F3]">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                                    <HelpCircle className="w-6 h-6 text-[#245CFF]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Have a question or an idea?
                                    </h3>
                                    <p className="text-xs text-[#64708C] leading-relaxed">
                                        The CSE Hub platform team can help with resources, account access and feedback.
                                    </p>
                                    <p className="text-xs font-semibold text-[#245CFF] pt-0.5">
                                        support@cse.edu.ng · Monday–Friday, 9 AM–5 PM WAT
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/support"
                                className="h-11 px-5 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-xs font-semibold rounded-lg flex items-center justify-center shrink-0 hover:opacity-95 transition-opacity shadow-sm self-start sm:self-auto"
                            >
                                Help &amp; Support
                            </Link>
                        </div>
                    </div>

                    {/* Shared Standard Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}