'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
    placeholder?: string;
    defaultValue?: string;
    onSearch: (query: string) => void;
    className?: string;
}

export default function SearchInput({
    placeholder = 'Search for past questions, projects, lecture notes...',
    defaultValue = '',
    onSearch,
    className = '',
}: SearchInputProps) {
    const [query, setQuery] = useState(defaultValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`w-full h-[61px] pl-[25px] pr-[7px] bg-white rounded-full shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center justify-between gap-3 border border-[#E1E6F3]/40 focus-within:ring-2 focus-within:ring-[#7148FF] transition-all ${className}`}
        >
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-[#0B123D] placeholder-[#64708C] text-[14px] sm:text-[15px] font-normal focus:outline-none"
            />
            <button
                type="submit"
                className="w-[48px] h-[48px] bg-[#7148FF] hover:bg-[#5b37db] rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors shadow-sm"
            >
                <Search className="w-[22px] h-[22px]" />
            </button>
        </form>
    );
}
