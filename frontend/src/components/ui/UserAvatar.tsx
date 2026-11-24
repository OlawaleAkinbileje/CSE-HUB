'use client';

import Image from 'next/image';
import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface UserAvatarProps {
    name: string;
    avatarUrl?: string | null;
    className?: string;
}

export default function UserAvatar({ name, avatarUrl, className = '' }: UserAvatarProps) {
    const [imageFailed, setImageFailed] = useState(false);
    const initials = name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U';
    const imageSrc = avatarUrl
        ? new URL(avatarUrl, apiClient.defaults.baseURL).toString()
        : '';

    return (
        <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#245CFF]/10 font-bold text-[#245CFF] ${className}`}>
            {imageSrc && !imageFailed ? (
                <Image
                    src={imageSrc}
                    alt={`${name || 'User'} profile picture`}
                    fill
                    unoptimized
                    sizes="160px"
                    className="object-cover"
                    onError={() => setImageFailed(true)}
                />
            ) : initials}
        </span>
    );
}
