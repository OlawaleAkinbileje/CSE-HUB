'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { CircleCheck, MailCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function RegistrationConfirmation() {
    const searchParams = useSearchParams();
    const accountAlreadyExists = searchParams.get('existing') === '1';
    const email = searchParams.get('email') || '';
    const verificationEmailSent = searchParams.get('sent') !== '0';

    return (
        <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#F6FCFF] via-[#F0ECFF] to-[#F7FCFF] px-6 py-12 font-sans text-[#0B123D]">
            <section
                role="status"
                aria-live="polite"
                className="w-full max-w-xl rounded-3xl border border-[#E1E6F3] bg-white p-8 text-center shadow-[0px_12px_40px_rgba(39,63,121,0.10)] sm:p-12"
            >
                {accountAlreadyExists || verificationEmailSent
                    ? <CircleCheck className="mx-auto h-16 w-16 text-green-600" aria-hidden="true" />
                    : <MailCheck className="mx-auto h-16 w-16 text-amber-500" aria-hidden="true" />}
                <h1 className="mt-6 text-3xl font-bold">
                    {accountAlreadyExists
                        ? 'Your account is ready'
                        : verificationEmailSent
                            ? 'Check your email'
                            : 'Account created; email not sent'}
                </h1>
                <p className="mt-3 text-base leading-7 text-[#64708C]">
                    {accountAlreadyExists
                        ? 'An account with this email is already registered. Sign in, or request a fresh verification link if the account is not verified yet.'
                        : verificationEmailSent
                            ? `Your account is registered. Follow the verification link sent to ${email || 'your email address'} to activate it, then sign in.`
                            : 'Your account is registered, but we could not send the verification message. You can request a fresh link or contact support.'}
                </p>
                {(!accountAlreadyExists || email) && (
                    <Link
                        href={`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg border border-[#245CFF] px-7 py-3 font-semibold text-[#245CFF] transition-colors hover:bg-blue-50"
                    >
                        {accountAlreadyExists
                            ? 'Request a verification link'
                            : verificationEmailSent
                                ? 'Resend verification email'
                                : 'Try sending the email again'}
                    </Link>
                )}
                <Link
                    href="/login"
                    className={`${accountAlreadyExists ? 'mt-8' : 'mt-3'} inline-flex min-h-12 items-center justify-center rounded-lg bg-[#245CFF] px-7 py-3 font-semibold text-white transition-colors hover:bg-blue-700`}
                >
                    Go to sign in
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
