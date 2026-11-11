'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import {
    Download,
    Copy,
    Check,
    Code
} from 'lucide-react';
import { useCodePreview } from '@/lib/queries';
import DataContainer from '@/components/ui/DataContainer';

export default function CodePreviewPage() {
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
        <div className="w-full min-h-screen bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex-1 min-h-0 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

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

            </div>
            </div>
        </div>
    );
}
