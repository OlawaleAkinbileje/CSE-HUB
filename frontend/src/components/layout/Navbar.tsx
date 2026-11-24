'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { notifyCurrentUserChanged, useCurrentUser } from '@/lib/useCurrentUser';
import UserAvatar from '@/components/ui/UserAvatar';
import { usePublicAppSettings } from '@/lib/queries';
import Cookies from 'js-cookie';

interface NavbarProps {
    userRole?: 'student' | 'staff' | 'admin';
    userRoleTitle?: string;
}

export default function Navbar({
    userRole,
    userRoleTitle,
}: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const currentUser = useCurrentUser();
    const { data: appSettings } = usePublicAppSettings();

    const resolvedRole = userRole || currentUser.role || 'student';
    const resolvedName = currentUser.full_name || currentUser.username || currentUser.email || 'User';

    const defaultTitle =
        userRoleTitle ||
        (resolvedRole === 'admin'
            ? 'Administrator'
            : resolvedRole === 'staff'
                ? 'Staff'
                : 'Student');

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('user_name');
        Cookies.remove('user_username');
        Cookies.remove('user_email');
        Cookies.remove('user_avatar_url');
        Cookies.remove('user_department_id');
        Cookies.remove('user_is_verified');
        Cookies.remove('profile_loaded');
        notifyCurrentUserChanged();
        router.push('/login');
    };

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setMobileMenuOpen(false);
        }
    };

    const mobileLinkClass = (href: string) =>
        `rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === href
                ? 'bg-[#E9EDFF] text-[#245CFF]'
                : 'text-[#0B123D] hover:bg-[#F6F8FF]'
        }`;

    return (
        <header className="h-19 bg-white border-b border-[#E1E6F3] px-4 md:px-7 flex items-center justify-between sticky top-0 z-30 w-full">
            {/* Brand Header — Unified CSE Hub branding */}
            <Link href="/" className="flex items-center gap-3 w-auto md:w-64.5">
                <div className="w-9 h-9.5 bg-[#245CFF] rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm">
                    C
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B123D]">
                    {appSettings?.appName || 'CSE Hub'}
                </span>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-155 mx-6 items-center gap-3 px-4 h-10.75 bg-white border border-[#E1E6F3] rounded-lg focus-within:ring-2 focus-within:ring-[#245CFF]">
                <Search className="w-4 h-4 shrink-0 text-[#64708C]" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Search resources"
                    placeholder="Search for resources, topics, or keywords..."
                    className="w-full bg-transparent text-sm text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                />
            </form>

            {/* Right User Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {currentUser.isAuthenticated ? (
                    <>
                        <Link
                            href="/notifications"
                            aria-label="Notifications"
                            className="p-2 text-[#0B123D] hover:bg-[#F6F8FF] rounded-full transition-colors"
                        >
                            <Bell className="w-5 h-5 text-[#0B123D]" />
                        </Link>
                        <Link href="/profile" className="flex items-center gap-3 cursor-pointer">
                            <UserAvatar
                                name={resolvedName}
                                avatarUrl={currentUser.avatar_url}
                                className="h-9 w-9 border border-[#E1E6F3] text-xs"
                            />
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-sm font-bold text-[#0B123D] leading-tight">
                                    {resolvedName}
                                </span>
                                <span className="text-xs text-[#64708C]">{defaultTitle}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[#64708C] hidden sm:block" />
                        </Link>
                    </>
                ) : (
                    <div className="hidden items-center gap-2 sm:flex">
                        <Link
                            href="/login"
                            className="rounded-lg border border-[#245CFF] px-4 py-2 text-sm font-semibold text-[#245CFF] transition-colors hover:bg-[#F6F8FF]"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-[#245CFF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Sign up
                        </Link>
                    </div>
                )}

                {/* Mobile Hamburger Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={mobileMenuOpen}
                    className="md:hidden p-2 text-[#0B123D] hover:bg-[#F6F8FF] rounded-lg"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-19 max-h-[calc(100vh-76px)] overflow-y-auto bg-white border-b border-[#E1E6F3] p-4 shadow-lg space-y-4 z-50">
                    <form onSubmit={handleSearch} className="flex items-center gap-3 px-3 py-2 bg-[#F6F8FF] rounded-lg border border-[#E1E6F3]">
                        <Search className="w-4 h-4 text-[#64708C]" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            aria-label="Search resources"
                            placeholder="Search resources..."
                            className="w-full bg-transparent text-sm text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                        />
                        <button type="submit" className="text-sm font-semibold text-[#245CFF]">Go</button>
                    </form>

                    <nav className="flex flex-col space-y-1">
                        {currentUser.isAuthenticated && resolvedRole === 'student' && (
                            <>
                                <Link
                                    href="/student/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/student/dashboard')}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/search"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/search')}
                                >
                                    Search Resources
                                </Link>
                                <Link
                                    href="/past-questions"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/past-questions')}
                                >
                                    Past Questions
                                </Link>
                                <Link
                                    href="/projects"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/projects')}
                                >
                                    Projects
                                </Link>
                                <Link
                                    href="/search?category=lecture-notes"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/search')}
                                >
                                    Lecture Notes
                                </Link>
                                <Link
                                    href="/code-preview"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/code-preview')}
                                >
                                    Code Samples
                                </Link>
                                <Link
                                    href="/knowledge"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/knowledge')}
                                >
                                    Knowledge Hub
                                </Link>
                                <Link
                                    href="/my-resources"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/my-resources')}
                                >
                                    My Resources
                                </Link>
                            </>
                        )}

                        {currentUser.isAuthenticated && resolvedRole === 'staff' && (
                            <>
                                <Link
                                    href="/staff/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/staff/dashboard')}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/staff/upload"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/staff/upload')}
                                >
                                    Upload Resource
                                </Link>
                                <Link
                                    href="/staff/manage-resources"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/staff/manage-resources')}
                                >
                                    Manage Resources
                                </Link>
                                <Link
                                    href="/my-resources"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/my-resources')}
                                >
                                    Resources
                                </Link>
                            </>
                        )}

                        {currentUser.isAuthenticated && resolvedRole === 'admin' && (
                            <>
                                <Link
                                    href="/admin/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/admin/dashboard')}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/users"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/admin/users')}
                                >
                                    User Management
                                </Link>
                                <Link
                                    href="/admin/categories"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/admin/categories')}
                                >
                                    Category & Courses
                                </Link>
                                <Link
                                    href="/staff/manage-resources"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/staff/manage-resources')}
                                >
                                    Manage Resources
                                </Link>
                                <Link
                                    href="/admin/analytics"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/admin/analytics')}
                                >
                                    Analytics
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/admin/settings')}
                                >
                                    System Settings
                                </Link>
                            </>
                        )}

                        {currentUser.isAuthenticated ? (
                        <div className="pt-2 border-t border-[#E1E6F3] flex flex-col space-y-1">
                            <Link
                                href="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass('/profile')}
                            >
                                My Profile
                            </Link>
                            <Link
                                href="/notifications"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass('/notifications')}
                            >
                                Notifications
                            </Link>
                            <Link
                                href="/support"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass('/support')}
                            >
                                Help & Support
                            </Link>
                        </div>
                        ) : (
                            <div className="pt-2 border-t border-[#E1E6F3] flex flex-col space-y-1">
                                <Link
                                    href="/search"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/search')}
                                >
                                    Browse resources
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/about')}
                                >
                                    About CSE Hub
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/login')}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={mobileLinkClass('/register')}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </nav>

                    {currentUser.isAuthenticated && <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>}
                </div>
            )}
        </header>
    );
}
