'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { apiClient } from '@/lib/api';

const INSTITUTIONAL_EMAIL_DOMAINS = new Set([
    'oauife.edu.ng',
    'student.oauife.ng',
]);

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [matricNumber, setMatricNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showSignInLink, setShowSignInLink] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setShowSignInLink(false);

        const emailDomain = email.trim().toLowerCase().split('@').pop();
        if (!emailDomain || !INSTITUTIONAL_EMAIL_DOMAINS.has(emailDomain)) {
            setErrorMsg(
                'Registration requires an OAU-issued email address. Students should use @student.oauife.ng; staff should use @oauife.edu.ng.'
            );
            setLoading(false);
            return;
        }

        // Client-side validations
        if (!fullName.trim()) {
            setErrorMsg('Full Name is required.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            // Send registration request with explicit full_name to FastAPI
            await apiClient.post('/auth/register', {
                full_name: fullName.trim(),
                email: email.trim(),
                username: matricNumber.trim() || email.split('@')[0],
                password,
                role: 'student',
            });

            router.push('/register/success');
        } catch (err: unknown) {
            const response = typeof err === 'object' && err !== null && 'response' in err ? err.response : undefined;
            const data = typeof response === 'object' && response !== null && 'data' in response ? response.data : undefined;
            const detail = typeof data === 'object' && data !== null && 'detail' in data ? data.detail : undefined;
            const status = typeof response === 'object' && response !== null && 'status' in response ? response.status : undefined;
            const duplicateAccount = typeof detail === 'string' && detail.toLowerCase().includes('already exists');

            if (duplicateAccount) {
                try {
                    await apiClient.post('/auth/login', {
                        email: email.trim(),
                        password,
                    });
                    router.push('/register/success?existing=1');
                    return;
                } catch (signInError: unknown) {
                    if (!axios.isAxiosError(signInError) || !signInError.response) {
                        setErrorMsg('An account already exists for these details, but we could not verify the sign-in. Try signing in directly.');
                        setShowSignInLink(true);
                        setLoading(false);
                        return;
                    }
                }
            }

            const message = duplicateAccount
                ? typeof detail === 'string'
                    ? detail
                    : 'An account already exists. Please sign in or use different registration details.'
                : typeof detail === 'string'
                ? detail
                : Array.isArray(detail) && detail[0]?.msg
                    ? detail[0].msg
                    : axios.isAxiosError(err) && (!err.response || (typeof status === 'number' && status >= 500))
                        ? 'We could not confirm the registration result. Your account may already have been created. Try signing in before submitting the registration form again.'
                        : 'We could not complete registration. Please review your details and try again.';

            setErrorMsg(message);
            setShowSignInLink(duplicateAccount || (axios.isAxiosError(err) && (!err.response || (typeof status === 'number' && status >= 500))));
            setLoading(false);
        }
    };

    const featureChecklist = [
        'Access academic resources',
        'Search past questions',
        'Explore projects',
        'Join the CSE community',
    ];

    return (
        <div className="w-full min-h-screen bg-white rounded-[24px] overflow-hidden flex flex-col xl:flex-row font-sans text-[#0B123D]">

            {/* LEFT COLUMN: REGISTRATION FORM */}
            <div className="w-full xl:w-[730px] px-6 sm:px-14 xl:px-[70px] pt-[38px] pb-[30px] flex flex-col justify-between gap-[18px]">
                <div>
                    {/* Logo Header */}
                    <Link href="/" className="inline-flex items-center gap-[10px] mb-4">
                        <div className="w-[36px] h-[38px] bg-[#245CFF] rounded-[10px] flex items-center justify-center text-white font-bold text-[17px] relative shadow-sm">
                            C
                        </div>
                        <span className="text-[25px] font-bold leading-[36.25px] text-[#0B123D]">CSE Hub</span>
                    </Link>

                    {/* Heading */}
                    <div className="space-y-1 mb-6">
                        <h1 className="text-[30px] sm:text-[34px] font-bold leading-[1.3] text-[#0B123D]">
                            Sign up
                        </h1>
                        <p className="text-[15px] sm:text-[16px] font-normal leading-[21.75px] text-[#64708C]">
                            Join the CSE Resource Search Hub today
                        </p>
                    </div>

                    {/* Error Feedback Alert */}
                    {errorMsg && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <div>
                                <span>{errorMsg}</span>
                                {showSignInLink && (
                                    <p className="mt-2">
                                        <Link href="/login" className="font-semibold underline">
                                            Go to sign in
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={handleRegister} className="space-y-[16px]">

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="block text-[16px] font-semibold leading-[23.2px] text-[#0B123D]">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="h-[50px] sm:h-[54px] px-[16px] bg-white rounded-[8px] border border-[#E1E6F3] flex items-center focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full bg-transparent text-[#0B123D] text-[16px] placeholder-[#64708C] focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="block text-[16px] font-semibold leading-[23.2px] text-[#0B123D]">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="h-[50px] sm:h-[54px] px-[16px] bg-white rounded-[8px] border border-[#E1E6F3] flex items-center focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrorMsg('');
                                    }}
                                    placeholder="Enter your email"
                                    className="w-full bg-transparent text-[#0B123D] text-[16px] placeholder-[#64708C] focus:outline-none"
                                />
                            </div>
                            <p className="text-[13px] text-[#64708C]">
                                Use the email address issued to you by your school or organisation. Personal email addresses are not accepted.
                            </p>
                        </div>

                        {/* Student Matric Number */}
                        <div className="space-y-2">
                            <label className="block text-[16px] font-semibold leading-[23.2px] text-[#0B123D]">
                                Student Matric Number (for students)
                            </label>
                            <div className="h-[50px] sm:h-[54px] px-[16px] bg-white rounded-[8px] border border-[#E1E6F3] flex items-center focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <input
                                    type="text"
                                    value={matricNumber}
                                    onChange={(e) => setMatricNumber(e.target.value)}
                                    placeholder="Enter your matric number"
                                    className="w-full bg-transparent text-[#0B123D] text-[16px] placeholder-[#64708C] focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-[16px] font-semibold leading-[23.2px] text-[#0B123D]">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="h-[50px] sm:h-[54px] px-[16px] bg-white rounded-[8px] border border-[#E1E6F3] flex items-center justify-between gap-2 focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
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

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-[16px] font-semibold leading-[23.2px] text-[#0B123D]">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="h-[50px] sm:h-[54px] px-[16px] bg-white rounded-[8px] border border-[#E1E6F3] flex items-center justify-between gap-2 focus-within:ring-2 focus-within:ring-[#245CFF]">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full bg-transparent text-[#0B123D] text-[16px] placeholder-[#64708C] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="text-[#64708C] hover:text-[#0B123D] p-1"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-[13px] text-[#64708C] font-normal leading-[18.85px]">
                                Enter your password again to confirm.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[48px] sm:h-[52px] bg-gradient-to-r from-[#7148FF] to-[#245CFF] rounded-[8px] text-white text-[16px] font-semibold leading-[23.2px] flex items-center justify-center hover:opacity-95 transition-opacity disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </form>

                    <div className="rounded-xl border border-[#E1E6F3] bg-[#F6F8FF] px-4 py-3 text-sm text-[#495471]">
                        Registration is for members of the school or organisation. Use your institution-assigned email address and a secure password.
                    </div>
                </div>

                {/* Footer Redirect */}
                <div className="text-center pt-2 text-[16px]">
                    <span className="text-[#64708C] font-normal">Already have an account? </span>
                    <Link href="/login" className="text-[#245CFF] font-normal hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>

            {/* RIGHT COLUMN: LEARNING JOURNEY CARD */}
            <div className="flex-1 bg-gradient-to-br from-[#F6FCFF] via-[#F0ECFF] to-[#F7FCFF] p-6 sm:p-10 xl:pr-[32px] flex flex-col items-center justify-center relative overflow-hidden">

                {/* Background Overlay Image */}
                <div className="w-full h-[220px] sm:h-[300px] xl:h-[350px] relative overflow-hidden rounded-[20px] mb-6">
                    <Image
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                        alt="Students Learning"
                        fill
                        sizes="(max-width: 1280px) 100vw, 50vw"
                        className="w-full h-full object-cover rounded-[20px]"
                    />
                </div>

                {/* White Feature Checklist Widget */}
                <div className="w-full max-w-[610px] p-6 sm:p-[30px] bg-white rounded-[24px] sm:rounded-[28px] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex flex-col gap-[20px] border border-[#E1E6F3]/50">

                    <div className="flex items-center gap-[20px] sm:gap-[28px]">
                        <div className="w-[56px] h-[56px] sm:w-[85px] sm:h-[85px] bg-[#7148FF] rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-white flex-shrink-0">
                            <span className="text-[24px] sm:text-[36px] font-bold">🚀</span>
                        </div>
                        <h3 className="text-[#0B123D] text-[22px] sm:text-[26px] font-bold leading-[1.3]">
                            Start Your<br />Learning Journey
                        </h3>
                    </div>

                    {featureChecklist.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-[14px] sm:gap-[20px]">
                            <div className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] bg-[#00B75E] rounded-full flex items-center justify-center text-white flex-shrink-0">
                                <Check className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] stroke-[3]" />
                            </div>
                            <span className="text-[#0B123D] text-[16px] sm:text-[18px] font-normal leading-[23.2px]">
                                {feature}
                            </span>
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}