import { LucideIcon } from 'lucide-react';

interface CategoryIconProps {
    icon: LucideIcon;
    bgColor: string; // e.g. '#6460FF'
    size?: 'sm' | 'md' | 'lg';
}

export default function CategoryIcon({ icon: Icon, bgColor, size = 'md' }: CategoryIconProps) {
    const sizeMap = {
        sm: 'w-[40px] h-[40px] rounded-[10px] p-2',
        md: 'w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-[16px] p-3',
        lg: 'w-[72px] h-[72px] rounded-[20px] p-4',
    };

    const iconSizeMap = {
        sm: 'w-[20px] h-[20px]',
        md: 'w-[28px] h-[28px] sm:w-[34px] sm:h-[34px]',
        lg: 'w-[40px] h-[40px]',
    };

    return (
        <div
            style={{ backgroundColor: bgColor }}
            className={`${sizeMap[size]} flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-transform group-hover:scale-105`}
        >
            <Icon className={iconSizeMap[size]} />
        </div>
    );
}