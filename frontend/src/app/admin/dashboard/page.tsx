'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import {
    Search,
    FileText,
    Users,
    Clock,
    Download,
    Bell,
    ChevronDown,
    Menu
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useAdminDashboard } from '@/lib/queries';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function AdminDashboardPage() {
    const currentUser = useCurrentUser();
    const [query, setQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: adminData, isLoading } = useAdminDashboard();

    const adminMetrics = adminData?.metrics || {
        totalResources: 0,
        totalUsers: 0,
        pendingReview: 0,
        totalDownloads: 0,
    };

    const metrics = [
        {
            label: 'Total Resources',
            count: adminMetrics.totalResources.toLocaleString(),
            bgColor: 'rgba(0, 197, 138, 0.09)',
            iconColor: '#00C58A',
            icon: FileText
        },
        {
            label: 'Total Users',
            count: adminMetrics.totalUsers.toLocaleString(),
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Users
        },
        {
            label: 'Pending Review',
            count: adminMetrics.pendingReview.toLocaleString(),
            bgColor: 'rgba(255, 72, 105, 0.09)',
            iconColor: '#FF4869',
            icon: Clock
        },
        {
            label: 'Total Downloads',
            count: adminMetrics.totalDownloads.toLocaleString(),
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Download
        },
    ];

    const userDistribution = adminData?.userDistribution || [
        { label: 'Students', percentage: '70%', color: '#7148FF' },
        { label: 'Staff', percentage: '20%', color: '#F6B93D' },
        { label: 'Admins', percentage: '10%', color: '#FF4869' },
    ];

    return (
        <div className="w-full min-h-screen bg-[#F6F8FF] flex font-sans text-[#0B123D]">

            {/* DESKTOP SIDEBAR */}
            <Sidebar userRole="admin" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER APP BAR */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">

                    {/* Mobile Logo & Menu Toggle */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="w-9 h-[38px] bg-[#245CFF] rounded-[10px] flex items-center justify-center text-white font-bold text-[17px]">
                            C
                        </div>
                        <span className="text-[21px] sm:text-[25px] font-bold text-[#0B123D]">AdminHub</span>
                    </div>

                    {/* Search Field */}
                    <div className="hidden lg:block w-full max-w-[620px]">
                        <div className="h-[43px] px-4 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <Search className="w-[18px] h-[18px] text-[#64708C]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for resources, topics, or keywords..."
                                className="w-full bg-transparent text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* User Profile & Actions */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">
                            <Bell className="w-[20px] h-[20px]" />
                        </button>

                        <div className="flex items-center gap-3 border-l border-[#E1E6F3] pl-3 sm:pl-4">
                            <div className="w-[34px] h-[36px] sm:w-[38px] sm:h-[40px] rounded-full bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-sm">
                                AU
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-[14px] font-bold text-[#0B123D]">{currentUser.full_name || currentUser.username || 'User'}</span>
                                <span className="text-[12px] text-[#64708C]">Administrator</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[#64708C] hidden sm:block" />
                        </div>
                    </div>
                </header>

                {/* MOBILE SEARCH BAR & NAVIGATION BAR */}
                <div className="lg:hidden bg-white border-b border-[#E1E6F3] p-4 space-y-3">
                    <div className="h-[44px] px-3 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-2.5">
                        <Search className="w-[18px] h-[18px] text-[#64708C]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search resources, topics or keywords..."
                            className="w-full bg-transparent text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <span className="text-[12px] font-semibold text-[#64708C]">ADMIN WORKSPACE</span>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex items-center gap-1.5 text-[12px] text-[#64708C] hover:text-[#0B123D]"
                        >
                            <Menu className="w-4 h-4" />
                            <span>Menu</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Mobile Workspace Tabs */}
                    {mobileMenuOpen && (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <a href="/admin/dashboard" className="h-[44px] px-3 bg-[#E9EDFF] text-[#245CFF] text-[13px] font-semibold rounded-[6px] flex items-center justify-between">
                                <span>Dashboard</span>
                                <div className="w-[3px] h-5 bg-[#245CFF] rounded-full" />
                            </a>
                            <a href="/admin/users" className="h-[44px] px-3 bg-white text-[#0B123D] text-[13px] rounded-[6px] flex items-center">
                                Users
                            </a>
                            <a href="/admin/categories" className="h-[44px] px-3 bg-white text-[#0B123D] text-[13px] rounded-[6px] flex items-center">
                                Categories & Courses
                            </a>
                            <a href="/staff/manage-resources" className="h-[44px] px-3 bg-white text-[#0B123D] text-[13px] rounded-[6px] flex items-center">
                                Manage Resources
                            </a>
                            <a href="/admin/analytics" className="h-[44px] px-3 bg-white text-[#0B123D] text-[13px] rounded-[6px] flex items-center">
                                Analytics
                            </a>
                            <a href="/admin/settings" className="h-[44px] px-3 bg-white text-[#0B123D] text-[13px] rounded-[6px] flex items-center">
                                System Settings
                            </a>
                        </div>
                    )}
                </div>

                {/* DASHBOARD CONTENT AREA */}
                <main className="p-4 sm:p-6 lg:p-[32px] space-y-[26px] flex-1">

                    {/* TITLE SECTION */}
                    <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0B123D] leading-tight">
                        System Overview
                    </h1>

                    {/* METRIC CARDS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
                        {metrics.map((item, idx) => (
                            <div
                                key={idx}
                                className="h-[123px] p-[22px] bg-white rounded-[16px] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] border border-[#E1E6F3]/50 flex items-center gap-[18px]"
                            >
                                <div
                                    style={{ backgroundColor: item.bgColor }}
                                    className="w-[56px] h-[58px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                                >
                                    <item.icon style={{ color: item.iconColor }} className="w-[29px] h-[29px]" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[28px] sm:text-[30px] font-bold leading-tight text-[#0B123D]">
                                        {isLoading ? '...' : item.count}
                                    </span>
                                    <span className="text-[13px] sm:text-[14px] text-[#64708C] font-normal">{item.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CHARTS GRID: RESOURCE GROWTH + USER DISTRIBUTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[28px] items-stretch">

                        {/* RESOURCE GROWTH CHART CARD (8 COLS ON DESKTOP) */}
                        <div className="lg:col-span-7 xl:col-span-8 p-[20px] sm:p-[22px] bg-white rounded-[16px] border border-[#E1E6F3] flex flex-col gap-[15px]">
                            <div>
                                <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0B123D]">Resource Growth</h2>
                                <p className="text-[13px] text-[#64708C] mt-1">Total resources · Academic Year 2026</p>
                            </div>

                            {/* Simplified Custom Line Graph Visual */}
                            <div className="w-full h-[210px] relative mt-2 flex flex-col justify-between">

                                {/* Horizontal Y-Axis Grid Lines */}
                                {[1500, 1000, 500, 0].map((val) => (
                                    <div key={val} className="flex items-center gap-3 w-full">
                                        <span className="w-9 text-[11px] text-[#64708C] text-right font-normal">{val}</span>
                                        <div className="flex-1 h-[1px] bg-[#E9EDF7]" />
                                    </div>
                                ))}

                                {/* Line Path Container */}
                                <div className="absolute left-[48px] right-0 top-[10px] bottom-[30px]">
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                                        <path
                                            d="M 0 110 Q 125 70, 250 40 T 500 10"
                                            fill="none"
                                            stroke="#245CFF"
                                            strokeWidth="3.5"
                                        />
                                    </svg>
                                </div>

                                {/* X-Axis Labels */}
                                <div className="flex justify-between pl-[48px] pt-2 text-[11px] text-[#64708C]">
                                    <span>Jan</span>
                                    <span>Mar</span>
                                    <span>May</span>
                                    <span>Jul</span>
                                    <span>Sep</span>
                                    <span>Nov</span>
                                </div>
                            </div>
                        </div>

                        {/* USER DISTRIBUTION CARD (4 COLS ON DESKTOP) */}
                        <div className="lg:col-span-5 xl:col-span-4 p-[20px] sm:p-[22px] bg-white rounded-[16px] border border-[#E1E6F3] flex flex-col justify-between gap-[20px]">
                            <div>
                                <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0B123D]">User Distribution</h2>
                                <p className="text-[13px] text-[#64708C] mt-1">By account role</p>
                            </div>

                            {/* Donut Chart Visual */}
                            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E1E6F3" strokeWidth="3.8" />
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#7148FF" strokeWidth="3.8" strokeDasharray="70 30" strokeDashoffset="0" />
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F6B93D" strokeWidth="3.8" strokeDasharray="20 80" strokeDashoffset="-70" />
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#FF4869" strokeWidth="3.8" strokeDasharray="10 90" strokeDashoffset="-90" />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-[20px] font-bold text-[#0B123D]">
                                        {adminMetrics.totalUsers.toLocaleString()}
                                    </span>
                                    <span className="text-[11px] text-[#64708C]">Total Users</span>
                                </div>
                            </div>

                            {/* Legend List */}
                            <div className="space-y-2 pt-2 border-t border-[#F0F3FA]">
                                {userDistribution.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                style={{ backgroundColor: item.color }}
                                                className="w-2.5 h-2.5 rounded-full"
                                            />
                                            <span className="text-[#0B123D] font-medium">{item.label}</span>
                                        </div>
                                        <span className="text-[#64708C] font-semibold">{item.percentage}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </main>

                {/* FOOTER */}
                <Footer />

            </div>
        </div>
    );
}
