'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import {
    Search,
    FileText,
    Clock,
    Download,
    Users,
    Bell
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useStaffDashboard } from '@/lib/queries';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function StaffDashboardPage() {
    const currentUser = useCurrentUser();
    const [query, setQuery] = useState('');
    const { data: staffData, isLoading } = useStaffDashboard();

    const staffMetrics = staffData?.metrics || {
        totalResources: 0,
        pendingReview: 0,
        totalDownloads: 0,
        activeUsers: 0,
    };

    const metrics = [
        {
            label: 'Total Resources',
            count: staffMetrics.totalResources.toLocaleString(),
            bgColor: 'rgba(0, 197, 138, 0.09)',
            iconColor: '#00C58A',
            icon: FileText
        },
        {
            label: 'Pending Review',
            count: staffMetrics.pendingReview.toLocaleString(),
            bgColor: 'rgba(255, 146, 53, 0.09)',
            iconColor: '#FF9235',
            icon: Clock
        },
        {
            label: 'Total Downloads',
            count: staffMetrics.totalDownloads.toLocaleString(),
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Download
        },
        {
            label: 'Active Users',
            count: staffMetrics.activeUsers.toLocaleString(),
            bgColor: 'rgba(113, 72, 255, 0.09)',
            iconColor: '#7148FF',
            icon: Users
        },
    ];

    return (
        <div className="w-full min-h-screen bg-[#F6F8FF] flex font-sans text-[#0B123D]">

            {/* SIDEBAR */}
            <Sidebar userRole="staff" />

            {/* MAIN CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER APP BAR */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="w-full max-w-[620px]">
                        <div className="h-[44px] px-3 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-[10px] focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <Search className="w-[18px] h-[18px] text-[#64708C]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for resources, topics, or keywords..."
                                className="w-full bg-transparent text-[12px] sm:text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">
                            <Bell className="w-[20px] h-[20px]" />
                        </button>
                        <div className="flex items-center gap-3 border-l border-[#E1E6F3] pl-4">
                            <div className="w-[32px] h-[34px] rounded-[22px] bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-xs">
                                DS
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-[12px] font-bold text-[#0B123D]">{currentUser.full_name || currentUser.username || 'User'}</span>
                                <span className="text-[11px] text-[#64708C]">Staff</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* DASHBOARD CONTENT */}
                <main className="p-6 sm:p-[32px] space-y-[26px] flex-1">

                    {/* WELCOME BANNER */}
                    <div className="relative p-8 sm:p-[36px] bg-gradient-to-br from-[#DDF7FE] via-[#E7DCFF] to-[#D6F6FF] rounded-[16px] flex flex-col gap-2 overflow-hidden border border-[#E1E6F3]/50">
                        <h1 className="text-[26px] sm:text-[31px] font-bold leading-[44.95px] text-[#0B123D]">
                            Welcome, {(currentUser.full_name || currentUser.username || 'User').split(' ')[0]}!
                        </h1>
                        <p className="text-[16px] sm:text-[18px] font-normal text-[#0B123D]">
                            Manage and contribute to the CSE Resource Hub
                        </p>
                    </div>

                    {/* METRIC CARDS */}
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
                                    <span className="text-[30px] font-bold leading-[43.5px] text-[#0B123D]">
                                        {isLoading ? '...' : item.count}
                                    </span>
                                    <span className="text-[14px] text-[#64708C] font-normal">{item.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                </main>

                {/* FOOTER LINKS */}
                <Footer />

            </div>
        </div>
    );
}
