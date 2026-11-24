'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';
import {
    Activity,
    BarChart2,
    Bell,
    CircleUserRound,
    FolderKanban,
    Home,
    HelpCircle,
    Layers,
    KeyRound,
    ImagePlus,
    Search,
    Shield,
    UploadCloud,
    Users,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/footer';
import { notifyCurrentUserChanged, useCurrentUser } from '@/lib/useCurrentUser';
import { apiClient } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';

type ProfileTab = 'details' | 'security' | 'activity';

const roleLabels = {
    student: 'Student',
    staff: 'Staff',
    admin: 'Administrator',
} as const;

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<ProfileTab>('details');
    const [avatarError, setAvatarError] = useState('');
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [profileEmail, setProfileEmail] = useState<string | null>(null);
    const [departmentId, setDepartmentId] = useState<string | null>(null);
    const [departmentCode, setDepartmentCode] = useState('');
    const [profileNotice, setProfileNotice] = useState('');
    const currentUser = useCurrentUser();
    const displayName = currentUser.full_name || currentUser.username || currentUser.email || 'User';
    const roleLabel = roleLabels[currentUser.role];
    useEffect(() => {
        let isMounted = true;
        apiClient.get('/departments')
            .then(({ data }) => {
                if (isMounted && Array.isArray(data.data)) setDepartments(data.data);
            })
            .catch((error: unknown) => {
                console.error('Failed to load department options.', error);
            });
        return () => { isMounted = false; };
    }, []);
    const avatarMutation = useMutation({
        mutationFn: async (image: File) => {
            const form = new FormData();
            form.append('file', image);
            const response = await apiClient.post<{ avatar_url: string }>('/auth/me/avatar', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: ({ avatar_url }) => {
            Cookies.set('user_avatar_url', avatar_url);
            notifyCurrentUserChanged();
        },
    });
    const profileMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.patch<{
                email: string;
                department_id?: string | null;
                is_verified: boolean;
                verification_email_sent?: boolean | null;
                message: string;
            }>('/auth/me/profile', {
                email: (profileEmail ?? currentUser.email).trim(),
                department_id: departmentId ?? currentUser.department_id,
                access_code: departmentCode.trim() || undefined,
            });
            return response.data;
        },
        onSuccess: (profile) => {
            Cookies.set('user_email', profile.email);
            Cookies.set('user_department_id', profile.department_id || '');
            Cookies.set('user_is_verified', String(profile.is_verified));
            Cookies.set('profile_loaded', 'true');
            setProfileEmail(profile.email);
            setDepartmentId(profile.department_id || '');
            setDepartmentCode('');
            setProfileNotice(profile.message);
            notifyCurrentUserChanged();
        },
    });

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const image = event.target.files?.[0];
        event.target.value = '';
        if (!image) return;
        if (image.size > 5 * 1024 * 1024) {
            setAvatarError('Profile pictures must be 5 MB or smaller.');
            return;
        }
        setAvatarError('');
        avatarMutation.mutate(image);
    };
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
                                <UserAvatar
                                    name={displayName}
                                    avatarUrl={currentUser.avatar_url}
                                    className="h-36 w-36 border-2 border-white text-3xl shadow-md sm:h-40 sm:w-40"
                                />
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E1E6F3] px-3 py-2 text-xs font-semibold text-[#245CFF] hover:bg-[#F6F8FF]">
                                    <ImagePlus className="h-4 w-4" />
                                    {avatarMutation.isPending ? 'Uploading…' : 'Change profile picture'}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="sr-only"
                                        disabled={avatarMutation.isPending}
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                                {avatarError && <p role="alert" className="text-xs text-red-600">{avatarError}</p>}
                                {avatarMutation.error && (
                                    <p role="alert" className="text-xs text-red-600">
                                        {avatarMutation.error.message}
                                    </p>
                                )}
                                {avatarMutation.isSuccess && (
                                    <p role="status" className="text-xs text-[#009F75]">
                                        Profile picture updated.
                                    </p>
                                )}
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
                            {currentUser.role !== 'admin' && (
                                <form
                                    className="w-full space-y-4 rounded-2xl border border-[#E1E6F3] bg-white p-5 shadow-sm sm:p-7"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        setProfileNotice('');
                                        profileMutation.mutate();
                                    }}
                                >
                                    <div>
                                        <h2 className="text-lg font-bold">Update university details</h2>
                                        <p className="mt-1 text-sm text-[#64708C]">
                                            Keep your official university email and department current.
                                        </p>
                                    </div>
                                    <label className="block space-y-2 text-sm font-semibold">
                                        University email
                                        <input
                                            type="email"
                                            required
                                            value={profileEmail ?? currentUser.email}
                                            onChange={(event) => setProfileEmail(event.target.value)}
                                            className="h-12 w-full rounded-lg border border-[#E1E6F3] px-4 font-normal focus:outline-none focus:ring-2 focus:ring-[#245CFF]"
                                        />
                                    </label>
                                    <label className="block space-y-2 text-sm font-semibold">
                                        Department
                                        <select
                                            required
                                            value={departmentId ?? currentUser.department_id}
                                            onChange={(event) => setDepartmentId(event.target.value)}
                                            className="h-12 w-full rounded-lg border border-[#E1E6F3] bg-white px-4 font-normal focus:outline-none focus:ring-2 focus:ring-[#245CFF]"
                                        >
                                            <option value="">Select your department</option>
                                            {departments.map((department) => (
                                                <option key={department.id} value={department.id}>{department.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    {currentUser.role === 'student' && (
                                        <label className="block space-y-2 text-sm font-semibold">
                                            Department access code
                                            <input
                                                type="text"
                                                value={departmentCode}
                                                onChange={(event) => setDepartmentCode(event.target.value)}
                                                placeholder="Required to change department"
                                                className="h-12 w-full rounded-lg border border-[#E1E6F3] px-4 font-normal focus:outline-none focus:ring-2 focus:ring-[#245CFF]"
                                            />
                                        </label>
                                    )}
                                    {profileMutation.error && (
                                        <p role="alert" className="text-sm text-red-600">
                                            {profileMutation.error.message}
                                        </p>
                                    )}
                                    {profileNotice && (
                                        <p
                                            role="status"
                                            className={`text-sm ${profileMutation.data?.verification_email_sent === false ? 'text-amber-700' : 'text-[#009F75]'}`}
                                        >
                                            {profileNotice}
                                        </p>
                                    )}
                                    {profileMutation.data?.verification_email_sent === false && (
                                        <Link
                                            href={`/verify-email?email=${encodeURIComponent(profileMutation.data.email)}`}
                                            className="inline-block text-sm font-semibold text-[#245CFF] hover:underline"
                                        >
                                            Retry verification email
                                        </Link>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={profileMutation.isPending || !departments.length}
                                        className="rounded-lg bg-[#245CFF] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        {profileMutation.isPending ? 'Saving…' : 'Save university details'}
                                    </button>
                                </form>
                            )}
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
