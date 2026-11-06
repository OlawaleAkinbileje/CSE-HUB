"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Settings,
    Search,
    Shield,
    Users,
    Bell,
    Database,
    CheckCircle2,
    AlertTriangle,
    Info,
    RotateCw,
    Save,
} from "lucide-react";

export default function SystemSettingsPage() {
    const [activeSection, setActiveSection] = useState("general");

    // Form State Management
    const [generalSettings, setGeneralSettings] = useState({
        appName: "CSE Hub",
        academicYear: "2024 / 2025",
        department: "Computer Science and Engineering",
        timeZone: "Africa/Lagos (WAT)",
        supportEmail: "support@cse.edu.ng",
        maintenanceMode: false,
    });

    const [searchSettings, setSearchSettings] = useState({
        defaultSort: "Relevance",
        resultsPerPage: "20",
        fullTextSearch: true,
        automaticIndexing: true,
    });

    const [resourcePolicy, setResourcePolicy] = useState({
        maxFileSize: "20 MB",
        defaultVisibility: "Public — Registered users",
        allowedFormats: "PDF, DOC, DOCX, PPT, ZIP, RAR, JPG, PNG",
        requireApproval: true,
        detectDuplicates: true,
        scanThreats: true,
    });

    const [userAccess, setUserAccess] = useState({
        defaultRole: "Student",
        sessionTimeout: "60 minutes",
        approvedDomains: "cse.edu.ng, student.cse.edu.ng",
        requireVerifiedEmail: true,
        requireAdmin2FA: true,
        allowSelfRegistration: true,
    });

    const [notifications, setNotifications] = useState({
        reviewQueueAlerts: true,
        decisionEmails: true,
        systemAnnouncements: true,
        activityDigest: "Weekly — Monday",
        deliveryTime: "08:00 WAT",
    });

    const [backupSettings, setBackupSettings] = useState({
        schedule: "Daily at 02:00 WAT",
        retention: "30 days",
    });

    const [isReindexing, setIsReindexing] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleSaveAll = () => {
        alert("System settings successfully updated!");
    };

    const handleRebuildIndex = () => {
        setIsReindexing(true);
        setTimeout(() => {
            setIsReindexing(false);
            alert("Search index successfully rebuilt.");
        }, 1500);
    };

    const handleRunBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            setIsBackingUp(false);
            alert("System backup initiated successfully.");
        }, 1500);
    };

    const sectionTabs = [
        { id: "general", label: "General", icon: Settings },
        { id: "search", label: "Search & Indexing", icon: Search },
        { id: "policy", label: "Resource Policy", icon: Shield },
        { id: "access", label: "User & Access", icon: Users },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "backup", label: "Backup", icon: Database },
    ];

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Standard Shared Navbar */}
            {/* <Navbar userRole="admin" />*/}

            {/* Main Layout Shell */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Standard Shared Sidebar */}
                <Sidebar userRole="admin" />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6 max-w-6xl">
                        {/* Header Title & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                    System Settings
                                </h1>
                                <p className="text-sm text-[#64708C] mt-1">
                                    Configure CSE Hub policies, access and platform operations.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-[#E6FAF4] text-[#009F75] text-xs font-semibold rounded-full flex items-center gap-1.5 shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-[#009F75]" />
                                    All services operational
                                </span>
                            </div>
                        </div>

                        <div className="text-xs text-[#64708C]">
                            Last saved · 4 Nov 2026, 9:30 AM WAT
                        </div>

                        {/* Layout Grid: Sidebar Navigation & Form Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                            {/* Section Jump Links Card (Desktop & Mobile Tabs) */}
                            <div className="lg:col-span-1 bg-white p-3 rounded-xl border border-[#E1E6F3] shadow-sm space-y-1">
                                <div className="text-xs font-semibold text-[#64708C] px-3 py-2 md:hidden">
                                    Settings Sections
                                </div>
                                {sectionTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeSection === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveSection(tab.id);
                                                const el = document.getElementById(tab.id);
                                                if (el) el.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-medium transition-all ${isActive
                                                ? "bg-[#E9EDFF] text-[#245CFF] font-semibold"
                                                : "text-[#0B123D] hover:bg-[#F6F8FF]"
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? "text-[#245CFF]" : "text-[#64708C]"}`} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Form Cards Stack */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* 1. General Settings Card */}
                                <div id="general" className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-5">
                                    <div className="border-b border-[#E1E6F3] pb-4">
                                        <h3 className="text-lg font-bold text-[#0B123D]">General</h3>
                                        <p className="text-xs text-[#64708C] mt-1">
                                            Basic information shown throughout the application.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* App Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Application name
                                            </label>
                                            <input
                                                type="text"
                                                value={generalSettings.appName}
                                                onChange={(e) =>
                                                    setGeneralSettings({ ...generalSettings, appName: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            />
                                        </div>

                                        {/* Academic Year */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Academic year
                                            </label>
                                            <select
                                                value={generalSettings.academicYear}
                                                onChange={(e) =>
                                                    setGeneralSettings({ ...generalSettings, academicYear: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="2024 / 2025">2024 / 2025</option>
                                                <option value="2025 / 2026">2025 / 2026</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Department */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">Department</label>
                                        <input
                                            type="text"
                                            value={generalSettings.department}
                                            onChange={(e) =>
                                                setGeneralSettings({ ...generalSettings, department: e.target.value })
                                            }
                                            className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Time zone */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">Time zone</label>
                                            <select
                                                value={generalSettings.timeZone}
                                                onChange={(e) =>
                                                    setGeneralSettings({ ...generalSettings, timeZone: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="Africa/Lagos (WAT)">Africa/Lagos (WAT)</option>
                                                <option value="UTC">UTC</option>
                                            </select>
                                        </div>

                                        {/* Support email */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Support email
                                            </label>
                                            <input
                                                type="email"
                                                value={generalSettings.supportEmail}
                                                onChange={(e) =>
                                                    setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            />
                                        </div>
                                    </div>

                                    {/* Maintenance Mode Toggle */}
                                    <div className="flex items-center justify-between gap-4 pt-2">
                                        <div>
                                            <div className="text-xs font-semibold text-[#0B123D]">
                                                Maintenance mode
                                            </div>
                                            <div className="text-xs text-[#64708C] mt-0.5">
                                                Limit access to administrators while maintenance is in progress.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setGeneralSettings({
                                                    ...generalSettings,
                                                    maintenanceMode: !generalSettings.maintenanceMode,
                                                })
                                            }
                                            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${generalSettings.maintenanceMode ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${generalSettings.maintenanceMode ? "translate-x-5" : ""
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* 2. Search & Indexing Card */}
                                <div id="search" className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-5">
                                    <div className="border-b border-[#E1E6F3] pb-4 flex items-center justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#0B123D]">Search & Indexing</h3>
                                            <p className="text-xs text-[#64708C] mt-1">
                                                1,250 / 1,250 resources indexed · 0 failed · Queue: 0
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-xs font-semibold rounded-full">
                                            Healthy
                                        </span>
                                    </div>

                                    <div className="text-xs text-[#64708C] border-b border-[#E1E6F3] pb-3 flex items-center gap-2">
                                        <span className="font-semibold text-[#0B123D]">Last indexed:</span>
                                        <span>4 Nov 2026, 9:28 AM · Completed in 42 seconds</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Default Sort */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Default sort
                                            </label>
                                            <select
                                                value={searchSettings.defaultSort}
                                                onChange={(e) =>
                                                    setSearchSettings({ ...searchSettings, defaultSort: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="Relevance">Relevance</option>
                                                <option value="Newest First">Newest First</option>
                                                <option value="Most Downloaded">Most Downloaded</option>
                                            </select>
                                        </div>

                                        {/* Results per page */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Results per page
                                            </label>
                                            <select
                                                value={searchSettings.resultsPerPage}
                                                onChange={(e) =>
                                                    setSearchSettings({ ...searchSettings, resultsPerPage: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="10">10</option>
                                                <option value="20">20</option>
                                                <option value="50">50</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Full-text search
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Search within supported PDF and document content.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearchSettings({
                                                        ...searchSettings,
                                                        fullTextSearch: !searchSettings.fullTextSearch,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${searchSettings.fullTextSearch ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${searchSettings.fullTextSearch ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Automatic indexing
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Reindex resources when files or metadata change.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearchSettings({
                                                        ...searchSettings,
                                                        automaticIndexing: !searchSettings.automaticIndexing,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${searchSettings.automaticIndexing ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${searchSettings.automaticIndexing ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                        <p className="text-xs text-[#64708C]">
                                            Rebuilding runs in the background without blocking search.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleRebuildIndex}
                                            disabled={isReindexing}
                                            className="h-10 px-4 border border-[#E1E6F3] bg-white text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#F6F8FF] transition-colors shrink-0"
                                        >
                                            <RotateCw className={`w-3.5 h-3.5 ${isReindexing ? "animate-spin" : ""}`} />
                                            <span>{isReindexing ? "Rebuilding..." : "Rebuild Index"}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 3. Resource Policy Card */}
                                <div id="policy" className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-5">
                                    <div className="border-b border-[#E1E6F3] pb-4">
                                        <h3 className="text-lg font-bold text-[#0B123D]">Resource Policy</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Max File Size */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Maximum file size
                                            </label>
                                            <select
                                                value={resourcePolicy.maxFileSize}
                                                onChange={(e) =>
                                                    setResourcePolicy({ ...resourcePolicy, maxFileSize: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="10 MB">10 MB</option>
                                                <option value="20 MB">20 MB</option>
                                                <option value="50 MB">50 MB</option>
                                            </select>
                                        </div>

                                        {/* Default Visibility */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Default visibility
                                            </label>
                                            <select
                                                value={resourcePolicy.defaultVisibility}
                                                onChange={(e) =>
                                                    setResourcePolicy({
                                                        ...resourcePolicy,
                                                        defaultVisibility: e.target.value,
                                                    })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="Public — Registered users">
                                                    Public — Registered users
                                                </option>
                                                <option value="Staff Only">Staff Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Formats */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Allowed file formats
                                        </label>
                                        <input
                                            type="text"
                                            value={resourcePolicy.allowedFormats}
                                            onChange={(e) =>
                                                setResourcePolicy({ ...resourcePolicy, allowedFormats: e.target.value })
                                            }
                                            className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                        />
                                        <p className="text-[11px] text-[#64708C]">
                                            Separate extensions with commas. Executable files are blocked.
                                        </p>
                                    </div>

                                    {/* Policy Toggles */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Require approval before publication
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    New uploads and replacement files must pass staff review.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setResourcePolicy({
                                                        ...resourcePolicy,
                                                        requireApproval: !resourcePolicy.requireApproval,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${resourcePolicy.requireApproval ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${resourcePolicy.requireApproval ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Detect duplicate submissions
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Flag matching files and similar resource titles for review.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setResourcePolicy({
                                                        ...resourcePolicy,
                                                        detectDuplicates: !resourcePolicy.detectDuplicates,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${resourcePolicy.detectDuplicates ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${resourcePolicy.detectDuplicates ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Scan files for threats
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Quarantine potentially unsafe attachments before they are accessible.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setResourcePolicy({
                                                        ...resourcePolicy,
                                                        scanThreats: !resourcePolicy.scanThreats,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${resourcePolicy.scanThreats ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${resourcePolicy.scanThreats ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3.5 bg-[#F0F3FF] rounded-lg flex items-center gap-2 text-xs text-[#245CFF]">
                                        <Info className="w-4 h-4 shrink-0" />
                                        <span>
                                            Archived resources retain their history but are excluded from student search.
                                        </span>
                                    </div>
                                </div>

                                {/* 4. User & Access Card */}
                                <div id="access" className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-5">
                                    <div className="border-b border-[#E1E6F3] pb-4">
                                        <h3 className="text-lg font-bold text-[#0B123D]">User & Access</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Role */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Default registration role
                                            </label>
                                            <select
                                                value={userAccess.defaultRole}
                                                onChange={(e) =>
                                                    setUserAccess({ ...userAccess, defaultRole: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Staff">Staff</option>
                                            </select>
                                        </div>

                                        {/* Timeout */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Session timeout
                                            </label>
                                            <select
                                                value={userAccess.sessionTimeout}
                                                onChange={(e) =>
                                                    setUserAccess({ ...userAccess, sessionTimeout: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="30 minutes">30 minutes</option>
                                                <option value="60 minutes">60 minutes</option>
                                                <option value="120 minutes">120 minutes</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Domains */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#0B123D]">
                                            Approved email domains
                                        </label>
                                        <input
                                            type="text"
                                            value={userAccess.approvedDomains}
                                            onChange={(e) =>
                                                setUserAccess({ ...userAccess, approvedDomains: e.target.value })
                                            }
                                            className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                        />
                                    </div>

                                    {/* Access Toggles */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Require verified university email
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Only verified departmental accounts can access resources.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setUserAccess({
                                                        ...userAccess,
                                                        requireVerifiedEmail: !userAccess.requireVerifiedEmail,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${userAccess.requireVerifiedEmail ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${userAccess.requireVerifiedEmail ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Require two-factor authentication for admins
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Protect privileged actions with an additional sign-in step.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setUserAccess({
                                                        ...userAccess,
                                                        requireAdmin2FA: !userAccess.requireAdmin2FA,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${userAccess.requireAdmin2FA ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${userAccess.requireAdmin2FA ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Allow student self-registration
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Students can register using their university email and matric number.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setUserAccess({
                                                        ...userAccess,
                                                        allowSelfRegistration: !userAccess.allowSelfRegistration,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${userAccess.allowSelfRegistration ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${userAccess.allowSelfRegistration ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-[#64708C]">
                                        Staff and administrator roles are assigned from User Management. Permission
                                        changes take effect at the next sign-in.
                                    </p>
                                </div>

                                {/* 5. Notifications Card */}
                                <div id="notifications" className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-5">
                                    <div className="border-b border-[#E1E6F3] pb-4">
                                        <h3 className="text-lg font-bold text-[#0B123D]">Notifications</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Review queue alerts
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Notify assigned staff when a resource is submitted or resubmitted.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNotifications({
                                                        ...notifications,
                                                        reviewQueueAlerts: !notifications.reviewQueueAlerts,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications.reviewQueueAlerts ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.reviewQueueAlerts ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    Decision emails
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Email contributors when resources are approved or need changes.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNotifications({
                                                        ...notifications,
                                                        decisionEmails: !notifications.decisionEmails,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications.decisionEmails ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.decisionEmails ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-xs font-semibold text-[#0B123D]">
                                                    System announcements
                                                </div>
                                                <div className="text-xs text-[#64708C] mt-0.5">
                                                    Send service notices and important platform updates.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNotifications({
                                                        ...notifications,
                                                        systemAnnouncements: !notifications.systemAnnouncements,
                                                    })
                                                }
                                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications.systemAnnouncements ? "bg-[#245CFF]" : "bg-[#B0BAD3]"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.systemAnnouncements ? "translate-x-5" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        {/* Activity Digest */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Activity digest
                                            </label>
                                            <select
                                                value={notifications.activityDigest}
                                                onChange={(e) =>
                                                    setNotifications({ ...notifications, activityDigest: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="Weekly — Monday">Weekly — Monday</option>
                                                <option value="Daily">Daily</option>
                                            </select>
                                        </div>

                                        {/* Delivery Time */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">
                                                Delivery time
                                            </label>
                                            <select
                                                value={notifications.deliveryTime}
                                                onChange={(e) =>
                                                    setNotifications({ ...notifications, deliveryTime: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="08:00 WAT">08:00 WAT</option>
                                                <option value="12:00 WAT">12:00 WAT</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Backup Card */}
                                <div id="backup" className="bg-white p-6 rounded-xl border border-[#E1E6F3] shadow-sm space-y-5">
                                    <div className="border-b border-[#E1E6F3] pb-4 flex items-center justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#0B123D]">Backup</h3>
                                            <p className="text-xs text-[#64708C] mt-1">
                                                4 Nov 2026, 2:00 AM WAT · 4.8 GB · Encrypted
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-xs font-semibold rounded-full">
                                            Successful
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Schedule */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">Schedule</label>
                                            <select
                                                value={backupSettings.schedule}
                                                onChange={(e) =>
                                                    setBackupSettings({ ...backupSettings, schedule: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="Daily at 02:00 WAT">Daily at 02:00 WAT</option>
                                                <option value="Weekly at 02:00 WAT">Weekly at 02:00 WAT</option>
                                            </select>
                                        </div>

                                        {/* Retention */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#0B123D]">Retention</label>
                                            <select
                                                value={backupSettings.retention}
                                                onChange={(e) =>
                                                    setBackupSettings({ ...backupSettings, retention: e.target.value })
                                                }
                                                className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option value="30 days">30 days</option>
                                                <option value="60 days">60 days</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs border-y border-[#E1E6F3] py-3">
                                        <div className="flex justify-between">
                                            <span className="text-[#64708C]">Next backup:</span>
                                            <span className="font-medium text-[#0B123D]">5 Nov 2026, 2:00 AM WAT</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#64708C]">Storage:</span>
                                            <span className="font-medium text-[#0B123D]">
                                                University secure storage · 144 GB / 500 GB used
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleRunBackup}
                                            disabled={isBackingUp}
                                            className="h-10 px-4 border border-[#E1E6F3] bg-white text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#F6F8FF] transition-colors"
                                        >
                                            <Database className="w-3.5 h-3.5" />
                                            <span>{isBackingUp ? "Running..." : "Run Backup Now"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => alert("Opening Backup History Log...")}
                                            className="h-10 px-4 border border-[#E1E6F3] bg-white text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center hover:bg-[#F6F8FF] transition-colors"
                                        >
                                            View Backup History
                                        </button>
                                    </div>

                                    <div className="p-3.5 bg-[#FFF5EB] rounded-lg flex items-start gap-2.5 text-xs text-[#B86A17]">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>
                                            Restore operations replace current data and require administrator confirmation.
                                            Contact the platform team before restoring.
                                        </span>
                                    </div>
                                </div>

                                {/* Save Footer Action */}
                                <div className="p-4 bg-white rounded-xl border border-[#E1E6F3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <span className="text-xs text-[#64708C]">
                                        Changes apply to the entire department.
                                    </span>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="flex-1 sm:flex-none h-11 px-5 border border-[#E1E6F3] bg-white text-[#245CFF] text-xs font-semibold rounded-lg hover:bg-[#F6F8FF] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveAll}
                                            className="flex-1 sm:flex-none h-11 px-6 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-95 shadow-sm"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Save Settings</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Standard Shared Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}