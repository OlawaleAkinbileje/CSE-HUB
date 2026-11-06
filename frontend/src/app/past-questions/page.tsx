'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import {
    Search,
    Bell,
    ChevronDown,
    ArrowRight,
    Home,
    HelpCircle,
    Folder,
    BookOpen,
    FileQuestion
} from 'lucide-react';
import { usePastQuestions } from '@/lib/queries';
import DataContainer from '@/components/ui/DataContainer';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function PastQuestionsPage() {
    const currentUser = useCurrentUser();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: pastQuestionYears, isLoading } = usePastQuestions();

    const filteredYears = (pastQuestionYears || []).filter((item) =>
        searchQuery ? String(item.year).includes(searchQuery) : true
    );

    return (
        <div className="w-full h-screen bg-[#F6F8FF] flex flex-col lg:flex-row font-sans text-[#0B123D] overflow-hidden">

            {/* DESKTOP SIDEBAR */}
            <Sidebar userRole="student" />

            {/* MAIN CONTAINER */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

                {/* FIXED HEADER / APP BAR */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-30">

                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[36px] sm:w-[36px] sm:h-[38px] bg-[#245CFF] rounded-[10px] flex items-center justify-center text-white font-bold text-[16px] sm:text-[17px]">
                            C
                        </div>
                        <span className="text-[20px] sm:text-[24px] lg:text-[25px] font-bold text-[#0B123D]">
                            CSE Hub
                        </span>
                    </div>

                    {/* Search Field (Desktop & Tablet) */}
                    <div className="hidden sm:block w-full max-w-[620px] mx-4 lg:mx-6">
                        <div className="h-[43px] px-4 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <Search className="w-[18px] h-[18px] text-[#64708C]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                        <div className="flex items-center gap-2 sm:gap-3 border-l border-[#E1E6F3] pl-3 sm:pl-4">
                            <div className="w-[34px] h-[36px] sm:w-[38px] sm:h-[40px] rounded-full bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-xs sm:text-sm">
                                JD
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] sm:text-[14px] font-bold text-[#0B123D] leading-tight">{currentUser.full_name || currentUser.username || 'User'}</span>
                                <span className="text-[11px] sm:text-[12px] text-[#64708C] leading-tight">Student</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[#64708C] hidden sm:block" />
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

                    <main className="p-4 sm:p-6 lg:p-[32px] space-y-[24px] sm:space-y-[28px] flex-1 max-w-[1280px] w-full mx-auto pb-20 lg:pb-8">

                        {/* PAGE TITLE & SUBTITLE */}
                        <div className="space-y-1.5">
                            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0B123D] leading-tight">
                                Past Questions
                            </h1>
                            <p className="text-[14px] sm:text-[16px] text-[#64708C]">
                                Browse and search past questions by year and course
                            </p>
                        </div>

                        {/* YEAR CARDS GRID WITH DATA CONTAINER */}
                        <DataContainer
                            isLoading={isLoading}
                            data={filteredYears}
                            emptyIcon={FileQuestion}
                            emptyTitle="No Past Questions Found"
                            emptyDescription={
                                searchQuery
                                    ? `No past question archives matched the search query "${searchQuery}".`
                                    : "There are currently no past questions uploaded for this department yet."
                            }
                            emptyAction={{
                                label: "Explore Resources",
                                href: "/student/search",
                            }}
                            skeletonCount={4}
                        >
                            {(years) => (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {years.map((item) => (
                                        <Link
                                            key={item.year}
                                            href={`/student/search?category=past-questions&year=${item.year}`}
                                            className="group min-h-[164px] sm:min-h-[195px] p-5 sm:p-7 bg-white rounded-[16px] border border-transparent shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex flex-col justify-between hover:border-[#245CFF] hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="space-y-1 sm:space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[28px] sm:text-[33px] font-bold text-[#0B123D] group-hover:text-[#245CFF] transition-colors">
                                                        {item.year} {item.isPopular && <span className="text-[#245CFF]">‹</span>}
                                                    </span>
                                                </div>
                                                <p className="text-[14px] sm:text-[16px] text-[#64708C]">
                                                    {item.count} {item.count === 1 ? 'Question' : 'Questions'}
                                                </p>
                                            </div>

                                            <div className="flex justify-end pt-3 sm:pt-4">
                                                <div className="w-[20px] h-[20px] flex items-center justify-center text-[#245CFF] group-hover:translate-x-1 transition-transform">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </DataContainer>

                    </main>

                    {/* FOOTER */}
                    <Footer />
                </div>

                {/* MOBILE BOTTOM NAVIGATION BAR */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#E1E6F3] px-2 flex items-center justify-around z-40">
                    <Link href="/student/dashboard" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <Home className="w-5 h-5" />
                        <span className="text-[10px]">Home</span>
                    </Link>
                    <Link href="/student/search" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <Search className="w-5 h-5" />
                        <span className="text-[10px]">Search</span>
                    </Link>
                    <Link href="/past-questions" className="flex flex-col items-center gap-1 text-[#245CFF] font-bold bg-[#E9EDFF] px-3 py-1 rounded-[8px]">
                        <HelpCircle className="w-5 h-5" />
                        <span className="text-[10px]">Questions</span>
                    </Link>
                    <Link href="/projects" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <Folder className="w-5 h-5" />
                        <span className="text-[10px]">Projects</span>
                    </Link>
                    <Link href="/knowledge" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-[10px]">Knowledge</span>
                    </Link>
                </div>

            </div>
        </div>
    );
}
