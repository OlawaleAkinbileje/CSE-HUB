'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F6F8FF] px-4 font-sans text-[#0B123D]">
            <section className="w-full max-w-md rounded-2xl border border-[#E1E6F3] bg-white p-8 text-center shadow-sm">
                <h1 className="text-xl font-bold">Email sign-in is active</h1>
                <p className="mt-3 text-sm text-[#64708C]">
                    This app uses FastAPI authentication. Please continue with the email sign-in flow.
                </p>
            </section>
        </main>
    );
}
