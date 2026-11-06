"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Bell,
    CheckCheck,
    ChevronDown,
    FileText,
    Clock,
    ArrowRight,
    ShieldAlert,
    SlidersHorizontal,
    Mail,
    HelpCircle,
} from "lucide-react";
import { useNotifications, NotificationItem } from "@/lib/queries";
import DataContainer from "@/components/ui/DataContainer";
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function StudentNotificationsPage() {
    const currentUser = useCurrentUser();
    const [activeTab, setActiveTab] = useState<"All" | "Resources" | "Reviews" | "System">("All");
    const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");

    // Notification Preferences State
    const [preferences, setPreferences] = useState({
        resourceUpdates: true,
        reviewActivity: true,
        weeklyDigest: false,
        emailFrequency: "As events happen",
        channelInApp: true,
        channelEmail: true,
    });

    const { data: rawNotifications, isLoading } = useNotifications();
    const [localNotifications, setLocalNotifications] = useState<NotificationItem[] | null>(null);

    const notifications = localNotifications !== null ? localNotifications : (rawNotifications || []);

    const markAllAsRead = () => {
        setLocalNotifications((prev) =>
            (prev || notifications).map((n) => ({ ...n, isRead: true }))
        );
    };

    const markAsRead = (id: string) => {
        setLocalNotifications((prev) =>
            (prev || notifications).map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );
    };

    const filteredNotifications = notifications.filter((item) => {
        const matchesCategory =
            activeTab === "All" || item.category === activeTab;
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "unread" && !item.isRead) ||
            (statusFilter === "read" && item.isRead);
        return matchesCategory && matchesStatus;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleSavePreferences = () => {
        alert("Notification delivery preferences saved successfully.");
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Standard Shared Navbar */}
            <Navbar userRole="student" />

            {/* Main Layout Shell */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Standard Shared Sidebar */}
                <Sidebar userRole="student" />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6 max-w-5xl mx-auto w-full">
                        {/* Header Title Section & Action Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                    Notifications
                                </h1>
                                <p className="text-sm text-[#64708C] mt-1">
                                    Keep up with resources, review decisions and important CSE Hub updates.
                                </p>
                            </div>

                            <button
                                onClick={markAllAsRead}
                                className="h-11 px-4 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#F6F8FF] transition-colors shadow-sm self-start sm:self-auto"
                            >
                                <CheckCheck className="w-4 h-4 text-[#245CFF]" />
                                <span>Mark All as Read</span>
                            </button>
                        </div>

                        {/* Sub-header Context Pill */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <span className="px-3 py-1 bg-[#E9EDFF] text-[#245CFF] text-xs font-semibold rounded-full w-fit">
                                {unreadCount} unread
                            </span>
                            <span className="text-xs text-[#64708C]">
                                You’re viewing notifications for {currentUser.full_name || currentUser.username || 'User'} · {currentUser.role}
                            </span>
                        </div>

                        {/* Sub-Navigation Tabs */}
                        <div className="border-b border-[#E1E6F3] flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {(["All", "Resources", "Reviews", "System"] as const).map((tab) => {
                                const count =
                                    tab === "All"
                                        ? notifications.length
                                        : notifications.filter((n) => n.category === tab).length;

                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
                                            ? "border-[#245CFF] text-[#245CFF]"
                                            : "border-transparent text-[#64708C] hover:text-[#0B123D]"
                                            }`}
                                    >
                                        {tab} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Filter controls toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <h2 className="text-lg font-bold text-[#0B123D]">
                                Recent notifications
                            </h2>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[#0B123D] font-semibold whitespace-nowrap">
                                    Filter by status:
                                </span>
                                <div className="relative w-44">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value as "all" | "unread" | "read")
                                        }
                                        className="w-full h-10 pl-3.5 pr-8 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] cursor-pointer"
                                    >
                                        <option value="all">All notifications</option>
                                        <option value="unread">Unread</option>
                                        <option value="read">Read</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Notification Cards List wrapped with DataContainer */}
                        <div className="bg-white rounded-xl border border-[#E1E6F3] overflow-hidden shadow-sm divide-y divide-[#E1E6F3]">
                            <DataContainer
                                isLoading={isLoading}
                                data={filteredNotifications}
                                emptyIcon={Bell}
                                emptyTitle="No Notifications Yet"
                                emptyDescription="You're all caught up! You'll receive updates here about resources, reviews, and department notices."
                                skeletonCount={4}
                                skeletonType="rows"
                            >
                                {(items) => (
                                    <>
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`p-5 transition-colors flex flex-col gap-3 ${!item.isRead ? "bg-[#F0F3FF]" : "bg-white hover:bg-[#F9FAFF]"
                                                    }`}
                                            >
                                                {/* Header line of notification item */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[#E9EDFF] flex items-center justify-center shrink-0 mt-0.5">
                                                            <Bell className="w-5 h-5 text-[#245CFF]" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 bg-[#F6F8FF] text-[#64708C] text-[10px] font-semibold rounded-md border border-[#E1E6F3]">
                                                                    {item.category}
                                                                </span>
                                                                <h4 className="text-sm font-bold text-[#0B123D]">
                                                                    {item.title}
                                                                </h4>
                                                            </div>
                                                            <p className="text-xs text-[#64708C] mt-1.5 leading-relaxed">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {!item.isRead && (
                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#245CFF] shrink-0 mt-1" />
                                                    )}
                                                </div>

                                                {/* Action link & timestamp */}
                                                <div className="flex items-center justify-between text-xs pt-1 pl-13">
                                                    <span className="text-[#64708C] text-[11px] flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {item.timestamp}
                                                    </span>

                                                    <div className="flex items-center gap-3">
                                                        {!item.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(item.id)}
                                                                className="text-xs text-[#64708C] hover:text-[#0B123D] transition-colors"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                        {item.actionText && (
                                                            <a
                                                                href={item.actionHref || "#"}
                                                                className="text-[#245CFF] font-semibold flex items-center gap-1 hover:underline"
                                                            >
                                                                <span>{item.actionText}</span>
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </DataContainer>
                        </div>
                    </div>

                    {/* Standard Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
