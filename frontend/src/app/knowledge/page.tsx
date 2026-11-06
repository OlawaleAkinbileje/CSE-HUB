'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import {
    Search,
    Bell,
    ChevronDown,
    Home,
    HelpCircle,
    Folder,
    BookOpen
} from 'lucide-react';
import { useCurrentUser } from '@/lib/useCurrentUser';

interface KnowledgeItem {
    id: string;
    title: string;
    category: 'Tutorial' | 'Article' | 'Guide' | 'Tips';
    readTime: string;
    tagColor: string;
    tagBg: string;
}

const knowledgeItems: KnowledgeItem[] = [
    {
        id: '1',
        title: 'Getting Started with Python',
        category: 'Tutorial',
        readTime: '5 min read',
        tagColor: '#D977C9',
        tagBg: 'rgba(217, 119, 201, 0.12)',
    },
    {
        id: '2',
        title: 'Understanding Data Structures',
        category: 'Article',
        readTime: '8 min read',
        tagColor: '#ED9B45',
        tagBg: 'rgba(237, 155, 69, 0.12)',
    },
    {
        id: '3',
        title: 'Web Development Roadmap',
        category: 'Guide',
        readTime: '10 min read',
        tagColor: '#6D71FF',
        tagBg: 'rgba(109, 113, 255, 0.12)',
    },
    {
        id: '4',
        title: 'Database Design Best Practices',
        category: 'Article',
        readTime: '7 min read',
        tagColor: '#A660E6',
        tagBg: 'rgba(166, 96, 230, 0.12)',
    },
    {
        id: '5',
        title: 'Tips for Final Year Projects',
        category: 'Tips',
        readTime: '6 min read',
        tagColor: '#12B2A7',
        tagBg: 'rgba(18, 178, 167, 0.12)',
    },
    {
        id: '6',
        title: 'Career Opportunities in CSE',
        category: 'Guide',
        readTime: '6 min read',
        tagColor: '#7983FF',
        tagBg: 'rgba(121, 131, 255, 0.12)',
    },
];

const categories = ['All', 'Tutorials', 'Articles', 'Guides', 'Others'];

export default function KnowledgeHubPage() {
    const currentUser = useCurrentUser();
    const [globalSearch, setGlobalSearch] = useState('');
    const [knowledgeSearch, setKnowledgeSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredItems = knowledgeItems.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(knowledgeSearch.toLowerCase());

        let matchesCategory = true;
        if (selectedCategory === 'Tutorials') matchesCategory = item.category === 'Tutorial';
        if (selectedCategory === 'Articles') matchesCategory = item.category === 'Article';
        if (selectedCategory === 'Guides') matchesCategory = item.category === 'Guide';
        if (selectedCategory === 'Others') matchesCategory = item.category === 'Tips';

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full h-screen bg-[#F6F8FF] flex flex-col lg:flex-row font-sans text-[#0B123D] overflow-hidden">

            {/* DESKTOP SIDEBAR */}
            <Sidebar userRole="student" />

            {/* MAIN CONTAINER */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

                {/* FIXED HEADER / APP BAR */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-30">

                    <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[36px] sm:w-[36px] sm:h-[38px] bg-[#245CFF] rounded-[10px] flex items-center justify-center text-white font-bold text-[16px] sm:text-[17px]">
                            C
                        </div>
                        <span className="text-[20px] sm:text-[24px] lg:text-[25px] font-bold text-[#0B123D]">
                            CSE Hub
                        </span>
                    </div>

                    <div className="hidden sm:block w-full max-w-[620px] mx-4 lg:mx-6">
                        <div className="h-[43px] px-4 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <Search className="w-[18px] h-[18px] text-[#64708C]" />
                            <input
                                type="text"
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                                placeholder="Search for resources, topics, or keywords..."
                                className="w-full bg-transparent text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                        </div>
                    </div>

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

                    <main className="p-4 sm:p-6 lg:p-[32px] space-y-[24px] sm:space-y-[26px] flex-1 max-w-[1280px] w-full mx-auto pb-20 lg:pb-8">

                        {/* TITLE & SEARCH HEADER */}
                        <div className="space-y-4">
                            <h1 className="text-[28px] sm:text-[33px] font-bold text-[#0B123D] leading-tight">
                                Knowledge Hub
                            </h1>

                            {/* SEARCH INPUT */}
                            <div className="h-[43px] px-4 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <Search className="w-[18px] h-[18px] text-[#64708C] flex-shrink-0" />
                                <input
                                    type="text"
                                    value={knowledgeSearch}
                                    onChange={(e) => setKnowledgeSearch(e.target.value)}
                                    placeholder="Search tutorials, articles, or topics..."
                                    className="w-full bg-transparent text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                                />
                            </div>

                            {/* CATEGORY PILL FILTERS */}
                            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
                                {categories.map((cat) => {
                                    const isActive = selectedCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 sm:px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold transition-all whitespace-nowrap ${isActive
                                                ? 'bg-[#245CFF] text-white'
                                                : 'bg-white text-[#0B123D] border border-[#E1E6F3] hover:bg-slate-50'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* KNOWLEDGE ARTICLES GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="h-[190px] p-5 sm:p-6 bg-white rounded-[16px] border border-[#E1E6F3] flex flex-col justify-between hover:border-[#245CFF] hover:shadow-md transition-all duration-200"
                                >
                                    <h3 className="text-[20px] sm:text-[24px] font-bold text-[#0B123D] leading-snug line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="h-[1px] bg-[#E1E6F3]" />
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="px-3 py-1 rounded-[6px] text-[12px] sm:text-[13px] font-semibold"
                                                style={{ backgroundColor: item.tagBg, color: item.tagColor }}
                                            >
                                                {item.category}
                                            </span>
                                            <span className="text-[13px] sm:text-[14px] text-[#64708C]">
                                                {item.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="p-12 text-center bg-white rounded-[16px] border border-[#E1E6F3] space-y-2">
                                <p className="text-[16px] font-semibold text-[#0B123D]">No articles found</p>
                                <p className="text-[14px] text-[#64708C]">Try searching for another topic or selecting a different category filter.</p>
                            </div>
                        )}

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
                    <Link href="/past-questions" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <HelpCircle className="w-5 h-5" />
                        <span className="text-[10px]">Questions</span>
                    </Link>
                    <Link href="/projects" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <Folder className="w-5 h-5" />
                        <span className="text-[10px]">Projects</span>
                    </Link>
                    <Link href="/knowledge" className="flex flex-col items-center gap-1 text-[#245CFF] font-bold bg-[#E9EDFF] px-3 py-1 rounded-[8px]">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-[10px]">Knowledge</span>
                    </Link>
                </div>

            </div>
        </div>
    );
}