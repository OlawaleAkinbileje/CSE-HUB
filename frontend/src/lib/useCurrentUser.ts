'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';

export interface CurrentUser {
    id?: string;
    full_name: string;
    username: string;
    email: string;
    role: 'student' | 'staff' | 'admin';
    initials: string;
    isAuthenticated: boolean;
}

const FALLBACK: CurrentUser = {
    full_name: '',
    username: '',
    email: '',
    role: 'student',
    initials: 'U',
    isAuthenticated: false,
};

function getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function readFromCookies(): CurrentUser | null {
    const token = Cookies.get('token');
    if (!token) return null;

    const full_name = Cookies.get('user_name') || '';
    const username = Cookies.get('user_username') || '';
    const email = Cookies.get('user_email') || '';
    const role = (Cookies.get('role') || 'student') as CurrentUser['role'];

    return {
        full_name,
        username,
        email,
        role,
        initials: getInitials(full_name || username || email),
        isAuthenticated: true,
    };
}

let snapshotSignature = JSON.stringify(FALLBACK);
let snapshotValue = FALLBACK;

function getSnapshot(): CurrentUser {
    const user = readFromCookies() ?? FALLBACK;
    const signature = JSON.stringify(user);
    if (signature !== snapshotSignature) {
        snapshotSignature = signature;
        snapshotValue = user;
    }
    return snapshotValue;
}

function getServerSnapshot(): CurrentUser {
    return FALLBACK;
}

function subscribe(onChange: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('csehub:current-user-changed', onChange);
    return () => window.removeEventListener('csehub:current-user-changed', onChange);
}

export function notifyCurrentUserChanged(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('csehub:current-user-changed'));
    }
}

/**
 * Returns the currently authenticated user.
 * - Uses a stable fallback for server rendering and hydration, then reads cookies.
 * - If name is missing, falls back to GET /api/v1/auth/me (one fetch).
 */
export function useCurrentUser(): CurrentUser {
    const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    useEffect(() => {
        const cookieUser = readFromCookies();

        // If we already have a name from cookies, skip the network call
        if (!cookieUser || cookieUser.full_name) {
            return;
        }

        // Fetch profile from /me endpoint
        apiClient
            .get('/auth/me')
            .then((res) => {
                const { full_name, username, email } = res.data;
                const name = full_name || username || email || '';
                // Cache in cookies for future renders
                Cookies.set('user_name', name);
                Cookies.set('user_username', username || '');
                Cookies.set('user_email', email || '');
                notifyCurrentUserChanged();
            })
            .catch((error: unknown) => {
                // Network error or 401 — keep cookie data or fallback
                console.error('Failed to load the current user profile.', error);
            });
    }, []);

    return user;
}
