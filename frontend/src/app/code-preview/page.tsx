'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import {
    Search,
    Bell,
    ChevronDown,
    Download,
    Copy,
    Check,
    Home,
    HelpCircle,
    Folder,
    Code
} from 'lucide-react';
import { useCodePreview } from '@/lib/queries';
import DataContainer from '@/components/ui/DataContainer';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function CodePreviewPage() {
    const currentUser = useCurrentUser();
    const [globalSearch, setGlobalSearch] = useState('');
    const [copied, setCopied] = useState(false);

    const { data: codeData, isLoading } = useCodePreview();

    const rawCode = codeData?.code || '';
    const codeLines = rawCode
        ? rawCode.split('\n').map((line, idx) => ({
            num: idx + 1,
            content: line,
        }))
        : [];

    const handleCopy = () => {
        if (!rawCode) return;
        navigator.clipboard.writeText(rawCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!rawCode) return;
        const element = document.createElement('a');
        const file = new Blob([rawCode], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = codeData?.filename || 'code_sample.py';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

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

                    <main className="p-4 sm:p-6 lg:p-[32px] space-y-[24px] flex-1 max-w-[1280px] w-full mx-auto pb-20 lg:pb-8">

                        {/* PAGE HEADING & ACTIONS */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0B123D] leading-tight">
                                    {codeData?.title || 'Code Preview'}
                                </h1>
                                <p className="text-[14px] sm:text-[15px] text-[#64708C]">
                                    {codeData?.filename || 'code_sample.py'} · {codeLines.length} lines
                                </p>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={codeLines.length === 0}
                                    className="h-[46px] sm:h-[48px] px-5 sm:px-6 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white font-semibold text-[14px] sm:text-[16px] rounded-[8px] flex items-center gap-2.5 hover:opacity-95 transition-opacity disabled:opacity-50"
                                >
                                    <Download className="w-4.5 h-4.5" />
                                    <span>Download</span>
                                </button>

                                <button
                                    onClick={handleCopy}
                                    disabled={codeLines.length === 0}
                                    className="h-[46px] sm:h-[48px] px-5 sm:px-6 bg-white border border-[#E1E6F3] text-[#0B123D] font-semibold text-[14px] sm:text-[16px] rounded-[8px] flex items-center gap-2.5 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    {copied ? <Check className="w-4.5 h-4.5 text-green-600" /> : <Copy className="w-4.5 h-4.5" />}
                                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {/* CODE VIEWER BOX WITH DATA CONTAINER */}
                        <DataContainer
                            isLoading={isLoading}
                            data={codeLines}
                            emptyIcon={Code}
                            emptyTitle="No Code Available"
                            emptyDescription="There are currently no code snippets or preview files uploaded to display."
                            emptyAction={{
                                label: "Browse Projects",
                                href: "/projects",
                            }}
                            skeletonCount={5}
                            skeletonType="rows"
                        >
                            {(lines) => (
                                <div className="bg-[#161D23] rounded-[8px] overflow-hidden border border-[#161D23]">
                                    <div className="p-4 sm:p-5 overflow-x-auto">
                                        <div className="min-w-[650px] font-mono text-[14px] sm:text-[15px] space-y-1 sm:space-y-1.5">
                                            {lines.map((line) => (
                                                <div key={line.num} className="flex items-start">
                                                    <span className="w-[32px] sm:w-[36px] text-[#64708C] text-right pr-4 select-none flex-shrink-0 text-[12px] sm:text-[13px] pt-0.5">
                                                        {line.num}
                                                    </span>
                                                    <span className="flex-1 text-[#D7DCD6] whitespace-pre font-mono">
                                                        {line.content}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
                    <Link href="/past-questions" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <HelpCircle className="w-5 h-5" />
                        <span className="text-[10px]">Questions</span>
                    </Link>
                    <Link href="/projects" className="flex flex-col items-center gap-1 text-[#64708C]">
                        <Folder className="w-5 h-5" />
                        <span className="text-[10px]">Projects</span>
                    </Link>
                    <Link href="/code-preview" className="flex flex-col items-center gap-1 text-[#245CFF] font-bold bg-[#E9EDFF] px-3 py-1 rounded-[8px]">
                        <Code className="w-5 h-5" />
                        <span className="text-[10px]">Code</span>
                    </Link>
                </div>

            </div>
        </div>
    );
}
