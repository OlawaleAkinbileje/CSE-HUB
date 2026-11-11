'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { notifyCurrentUserChanged, useCurrentUser } from '@/lib/useCurrentUser';
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
    const router = useRouter();
    const currentUser = useCurrentUser();

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
        notifyCurrentUserChanged();
        router.push('/login');
    };

    return (
        <header className="h-19 bg-white border-b border-[#E1E6F3] px-4 md:px-7 flex items-center justify-between sticky top-0 z-30 w-full">
            {/* Brand Header — Unified CSE Hub branding */}
            <Link href="/" className="flex items-center gap-3 w-auto md:w-64.5">
                <div className="w-9 h-9.5 bg-[#245CFF] rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm">
                    C
                </div>
                <span className="text-xl md:text-2xl font-bold text-[#0B123D]">
                    CSE Hub
                </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-155 mx-6 items-center gap-3 px-4 h-10.75 bg-white border border-[#E1E6F3] rounded-lg">
                <Search className="w-4 h-4 text-[#64708C]" />
                <input
                    type="text"
                    placeholder="Search for resources, topics, or keywords..."
                    className="w-full bg-transparent text-sm text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                />
            </div>

            {/* Right User Actions */}
            <div className="flex items-center gap-4">
                <Link
                    href="/notifications"
                    aria-label="Notifications"
                    className="p-2 text-[#0B123D] hover:bg-[#F6F8FF] rounded-full transition-colors"
                >
                    <Bell className="w-5 h-5 text-[#0B123D]" />
                </Link>

                {/* User Profile Link */}
                <Link href="/profile" className="flex items-center gap-3 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-[#245CFF]/10 text-[#245CFF] overflow-hidden relative border border-[#E1E6F3] flex items-center justify-center font-bold text-xs">
                        {currentUser.initials || resolvedName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                        <span className="text-sm font-bold text-[#0B123D] leading-tight">
                            {resolvedName}
                        </span>
                        <span className="text-xs text-[#64708C]">{defaultTitle}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#64708C] hidden sm:block" />
                </Link>

                {/* Mobile Hamburger Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-[#0B123D] hover:bg-[#F6F8FF] rounded-lg"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-19 bg-white border-b border-[#E1E6F3] p-4 shadow-lg space-y-4 z-50">
                    <div className="flex items-center gap-3 px-3 py-2 bg-[#F6F8FF] rounded-lg border border-[#E1E6F3]">
                        <Search className="w-4 h-4 text-[#64708C]" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="w-full bg-transparent text-sm text-[#0B123D] placeholder-[#64708C] focus:outline-none"
                        />
                    </div>

                    <nav className="flex flex-col space-y-1">
                        {resolvedRole === 'student' && (
                            <>
                                <Link
                                    href="/student/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/projects"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Projects
                                </Link>
                                <Link
                                    href="/my-resources"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    My Resources
                                </Link>
                            </>
                        )}

                        {resolvedRole === 'staff' && (
                            <>
                                <Link
                                    href="/staff/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/staff/upload"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Upload Resource
                                </Link>
                                <Link
                                    href="/staff/manage-resources"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Manage Resources
                                </Link>
                                <Link
                                    href="/staff/review-submissions"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Review Submissions
                                </Link>
                            </>
                        )}

                        {resolvedRole === 'admin' && (
                            <>
                                <Link
                                    href="/admin/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/users"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    User Management
                                </Link>
                                <Link
                                    href="/admin/categories"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Category & Courses
                                </Link>
                                <Link
                                    href="/admin/analytics"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    Analytics
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2.5 text-sm font-medium text-[#0B123D] hover:bg-[#F6F8FF] rounded-md"
                                >
                                    System Settings
                                </Link>
                            </>
                        )}

                        <div className="pt-2 border-t border-[#E1E6F3] flex flex-col space-y-1">
                            <Link
                                href="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 text-sm text-[#64708C] hover:text-[#0B123D]"
                            >
                                My Profile
                            </Link>
                            <Link
                                href="/notifications"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 text-sm text-[#64708C] hover:text-[#0B123D]"
                            >
                                Notifications
                            </Link>
                            <Link
                                href="/support"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 text-sm text-[#64708C] hover:text-[#0B123D]"
                            >
                                Help & Support
                            </Link>
                        </div>
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </header>
    );
}
