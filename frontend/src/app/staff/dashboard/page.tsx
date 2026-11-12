'use client';

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import {
    FileText,
    Clock,
    Download,
    Users,
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useStaffDashboard } from '@/lib/queries';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function StaffDashboardPage() {
    const currentUser = useCurrentUser();
    const { data: staffData, isLoading, error } = useStaffDashboard();

    const staffMetrics = staffData?.metrics;

    const metrics = [
        {
            label: 'Total Resources',
            count: staffMetrics?.totalResources.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(0, 197, 138, 0.09)',
            iconColor: '#00C58A',
            icon: FileText
        },
        {
            label: 'Pending Review',
            count: staffMetrics?.pendingReview.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(255, 146, 53, 0.09)',
            iconColor: '#FF9235',
            icon: Clock
        },
        {
            label: 'Total Downloads',
            count: staffMetrics?.totalDownloads.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Download
        },
        {
            label: 'Active Users',
            count: staffMetrics?.activeUsers.toLocaleString() ?? 'Unavailable',
            bgColor: 'rgba(113, 72, 255, 0.09)',
            iconColor: '#7148FF',
            icon: Users
        },
    ];

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1 p-4 md:p-8 space-y-6">
                    {error && (
                        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            Dashboard data could not be loaded. Please try again later.
                        </p>
                    )}

                    {/* WELCOME BANNER */}
                    <div className="relative p-6 sm:p-9 bg-gradient-to-br from-[#DDF7FE] via-[#E7DCFF] to-[#D6F6FF] rounded-2xl flex flex-col gap-2 overflow-hidden border border-[#E1E6F3]/50">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B123D]">
                            Welcome, {(currentUser.full_name || currentUser.username || 'User').split(' ')[0]}!
                        </h1>
                        <p className="text-base sm:text-lg font-normal text-[#0B123D]">
                            Manage and contribute to the CSE Resource Hub
                        </p>
                    </div>

                    {/* METRIC CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((item, idx) => (
                            <div
                                key={idx}
                                className="min-h-[123px] p-5 bg-white rounded-2xl shadow-[0px_5px_18px_rgba(39,63,121,0.06)] border border-[#E1E6F3]/50 flex items-center gap-4"
                            >
                                <div
                                    style={{ backgroundColor: item.bgColor }}
                                    className="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0"
                                >
                                    <item.icon style={{ color: item.iconColor }} className="w-7 h-7" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-3xl font-bold text-[#0B123D]">
                                        {isLoading ? '...' : item.count}
                                    </span>
                                    <span className="text-sm text-[#64708C] font-normal">{item.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
