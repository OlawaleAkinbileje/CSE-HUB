'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import {
    Search,
} from 'lucide-react';

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
        <div className="w-full min-h-screen bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex-1 min-h-0 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

                {/* SCROLLABLE MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

                    <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-6.5 flex-1 max-w-7xl w-full mx-auto pb-20 lg:pb-8">

                        {/* TITLE & SEARCH HEADER */}
                        <div className="space-y-4">
                            <h1 className="text-[28px] sm:text-[33px] font-bold text-[#0B123D] leading-tight">
                                Knowledge Hub
                            </h1>

                            {/* SEARCH INPUT */}
                            <div className="h-10.75 px-4 bg-white rounded-lg border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <Search className="w-4.5 h-4.5 text-[#64708C] shrink-0" />
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
                                    className="h-47.5 p-5 sm:p-6 bg-white rounded-2xl border border-[#E1E6F3] flex flex-col justify-between hover:border-[#245CFF] hover:shadow-md transition-all duration-200"
                                >
                                    <h3 className="text-[20px] sm:text-[24px] font-bold text-[#0B123D] leading-snug line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="h-px bg-[#E1E6F3]" />
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="px-3 py-1 rounded-md text-[12px] sm:text-[13px] font-semibold"
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
                            <div className="p-12 text-center bg-white rounded-2xl border border-[#E1E6F3] space-y-2">
                                <p className="text-[16px] font-semibold text-[#0B123D]">No articles found</p>
                                <p className="text-[14px] text-[#64708C]">Try searching for another topic or selecting a different category filter.</p>
                            </div>
                        )}

                    </main>

                    {/* FOOTER */}
                    <Footer />
                </div>

            </div>
            </div>
        </div>
    );
}