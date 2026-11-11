'use client';

import { Suspense, useEffect, useState } from 'react';
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
    Home,
    Info,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { notifyCurrentUserChanged, useCurrentUser } from '@/lib/useCurrentUser';
import Cookies from 'js-cookie';

interface SidebarProps {
    userRole?: 'student' | 'staff' | 'admin';
}

function SidebarContent({ userRole }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
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

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setCollapsed(window.localStorage.getItem('csehub-sidebar-collapsed') === 'true');
        });
        return () => window.cancelAnimationFrame(frame);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((current) => {
            const next = !current;
            window.localStorage.setItem('csehub-sidebar-collapsed', String(next));
            return next;
        });
    };

    const handleLogout = () => {
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
        { label: 'Search Resources', icon: Search, href: '/search' },
        { label: 'Past Questions', icon: FileText, href: '/past-questions' },
        { label: 'Projects', icon: FolderGit2, href: '/projects' },
        { label: 'Lecture Notes', icon: BookMarked, href: '/search?category=lecture-notes' },
        { label: 'Code Samples', icon: Code, href: '/code-preview' },
        { label: 'Knowledge Hub', icon: Layers, href: '/knowledge' },
        { label: 'Resources', icon: Bookmark, href: '/my-resources' },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
        { label: 'Help & Support', icon: HelpCircle, href: '/support' },
        { label: 'Profile', icon: User, href: '/profile' },
    ];

    const staffNav = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/staff/dashboard' },
        { label: 'Upload Resource', icon: UploadCloud, href: '/staff/upload' },
        { label: 'Manage Resources', icon: FolderKanban, href: '/staff/manage-resources' },
        { label: 'Review Submissions', icon: FileSearch, href: '/staff/review-submissions' },
        { label: 'Resources', icon: Bookmark, href: '/my-resources' },
        { label: 'Notifications', icon: Bell, href: '/notifications' },
        { label: 'Help & Support', icon: HelpCircle, href: '/support' },
        { label: 'Profile', icon: User, href: '/profile' },
    ];

    const adminNav = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Manage Users', icon: Users, href: '/admin/users' },
        { label: 'Categories & Courses', icon: FolderKanban, href: '/admin/categories' },
        { label: 'Manage Resources', icon: FileSearch, href: '/staff/manage-resources' },
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
        <aside className={`hidden md:flex ${collapsed ? 'w-[72px]' : 'w-64 md:w-72'} bg-white border-r border-[#E1E6F3] flex-col justify-between sticky top-[76px] h-[calc(100vh-76px)] z-20 shrink-0 transition-[width] duration-200`}>
            <div className="flex-1 overflow-y-auto">
                <div className={`flex h-14 items-center border-b border-[#E1E6F3] ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
                    {!collapsed && <span className="text-xs font-semibold tracking-wide text-[#64708C]">NAVIGATION</span>}
                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-expanded={!collapsed}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64708C] hover:bg-[#F6F8FF] hover:text-[#245CFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245CFF]"
                    >
                        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </button>
                </div>
                {/* Dynamic Navigation Items */}
                <nav className={`space-y-1 ${collapsed ? 'p-2' : 'p-4'}`}>
                    {navItems.map((item, idx) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href.includes('?') && pathname.includes(item.href.split('?')[0]));

                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                title={collapsed ? item.label : undefined}
                                className={`group/item relative flex h-11 items-center rounded-lg text-sm transition-all ${collapsed ? 'justify-center px-0' : 'justify-between px-3.5'} ${isActive
                                    ? 'bg-[#E9EDFF] text-[#245CFF] font-semibold relative'
                                    : 'text-[#0B123D] hover:bg-[#F6F8FF] font-normal'
                                    }`}
                            >
                                <div className={`flex min-w-0 items-center ${collapsed ? 'justify-center' : 'gap-3.5'}`}>
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#245CFF]' : 'text-[#0B123D]'}`} />
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </div>
                                {collapsed && (
                                    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B123D] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/item:opacity-100 group-focus-visible/item:opacity-100">
                                        {item.label}
                                    </span>
                                )}
                                {isActive && !collapsed && <div className="w-1 h-6 bg-[#245CFF] rounded-full" />}
                                {isActive && collapsed && <div className="absolute right-0 h-6 w-1 rounded-full bg-[#245CFF]" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Footer Links */}
            <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-[#E1E6F3] space-y-2`}>
                <div className={`space-y-1 mb-2 pb-2 border-b border-[#E1E6F3] ${collapsed ? 'flex flex-col items-center' : ''}`}>
                    <Link
                        href="/"
                        title={collapsed ? 'Home' : undefined}
                        className={`flex items-center gap-3.5 px-3.5 h-9 rounded-lg text-xs font-normal transition-all ${pathname === '/'
                            ? 'bg-[#E9EDFF] text-[#245CFF] font-semibold'
                            : 'text-[#64708C] hover:text-[#0B123D]'
                            } ${collapsed ? 'group/item relative w-11 justify-center px-0' : ''}`}
                    >
                        <Home className="w-4 h-4" />
                        {!collapsed && <span>Home</span>}
                        {collapsed && <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B123D] px-3 py-2 text-xs text-white opacity-0 shadow-lg group-hover/item:opacity-100">Home</span>}
                    </Link>
                    <Link
                        href="/about"
                        title={collapsed ? 'About CSE Hub' : undefined}
                        className={`flex items-center gap-3.5 px-3.5 h-9 rounded-lg text-xs font-normal transition-all ${pathname === '/about'
                            ? 'bg-[#E9EDFF] text-[#245CFF] font-semibold'
                            : 'text-[#64708C] hover:text-[#0B123D]'
                            } ${collapsed ? 'group/item relative w-11 justify-center px-0' : ''}`}
                    >
                        <Info className="w-4 h-4" />
                        {!collapsed && <span>About CSE Hub</span>}
                        {collapsed && <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B123D] px-3 py-2 text-xs text-white opacity-0 shadow-lg group-hover/item:opacity-100">About CSE Hub</span>}
                    </Link>
                </div>

                {/* User Info & Logout Button */}
                <Link href="/profile" title={collapsed ? resolvedName : undefined} className={`group/item relative flex items-center gap-3 rounded-xl bg-[#F6F8FF] p-2 transition-colors hover:bg-[#E9EDFF] ${collapsed ? 'justify-center' : ''}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#245CFF]/10 text-xs font-bold text-[#245CFF]">
                        {currentUser.initials || resolvedName.slice(0, 2).toUpperCase()}
                    </div>
                    {!collapsed && <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-xs font-bold text-[#0B123D] truncate">{resolvedName}</span>
                        <span className="text-[10px] text-[#64708C] truncate">{resolvedCode}</span>
                    </div>}
                    {collapsed && <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B123D] px-3 py-2 text-xs text-white opacity-0 shadow-lg group-hover/item:opacity-100">{resolvedName} · {resolvedCode}</span>}
                </Link>

                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Sign Out' : undefined}
                    className={`group/item relative flex w-full items-center gap-3 rounded-lg py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 ${collapsed ? 'justify-center px-0' : 'px-4'}`}
                >
                    <LogOut className="w-4 h-4" />
                    {!collapsed && <span>Sign Out</span>}
                    {collapsed && <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B123D] px-3 py-2 text-xs text-white opacity-0 shadow-lg group-hover/item:opacity-100">Sign Out</span>}
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
