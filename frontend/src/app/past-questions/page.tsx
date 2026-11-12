'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import {
    ArrowRight,
    FileQuestion,
    Search
} from 'lucide-react';
import { usePastQuestions } from '@/lib/queries';
import DataContainer from '@/components/ui/DataContainer';

export default function PastQuestionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: pastQuestionYears, isLoading, error } = usePastQuestions();

    const filteredYears = (pastQuestionYears || []).filter((item) =>
        searchQuery ? String(item.year).includes(searchQuery) : true
    );

    return (
        <div className="w-full min-h-screen bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex-1 min-h-0 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

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
                        <label className="flex h-11 max-w-md items-center gap-3 rounded-lg border border-[#E1E6F3] bg-white px-4 focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <Search className="h-4 w-4 shrink-0 text-[#64708C]" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                aria-label="Filter past questions by year"
                                placeholder="Search by year..."
                                className="w-full bg-transparent text-sm text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                        </label>

                        {/* YEAR CARDS GRID WITH DATA CONTAINER */}
                        <DataContainer
                            isLoading={isLoading}
                            data={filteredYears}
                            errorMessage={error instanceof Error ? error.message : undefined}
                            emptyIcon={FileQuestion}
                            emptyTitle="No Past Questions Found"
                            emptyDescription={
                                searchQuery
                                    ? `No past question archives matched the search query "${searchQuery}".`
                                    : "There are currently no past questions uploaded for this department yet."
                            }
                            emptyAction={{
                                label: "Explore Resources",
                                href: "/search",
                            }}
                            skeletonCount={4}
                        >
                            {(years) => (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {years.map((item) => (
                                        <Link
                                            key={item.year}
                                            href={`/search?category=past-questions&year=${item.year}`}
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

            </div>
            </div>
        </div>
    );
}
