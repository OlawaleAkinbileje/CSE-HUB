'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Search,
    FileText,
    FolderGit2,
    BookMarked,
    Code,
    Layers,
    Bookmark,
    User,
    UploadCloud,
    FolderKanban,
    FileSearch,
    BarChart2,
    Users,
    Settings,
    Bell,
    HelpCircle,
    Info,
    LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notifyCurrentUserChanged, useCurrentUser } from '@/lib/useCurrentUser';
import Cookies from 'js-cookie';

interface SidebarProps {
    userRole?: 'student' | 'staff' | 'admin';
}

function SidebarContent({ userRole }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentUser = useCurrentUser();

    const resolvedRole = userRole || currentUser.role || 'student';
    const resolvedName = currentUser.full_name || currentUser.username || currentUser.email || 'User';
    const resolvedCode = resolvedRole === 'staff'
        ? 'Staff'
        : resolvedRole === 'admin'
            ? 'Administrator'
            : currentUser.username || 'Student';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Clear all auth cookies
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('user_name');
        Cookies.remove('user_username');
        Cookies.remove('user_email');
        notifyCurrentUserChanged();
        router.push('/login');
    };

    // Shared & Role Navigation Links
    const studentNav = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
        { label: 'Search Resources', icon: Search, href: '/student/search' },
        { label: 'Past Questions', icon: FileText, href: '/past-questions' },
        { label: 'Projects', icon: FolderGit2, href: '/projects' },
        { label: 'Lecture Notes', icon: BookMarked, href: '/student/search?category=lecture-notes' },
        { label: 'Code Samples', icon: Code, href: '/code-preview' },
        { label: 'Knowledge Hub', icon: Layers, href: '/knowledge' },
        { label: 'My Resources', icon: Bookmark, href: '/my-resources' },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
        { label: 'Help & Support', icon: HelpCircle, href: '/support' },
        { label: 'Profile', icon: User, href: '/profile' },
    ];

    const staffNav = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/staff/dashboard' },
        { label: 'Upload Resource', icon: UploadCloud, href: '/staff/upload' },
        { label: 'Manage Resources', icon: FolderKanban, href: '/staff/manage-resources' },
        { label: 'Review Submissions', icon: FileSearch, href: '/staff/review-submissions' },
        { label: 'My Resources', icon: Bookmark, href: '/my-resources' },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
        { label: 'Help & Support', icon: HelpCircle, href: '/support' },
        { label: 'Profile', icon: User, href: '/profile' },
    ];

    const adminNav = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Manage Users', icon: Users, href: '/admin/users' },
        { label: 'Categories & Courses', icon: FolderKanban, href: '/admin/categories' },
        { label: 'System Settings', icon: Settings, href: '/admin/settings' },
        { label: 'Analytics', icon: BarChart2, href: '/admin/analytics' },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
        { label: 'Help & Support', icon: HelpCircle, href: '/support' },
        { label: 'Profile', icon: User, href: '/profile' },
    ];

    const getNavItems = () => {
        switch (resolvedRole) {
            case 'staff':
                return staffNav;
            case 'admin':
                return adminNav;
            default:
                return studentNav;
        }
    };

    const navItems = getNavItems();

    return (
        <aside className="w-64 md:w-72 bg-white border-r border-[#E1E6F3] flex flex-col justify-between hidden md:flex sticky top-[76px] h-[calc(100vh-76px)] z-20 shrink-0">
            <div className="flex-1 overflow-y-auto">
                {/* Dynamic Navigation Items */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item, idx) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href.includes('?') && pathname.includes(item.href.split('?')[0]));

                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 h-11 rounded-lg text-sm transition-all ${isActive
                                    ? 'bg-[#E9EDFF] text-[#245CFF] font-semibold relative'
                                    : 'text-[#0B123D] hover:bg-[#F6F8FF] font-normal'
                                    }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#245CFF]' : 'text-[#0B123D]'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && <div className="w-1 h-6 bg-[#245CFF] rounded-full" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Footer Links */}
            <div className="p-4 border-t border-[#E1E6F3] space-y-2">
                <div className="space-y-1 mb-2 pb-2 border-b border-[#E1E6F3]">
                    <Link
                        href="/about"
                        className={`flex items-center gap-3.5 px-3.5 h-9 rounded-lg text-xs font-normal transition-all ${pathname === '/about'
                            ? 'bg-[#E9EDFF] text-[#245CFF] font-semibold'
                            : 'text-[#64708C] hover:text-[#0B123D]'
                            }`}
                    >
                        <Info className="w-4 h-4" />
                        <span>About CSE Hub</span>
                    </Link>
                </div>

                {/* User Info & Logout Button */}
                <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl bg-[#F6F8FF] hover:bg-[#E9EDFF] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#245CFF]/10 text-[#245CFF] flex items-center justify-center font-bold text-xs">
                        {currentUser.initials || resolvedName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#0B123D] truncate">{resolvedName}</span>
                        <span className="text-[10px] text-[#64708C] truncate">{resolvedCode}</span>
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

export default function Sidebar(props: SidebarProps) {
    return (
        <Suspense fallback={<aside className="hidden w-64 shrink-0 md:block md:w-72" aria-hidden="true" />}>
            <SidebarContent {...props} />
        </Suspense>
    );
}
