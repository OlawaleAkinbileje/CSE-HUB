'use client';

import Link from 'next/link';

interface FooterProps {
    links?: { label: string; href: string }[];
}

const defaultLinks = [
    { label: 'Notifications', href: '/notifications' },
    { label: 'Help & Support', href: '/support' },
    { label: 'About CSE Hub', href: '/about' },
];

export default function Footer({ links = defaultLinks }: FooterProps) {
    return (
        <footer className="px-4 sm:px-8 py-5 border-t border-[#E1E6F3] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#64708C] bg-white lg:bg-transparent">
            {/* Footer Navigation Links */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.href}
                        className="hover:underline hover:text-[#0B123D] transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Copyright Notice */}
            <div className="text-center sm:text-right font-medium">
                © 2026 Olawale Akinbileje Emmanuel. All rights reserved.
            </div>
        </footer>
    );
}