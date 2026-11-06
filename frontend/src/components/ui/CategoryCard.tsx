import CategoryIcon from './CategoryIcon';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
    title: string;
    bgColor: string;
    icon: LucideIcon;
    onClick?: () => void;
}

export default function CategoryCard({ title, bgColor, icon, onClick }: CategoryCardProps) {
    return (
        <div
            onClick={onClick}
            className="h-[167px] p-[22px] bg-white/87 backdrop-blur-md rounded-[16px] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] border border-[#E1E6F3]/50 flex flex-col items-center justify-center gap-[18px] cursor-pointer hover:scale-[1.02] transition-all group"
        >
            <CategoryIcon icon={icon} bgColor={bgColor} size="md" />
            <h3 className="text-[19px] font-bold leading-[27.55px] text-[#0B123D] text-center">
                {title}
            </h3>
        </div>
    );
}