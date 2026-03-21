interface RawTypeProps {
    value: string;
    onChange: (value: string) => void;
}

export const RawType = ({ value, onChange }: RawTypeProps) => {
    return (
        <div className="h-full">
            <textarea
                className="w-full h-64 p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded font-mono text-sm focus:border-[#0E61B1] focus:ring-1 focus:ring-[#0E61B1] outline-none text-gray-800 dark:text-gray-200"
                placeholder="Raw text content..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};
