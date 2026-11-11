'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    <div className="w-full min-h-screen bg-linear-to-br from-[#F6FCFF] via-[#F0ECFF] to-[#F7FCFF] overflow-hidden rounded-3xl flex flex-col font-sans text-[#0B123D]">

      {/* 1. REUSABLE GLOBAL NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION & CATEGORIES */}
      <main className="flex-1 max-w-360 mx-auto w-full px-6 sm:px-10 lg:px-35.5 pt-8 sm:pt-10 pb-16 flex flex-col gap-12 sm:gap-10">

        {/* Top Hero Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* Left Text + Reusable Search Input Box */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-162.5">

            {/* Headline */}
            <h1 className="text-[42px] sm:text-[52px] lg:text-[60px] font-bold leading-[1.07] tracking-tight text-[#0B123D]">
              Discover<br />
              Explore<br />
              Learn<br />
              <span className="text-[#7148FF]">Grow</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.45] text-[#495471] max-w-147.5">
              A centralized search engine for past questions, projects, lecture notes, and learning resources from the Department of Computer Science and Engineering.
            </p>

            {/* Reusable Search Component */}
            <SearchInput onSearch={handleSearch} />

            {/* Popular Search Tags */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="text-[14px] font-semibold leading-[20.3px] text-[#0B123D]">Popular:</span>
              {popularTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(tag)}
                  className="px-3 py-1.5 bg-[#E3E9FF] rounded-full text-[12px] sm:text-[13px] font-normal leading-[17.4px] text-[#0B123D] hover:bg-[#d0daff] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>

          {/* Right Hero Frame with Floating Badge & Widget */}
          <div className="lg:col-span-5 flex justify-center w-full mt-4 lg:mt-0">
            <div className="relative w-full max-w-127.5 h-100 sm:h-125 lg:h-137.5 rounded-3xl overflow-hidden flex items-start justify-start">

              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="CSE Students Collaborating"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
              />

              <div className="absolute left-0 top-70 w-15.5 h-67.5 bg-linear-to-r from-[#F0ECFF] via-[#F0ECFF]/75 to-transparent pointer-events-none" />

              <div className="absolute left-3.5 top-25 sm:top-35 w-29 p-3 bg-[#7148FF] rounded-2xl text-white text-[13px] font-semibold leading-[18.85px] shadow-md z-10">
                Access the right resources
              </div>

              <div className="absolute right-2.5 sm:right-5 bottom-5 sm:bottom-7.5 w-40 p-5.5 bg-white rounded-3xl shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex flex-col gap-3 z-10 border border-[#E1E6F3]/50">

                <div className="flex items-center gap-3">
                  <Search className="w-4.5 h-4.5 text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Search</span>
                </div>

                <div className="flex items-center gap-3">
                  <Eye className="w-4.5 h-4.5 text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Preview</span>
                </div>

                <div className="flex items-center gap-3">
                  <Download className="w-4.5 h-4.5 text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Download</span>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpenCheck className="w-4.5 h-4.5 text-[#245CFF]" />
                  <span className="text-[14px] font-semibold text-[#0B123D]">Learn</span>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* 3. REUSABLE CATEGORY CARDS GRID */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5.5">
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