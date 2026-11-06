'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import {
    Search,
    Bell,
    ChevronDown,
    ArrowLeft,
    FileText,
    Download,
    Bookmark,
    Share2,
    ThumbsUp,
    MessageSquare,
    Flag,
    Bold,
    Italic,
    Link as LinkIcon,
    Home,
    HelpCircle,
    Folder,
    BookOpen
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function ResourceDetailsPage() {
    const currentUser = useCurrentUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'comments'>('preview');
    const [currentPage, setCurrentPage] = useState(1);
    const [commentText, setCommentText] = useState('Great set of notes! The section on gradient descent really helped clarify the concept. Would love to see more worked examples in the next revision.');

    return (
        <div className="w-full min-h-screen bg-[#F6F8FF] flex flex-col lg:flex-row font-sans text-[#0B123D]">

            {/* DESKTOP SIDEBAR */}
            <Sidebar userRole="student" />

            {/* MAIN CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">

                {/* HEADER / APP BAR */}
                <header className="h-[76px] bg-white border-b border-[#E1E6F3] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">

                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[36px] sm:w-[36px] sm:h-[38px] bg-[#245CFF] rounded-[10px] flex items-center justify-center text-white font-bold text-[16px] sm:text-[17px]">
                            C
                        </div>
                        <span className="text-[20px] sm:text-[24px] lg:text-[25px] font-bold text-[#0B123D]">
                            CSE Hub
                        </span>
                    </div>

                    {/* Search Field (Desktop) */}
                    <div className="hidden lg:block w-full max-w-[620px] mx-6">
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

                    {/* User Profile & Notifications */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">
                            <Bell className="w-[20px] h-[20px]" />
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3 border-l border-[#E1E6F3] pl-3 sm:pl-4">
                            <div className="w-[32px] h-[34px] sm:w-[38px] sm:h-[40px] rounded-full bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-xs sm:text-sm">
                                JD
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[12px] sm:text-[14px] font-bold text-[#0B123D] leading-tight">{currentUser.full_name || currentUser.username || 'User'}</span>
                                <span className="text-[11px] sm:text-[12px] text-[#64708C] leading-tight">Student</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[#64708C] hidden sm:block" />
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT CONTAINER */}
                <main className="p-4 sm:p-6 lg:p-[32px] space-y-[24px] lg:space-y-[26px] flex-1 max-w-[1280px] w-full mx-auto">

                    {/* BACK TO RESULTS LINK */}
                    <NextLink
                        href="/student/search"
                        className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#245CFF] hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Results</span>
                    </NextLink>

                    {/* HERO RESOURCE HEADER */}
                    <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 lg:gap-[28px]">
                        {/* Resource Cover Thumbnail */}
                        <div className="w-[88px] h-[92px] sm:w-[136px] sm:h-[141px] bg-[#00C58A]/10 rounded-[14px] flex items-center justify-center flex-shrink-0">
                            <div className="w-[58px] h-[68px] sm:w-[88px] sm:h-[104px] bg-[#00C58A] rounded-[7px] flex items-center justify-center shadow-sm">
                                <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                            </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 space-y-3 sm:space-y-3.5">
                            <h1 className="text-[23px] sm:text-[27px] lg:text-[29px] font-bold text-[#0B123D] leading-tight sm:leading-[42px]">
                                Introduction to Machine Learning - Lecture Notes
                            </h1>

                            {/* Meta Stats Inline */}
                            <div className="flex items-center gap-2 sm:gap-3 text-[13px] sm:text-[15px] text-[#64708C] flex-wrap">
                                <span className="font-medium text-[#0B123D]">Lecture Notes</span>
                                <span>·</span>
                                <span>2.4 MB</span>
                                <span>·</span>
                                <span>2023</span>
                                <span>·</span>
                                <span>125 downloads</span>
                            </div>

                            {/* Description */}
                            <p className="text-[14px] sm:text-[16px] lg:text-[18px] text-[#64708C] leading-normal sm:leading-[26px]">
                                Comprehensive lecture notes covering the basics of Machine Learning, including supervised and unsupervised learning, algorithms, and practical examples.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2.5 sm:gap-5 pt-1 flex-wrap">
                                <button className="h-[46px] sm:h-[48px] px-4 sm:px-6 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white font-semibold text-[14px] sm:text-[16px] rounded-[8px] flex items-center gap-2 shadow-sm hover:opacity-95 transition-opacity">
                                    <Download className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px]" />
                                    <span>Download</span>
                                </button>
                                <button className="h-[46px] sm:h-[48px] px-4 sm:px-6 bg-white border border-[#E1E6F3] text-[#0B123D] font-semibold text-[14px] sm:text-[16px] rounded-[8px] flex items-center gap-2 hover:bg-slate-50 transition-colors">
                                    <Bookmark className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px]" />
                                    <span>Bookmark</span>
                                </button>
                                <button className="h-[46px] sm:h-[48px] px-4 sm:px-6 bg-white border border-[#E1E6F3] text-[#0B123D] font-semibold text-[14px] sm:text-[16px] rounded-[8px] flex items-center gap-2 hover:bg-slate-50 transition-colors">
                                    <Share2 className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px]" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DOCUMENT PREVIEW CARD */}
                    <div className="bg-white rounded-[16px] border border-[#E1E6F3] overflow-hidden flex flex-col">

                        {/* PREVIEW CARD HEADER / TABS */}
                        <div className="h-[56px] px-4 sm:px-6 border-b border-[#E1E6F3] flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`h-full px-[18px] text-[14px] sm:text-[16px] font-bold flex items-center relative ${activeTab === 'preview' ? 'text-[#245CFF] bg-[#EFF2FF]' : 'text-[#64708C] hover:text-[#0B123D]'
                                    }`}
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`h-full px-2 text-[14px] sm:text-[16px] font-medium flex items-center ${activeTab === 'details' ? 'text-[#245CFF] font-bold' : 'text-[#64708C] hover:text-[#0B123D]'
                                    }`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab('comments')}
                                className={`h-full px-2 text-[14px] sm:text-[16px] font-medium flex items-center ${activeTab === 'comments' ? 'text-[#245CFF] font-bold' : 'text-[#64708C] hover:text-[#0B123D]'
                                    }`}
                            >
                                Comments
                            </button>
                        </div>

                        {/* PREVIEW TOOLBAR (MOBILE/TABLET READABILITY) */}
                        <div className="px-4 py-3 bg-[#F9FAFE] border-b border-[#E1E6F3] flex items-center justify-between text-[13px] text-[#0B123D]">
                            <span className="font-semibold cursor-pointer flex items-center gap-1">
                                Document Pages <ChevronDown className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex items-center gap-3 text-[#245CFF] font-medium">
                                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>‹</button>
                                <span>{currentPage} / 24</span>
                                <button onClick={() => setCurrentPage(Math.min(24, currentPage + 1))}>›</button>
                            </div>
                            <span className="text-[#64708C] cursor-pointer flex items-center gap-1">
                                Fit <ChevronDown className="w-3.5 h-3.5" />
                            </span>
                        </div>

                        {/* PREVIEW MAIN BODY: SIDEBAR + READER */}
                        <div className="flex flex-col lg:flex-row min-h-[480px] sm:min-h-[522px]">

                            {/* PAGE THUMBNAILS (DESKTOP / TABLET SIDEBAR) */}
                            <div className="w-full lg:w-[270px] p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#E1E6F3] space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[15px] font-semibold text-[#0B123D]">Document Pages</span>
                                    <div className="w-2 h-2 rounded-full bg-[#64708C]" />
                                </div>

                                {/* Page Thumbnails Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((page) => (
                                        <div
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex flex-col items-center gap-2 cursor-pointer group`}
                                        >
                                            <div
                                                className={`w-full h-[90px] sm:h-[120px] lg:h-[140px] bg-white border rounded-[7px] p-3 flex flex-col gap-1.5 transition-all ${currentPage === page
                                                    ? 'border-[#245CFF] ring-2 ring-[#245CFF]/20'
                                                    : 'border-[#E1E6F3] group-hover:border-[#245CFF]'
                                                    }`}
                                            >
                                                <div className="w-3/4 h-[2px] bg-[#B8BFCD]" />
                                                <div className="w-full h-[2px] bg-[#B8BFCD]" />
                                                <div className="w-full h-[2px] bg-[#B8BFCD]" />
                                                <div className="w-2/3 h-[2px] bg-[#B8BFCD]" />
                                                <div className="w-full h-[2px] bg-[#B8BFCD]" />
                                                <div className="w-3/4 h-[2px] bg-[#B8BFCD]" />
                                            </div>
                                            <span className="text-[12px] sm:text-[14px] text-[#0B123D] font-medium">{page}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* MAIN READER VIEWPORT */}
                            <div className="flex-1 bg-[#EDF0F4] p-4 sm:p-8 flex items-center justify-center relative overflow-x-auto">
                                {/* Book Page Spread Mock */}
                                <div className="w-full max-w-[715px] min-h-[380px] sm:min-h-[470px] lg:min-h-[520px] bg-[#FFFDFA] border-l-[14px] sm:border-l-[24px] lg:border-l-[38px] border-[#212226] shadow-md p-6 sm:p-10 relative flex flex-col justify-between">

                                    {/* Decorative Header Dots */}
                                    <div className="text-[#FF9235] text-[14px] tracking-[7px] leading-tight font-serif select-none">
                                        ••••<br />••••<br />••••
                                    </div>

                                    {/* Title & Subtitle */}
                                    <div className="space-y-3 my-auto">
                                        <h2 className="text-center font-serif font-bold text-[25px] sm:text-[35px] lg:text-[38px] text-[#0B123D] leading-tight">
                                            Introduction to<br />Machine Learning
                                        </h2>
                                        <p className="text-center font-serif text-[16px] sm:text-[21px] text-[#0B123D]">
                                            Discover the basics of Machine Learning
                                        </p>
                                    </div>

                                    {/* Graphic Watermarks */}
                                    <div className="flex items-center justify-between pt-6">
                                        <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border-2 border-[#00AFFF] flex items-center justify-center opacity-80" />
                                        <div className="flex items-center -space-x-4">
                                            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#8B60FF]" />
                                            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-[#8C68FF]/30" />
                                        </div>
                                    </div>

                                    {/* Custom Scrollbar visual element */}
                                    <div className="hidden sm:block absolute right-3 top-4 w-[9px] h-[200px] bg-[#777B84] rounded-full" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* DOCUMENT DETAILS CARD */}
                    <div className="bg-white rounded-[16px] border border-[#E1E6F3] overflow-hidden">
                        <div className="h-[56px] px-6 border-b border-[#E1E6F3] flex items-center">
                            <h3 className="text-[18px] font-bold text-[#0B123D]">Document Details</h3>
                        </div>

                        <div className="p-4 sm:p-7 space-y-0 divide-y divide-[#E1E6F3]">

                            {/* Row 1 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-[13px] sm:text-[14px] text-[#64708C]">Resource Type</span>
                                <span className="inline-block px-3 py-1 bg-[#00C58A]/10 text-[#00C58A] text-[12px] sm:text-[13px] font-semibold rounded-full w-fit">
                                    Lecture Notes
                                </span>
                            </div>

                            {/* Row 2 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-[13px] sm:text-[14px] text-[#64708C]">Course</span>
                                <span className="text-[14px] font-semibold text-[#0B123D]">
                                    CSC 401 – Introduction to Machine Learning
                                </span>
                            </div>

                            {/* Row 3 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-[13px] sm:text-[14px] text-[#64708C]">Uploaded by</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-[#245CFF] rounded-full text-white font-bold text-[12px] flex items-center justify-center">
                                        Dr
                                    </div>
                                    <span className="text-[14px] font-semibold text-[#0B123D]">Dr. Amaka Osei</span>
                                    <span className="px-2.5 py-0.5 bg-[#245CFF]/10 text-[#245CFF] text-[12px] font-semibold rounded-full">
                                        Lecturer
                                    </span>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-[13px] sm:text-[14px] text-[#64708C]">Year / Semester</span>
                                <span className="text-[14px] font-semibold text-[#0B123D]">2023 / First Semester</span>
                            </div>

                            {/* Row 5 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-[13px] sm:text-[14px] text-[#64708C]">File Size</span>
                                <span className="text-[14px] font-semibold text-[#0B123D]">
                                    2.4 MB · PDF Document · 24 pages
                                </span>
                            </div>

                            {/* Row 6 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-[13px] sm:text-[14px] text-[#64708C]">Downloads</span>
                                <span className="text-[14px] font-semibold text-[#0B123D]">125 total · 18 this week</span>
                            </div>

                            {/* Row 7 */}
                            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-[13px] sm:text-[14px] text-[#64708C]">Tags</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {['Machine Learning', 'AI', 'Algorithms', 'CSC 401'].map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-[#F3F4F6] border border-[#E1E6F3] text-[#0B123D] text-[12px] sm:text-[13px] rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* DISCUSSION SECTION */}
                    <div className="bg-white rounded-[16px] border border-[#E1E6F3] overflow-hidden">

                        {/* DISCUSSION HEADER */}
                        <div className="h-[60px] px-4 sm:px-7 border-b border-[#E1E6F3] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[18px] sm:text-[20px] font-bold text-[#0B123D]">Discussion</h3>
                                <span className="px-2.5 py-0.5 bg-[#245CFF]/10 text-[#245CFF] text-[12px] sm:text-[13px] font-bold rounded-full">
                                    14 comments
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[13px] text-[#64708C]">
                                <span>Sort by:</span>
                                <button className="text-[#245CFF] font-semibold flex items-center gap-1">
                                    Most Recent <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* COMMENTS CONTENT AREA */}
                        <div className="p-4 sm:p-7 space-y-6">

                            {/* COMMENT INPUT FORM */}
                            <div className="flex gap-3 sm:gap-4 items-start">
                                <div className="w-10 h-10 bg-[#245CFF] rounded-full text-white font-bold text-[15px] flex items-center justify-center flex-shrink-0">
                                    JD
                                </div>

                                <div className="flex-1 bg-white rounded-[12px] border-2 border-[#245CFF] p-4 space-y-4">
                                    <textarea
                                        rows={3}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="w-full text-[14px] text-[#0B123D] placeholder-[#64708C] focus:outline-none resize-none leading-relaxed"
                                    />

                                    <div className="flex items-center justify-between pt-2 border-t border-[#E1E6F3]/50">
                                        <div className="flex items-center gap-2">
                                            <button className="w-7 h-7 bg-[#F3F4F6] rounded-[6px] text-[#64708C] font-bold flex items-center justify-center hover:bg-slate-200">
                                                <Bold className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="w-7 h-7 bg-[#F3F4F6] rounded-[6px] text-[#64708C] italic flex items-center justify-center hover:bg-slate-200">
                                                <Italic className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="w-7 h-7 bg-[#F3F4F6] rounded-[6px] text-[#64708C] flex items-center justify-center hover:bg-slate-200">
                                                <LinkIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <button className="px-5 py-2 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-[14px] font-semibold rounded-[8px] hover:opacity-95">
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-[#E1E6F3]" />

                            {/* PINNED LECTURER COMMENT */}
                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-10 h-10 bg-[#FF4869] rounded-full text-white font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                                    AO
                                </div>

                                <div className="flex-1 space-y-2.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[14px] font-bold text-[#0B123D]">Dr. Amaka Osei</span>
                                        <span className="px-2 py-0.5 bg-[#FF4869]/10 text-[#FF4869] text-[12px] font-semibold rounded-full">
                                            Lecturer
                                        </span>
                                        <span className="px-2 py-0.5 bg-[#FF9D25]/10 text-[#FF9D25] text-[12px] font-semibold rounded-full">
                                            📌 Pinned
                                        </span>
                                        <span className="text-[13px] text-[#64708C]">3 days ago</span>
                                    </div>

                                    <div className="p-3.5 bg-[#FFF9F5] border border-[#FF9D25]/20 rounded-[12px]">
                                        <p className="text-[14px] text-[#0B123D] leading-relaxed">
                                            Welcome to this resource! These notes were prepared for the 2023/24 CSC 401 cohort. If you have questions or find any errors, please leave a comment below and I&apos;ll respond as soon as possible. For chapter-specific queries, mention the page number so I can help you faster. Happy studying! 🎓
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-5 text-[13px] text-[#64708C]">
                                        <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#0B123D]">
                                            <ThumbsUp className="w-3.5 h-3.5" /> 24 likes
                                        </span>
                                        <button className="text-[#245CFF] font-semibold hover:underline">Reply</button>
                                        <span>·</span>
                                        <button className="text-[#64708C] hover:underline">Report</button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-[#E1E6F3]" />

                            {/* THREADED COMMENT WITH REPLIES */}
                            <div className="space-y-4">
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="w-10 h-10 bg-[#7148FF] rounded-full text-white font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                                        KM
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-bold text-[#0B123D]">Kwame Mensah</span>
                                            <span className="px-2 py-0.5 bg-[#7148FF]/10 text-[#7148FF] text-[12px] font-semibold rounded-full">
                                                Student
                                            </span>
                                            <span className="text-[13px] text-[#64708C]">2 days ago</span>
                                        </div>

                                        <p className="text-[14px] text-[#0B123D] leading-relaxed">
                                            Page 7 on the bias-variance tradeoff is super well explained. I&apos;d been struggling with this concept for weeks and this diagram finally made it click! Does anyone know if the original source paper for Figure 3 is cited somewhere?
                                        </p>

                                        <div className="flex items-center gap-5 text-[13px]">
                                            <span className="text-[#245CFF] font-semibold flex items-center gap-1 cursor-pointer">
                                                <ThumbsUp className="w-3.5 h-3.5" /> 9 likes
                                            </span>
                                            <button className="text-[#245CFF] font-semibold hover:underline">Reply</button>
                                            <span className="text-[#B8BFCD]">·</span>
                                            <button className="text-[#64708C] hover:underline">Report</button>
                                        </div>
                                    </div>
                                </div>

                                {/* THREAD REPLIES CONTAINER */}
                                <div className="pl-6 sm:pl-12 border-l-2 border-[#E1E6F3] space-y-4">

                                    {/* Reply 1 */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-[#FF4869] rounded-full text-white font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                                            AO
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-[#0B123D]">Dr. Amaka Osei</span>
                                                <span className="px-2 py-0.5 bg-[#FF4869]/10 text-[#FF4869] text-[11px] font-semibold rounded-full">
                                                    Lecturer
                                                </span>
                                                <span className="text-[12px] text-[#64708C]">2 days ago</span>
                                            </div>
                                            <div className="p-3 bg-[#F9FAFE] border border-[#E1E6F3] rounded-[10px]">
                                                <p className="text-[13px] text-[#0B123D] leading-relaxed">
                                                    @Kwame Great question! Figure 3 is adapted from Hastie et al. &quot;The Elements of Statistical Learning&quot; (2nd ed., 2009), p. 37. I&apos;ll add a formal citation in the next version of these notes.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 text-[12px] text-[#64708C]">
                                                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> 6</span>
                                                <button className="text-[#245CFF] font-semibold hover:underline">Reply</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reply 2 */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-[#00C58A] rounded-full text-white font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                                            ZA
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-[#0B123D]">Zainab Aliyu</span>
                                                <span className="px-2 py-0.5 bg-[#00C58A]/10 text-[#00C58A] text-[11px] font-semibold rounded-full">
                                                    Student
                                                </span>
                                                <span className="text-[12px] text-[#64708C]">1 day ago</span>
                                            </div>
                                            <p className="text-[13px] text-[#0B123D] leading-relaxed">
                                                Thanks for clarifying, Dr. Osei! That book has been on my reading list — now I have an extra reason to pick it up 😊
                                            </p>
                                            <div className="flex items-center gap-4 text-[12px] text-[#64708C]">
                                                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> 3</span>
                                                <button className="text-[#245CFF] font-semibold hover:underline">Reply</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Reply Editor Box */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-[#245CFF] rounded-full text-white font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                                            JD
                                        </div>
                                        <div className="flex-1 bg-white rounded-[10px] border-2 border-[#245CFF] p-3 space-y-3">
                                            <div className="text-[13px] text-[#0B123D]">
                                                <span className="text-[#245CFF] font-semibold">@Zainab</span> Same here! Also, the section on k-NN was really intuitive.
                                            </div>
                                            <div className="flex items-center justify-between border-t border-[#E1E6F3]/50 pt-2 text-[12px]">
                                                <span className="text-[#B8BFCD]">Replying to Kwame&apos;s thread</span>
                                                <div className="flex items-center gap-2">
                                                    <button className="px-3 py-1.5 bg-[#F3F4F6] text-[#64708C] font-semibold rounded-[6px] hover:bg-slate-200">
                                                        Cancel
                                                    </button>
                                                    <button className="px-3 py-1.5 bg-[#245CFF] text-white font-semibold rounded-[6px] hover:opacity-95">
                                                        Post Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="h-[1px] bg-[#E1E6F3]" />

                            {/* FLAGGED / MODERATED COMMENT */}
                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-10 h-10 bg-[#B8BFCD] rounded-full text-white font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                                    UN
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-bold text-[#0B123D]">Unknown User</span>
                                        <span className="px-2 py-0.5 bg-[#FF4869]/10 text-[#FF4869] text-[12px] font-semibold rounded-full flex items-center gap-1">
                                            <Flag className="w-3 h-3" /> Flagged
                                        </span>
                                        <span className="text-[13px] text-[#64708C]">4 hours ago</span>
                                    </div>

                                    <div className="p-3.5 bg-[#FFF5F7] border border-[#FF4869]/20 rounded-[10px]">
                                        <p className="text-[14px] text-[#64708C] italic">
                                            [This comment has been flagged for review and is pending moderation.]
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-[13px]">
                                        <button className="text-[#64708C] font-semibold hover:underline">Dismiss</button>
                                        <span className="text-[#B8BFCD]">·</span>
                                        <button className="text-[#FF4869] font-semibold hover:underline">Remove Comment</button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-[#E1E6F3]" />

                            {/* USER'S OWN COMMENT */}
                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-10 h-10 bg-[#245CFF] rounded-full text-white font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                                    JD
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-bold text-[#0B123D]">{currentUser.full_name || currentUser.username || 'User'}</span>
                                        <span className="px-2 py-0.5 bg-[#245CFF]/10 text-[#245CFF] text-[12px] font-semibold rounded-full">
                                            You
                                        </span>
                                        <span className="text-[13px] text-[#64708C]">Just now</span>
                                    </div>

                                    <p className="text-[14px] text-[#0B123D] leading-relaxed">
                                        These are hands-down the best ML notes I&apos;ve found on the platform. The visual on page 12 showing the decision boundary was especially helpful. Thank you Dr. Osei! 🙌
                                    </p>

                                    <div className="flex items-center gap-4 text-[13px] text-[#64708C]">
                                        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> 0 likes</span>
                                        <button className="text-[#245CFF] font-semibold hover:underline">Reply</button>
                                        <span>·</span>
                                        <button className="hover:underline">Edit</button>
                                        <span>·</span>
                                        <button className="text-[#FF4869] hover:underline">Delete</button>
                                    </div>
                                </div>
                            </div>

                            {/* LOAD MORE COMMENTS BUTTON */}
                            <div className="pt-2 flex justify-center">
                                <button className="px-7 py-2.5 bg-white border border-[#E1E6F3] text-[#245CFF] text-[14px] font-semibold rounded-[8px] hover:bg-slate-50 transition-colors">
                                    Load 9 more comments
                                </button>
                            </div>

                        </div>
                    </div>

                </main>

                <Footer />

                {/* MOBILE BOTTOM NAVIGATION BAR */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#E1E6F3] px-2 flex items-center justify-around z-40">
                    <NextLink href="/student/dashboard" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <Home className="w-5 h-5" />
                        <span className="text-[10px]">Home</span>
                    </NextLink>
                    <NextLink href="/student/search" className="flex flex-col items-center gap-1 text-[#245CFF] font-bold bg-[#E9EDFF] px-3 py-1 rounded-[8px]">
                        <Search className="w-5 h-5" />
                        <span className="text-[10px]">Search</span>
                    </NextLink>
                    <NextLink href="/past-questions" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <HelpCircle className="w-5 h-5" />
                        <span className="text-[10px]">Questions</span>
                    </NextLink>
                    <NextLink href="/projects" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <Folder className="w-5 h-5" />
                        <span className="text-[10px]">Projects</span>
                    </NextLink>
                    <NextLink href="/knowledge" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-[10px]">Knowledge</span>
                    </NextLink>
                </div>

            </div>
        </div>
    );
}