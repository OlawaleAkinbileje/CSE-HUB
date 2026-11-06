'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import SearchInput from '@/components/ui/SearchInput';
import CategoryCard from '@/components/ui/CategoryCard';
import {
  FileText,
  FolderGit2,
  BookMarked,
  Code,
  Search,
  Eye,
  Download,
  BookOpenCheck
} from 'lucide-react';
import Footer from '@/components/layout/footer'

export default function LandingPage() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/student/search?q=${encodeURIComponent(query)}`);
  };

  const popularTags = [
    'Machine Learning',
    'Web Development',
    'Data Structures',
    'Final Year Projects'
  ];

  const categoryCards = [
    {
      title: 'Past Questions',
      bgColor: '#6460FF',
      icon: FileText,
      slug: 'past-questions'
    },
    {
      title: 'Projects',
      bgColor: '#8C4DFF',
      icon: FolderGit2,
      slug: 'projects'
    },
    {
      title: 'Lecture Notes',
      bgColor: '#14B9CA',
      icon: BookMarked,
      slug: 'lecture-notes'
    },
    {
      title: 'Code Samples',
      bgColor: '#514BFF',
      icon: Code,
      slug: 'code-samples'
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F6FCFF] via-[#F0ECFF] to-[#F7FCFF] overflow-hidden rounded-[24px] flex flex-col font-sans text-[#0B123D]">

      {/* 1. REUSABLE GLOBAL NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION & CATEGORIES */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 lg:px-[142px] pt-8 sm:pt-[40px] pb-16 flex flex-col gap-12 sm:gap-[40px]">

        {/* Top Hero Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[24px] items-center">

          {/* Left Text + Reusable Search Input Box */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-[650px]">

            {/* Headline */}
            <h1 className="text-[42px] sm:text-[52px] lg:text-[60px] font-bold leading-[1.07] tracking-tight text-[#0B123D]">
              Discover<br />
              Explore<br />
              Learn<br />
              <span className="text-[#7148FF]">Grow</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.45] text-[#495471] max-w-[590px]">
              A centralized search engine for past questions, projects, lecture notes, and learning resources from the Department of Computer Science and Engineering.
            </p>

            {/* Reusable Search Component */}
            <SearchInput onSearch={handleSearch} />

            {/* Popular Search Tags */}
            <div className="flex flex-wrap items-center gap-[10px] pt-1">
              <span className="text-[14px] font-semibold leading-[20.3px] text-[#0B123D]">Popular:</span>
              {popularTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(tag)}
                  className="px-[12px] py-[6px] bg-[#E3E9FF] rounded-full text-[12px] sm:text-[13px] font-normal leading-[17.4px] text-[#0B123D] hover:bg-[#d0daff] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>

          {/* Right Hero Frame with Floating Badge & Widget */}
          <div className="lg:col-span-5 flex justify-center w-full mt-4 lg:mt-0">
            <div className="relative w-full max-w-[510px] h-[400px] sm:h-[500px] lg:h-[550px] rounded-[24px] overflow-hidden flex items-start justify-start">

              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="CSE Students Collaborating"
                className="absolute inset-0 w-full h-full object-cover rounded-[24px]"
              />

              <div className="absolute left-0 top-[280px] w-[62px] h-[270px] bg-gradient-to-r from-[#F0ECFF] via-[#F0ECFF]/75 to-transparent pointer-events-none" />

              <div className="absolute left-[14px] top-[100px] sm:top-[140px] w-[116px] p-3 bg-[#7148FF] rounded-[16px] text-white text-[13px] font-semibold leading-[18.85px] shadow-md z-10">
                Access the right resources
              </div>

              <div className="absolute right-[10px] sm:right-[20px] bottom-[20px] sm:bottom-[30px] w-[160px] p-[22px] bg-white rounded-[24px] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex flex-col gap-[12px] z-10 border border-[#E1E6F3]/50">

                <div className="flex items-center gap-[12px]">
                  <Search className="w-[18px] h-[18px] text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Search</span>
                </div>

                <div className="flex items-center gap-[12px]">
                  <Eye className="w-[18px] h-[18px] text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Preview</span>
                </div>

                <div className="flex items-center gap-[12px]">
                  <Download className="w-[18px] h-[18px] text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Download</span>
                </div>

                <div className="flex items-center gap-[12px]">
                  <BookOpenCheck className="w-[18px] h-[18px] text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Learn</span>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* 3. REUSABLE CATEGORY CARDS GRID */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[22px]">
          {categoryCards.map((card, idx) => (
            <CategoryCard
              key={idx}
              title={card.title}
              bgColor={card.bgColor}
              icon={card.icon}
              onClick={() => router.push(`/student/search?category=${encodeURIComponent(card.slug)}`)}
            />
          ))}
        </div>

      </main>
      <Footer />

    </div>
  );
}