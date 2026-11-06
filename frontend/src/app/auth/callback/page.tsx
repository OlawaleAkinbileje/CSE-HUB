'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { notifyCurrentUserChanged } from '@/lib/useCurrentUser';

export default function AuthCallbackPage() {
    const router = useRouter();
    const started = useRef(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const completeSignUp = async () => {
            try {
                const url = new URL(window.location.href);
                const providerError = url.searchParams.get('error_description');
                if (providerError) throw new Error(providerError);

                const code = url.searchParams.get('code');
                let session: Session | null;
                if (code) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                    session = data.session;
                } else {
                    const { data, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    session = data.session;
                }
                if (!session) throw new Error('The identity provider did not return a valid session.');

                const { data } = await apiClient.post('/auth/oauth', {
                    access_token: session.access_token,
                });
                const { access_token, role, full_name, username, email } = data;
                Cookies.set('token', access_token);
                Cookies.set('role', role);
                Cookies.set('user_name', full_name || username || '');
                Cookies.set('user_username', username || '');
                Cookies.set('user_email', email || '');
                notifyCurrentUserChanged();

                const destination = role === 'admin'
                    ? '/admin/dashboard'
                    : role === 'staff'
                        ? '/staff/dashboard'
                        : '/student/dashboard';
                router.replace(destination);
            } catch (error: unknown) {
                setErrorMessage(
                    error instanceof Error ? error.message : 'Unable to complete social sign-up.',
                );
            }
        };

        void completeSignUp();
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F6F8FF] px-4 font-sans text-[#0B123D]">
            <section className="w-full max-w-md rounded-2xl border border-[#E1E6F3] bg-white p-8 text-center shadow-sm">
                {errorMessage ? (
                    <>
                        <h1 className="text-xl font-bold">Sign-up could not be completed</h1>
                        <p role="alert" className="mt-3 text-sm text-red-600">{errorMessage}</p>
                        <Link href="/register" className="mt-6 inline-block font-semibold text-[#245CFF] hover:underline">
                            Return to sign up
                        </Link>
                    </>
                ) : (
                    <>
                        <h1 className="text-xl font-bold">Completing sign-up</h1>
                        <p className="mt-3 text-sm text-[#64708C]">Please wait while we finish setting up your account.</p>
                    </>
                )}
            </section>
        </main>
    );
}
