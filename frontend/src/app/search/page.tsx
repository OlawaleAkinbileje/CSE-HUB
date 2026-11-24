'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    BookOpen,
    ChevronDown,
    Code,
    FileText,
    FolderKanban,
    Search as SearchIcon,
    SlidersHorizontal,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import DataContainer from '@/components/ui/DataContainer';
import { apiClient } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { usePublicAppSettings } from '@/lib/queries';

interface SearchResource {
    id: string;
    title: string;
    resource_type: string;
    file_size: number;
    created_at: string | null;
    downloads: number;
    description: string | null;
}

interface SearchOptions {
    categories: { id: string; name: string; slug: string }[];
    years: number[];
}

interface ResourceSearchFormProps {
    query: string;
    baseParams: string;
    selectedType: string;
    selectedCategory: string;
    selectedYear: string;
    sortBy: string;
}

function ResourceSearchForm({
    query,
    baseParams,
    selectedType,
    selectedCategory,
    selectedYear,
    sortBy,
}: ResourceSearchFormProps) {
    const router = useRouter();
    const [searchDraft, setSearchDraft] = useState(query);

    const updateSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = new URLSearchParams(baseParams);
        const trimmedQuery = searchDraft.trim();
        if (trimmedQuery) params.set('q', trimmedQuery);
        else params.delete('q');
        if (selectedType) params.set('resource_type', selectedType);
        else params.delete('resource_type');
        if (selectedCategory) params.set('category_slug', selectedCategory);
        else params.delete('category_slug');
        if (selectedYear) params.set('year', selectedYear);
        else params.delete('year');
        if (sortBy !== 'relevance') params.set('sort_by', sortBy);
        else params.delete('sort_by');
        params.delete('category');
        const nextUrl = params.toString() ? `/search?${params}` : '/search';
        router.push(nextUrl);
    };

    return (
        <form
            onSubmit={updateSearch}
            className="mb-6 flex h-12 items-center gap-3 rounded-xl border border-[#E1E6F3] bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#245CFF]"
        >
            <SearchIcon className="h-5 w-5 shrink-0 text-[#64708C]" />
            <input
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                aria-label="Search resources"
                placeholder="Search by title, topic, course or keyword"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
                type="submit"
                className="rounded-lg bg-[#245CFF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
                Search
            </button>
        </form>
    );
}

const resourceTypes = [
    { label: 'All types', value: '' },
    { label: 'Past questions', value: 'past_question' },
    { label: 'Projects', value: 'project' },
    { label: 'Lecture notes', value: 'lecture_note' },
    { label: 'Code samples', value: 'code_preview' },
    { label: 'Other resources', value: 'other' },
];

const sortOptions = [
    { label: 'Most relevant', value: 'relevance' },
    { label: 'Newest first', value: 'newest' },
    { label: 'Oldest first', value: 'oldest' },
    { label: 'Title A–Z', value: 'title_asc' },
    { label: 'Title Z–A', value: 'title_desc' },
    { label: 'Most downloaded', value: 'downloads' },
];

