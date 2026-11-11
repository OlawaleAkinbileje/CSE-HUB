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
    const { data: adminData, isLoading, error } = useAdminDashboard();
    const adminMetrics = adminData?.metrics;
    const resourceGrowth = adminData?.resourceGrowth || [];
    const maxMonthlyResources = Math.max(...resourceGrowth.map((item) => item.count), 1);

    const metrics = [
        {
            label: 'Total Resources',
            count: adminMetrics?.totalResources.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(0, 197, 138, 0.09)',
            iconColor: '#00C58A',
            icon: FileText
        },
        {
            label: 'Total Users',
            count: adminMetrics?.totalUsers.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Users
        },
        {
            label: 'Pending Review',
            count: adminMetrics?.pendingReview.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(255, 72, 105, 0.09)',
            iconColor: '#FF4869',
            icon: Clock
        },
        {
            label: 'Total Downloads',
            count: adminMetrics?.totalDownloads.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Download
        },
    ];

    const userDistribution = adminData?.userDistribution || [];
    const distributionTotal = userDistribution.reduce((total, item) => total + Number.parseFloat(item.percentage), 0);

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
                    {error && <p role="alert" className="text-sm text-[#DF365B]">{error.message}</p>}

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
                                <p className="text-[13px] text-[#64708C] mt-1">Resources added per month · Last six months</p>
                            </div>

                            {/* Simplified Custom Line Graph Visual */}
                            <div className="w-full min-h-[210px] mt-2 flex items-end justify-around gap-3 border-b border-[#E9EDF7] px-2">
                                {isLoading ? <span className="mb-4 text-xs text-[#64708C]">Loading resource growth...</span> : resourceGrowth.length ? resourceGrowth.map((item) => (
                                    <div key={item.month} className="flex h-[190px] min-w-0 flex-1 flex-col items-center justify-end gap-2">
                                        <span className="text-[11px] text-[#64708C]">{item.count}</span>
                                        <div
                                            title={`${item.count} resources`}
                                            className="w-full max-w-12 rounded-t-md bg-[#245CFF]"
                                            style={{ height: `${Math.max((item.count / maxMonthlyResources) * 70, item.count ? 4 : 0)}%` }}
                                        />
                                        <span className="truncate text-[10px] text-[#64708C]">{item.month}</span>
                                    </div>
                                )) : <span className="mb-4 text-xs text-[#64708C]">No resource additions recorded in the last six months.</span>}
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
                                    {userDistribution.map((item, index) => {
                                        const percentage = distributionTotal ? Number.parseFloat(item.percentage) * 100 / distributionTotal : 0;
                                        const offset = userDistribution.slice(0, index).reduce(
                                            (total, previous) => total + (distributionTotal ? Number.parseFloat(previous.percentage) * 100 / distributionTotal : 0),
                                            0,
                                        );
                                        return <circle key={item.label} cx="18" cy="18" r="15.915" fill="transparent" stroke={item.color} strokeWidth="3.8" strokeDasharray={`${percentage} ${100 - percentage}`} strokeDashoffset={-offset} />;
                                    })}
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-[20px] font-bold text-[#0B123D]">
                                        {isLoading ? "..." : adminMetrics?.totalUsers.toLocaleString() ?? "Unavailable"}
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
