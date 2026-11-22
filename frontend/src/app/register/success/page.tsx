'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { CircleCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function RegistrationConfirmation() {
    const searchParams = useSearchParams();
    const accountAlreadyExists = searchParams.get('existing') === '1';

    return (
        <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#F6FCFF] via-[#F0ECFF] to-[#F7FCFF] px-6 py-12 font-sans text-[#0B123D]">
            <section
                role="status"
                aria-live="polite"
                className="w-full max-w-xl rounded-3xl border border-[#E1E6F3] bg-white p-8 text-center shadow-[0px_12px_40px_rgba(39,63,121,0.10)] sm:p-12"
            >
                <CircleCheck className="mx-auto h-16 w-16 text-green-600" aria-hidden="true" />
                <h1 className="mt-6 text-3xl font-bold">
                    {accountAlreadyExists ? 'Your account is ready' : 'Registration successful'}
                </h1>
                <p className="mt-3 text-base leading-7 text-[#64708C]">
                    {accountAlreadyExists
                        ? 'This OAU email is already registered, and the password you entered is valid. Sign in to continue.'
                        : 'Your CSE Hub account has been created. You can now sign in with your OAU email address and password.'}
                </p>
                <Link
                    href="/login"
                    className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#245CFF] px-7 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    Proceed to sign in
                </Link>
            </section>
        </main>
    );
}

export default function RegistrationSuccessPage() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-white" />}>
            <RegistrationConfirmation />
        </Suspense>
    );
}