const categoryTypeBySlug: Record<string, string> = {
    'past-questions': 'past_question',
    projects: 'project',
    'lecture-notes': 'lecture_note',
    'code-samples': 'code_preview',
};

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentUser = useCurrentUser();
    const { data: appSettings } = usePublicAppSettings();
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';
    const [selectedType, setSelectedType] = useState(
        categoryTypeBySlug[categoryParam] || searchParams.get('resource_type') || ''
    );
    const [selectedCategory, setSelectedCategory] = useState(
        (categoryParam && !categoryTypeBySlug[categoryParam] ? categoryParam : '') ||
        searchParams.get('category_slug') ||
        ''
    );
    const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
    const [sortByOverride, setSortByOverride] = useState<string | null>(
        searchParams.get('sort_by')
    );
    const sortBy =
        searchParams.get('sort_by')
        || sortByOverride
        || appSettings?.search.defaultSort
        || 'relevance';

    const optionsQuery = useQuery({
        queryKey: ['resources', 'options'],
        queryFn: async () => {
            const response = await apiClient.get<SearchOptions>('/resources/options');
            return response.data;
        },
    });

    const { data: searchResults, isLoading, error } = useQuery({
        queryKey: [
            'resources',
            'search',
            query,
            selectedType,
            selectedCategory,
            selectedYear,
            sortBy,
            appSettings?.search.resultsPerPage,
        ],
        queryFn: async () => {
            const params: Record<string, string> = {
                sort_by: sortBy,
                limit: String(appSettings?.search.resultsPerPage || 20),
            };
            if (query.trim()) params.search = query.trim();
            if (selectedType) params.resource_type = selectedType;
            if (selectedCategory) params.category_slug = selectedCategory;
            if (selectedYear) params.year = selectedYear;
            const response = await apiClient.get('/resources', { params });
            return response.data as { data: SearchResource[]; count: number };
        },
    });

    const clearFilters = () => {
        setSelectedType('');
        setSelectedCategory('');
        setSelectedYear('');
        setSortByOverride(null);
        router.replace(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    };

    const activeFilterCount =
        Number(Boolean(selectedType)) +
        Number(Boolean(selectedCategory)) +
        Number(Boolean(selectedYear));

    const results = searchResults?.data || [];

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#F6F8FF] font-sans text-[#0B123D]">
            <Navbar userRole={currentUser.isAuthenticated ? currentUser.role : undefined} />
            <div className="flex flex-1">
                {currentUser.isAuthenticated && (
                    <Sidebar userRole={currentUser.role} />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-[#245CFF]">CSE HUB RESOURCE LIBRARY</p>
                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Search resources</h1>
                            <p className="mt-2 text-sm text-[#64708C]">
                                Search CSE learning materials. You can browse without an account.
                            </p>
                        </div>

                        <ResourceSearchForm
                            key={query}
                            query={query}
                            baseParams={searchParams.toString()}
                            selectedType={selectedType}
                            selectedCategory={selectedCategory}
                            selectedYear={selectedYear}
                            sortBy={sortBy}
                        />

                        <div className="mb-4 flex items-start gap-2">
                            <details className="group min-w-0 flex-1 rounded-xl border border-[#E1E6F3] bg-white shadow-sm">
                                <summary className="flex h-11 cursor-pointer list-none items-center gap-2.5 px-3 text-sm font-semibold sm:px-4">
                                    <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#245CFF]" />
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full bg-[#E9EDFF] px-2 py-0.5 text-xs font-semibold text-[#245CFF]">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    <span className="hidden text-xs font-normal text-[#64708C] sm:inline">
                                        Narrow results by type, category or year
                                    </span>
                                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#64708C] transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="grid gap-3 border-t border-[#E1E6F3] p-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <label className="min-w-0 space-y-1 text-xs font-medium text-[#475569]">
                                        Resource type
                                        <select
                                            value={selectedType}
                                            onChange={(event) => setSelectedType(event.target.value)}
                                            className="h-9 w-full rounded-lg border border-[#D8DFEC] bg-white px-2.5 text-sm text-[#0B123D] outline-none focus:border-[#245CFF] focus:ring-2 focus:ring-[#245CFF]/20"
                                        >
                                            {resourceTypes.map((type) => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="min-w-0 space-y-1 text-xs font-medium text-[#475569]">
                                        Category
                                        <select
                                            value={selectedCategory}
                                            onChange={(event) => setSelectedCategory(event.target.value)}
                                            className="h-9 w-full rounded-lg border border-[#D8DFEC] bg-white px-2.5 text-sm text-[#0B123D] outline-none focus:border-[#245CFF] focus:ring-2 focus:ring-[#245CFF]/20"
                                        >
                                            <option value="">All categories</option>
                                            {(optionsQuery.data?.categories || []).map((category) => (
                                                <option key={category.id} value={category.slug}>{category.name}</option>
                                            ))}
                                        </select>
                                        {optionsQuery.error && (
                                            <span role="alert" className="block text-xs text-red-600">
                                                Could not load categories.
                                            </span>
                                        )}
                                    </label>
                                    <label className="min-w-0 space-y-1 text-xs font-medium text-[#475569]">
                                        Year
                                        <select
                                            value={selectedYear}
                                            onChange={(event) => setSelectedYear(event.target.value)}
                                            className="h-9 w-full rounded-lg border border-[#D8DFEC] bg-white px-2.5 text-sm text-[#0B123D] outline-none focus:border-[#245CFF] focus:ring-2 focus:ring-[#245CFF]/20"
                                        >
                                            <option value="">All years</option>
                                            {(optionsQuery.data?.years || []).map((year) => (
                                                <option key={year} value={String(year)}>{year}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </details>
                            <button
                                type="button"
                                onClick={clearFilters}
                                disabled={
                                    activeFilterCount === 0
                                    && sortBy === (appSettings?.search.defaultSort || 'relevance')
                                }
                                className="h-11 shrink-0 rounded-lg border border-[#E1E6F3] bg-white px-3 text-xs font-semibold text-[#245CFF] transition-colors hover:bg-[#F6F8FF] disabled:text-[#94A3B8] disabled:hover:bg-white sm:px-4"
                            >
                                Clear
                            </button>
                        </div>

                        <section className="min-w-0">
                                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#E1E6F3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-bold">
                                            {query ? `Results for “${query}”` : 'Available resources'}
                                        </h2>
                                        <p className="mt-1 text-sm text-[#64708C]">
                                            {isLoading ? 'Searching…' : `${searchResults?.count ?? 0} resources found`}
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-[#475569]">
                                        <span className="shrink-0 font-medium">Sort by</span>
                                        <select
                                            value={sortBy}
                                            onChange={(event) => setSortByOverride(event.target.value)}
                                            aria-label="Sort search results"
                                            className="min-w-40 rounded-lg border border-[#D8DFEC] bg-white px-3 py-2 text-sm text-[#0B123D] outline-none focus:border-[#245CFF] focus:ring-2 focus:ring-[#245CFF]/20"
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <DataContainer
                                    isLoading={isLoading}
                                    data={results}
                                    errorMessage={error instanceof Error ? error.message : undefined}
                                    emptyIcon={SearchIcon}
                                    emptyTitle="No resources found"
                                    emptyDescription="Try a different search term or adjust your filters."
                                    emptyAction={{ label: 'Clear filters', onClick: clearFilters }}
                                    skeletonCount={4}
                                    skeletonType="rows"
                                >
                                    {(items) => (
                                        <div className="space-y-3">
                                            {items.map((item) => {
                                                const type = resourceTypes.find(
                                                    (entry) => entry.value === item.resource_type
                                                )?.label || 'Resource';
                                                const Icon = item.resource_type === 'project'
                                                    ? FolderKanban
                                                    : item.resource_type === 'code_preview'
                                                        ? Code
                                                        : item.resource_type === 'lecture_note'
                                                            ? BookOpen
                                                            : FileText;
                                                const dateYear = item.created_at
                                                    ? new Date(item.created_at).getFullYear()
                                                    : null;
                                                return (
                                                    <article
                                                        key={item.id}
                                                        className="flex flex-col gap-4 rounded-xl border border-[#E1E6F3] bg-white p-4 shadow-sm transition hover:border-[#B9C9FF] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                                    >
                                                        <div className="flex min-w-0 items-start gap-3">
                                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9EDFF] text-[#245CFF]">
                                                                <Icon className="h-5 w-5" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <h3 className="truncate font-semibold text-[#0B123D]">
                                                                    {item.title}
                                                                </h3>
                                                                <p className="mt-1 text-xs text-[#64708C]">
                                                                    {type} · {(Number(item.file_size || 0) / (1024 * 1024)).toFixed(1)} MB
                                                                    {dateYear ? ` · ${dateYear}` : ''}
                                                                    {' · '}{item.downloads || 0} downloads
                                                                </p>
                                                                {item.description && (
                                                                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#64708C]">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/resources/${item.id}`}
                                                            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#245CFF] px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                                        >
                                                            View resource
                                                        </Link>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    )}
                                </DataContainer>
                        </section>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F6F8FF] text-sm text-[#64708C]">Loading resources…</div>}>
            <SearchContent />
        </Suspense>
    );
}
