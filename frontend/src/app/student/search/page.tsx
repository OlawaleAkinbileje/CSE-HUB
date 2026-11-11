'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import {
    Search,
    FileText,
    FolderGit2,
    Code,
    Bell
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import DataContainer from '@/components/ui/DataContainer';
import { useCurrentUser } from '@/lib/useCurrentUser';

interface SearchResource {
    id: string;
    title: string;
    resource_type: string;
    file_size: number;
    created_at: string | null;
    downloads: number;
    description: string | null;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const currentUser = useCurrentUser();
    const [query, setQuery] = useState(initialQuery);

    const [selectedType, setSelectedType] = useState('All');
    const [selectedDept, setSelectedDept] = useState('All Categories');
    const [selectedYear, setSelectedYear] = useState('All Years');
    const router = useRouter();

    const { data: resourceOptions } = useQuery({
        queryKey: ['resources', 'options'],
        queryFn: async () => {
            const res = await apiClient.get('/resources/options');
            return res.data as { categories: { id: string; name: string; slug: string }[] };
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/student/search?q=${encodeURIComponent(query)}`);
        }
    };

    const { data: searchResults, isLoading, error } = useQuery({
        queryKey: ['resources', 'search', query, selectedType, selectedDept, selectedYear],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (query.trim()) params.search = query.trim();
            const resourceTypes: Record<string, string> = {
                'Past Questions': 'past_question',
                Projects: 'project',
                'Lecture Notes': 'lecture_note',
                'Code Samples': 'code_preview',
            };
            if (selectedType !== 'All') {
                params.resource_type = resourceTypes[selectedType];
            }
            if (selectedDept !== 'All Categories') params.category_slug = selectedDept;
            if (selectedYear !== 'All Years') params.year = selectedYear;
            const res = await apiClient.get('/resources', { params });
            return res.data as { data: SearchResource[]; count: number };
        },
    });

    const results = (searchResults?.data || []).map((r) => ({
        id: String(r.id),
        title: r.title,
        type: r.resource_type === 'past_question' ? 'Past Questions' : (r.resource_type === 'project' ? 'Project' : (r.resource_type === 'code_preview' ? 'Code Sample' : 'Lecture Notes')),
        badgeBg: '#245CFF',
        lightBg: 'rgba(36, 92, 255, 0.09)',
        icon: r.resource_type === 'project' ? FolderGit2 : (r.resource_type === 'code_preview' ? Code : FileText),
        size: `${(Number(r.file_size || 0) / (1024 * 1024)).toFixed(1)} MB`,
        year: r.created_at ? new Date(r.created_at).getFullYear().toString() : '',
        downloads: String(r.downloads || 0),
        desc: r.description || 'Department academic resource file.',
    }));

    return (
        <div className="w-full min-h-screen bg-[#F6F8FF] flex font-sans text-[#0B123D]">

            {/* 1. REUSABLE SIDEBAR */}
            <Sidebar userRole="student" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER BAR */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
                    <form onSubmit={handleSearch} className="w-full max-w-[620px]">
                        <div className="h-[43px] px-4 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                            <Search className="text-[#64708C] w-[18px] h-[18px]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for resources, topics, or keywords..."
                                className="w-full bg-transparent text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                        </div>
                    </form>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">
                            <Bell className="w-[20px] h-[20px]" />
                        </button>
                        <div className="flex items-center gap-3 border-l border-[#E1E6F3] pl-4">
                            <div className="w-[38px] h-[40px] rounded-[22px] bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-sm">
                                JD
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-[14px] font-bold text-[#0B123D]">{currentUser.full_name || currentUser.username || 'User'}</span>
                                <span className="text-[12px] text-[#64708C]">Student</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* BODY CONTAINER (FILTERS COLUMN + RESULTS FEED) */}
                <main className="p-6 sm:p-[32px] flex-1 flex flex-col xl:flex-row gap-[26px]">

                    {/* 2. FILTERS COLUMN */}
                    <div className="w-full xl:w-[233px] p-[18px] bg-white rounded-[16px] border border-[#E1E6F3] flex-shrink-0 space-y-[27px]">
                        <div className="text-[20px] font-bold text-[#0B123D] border-b border-[#E1E6F3] pb-3 flex items-center justify-between">
                            <span>Filters</span>
                            <span className="text-sm font-normal text-[#64708C]">↔</span>
                        </div>

                        {/* Filter Group: Resource Type */}
                        <div className="space-y-3">
                            <h3 className="text-[16px] font-bold text-[#0B123D]">Resource Type</h3>
                            {['All', 'Past Questions', 'Projects', 'Lecture Notes', 'Code Samples'].map((type) => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer text-[14px] text-[#64708C]">
                                    <input
                                        type="radio"
                                        name="resourceType"
                                        checked={selectedType === type}
                                        onChange={() => setSelectedType(type)}
                                        className="w-[18px] h-[18px] accent-[#245CFF]"
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>

                        {/* Filter Group: Category */}
                        <div className="space-y-3">
                            <h3 className="text-[16px] font-bold text-[#0B123D]">Category</h3>
                            {[
                                { name: 'All Categories', slug: 'All Categories' },
                                ...(resourceOptions?.categories || []).map((category) => ({
                                    name: category.name,
                                    slug: category.slug,
                                })),
                            ].map((dept) => (
                                <label key={dept.slug} className="flex items-center gap-3 cursor-pointer text-[14px] text-[#64708C]">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedDept === dept.slug}
                                        onChange={() => setSelectedDept(dept.slug)}
                                        className="w-[18px] h-[18px] accent-[#245CFF]"
                                    />
                                    <span>{dept.name}</span>
                                </label>
                            ))}
                        </div>

                        {/* Filter Group: Year */}
                        <div className="space-y-3">
                            <h3 className="text-[16px] font-bold text-[#0B123D]">Year</h3>
                            {['All Years', '2026', '2025', '2024', '2023', '2022'].map((yr) => (
                                <label key={yr} className="flex items-center gap-3 cursor-pointer text-[14px] text-[#64708C]">
                                    <input
                                        type="radio"
                                        name="year"
                                        checked={selectedYear === yr}
                                        onChange={() => setSelectedYear(yr)}
                                        className="w-[18px] h-[18px] accent-[#245CFF]"
                                    />
                                    <span>{yr}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 3. SEARCH RESULTS LIST */}
                    <div className="flex-1 space-y-[18px]">

                        {/* Title & Count Header */}
                        <div className="space-y-2">
                            <h1 className="text-[23px] sm:text-[27px] font-bold leading-[39.15px] text-[#0B123D]">
                                {query ? `Search Results for ”${query}“` : 'All Resources'}
                            </h1>

                            <div className="flex items-center justify-between text-[14px] sm:text-[15px] text-[#64708C]">
                                <span>Found {searchResults?.count ?? 0} results</span>
                                <div className="flex items-center gap-3">
                                    <span>Sort by:</span>
                                    <div className="px-4 py-2 bg-white rounded-[7px] border border-[#E1E6F3] text-[#0B123D] font-normal cursor-pointer text-sm">
                                        Relevance ⌄
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Feed wrapped in DataContainer */}
                        <DataContainer
                            isLoading={isLoading}
                            data={results}
                            errorMessage={error?.message}
                            emptyIcon={Search}
                            emptyTitle="No Records Found"
                            emptyDescription={
                                query
                                    ? `No matching records found for "${query}". Try adjusting keywords, level, or category filter.`
                                    : "There are currently no resources available for the selected filters."
                            }
                            emptyAction={{
                                label: "Clear Filters",
                                onClick: () => {
                                    setQuery('');
                                    setSelectedType('All');
                                    setSelectedDept('All Categories');
                                    setSelectedYear('All Years');
                                },
                            }}
                            skeletonCount={4}
                            skeletonType="rows"
                        >
                            {(items) => (
                                <div className="space-y-[16px]">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-5 sm:p-[20px] bg-white rounded-[16px] border border-[#E1E6F3]/60 shadow-[0px_5px_18px_rgba(39,63,121,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#245CFF] transition-all group"
                                        >
                                            <div className="flex items-start gap-4 flex-1">
                                                {/* Icon Badge */}
                                                <div
                                                    style={{ backgroundColor: item.lightBg }}
                                                    className="w-[66px] h-[71px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                                                >
                                                    <div
                                                        style={{ backgroundColor: item.badgeBg }}
                                                        className="w-[43px] h-[51px] rounded-[7px] flex items-center justify-center text-white"
                                                    >
                                                        <item.icon className="w-[26px] h-[26px]" />
                                                    </div>
                                                </div>

                                                {/* Metadata & Summary */}
                                                <div className="space-y-2 flex-1">
                                                    <h3 className="text-[18px] font-bold leading-[26.1px] text-[#0B123D] group-hover:text-[#245CFF] transition-colors">
                                                        {item.title}
                                                    </h3>

                                                    <div className="text-[12px] sm:text-[13px] text-[#64708C] flex flex-wrap items-center gap-2 font-normal">
                                                        <span>{item.type}</span>
                                                        <span>•</span>
                                                        <span>{item.size}</span>
                                                        <span>•</span>
                                                        <span>{item.year}</span>
                                                        <span>•</span>
                                                        <span>{item.downloads} downloads</span>
                                                    </div>

                                                    <p className="text-[13px] sm:text-[14px] text-[#64708C] leading-[20.3px] line-clamp-2">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Gradient View Button */}
                                            <Link
                                                href={`/resources/${item.id}`}
                                                className="w-full sm:w-auto h-[48px] px-6 bg-gradient-to-r from-[#7148FF] to-[#245CFF] rounded-[8px] text-white text-[16px] font-semibold flex items-center justify-center hover:opacity-95 transition-opacity shadow-sm"
                                            >
                                                View
                                            </Link>
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

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F6F8FF] flex items-center justify-center text-[#0B123D]">Loading search results...</div>}>
            <SearchContent />
        </Suspense>
    );
}
