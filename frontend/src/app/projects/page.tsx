'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import {
    Search,
    ChevronDown,
    Clock,
    Download,
    Folder,
    Home,
    HelpCircle,
    BookOpen,
    FolderSearch
} from 'lucide-react';
import { useProjects } from '@/lib/queries';
import DataContainer from '@/components/ui/DataContainer';

const departments = [
    'All Departments',
    'Computer Science & Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
];

export default function ProjectsPage() {
    const [projectSearch, setProjectSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('All Departments');

    const { data: rawProjects, isLoading } = useProjects();
    const projectsList = rawProjects || [];

    // Filter project cards by search query and selected department
    const filteredProjects = projectsList.filter((project) => {
        const matchesSearch =
            project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
            (project.tags && project.tags.some((t) => t.toLowerCase().includes(projectSearch.toLowerCase())));

        const matchesDept =
            selectedDept === 'All Departments' ||
            (project.department && selectedDept.toLowerCase().includes(project.department.toLowerCase()));

        return matchesSearch && matchesDept;
    });

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Shared Header Navigation */}
            <Navbar userRole="student" />

            {/* Main Shell */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Shared Sidebar */}
                <Sidebar userRole="student" />

                {/* Main Workspace Container */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6 max-w-6xl mx-auto w-full">

                        {/* Page Heading & Filters Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#0B123D] leading-tight">
                                    Final Year Projects
                                </h1>
                                <p className="text-xs sm:text-sm text-[#64708C]">Resources</p>
                            </div>

                            {/* Search & Dropdown Filters */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Project Search Input */}
                                <div className="w-full sm:w-[280px] lg:w-[325px] h-[43px] px-4 bg-white rounded-8 border border-[#E1E6F3] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#245CFF]">
                                    <Search className="w-4 h-4 text-[#64708C] shrink-0" />
                                    <input
                                        type="text"
                                        value={projectSearch}
                                        onChange={(e) => setProjectSearch(e.target.value)}
                                        placeholder="Search for projects..."
                                        className="w-full bg-transparent text-sm text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                                    />
                                </div>

                                {/* Department Dropdown */}
                                <div className="relative w-full sm:w-[220px] lg:w-[260px]">
                                    <select
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="w-full h-[43px] pl-4 pr-10 bg-white rounded-8 border border-[#E1E6F3] text-sm text-[#0B123D] appearance-none focus:ring-2 focus:ring-[#245CFF] focus:outline-none cursor-pointer"
                                    >
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[#0B123D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Projects Card Grid wrapped with DataContainer */}
                        <DataContainer
                            isLoading={isLoading}
                            data={filteredProjects}
                            emptyIcon={Folder}
                            emptyTitle={projectSearch ? "No Projects Found" : "No Projects Yet"}
                            emptyDescription={
                                projectSearch
                                    ? `No project submissions matched "${projectSearch}". Try adjusting your search query or department filter.`
                                    : "There are currently no research or capstone projects submitted in the repository."
                            }
                            emptyAction={{
                                label: "Explore Resources",
                                href: "/student/search",
                            }}
                            skeletonCount={6}
                        >
                            {(projects) => (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="bg-white rounded-2xl border border-[#E1E6F3] overflow-hidden flex flex-col justify-between hover:border-[#245CFF] hover:shadow-md transition-all duration-200"
                                        >
                                            {/* Thumbnail Image Banner */}
                                            <div className="relative w-full h-[145px] bg-slate-100">
                                                <Image
                                                    src={project.imageUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"}
                                                    alt={project.title}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />
                                            </div>

                                            {/* Card Content Body */}
                                            <div className="p-[18px] flex-1 flex flex-col justify-between gap-4">
                                                <div className="space-y-3">
                                                    <h3 className="text-[17px] font-bold text-[#0B123D] leading-snug line-clamp-2">
                                                        {project.title}
                                                    </h3>

                                                    {/* Category Tag Badges */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {(project.tags || []).map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-2.5 py-1 bg-[#E9EDFF] text-[#245CFF] font-semibold text-xs rounded-md"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Card Metadata Footer */}
                                                <div className="flex items-center gap-2 text-xs text-[#64708C] pt-2 border-t border-[#F0F3FA]">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{project.year || 2026}</span>
                                                    </div>
                                                    <span>·</span>
                                                    <span>{project.department || "CSE"}</span>
                                                    <span>·</span>
                                                    <div className="flex items-center gap-1">
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>{project.downloads || 0} downloads</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DataContainer>
                    </div>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#E1E6F3] px-2 flex items-center justify-around z-40">
                <Link href="/student/dashboard" className="flex flex-col items-center gap-1 text-[#64708C]">
                    <Home className="w-5 h-5" />
                    <span className="text-[10px]">Home</span>
                </Link>
                <Link href="/student/search" className="flex flex-col items-center gap-1 text-[#64708C]">
                    <FolderSearch className="w-5 h-5" />
                    <span className="text-[10px]">Search</span>
                </Link>
                <Link href="/past-questions" className="flex flex-col items-center gap-1 text-[#64708C]">
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-[10px]">Questions</span>
                </Link>
                <Link href="/projects" className="flex flex-col items-center gap-1 text-[#245CFF] font-bold bg-[#E9EDFF] px-3 py-1 rounded-lg">
                    <Folder className="w-5 h-5" />
                    <span className="text-[10px]">Projects</span>
                </Link>
                <Link href="/knowledge" className="flex flex-col items-center gap-1 text-[#64708C]">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-[10px]">Knowledge</span>
                </Link>
            </div>
        </div>
    );
}
