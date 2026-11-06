interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export default function FormField({ label, ...props }: FormFieldProps) {
    return (
        <div className="w-full">
            <label className="block text-xs font-semibold text-[#0B123D] mb-1.5">
                {label}
            </label>
            <input
                {...props}
                className="w-full px-4 py-3 rounded-xl border border-[#E1E6F3] bg-white text-[#0B123D] text-sm focus:outline-none focus:ring-2 focus:ring-[#245CFF] placeholder:text-[#64708C]/60 transition-all"
            />
        </div>
    );
}