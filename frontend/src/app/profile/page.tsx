'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    BarChart2,
    Bell,
    CircleUserRound,
    FileSearch,
    FolderKanban,
    Home,
    HelpCircle,
    Layers,
    KeyRound,
    Search,
    Shield,
    UploadCloud,
    Users,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import { useCurrentUser } from '@/lib/useCurrentUser';

type ProfileTab = 'details' | 'security' | 'activity';

const roleLabels = {
    student: 'Student',
    staff: 'Staff',
    admin: 'Administrator',
} as const;

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<ProfileTab>('details');
    const currentUser = useCurrentUser();
    const displayName = currentUser.full_name || currentUser.username || currentUser.email || 'User';
    const roleLabel = roleLabels[currentUser.role];
    const mobileNavItems = currentUser.role === 'admin'
        ? [
            { label: 'Home', href: '/admin/dashboard', icon: Home },
            { label: 'Users', href: '/admin/users', icon: Users },
            { label: 'Categories', href: '/admin/categories', icon: Layers },
            { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
            { label: 'Profile', href: '/profile', icon: CircleUserRound },
        ]
        : currentUser.role === 'staff'
            ? [
                { label: 'Home', href: '/staff/dashboard', icon: Home },
                { label: 'Upload', href: '/staff/upload', icon: UploadCloud },
                { label: 'Manage', href: '/staff/manage-resources', icon: FolderKanban },
                { label: 'Review', href: '/staff/review-submissions', icon: FileSearch },
                { label: 'Profile', href: '/profile', icon: CircleUserRound },
            ]
            : [
                { label: 'Home', href: '/student/dashboard', icon: Home },
                { label: 'Search', href: '/search', icon: Search },
                { label: 'Questions', href: '/past-questions', icon: HelpCircle },
                { label: 'Alerts', href: '/notifications', icon: Bell },
                { label: 'Profile', href: '/profile', icon: CircleUserRound },
            ];

    return (
        <div className="flex min-h-screen flex-col bg-[#F6F8FF] font-sans text-[#0B123D]">
            <Navbar userRole={currentUser.role} />

            <div className="flex min-h-[calc(100vh-76px)] flex-1">
                <Sidebar userRole={currentUser.role} />

                <main className="min-w-0 flex-1 space-y-6 overflow-y-auto p-4 pb-24 sm:space-y-8 sm:p-6 lg:p-8 lg:pb-8">
                    <div>
                        <h1 className="text-[26px] font-bold sm:text-[30px]">My Profile</h1>
                        <p className="mt-1 text-sm text-[#64708C]">
                            Manage your account information and security.
                        </p>
                    </div>

                    <div role="tablist" aria-label="Profile sections" className="flex gap-2 overflow-x-auto border-b border-[#E1E6F3] sm:gap-6">
                        {([
                            ['details', 'Profile Details'],
                            ['security', 'Security'],
                            ['activity', 'Recent Activity'],
                        ] as const).map(([tab, label]) => (
                            <button
                                key={tab}
                                id={`profile-tab-${tab}`}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab}
                                aria-controls={`profile-panel-${tab}`}
                                onClick={() => setActiveTab(tab)}
                                className={`shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors sm:text-[15px] ${
                                    activeTab === tab
                                        ? 'border-[#245CFF] text-[#245CFF]'
                                        : 'border-transparent text-[#64708C] hover:text-[#0B123D]'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'details' && (
                        <section
                            id="profile-panel-details"
                            role="tabpanel"
                            aria-labelledby="profile-tab-details"
                            className="flex flex-col items-start gap-8 xl:flex-row"
                        >
                            <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-[#E1E6F3] bg-white p-6 text-center shadow-sm xl:w-[240px]">
                                <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-white bg-[#245CFF]/10 text-3xl font-bold text-[#245CFF] shadow-md sm:h-40 sm:w-40">
                                    {currentUser.initials}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{displayName}</h2>
                                    <p className="mt-1 text-sm text-[#64708C]">{roleLabel}</p>
                                </div>
                                <p className="text-xs text-[#64708C]">
                                    Your CSE Hub account profile.
                                </p>
                            </div>

                            <dl className="grid w-full flex-1 grid-cols-1 gap-4 rounded-2xl border border-[#E1E6F3] bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
                                <div className="space-y-2">
                                    <dt className="text-sm font-semibold">Full Name</dt>
                                    <dd className="flex min-h-12 items-center rounded-lg border border-[#E1E6F3] bg-[#F6F8FF] px-4 text-sm">
                                        {currentUser.full_name || 'Not provided'}
                                    </dd>
                                </div>
                                <div className="space-y-2">
                                    <dt className="text-sm font-semibold">Username</dt>
                                    <dd className="flex min-h-12 items-center rounded-lg border border-[#E1E6F3] bg-[#F6F8FF] px-4 text-sm">
                                        {currentUser.username || 'Not provided'}
                                    </dd>
                                </div>
                                <div className="space-y-2">
                                    <dt className="text-sm font-semibold">Email Address</dt>
                                    <dd className="flex min-h-12 items-center break-all rounded-lg border border-[#E1E6F3] bg-[#F6F8FF] px-4 text-sm">
                                        {currentUser.email || 'Not provided'}
                                    </dd>
                                </div>
                                <div className="space-y-2">
                                    <dt className="text-sm font-semibold">Account Type</dt>
                                    <dd className="flex min-h-12 items-center rounded-lg border border-[#E1E6F3] bg-[#F6F8FF] px-4 text-sm">
                                        {roleLabel}
                                    </dd>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <dt className="text-sm font-semibold">Account Status</dt>
                                    <dd className="flex min-h-12 items-center gap-2 rounded-lg border border-[#E1E6F3] bg-[#F6F8FF] px-4 text-sm">
                                        <span className={`h-2 w-2 rounded-full ${currentUser.isAuthenticated ? 'bg-[#00C58A]' : 'bg-[#FF9235]'}`} />
                                        {currentUser.isAuthenticated ? 'Signed in' : 'Not signed in'}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    )}

                    {activeTab === 'security' && (
                        <section id="profile-panel-security" role="tabpanel" aria-labelledby="profile-tab-security" className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold sm:text-xl">Security</h2>
                                <p className="text-sm text-[#64708C]">
                                    Information about protecting your CSE Hub account.
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-4 rounded-2xl border border-[#E1E6F3] bg-white p-5 shadow-sm">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#245CFF]/10 text-[#245CFF]">
                                        <KeyRound className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">Sign-in credentials</h3>
                                        <p className="mt-1 text-xs leading-relaxed text-[#64708C]">
                                            Keep your password private. Password changes are handled through the sign-in provider or account recovery flow.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 rounded-2xl border border-[#E1E6F3] bg-white p-5 shadow-sm">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00C58A]/10 text-[#009F75]">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">Account access</h3>
                                        <p className="mt-1 text-xs leading-relaxed text-[#64708C]">
                                            Your access and available features are based on your account role: {roleLabel}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Link href="/support" className="inline-flex items-center gap-2 text-sm font-semibold text-[#245CFF] hover:underline">
                                Need help securing your account?
                                <span aria-hidden="true">→</span>
                            </Link>
                        </section>
                    )}

                    {activeTab === 'activity' && (
                        <section id="profile-panel-activity" role="tabpanel" aria-labelledby="profile-tab-activity" className="space-y-4">
                            <div>
                                <h2 className="text-lg font-bold sm:text-xl">Recent Activity</h2>
                                <p className="text-sm text-[#64708C]">Recent account activity will appear here.</p>
                            </div>
                            <div className="flex flex-col items-center rounded-2xl border border-[#E1E6F3] bg-white px-6 py-12 text-center shadow-sm">
                                <Activity className="h-8 w-8 text-[#64708C]" />
                                <h3 className="mt-3 text-sm font-semibold">No activity to show</h3>
                                <p className="mt-1 max-w-md text-xs leading-relaxed text-[#64708C]">
                                    Activity history is not available yet. Your account information remains available in Profile Details.
                                </p>
                            </div>
                        </section>
                    )}

                    <Footer />
                </main>
            </div>

            <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[#E1E6F3] bg-white px-2 md:hidden">
                {mobileNavItems.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        aria-current={href === '/profile' ? 'page' : undefined}
                        className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1 ${
                            href === '/profile'
                                ? 'bg-[#E9EDFF] font-bold text-[#245CFF]'
                                : 'text-[#64708C]'
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px]">{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
