'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
    Search,
    FileText,
    FolderGit2,
    BookMarked,
    Code,
    Download,
    Bookmark,
    Bell
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useStudentDashboard } from '@/lib/queries';
import DataContainer from '@/components/ui/DataContainer';

export default function StudentDashboardPage() {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const router = useRouter();
    const currentUser = useCurrentUser();
    const firstName = (currentUser.full_name || currentUser.username || 'Student').split(' ')[0];

    const { data: dashboardData, isLoading } = useStudentDashboard();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/student/search?q=${encodeURIComponent(query)}`);
        }
    };

    const categories = [
        { name: 'All', active: activeCategory === 'All' },
        { name: 'Past Questions', active: activeCategory === 'Past Questions' },
        { name: 'Projects', active: activeCategory === 'Projects' },
        { name: 'Lecture Notes', active: activeCategory === 'Lecture Notes' },
        { name: 'Code Samples', active: activeCategory === 'Code Samples' },
    ];

    const studentMetrics = dashboardData?.metrics || {
        totalResources: 0,
        downloads: 0,
        bookmarks: 0,
        recentSearches: 0,
    };

    const metrics = [
        {
            label: 'Total Resources',
            count: studentMetrics.totalResources.toLocaleString(),
            bgColor: 'rgba(0, 197, 138, 0.09)',
            iconColor: '#00C58A',
            icon: FileText
        },
        {
            label: 'Downloads',
            count: studentMetrics.downloads.toLocaleString(),
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Download
        },
        {
            label: 'Bookmarks',
            count: studentMetrics.bookmarks.toLocaleString(),
            bgColor: 'rgba(255, 146, 53, 0.09)',
            iconColor: '#FF9235',
            icon: Bookmark
        },
        {
            label: 'Recent Searches',
            count: studentMetrics.recentSearches.toLocaleString(),
            bgColor: 'rgba(36, 92, 255, 0.09)',
            iconColor: '#245CFF',
            icon: Search
        },
    ];

    const popularCollectionCards = [
        { title: 'Past Questions', badgeBg: '#FF4869', lightBg: 'rgba(255, 72, 105, 0.09)', icon: FileText, cat: 'past-questions' },
        { title: 'Projects', badgeBg: '#7148FF', lightBg: 'rgba(113, 72, 255, 0.09)', icon: FolderGit2, cat: 'projects' },
        { title: 'Lecture Notes', badgeBg: '#00C58A', lightBg: 'rgba(0, 197, 138, 0.09)', icon: BookMarked, cat: 'lecture-notes' },
        { title: 'Code Samples', badgeBg: '#245CFF', lightBg: 'rgba(36, 92, 255, 0.09)', icon: Code, cat: 'code-samples' },
    ];

    return (
        <div className="w-full min-h-screen bg-[#F6F8FF] flex font-sans text-[#0B123D]">

            {/* 1. REUSABLE DASHBOARD SIDEBAR */}
            <Sidebar userRole="student" />

            {/* MAIN CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* TOP DASHBOARD APP BAR */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
                    <form onSubmit={handleSearch} className="w-full max-w-[620px]">
                        <div className="h-[43px] px-4 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <Search className="w border-none text-[#64708C] w-[18px] h-[18px]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for resources, topics, or keywords..."
                                className="w-full bg-transparent text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                        </div>
                    </form>

                    {/* User Profile Pill */}
                    <div className="flex items-center gap-4">
                        <Link href="/notifications">
                            <button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">
                                <Bell className="w-[20px] h-[20px]" />
                            </button>
                        </Link>
                        <Link href="/profile" className="flex items-center gap-3 border-l border-[#E1E6F3] pl-4">
                            <div className="w-[38px] h-[40px] rounded-[22px] bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-sm">
                                {currentUser.initials}
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-[14px] font-bold leading-[20.3px] text-[#0B123D]">{currentUser.full_name || currentUser.username || 'User'}</span>
                                <span className="text-[12px] text-[#64708C]">Student</span>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* DASHBOARD CONTENT AREA */}
                <main className="p-6 sm:p-[32px] space-y-[26px] flex-1">

                    {/* BANNER WITH SEARCH ENGINE & PILLS */}
                    <div className="relative p-6 sm:p-[36px] bg-gradient-to-br from-[#DDF7FE] via-[#E7DCFF] to-[#D6F6FF] rounded-[16px] flex flex-col gap-[24px] overflow-hidden border border-[#E1E6F3]/50">
                        <div className="space-y-2">
                            <h1 className="text-[26px] sm:text-[31px] font-bold leading-[44.95px] text-[#0B123D]">
                                Welcome Back, {firstName}!
                            </h1>
                            <p className="text-[16px] sm:text-[18px] font-normal text-[#0B123D]">
                                What would you like to explore today?
                            </p>
                        </div>

                        {/* Banner Search Box */}
                        <form onSubmit={handleSearch} className="w-full h-[60px] pl-[17px] pr-[6px] bg-white rounded-full flex items-center justify-between gap-3 border border-[#E1E6F3]/50 shadow-sm focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for resources, topics, or keywords..."
                                className="w-full bg-transparent text-[15px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                            <button type="submit" className="w-[47px] h-[47px] bg-[#245CFF] rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                <Search className="w-[22px] h-[22px]" />
                            </button>
                        </form>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap items-center gap-[12px]">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(cat.name);
                                        if (cat.name !== 'All') {
                                            router.push(`/student/search?category=${encodeURIComponent(cat.name.toLowerCase().replace(' ', '-'))}`);
                                        }
                                    }}
                                    className={`px-[20px] py-[9px] rounded-full text-[14px] font-semibold transition-all ${cat.active
                                        ? 'bg-[#245CFF] text-white border border-[#245CFF]'
                                        : 'bg-white text-[#0B123D] border border-[#E1E6F3] hover:border-[#245CFF]'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4 METRICS CARDS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
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

                    {/* POPULAR CATEGORIES SECTION */}
                    <div className="space-y-[20px]">
                        <h2 className="text-[27px] font-bold leading-[39.15px] text-[#0B123D]">
                            Popular Categories
                        </h2>

                        <DataContainer
                            isLoading={isLoading}
                            data={popularCollectionCards}
                            emptyTitle="No Categories Found"
                            emptyDescription="There are currently no active course categories configured."
                            emptyAction={{ label: "Browse All Resources", href: "/student/search" }}
                        >
                            {(cards) => (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
                                    {cards.map((card, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => router.push(`/student/search?category=${card.cat}`)}
                                            className="h-[138px] p-[22px] bg-white rounded-[16px] shadow-[0px_5px_18px_rgba(39,63_121,0.06)] border border-[#E1E6F3]/50 flex items-center gap-[18px] cursor-pointer hover:border-[#245CFF] transition-all group"
                                        >
                                            {/* Category Square Badge */}
                                            <div
                                                style={{ backgroundColor: card.lightBg }}
                                                className="w-[56px] h-[61px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                                            >
                                                <div
                                                    style={{ backgroundColor: card.badgeBg }}
                                                    className="w-[36px] h-[43px] rounded-[7px] flex items-center justify-center text-white"
                                                >
                                                    <card.icon className="w-[22px] h-[22px]" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-[17px] font-bold text-[#0B123D] group-hover:text-[#245CFF] transition-colors">
                                                    {card.title}
                                                </h3>
                                                <span className="text-[14px] text-[#64708C]">View Collection</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DataContainer>
                    </div>

                </main>
                <Footer />

            </div>
        </div>
    );
}
