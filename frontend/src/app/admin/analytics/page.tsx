"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Download,
    TrendingUp,
    FileText,
    Users,
} from "lucide-react";
import { useAdminAnalytics } from "@/lib/queries";
import DataContainer from "@/components/ui/DataContainer";

export default function AnalyticsPage() {
    const { data: analyticsData, isLoading, error } = useAdminAnalytics();

    const popularResources = analyticsData?.popularResources || [];

    const handleExport = () => {
        if (!analyticsData) return;
        const rows = [
            ["Metric", "Value"],
            ["Total downloads", analyticsData.metrics.totalDownloads],
            ["Active users", analyticsData.metrics.activeUsers],
            ["Uploaded resources", analyticsData.metrics.uploadedResources],
            ["Average daily downloads (30 days)", analyticsData.metrics.avgDailyDownloads],
            [],
            ["Resource", "Course", "Downloads"],
            ...popularResources.map((resource) => [resource.title, resource.course, resource.downloads]),
        ];
        const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "cse-hub-analytics.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Layout Shell */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Standard Shared Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Header Title & Export Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">Analytics</h1>
                                <p className="text-sm text-[#64708C] mt-1">
                                    Understand resource growth, learning activity and your most useful content.
                                </p>
                            </div>

                            <button
                                onClick={handleExport}
                                disabled={!analyticsData}
                                className="h-11 px-5 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-95 shadow-sm self-start sm:self-auto"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                        </div>

                        {error && <p role="alert" className="text-sm text-[#DF365B]">{error.message}</p>}

                        {/* Top Key Performance Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E9EDFF] rounded-xl flex items-center justify-center text-[#245CFF]">
                                    <Download className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : analyticsData?.metrics.totalDownloads.toLocaleString() ?? "Unavailable"}</div>
                                    <div className="text-xs text-[#64708C]">Total downloads</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E6FAF4] rounded-xl flex items-center justify-center text-[#009F75]">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : analyticsData?.metrics.activeUsers.toLocaleString() ?? "Unavailable"}</div>
                                    <div className="text-xs text-[#64708C]">Active accounts</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#F6F0FF] rounded-xl flex items-center justify-center text-[#7148FF]">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : analyticsData?.metrics.uploadedResources.toLocaleString() ?? "Unavailable"}</div>
                                    <div className="text-xs text-[#64708C]">Uploaded resources</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FFF5EB] rounded-xl flex items-center justify-center text-[#FF9235]">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : analyticsData?.metrics.avgDailyDownloads.toLocaleString() ?? "Unavailable"}</div>
                                    <div className="text-xs text-[#64708C]">Average daily downloads (30 days)</div>
                                </div>
                            </div>
                        </div>

                        {/* Popular Resources Table Section */}
                        <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-lg font-bold text-[#0B123D]">Popular Resources</h3>
                                <span className="text-xs text-[#64708C]">
                                    Ranked by downloads
                                </span>
                            </div>

                            <DataContainer
                                isLoading={isLoading}
                                data={popularResources}
                                emptyIcon={TrendingUp}
                                emptyTitle="No Resource Analytics Yet"
                                emptyDescription="Download metrics and ranking data will appear once users begin accessing resources."
                                skeletonCount={4}
                                skeletonType="rows"
                            >
                                {(items) => (
                                    <div className="overflow-x-auto rounded-lg border border-[#E1E6F3]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#F6F8FF] border-b border-[#E1E6F3] text-xs font-semibold text-[#64708C]">
                                                    <th className="p-3.5">Resource</th>
                                                    <th className="p-3.5">Course</th>
                                                    <th className="p-3.5">Downloads</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E1E6F3] text-xs">
                                                {items.map((res) => (
                                                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-3.5 font-semibold text-[#0B123D]">
                                                            {res.title}
                                                        </td>
                                                        <td className="p-3.5 text-[#0B123D]">{res.course}</td>
                                                        <td className="p-3.5 text-[#0B123D]">{res.downloads}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </DataContainer>
                        </div>
                    </div>

                    {/* Standard Shared Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
