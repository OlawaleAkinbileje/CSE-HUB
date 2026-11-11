'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';
import { notifyCurrentUserChanged } from '@/lib/useCurrentUser';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // Send login request to FastAPI endpoint
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            const { access_token, role, full_name, username, email: userEmail } = response.data;

            // Set cookie expiration based on 'Remember Me'
            const cookieOptions = rememberMe ? { expires: 7 } : {};
            Cookies.set('token', access_token, cookieOptions);
            Cookies.set('role', role, cookieOptions);
            Cookies.set('user_name', full_name || username || '', cookieOptions);
            Cookies.set('user_username', username || '', cookieOptions);
            Cookies.set('user_email', userEmail || '', cookieOptions);
            notifyCurrentUserChanged();

            // Role-based redirect routing
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else if (role === 'staff') {
                router.push('/staff/dashboard');
            } else {
                router.push('/student/dashboard');
            }
        } catch (err: unknown) {
            const response = (err as { response?: { data?: { detail?: unknown } } }).response;
            const message = typeof response?.data?.detail === 'string'
                ? response.data.detail
                : axios.isAxiosError(err) && !err.response
                    ? 'Unable to reach the CSE Hub server. Check that the backend is running and try again.'
                    : 'An unexpected error occurred during login.';
            setErrorMsg(message);
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-white rounded-[24px] overflow-hidden flex flex-col xl:flex-row font-sans text-[#0B123D]">

            {/* LEFT COLUMN: FORM SECTION */}
            <div className="w-full xl:w-[770px] flex-1 px-6 sm:px-16 xl:px-[88px] pt-10 sm:pt-14 xl:pt-[62px] pb-[38px] flex flex-col justify-between gap-[30px] overflow-hidden">
                <div>
                    {/* Logo Brand Header */}
                    <Link href="/" className="inline-flex items-center gap-[10px] mb-6">
                        <div className="w-[36px] h-[38px] bg-[#245CFF] rounded-[10px] flex items-center justify-center text-white font-bold text-[17px] relative shadow-sm">
                            C
                        </div>
                        <span className="text-[25px] font-bold leading-[36.25px] text-[#0B123D]">CSE Hub</span>
                    </Link>

                    {/* Title & Subtitle */}
                    <div className="space-y-2 mb-8">
                        <h1 className="text-[32px] sm:text-[40px] xl:text-[43px] font-bold leading-[1.2] text-[#0B123D]">
                            Welcome Back!
                        </h1>
                        <p className="text-[16px] sm:text-[18px] xl:text-[21px] font-normal leading-[1.45] text-[#64708C]">
                            Sign in to access the CSE Resource Search Hub
                        </p>
                    </div>

                    {/* Error Alert */}
                    {errorMsg && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-[20px]">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-[16px] font-semibold leading-[23.2px] text-[#0B123D]">
                                Email Address
                            </label>
                            <div className="h-[50px] sm:h-[54px] px-[16px] bg-white rounded-[8px] border border-[#E1E6F3] flex items-center focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-transparent text-[#0B123D] text-[16px] placeholder-[#64708C] focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-[16px] font-semibold leading-[23.2px] text-[#0B123D]">
                                Password
                            </label>
                            <div className="h-[50px] sm:h-[54px] px-[16px] bg-white rounded-[8px] border border-[#E1E6F3] flex items-center justify-between gap-2 focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full bg-transparent text-[#0B123D] text-[16px] placeholder-[#64708C] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[#64708C] hover:text-[#0B123D] p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between pt-1 text-[14px] sm:text-[16px]">
                            <label className="flex items-center gap-[10px] cursor-pointer text-[#0B123D]">
                                <button
                                    type="button"
                                    onClick={() => setRememberMe(!rememberMe)}
                                    className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#245CFF] text-white' : 'bg-white border border-[#E1E6F3]'
                                        }`}
                                >
                                    {rememberMe && <Check className="w-4 h-4 stroke-[3]" />}
                                </button>
                                <span className="font-normal">Remember me</span>
                            </label>
                            <Link href="/support" className="font-semibold text-[#245CFF] hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[48px] sm:h-[52px] bg-gradient-to-r from-[#7148FF] to-[#245CFF] rounded-[8px] text-white text-[16px] font-semibold leading-[23.2px] flex items-center justify-center hover:opacity-95 transition-opacity disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="rounded-xl border border-[#E1E6F3] bg-[#F6F8FF] px-4 py-3 text-sm text-[#495471]">
                        Use your department email and password to access the CSE Hub dashboard.
                    </div>
                </div>

                {/* Footer Redirect Link */}
                <div className="text-center pt-4 text-[16px] sm:text-[17px]">
                    <span className="text-[#0B123D] font-normal">Don&apos;t have an account? </span>
                    <Link href="/register" className="text-[#245CFF] font-normal hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>

            {/* RIGHT COLUMN: BRAND BANNER & QUOTE */}
            <div className="flex-1 bg-gradient-to-br from-[#18233D] to-[#444C97] flex flex-col justify-between overflow-hidden min-h-[300px] xl:min-h-full">
                <div className="relative w-full h-[240px] sm:h-[320px] xl:h-[420px] overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                        alt="Students Studying"
                        fill
                        sizes="(max-width: 1280px) 100vw, 50vw"
                        className="object-cover opacity-60 mix-blend-overlay"
                    />
                </div>

                <div className="p-6 sm:p-[32px] xl:pt-[42px] xl:px-[90px] xl:pb-[60px] flex flex-col gap-[22px] sm:gap-[28px]">
                    <div className="flex gap-[18px] sm:gap-[34px]">
                        <div className="w-[4px] h-[84px] sm:h-[120px] xl:h-[252px] bg-[#245CFF] flex-shrink-0" />
                        <h2 className="text-white text-[28px] sm:text-[36px] xl:text-[44px] font-bold leading-[1.3] sm:leading-[1.45]">
                            Knowledge<br className="hidden xl:block" /> shared is<br className="hidden xl:block" /> knowledge<br className="hidden xl:block" /> multiplied”
                        </h2>
                    </div>

                    <p className="text-[#D8DBEF] text-[16px] sm:text-[18px] xl:text-[23px] font-normal leading-[1.45]">
                        Access, search and explore a wide range of academic resources.
                    </p>
                </div>
            </div>

        </div>
    );
}