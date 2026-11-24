'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

function VerificationContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'invalid' | 'idle'>(
        token ? 'checking' : 'idle'
    );
    const [verificationMessage, setVerificationMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [resendError, setResendError] = useState('');

    useEffect(() => {
        if (!token) return;
        let isMounted = true;
        apiClient.post('/auth/verify-email', { token })
            .then(({ data }) => {
                if (!isMounted) return;
                setVerificationStatus('verified');
                setVerificationMessage(data.message || 'Email verified. You can now sign in.');
            })
            .catch((error: unknown) => {
                if (!isMounted) return;
                setVerificationStatus('invalid');
                const detail = typeof error === 'object' && error !== null && 'response' in error
                    ? (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
                    : undefined;
                setVerificationMessage(
                    typeof detail === 'string' ? detail : 'We could not verify this link. Request a new one below.'
                );
            });
        return () => { isMounted = false; };
    }, [token]);

    const resendEmail = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSending(true);
        setResendError('');
        setResendMessage('');
        try {
            const { data } = await apiClient.post('/auth/resend-verification', { email: email.trim() });
            setResendMessage(data.message || 'If your account needs verification, a link will be sent.');
        } catch (error: unknown) {
            const detail = typeof error === 'object' && error !== null && 'response' in error
                ? (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
                : undefined;
            setResendError(
                typeof detail === 'string' ? detail : 'We could not send the verification email. Please try again.'
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F6F8FF] px-5 py-12 font-sans text-[#0B123D]">
            <section className="w-full max-w-xl space-y-5 rounded-3xl border border-[#E1E6F3] bg-white p-8 text-center shadow-sm sm:p-12">
                <h1 className="text-3xl font-bold">
                    {verificationStatus === 'checking'
                        ? 'Verifying your email…'
                        : verificationStatus === 'verified'
                            ? 'Email verified'
                            : verificationStatus === 'invalid'
                                ? 'Verification link unavailable'
                                : 'Verify your email'}
                </h1>
                {verificationMessage && (
                    <p role={verificationStatus === 'invalid' ? 'alert' : 'status'} className="text-sm leading-6 text-[#64708C]">
                        {verificationMessage}
                    </p>
                )}
                {verificationStatus === 'verified' && (
                    <Link href="/login" className="inline-flex rounded-lg bg-[#245CFF] px-6 py-3 font-semibold text-white">
                        Proceed to sign in
                    </Link>
                )}
                {verificationStatus !== 'verified' && (
                    <form onSubmit={resendEmail} className="space-y-3 border-t border-[#E1E6F3] pt-5 text-left">
                        <p className="text-center text-sm text-[#64708C]">
                            Request a fresh link if the message didn’t arrive or the link expired.
                        </p>
                        <label className="block space-y-2 text-sm font-semibold">
                            Email address
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="h-12 w-full rounded-lg border border-[#E1E6F3] px-4 font-normal focus:outline-none focus:ring-2 focus:ring-[#245CFF]"
                            />
                        </label>
                        {resendError && <p role="alert" className="text-sm text-red-600">{resendError}</p>}
                        {resendMessage && <p role="status" className="text-sm text-[#009F75]">{resendMessage}</p>}
                        <button
                            type="submit"
                            disabled={isSending || !email.trim()}
                            className="w-full rounded-lg border border-[#245CFF] px-5 py-3 font-semibold text-[#245CFF] disabled:opacity-50"
                        >
                            {isSending ? 'Sending…' : 'Resend verification email'}
                        </button>
                    </form>
                )}
                {verificationStatus !== 'verified' && (
                    <Link href="/login" className="inline-block text-sm font-semibold text-[#245CFF] hover:underline">
                        Back to sign in
                    </Link>
                )}
            </section>
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-[#F6F8FF]" />}>
            <VerificationContent />
        </Suspense>
    );
}
