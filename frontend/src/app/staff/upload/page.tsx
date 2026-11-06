'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import {
    Check,
    RotateCw,
    ChevronDown,
    X,
    FileCheck2,
    Send,
    HelpCircle,
    Bell,
    Search
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function UploadResourcePage() {
    const currentUser = useCurrentUser();
    const [title, setTitle] = useState('Introduction to Algorithms — Lecture Notes 2024');
    const [description, setDescription] = useState(
        'Comprehensive lecture notes covering sorting, graph algorithms, dynamic programming, and complexity analysis for Year 2 CS students.'
    );
    const [course, setCourse] = useState('CS201 — Data Structures & Algorithms');
    const [category, setCategory] = useState('Lecture Notes');
    const [academicYear, setAcademicYear] = useState('2024 / 2025');
    const [resourceType, setResourceType] = useState('Document');
    const [tags, setTags] = useState(['algorithms', 'data-structures', 'CS201', 'Year 2']);
    const [tagInput, setTagInput] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'course' | 'staff'>('public');

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(',', '');
            if (!tags.includes(newTag) && tags.length < 10) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F6F8FF] flex font-sans text-[#0B123D]">

            {/* SIDEBAR */}
            <Sidebar userRole="staff" />

            {/* MAIN CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="w-full max-w-[620px]">
                        <div className="h-[44px] px-3 bg-white rounded-[8px] border border-[#E1E6F3] flex items-center gap-[10px]">
                            <Search className="w-[18px] h-[18px] text-[#64708C]" />
                            <input
                                type="text"
                                placeholder="Search for resources, topics, or keywords..."
                                className="w-full bg-transparent text-[12px] sm:text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">
                            <Bell className="w-[20px] h-[20px]" />
                        </button>
                        <div className="flex items-center gap-3 border-l border-[#E1E6F3] pl-4">
                            <div className="w-[32px] h-[34px] rounded-[22px] bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-xs">
                                DS
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-[12px] font-bold text-[#0B123D]">{currentUser.full_name || currentUser.username || 'User'}</span>
                                <span className="text-[11px] text-[#64708C]">Staff</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* UPLOADER PAGE LAYOUT */}
                <main className="p-6 sm:p-[32px] space-y-[26px] flex-1">

                    {/* TOP PAGE TITLE & STEPPER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-[26px] font-bold text-[#0B123D]">Upload New Resource</h1>

                        {/* Stepper Pills */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[#245CFF] text-[13px] font-semibold">
                                <div className="w-7 h-7 bg-[#245CFF] rounded-full flex items-center justify-center text-white text-xs">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span>Upload File</span>
                            </div>
                            <div className="w-8 h-[2px] bg-[#245CFF]" />

                            <div className="flex items-center gap-1.5 text-[#245CFF] text-[13px] font-semibold">
                                <div className="w-7 h-7 bg-[#245CFF] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    2
                                </div>
                                <span>Resource Details</span>
                            </div>
                            <div className="w-8 h-[2px] bg-[#C5CEED]" />

                            <div className="flex items-center gap-1.5 text-[#64708C] text-[13px] font-semibold">
                                <div className="w-7 h-7 bg-[#E1E6F3] rounded-full flex items-center justify-center text-[#64708C] text-xs font-bold">
                                    3
                                </div>
                                <span>Review & Submit</span>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT GRID: MAIN FORM (LEFT) + SIDE GUIDELINES (RIGHT) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] items-start">

                        {/* FORM COLUMN (LEFT 8 COLUMNS) */}
                        <div className="lg:col-span-8 space-y-[20px]">

                            {/* FILE UPLOADED CARD */}
                            <div className="p-5 bg-white rounded-[8px] border border-[#245CFF] flex flex-col gap-[12px]">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 bg-[#E9EDFF] text-[#245CFF] text-[12px] font-bold rounded-[6px]">
                                            PDF
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-semibold text-[#0B123D]">Introduction_to_Algorithms_2024.pdf</span>
                                            <span className="text-[12px] text-[#64708C]">3.4 MB · Uploaded successfully</span>
                                        </div>
                                    </div>

                                    <div className="px-3 py-1 bg-[#E6FAF4] text-[#00C58A] rounded-full text-[12px] font-semibold flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>File Ready</span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-[6px] bg-[#E9EDFF] rounded-full overflow-hidden">
                                    <div className="w-full h-full bg-[#245CFF]" />
                                </div>

                                <div className="flex items-center gap-2 text-[13px]">
                                    <RotateCw className="w-3.5 h-3.5 text-[#64708C]" />
                                    <span className="text-[#64708C]">Wrong file?</span>
                                    <button type="button" className="text-[#245CFF] font-semibold hover:underline">
                                        Replace file
                                    </button>
                                    <span className="text-[#64708C]">· Supported: PDF, DOC, DOCX, PPT, ZIP, RAR, JPG, PNG (Max 20MB)</span>
                                </div>
                            </div>

                            {/* RESOURCE DETAILS CARD */}
                            <div className="p-[24px] bg-white rounded-[12px] border border-[#E1E6F3] flex flex-col gap-[18px]">
                                <h2 className="text-[16px] font-bold text-[#0B123D]">Resource Details</h2>

                                {/* Title */}
                                <div className="flex flex-col gap-[6px]">
                                    <label className="text-[13px] font-bold text-[#0B123D] flex items-center gap-1">
                                        Title <span className="text-[#245CFF]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full h-[43px] px-3.5 bg-white rounded-[8px] border border-[#E1E6F3] text-[14px] text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                    />
                                </div>

                                {/* Description */}
                                <div className="flex flex-col gap-[6px]">
                                    <label className="text-[13px] font-bold text-[#0B123D] flex items-center gap-1">
                                        Description <span className="text-[#245CFF]">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full p-3.5 bg-white rounded-[8px] border border-[#E1E6F3] text-[14px] text-[#0B123D] focus:outline-none focus:border-[#245CFF] resize-none"
                                    />
                                    <span className="text-[12px] text-[#64708C] self-end">{description.length} / 500 characters</span>
                                </div>

                                {/* Select Inputs Row 1 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                                    <div className="flex flex-col gap-[6px]">
                                        <label className="text-[13px] font-bold text-[#0B123D] flex items-center gap-1">
                                            Course <span className="text-[#245CFF]">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={course}
                                                onChange={(e) => setCourse(e.target.value)}
                                                className="w-full h-[43px] px-3.5 bg-white rounded-[8px] border border-[#E1E6F3] text-[14px] text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option>CS201 — Data Structures & Algorithms</option>
                                                <option>CS301 — Database Systems</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-[6px]">
                                        <label className="text-[13px] font-bold text-[#0B123D] flex items-center gap-1">
                                            Category <span className="text-[#245CFF]">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full h-[43px] px-3.5 bg-white rounded-[8px] border border-[#E1E6F3] text-[14px] text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option>Lecture Notes</option>
                                                <option>Past Questions</option>
                                                <option>Projects</option>
                                                <option>Code Samples</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Select Inputs Row 2 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                                    <div className="flex flex-col gap-[6px]">
                                        <label className="text-[13px] font-bold text-[#0B123D]">Academic Year</label>
                                        <div className="relative">
                                            <select
                                                value={academicYear}
                                                onChange={(e) => setAcademicYear(e.target.value)}
                                                className="w-full h-[43px] px-3.5 bg-white rounded-[8px] border border-[#E1E6F3] text-[14px] text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option>2024 / 2025</option>
                                                <option>2023 / 2024</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-[6px]">
                                        <label className="text-[13px] font-bold text-[#0B123D]">Resource Type</label>
                                        <div className="relative">
                                            <select
                                                value={resourceType}
                                                onChange={(e) => setResourceType(e.target.value)}
                                                className="w-full h-[43px] px-3.5 bg-white rounded-[8px] border border-[#E1E6F3] text-[14px] text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF]"
                                            >
                                                <option>Document</option>
                                                <option>Archive</option>
                                                <option>Source Code</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-3 top-3.5 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Tags Field */}
                                <div className="flex flex-col gap-[8px]">
                                    <label className="text-[13px] font-bold text-[#0B123D] flex items-center gap-1">
                                        Tags <span className="text-[#64708C] font-normal">(optional)</span>
                                    </label>
                                    <div className="min-h-[43px] p-2 bg-white rounded-[8px] border border-[#E1E6F3] flex flex-wrap items-center gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 bg-[#E9EDFF] text-[#245CFF] text-[12px] font-semibold rounded-full flex items-center gap-1.5"
                                            >
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)}>
                                                    <X className="w-3 h-3 hover:text-blue-800" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            placeholder="Add tag..."
                                            className="bg-transparent text-[13px] text-[#0B123D] placeholder-[#64708C] focus:outline-none flex-1 min-w-[100px]"
                                        />
                                    </div>
                                    <span className="text-[12px] text-[#64708C]">Press Enter or comma to add a tag. Max 10 tags.</span>
                                </div>

                                {/* Visibility Settings */}
                                <div className="flex flex-col gap-[10px]">
                                    <label className="text-[13px] font-bold text-[#0B123D]">Visibility</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
                                        <div
                                            onClick={() => setVisibility('public')}
                                            className={`p-3.5 rounded-[8px] border cursor-pointer flex items-start gap-2.5 transition-all ${visibility === 'public'
                                                ? 'bg-[#F0F3FF] border-[#245CFF]'
                                                : 'bg-white border-[#E1E6F3]'
                                                }`}
                                        >
                                            <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center mt-0.5 ${visibility === 'public' ? 'border-[#245CFF] bg-[#245CFF]' : 'border-[#C5CEED]'
                                                }`}>
                                                {visibility === 'public' && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-[#0B123D]">Public</span>
                                                <span className="text-[12px] text-[#64708C]">Visible to all registered students & staff</span>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setVisibility('course')}
                                            className={`p-3.5 rounded-[8px] border cursor-pointer flex items-start gap-2.5 transition-all ${visibility === 'course'
                                                ? 'bg-[#F0F3FF] border-[#245CFF]'
                                                : 'bg-white border-[#E1E6F3]'
                                                }`}
                                        >
                                            <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center mt-0.5 ${visibility === 'course' ? 'border-[#245CFF] bg-[#245CFF]' : 'border-[#C5CEED]'
                                                }`}>
                                                {visibility === 'course' && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-[#0B123D]">Course Only</span>
                                                <span className="text-[12px] text-[#64708C]">Only enrolled CS201 students</span>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setVisibility('staff')}
                                            className={`p-3.5 rounded-[8px] border cursor-pointer flex items-start gap-2.5 transition-all ${visibility === 'staff'
                                                ? 'bg-[#F0F3FF] border-[#245CFF]'
                                                : 'bg-white border-[#E1E6F3]'
                                                }`}
                                        >
                                            <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center mt-0.5 ${visibility === 'staff' ? 'border-[#245CFF] bg-[#245CFF]' : 'border-[#C5CEED]'
                                                }`}>
                                                {visibility === 'staff' && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-[#0B123D]">Staff Only</span>
                                                <span className="text-[12px] text-[#64708C]">Only staff members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* REVIEW SUMMARY SECTION */}
                            <div className="p-[24px] bg-white rounded-[12px] border border-[#E1E6F3] flex flex-col gap-[16px]">
                                <div className="flex items-center gap-2 text-[16px] font-bold text-[#0B123D]">
                                    <FileCheck2 className="w-[18px] h-[18px] text-[#245CFF]" />
                                    <span>Review & Submit</span>
                                </div>
                                <div className="h-[1px] bg-[#E1E6F3]" />

                                <div className="space-y-[12px] text-[13px]">
                                    <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
                                        <span className="w-36 text-[#64708C] font-semibold">File</span>
                                        <span className="flex-1 text-[#0B123D]">Introduction_to_Algorithms_2024.pdf (3.4 MB)</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
                                        <span className="w-36 text-[#64708C] font-semibold">Title</span>
                                        <span className="flex-1 text-[#0B123D]">{title}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
                                        <span className="w-36 text-[#64708C] font-semibold">Course</span>
                                        <span className="flex-1 text-[#0B123D]">{course}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
                                        <span className="w-36 text-[#64708C] font-semibold">Category</span>
                                        <span className="flex-1 text-[#0B123D]">{category}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
                                        <span className="w-36 text-[#64708C] font-semibold">Academic Year</span>
                                        <span className="flex-1 text-[#0B123D]">{academicYear}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
                                        <span className="w-36 text-[#64708C] font-semibold">Tags</span>
                                        <div className="flex-1 flex flex-wrap gap-1.5">
                                            {tags.map((t) => (
                                                <span key={t} className="px-2 py-0.5 bg-[#E9EDFF] text-[#245CFF] text-[11px] font-semibold rounded-full">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="w-36 text-[#64708C] font-semibold">Visibility</span>
                                        <span className="px-2.5 py-0.5 bg-[#E6FAF4] text-[#00C58A] text-[12px] font-semibold rounded-full">
                                            {visibility.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-[#F0F3FF] rounded-[8px] flex items-start gap-2.5 text-[#245CFF] text-[13px]">
                                    <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>
                                        All required fields are complete. Your submission will be queued for staff review before being published to students.
                                    </span>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <button type="button" className="h-[48px] px-6 bg-white rounded-[8px] border border-[#E1E6F3] text-[#64708C] font-semibold text-[15px] hover:bg-slate-50">
                                        Cancel
                                    </button>
                                    <button type="button" className="h-[48px] px-6 bg-white rounded-[8px] border border-[#245CFF] text-[#245CFF] font-semibold text-[15px] hover:bg-blue-50">
                                        Save as Draft
                                    </button>
                                </div>
                                <button type="button" className="h-[48px] px-8 bg-[#245CFF] rounded-[8px] text-white font-bold text-[15px] flex items-center gap-2 hover:bg-blue-700">
                                    <Send className="w-4 h-4" />
                                    <span>Submit for Review</span>
                                </button>
                            </div>

                        </div>

                        {/* SIDE GUIDELINES & WORKFLOW COLUMN (RIGHT 4 COLUMNS) */}
                        <div className="lg:col-span-4 space-y-[16px]">

                            {/* GUIDELINES CARD */}
                            <div className="p-5 bg-white rounded-[12px] border border-[#E1E6F3] space-y-3.5">
                                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0B123D] border-b border-[#F0F3FF] pb-3">
                                    <div className="w-8 h-8 bg-[#E9EDFF] rounded-[8px] flex items-center justify-center text-[#245CFF]">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span>Upload Guidelines</span>
                                </div>

                                <ul className="space-y-2.5 text-[13px] text-[#64708C]">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-[#245CFF] rounded-full mt-2 flex-shrink-0" />
                                        <span>Maximum file size is 20 MB per upload.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-[#245CFF] rounded-full mt-2 flex-shrink-0" />
                                        <span>Accepted formats: PDF, DOC, DOCX, PPT, ZIP, RAR, JPG, PNG.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-[#245CFF] rounded-full mt-2 flex-shrink-0" />
                                        <span>Ensure files are free of sensitive personal data before uploading.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-[#245CFF] rounded-full mt-2 flex-shrink-0" />
                                        <span>All resources are reviewed by an administrator before publication.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-[#245CFF] rounded-full mt-2 flex-shrink-0" />
                                        <span>Use descriptive titles and accurate tags to improve discoverability.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* APPROVAL WORKFLOW CARD */}
                            <div className="p-5 bg-white rounded-[12px] border border-[#E1E6F3] space-y-4">
                                <h3 className="text-[14px] font-bold text-[#0B123D] border-b border-[#F0F3FF] pb-2">
                                    Approval Workflow
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#245CFF] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            1
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-[#0B123D]">Submit for Review</span>
                                            <span className="text-[12px] text-[#64708C]">Your resource is queued for admin approval.</span>
                                        </div>
                                    </div>
                                    <div className="ml-3 w-[2px] h-4 bg-[#C5CEED]" />

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#FF9235] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            2
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-[#0B123D]">Under Review</span>
                                            <span className="text-[12px] text-[#64708C]">Admin checks content and compliance (1–2 days).</span>
                                        </div>
                                    </div>
                                    <div className="ml-3 w-[2px] h-4 bg-[#C5CEED]" />

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#00C58A] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            3
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-[#0B123D]">Published</span>
                                            <span className="text-[12px] text-[#64708C]">Resource is live and discoverable by students.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NEED HELP CARD */}
                            <div className="p-5 bg-gradient-to-br from-[#E9EDFF] to-[#F0EBFF] rounded-[12px] flex flex-col gap-2.5">
                                <h4 className="text-[14px] font-bold text-[#0B123D]">Need Help?</h4>
                                <p className="text-[13px] text-[#64708C]">
                                    Contact the platform team for support with uploads, permissions, or technical issues.
                                </p>
                                <button type="button" className="w-full py-2 bg-[#245CFF] text-white text-[13px] font-semibold rounded-[8px] hover:bg-blue-700">
                                    Contact Support
                                </button>
                            </div>

                        </div>

                    </div>

                </main>

                {/* FOOTER */}
                <Footer />

            </div>
        </div>
    );
}