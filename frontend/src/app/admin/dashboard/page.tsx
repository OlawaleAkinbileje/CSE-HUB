'use client';

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import {
    FileText,
    Users,
    Clock,
    Download,
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useAdminDashboard } from '@/lib/queries';

export default function AdminDashboardPage() {
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
        <div className="w-full min-h-screen bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
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
        </div>
    );
}
