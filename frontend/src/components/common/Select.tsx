import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useDismissibleLayer } from "@/hooks/useDismissibleLayer";

interface Option {
    label: string;
    value: string;
    className?: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    className?: string;
}

export const Select = ({ value, onChange, options, className = "" }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useDismissibleLayer<HTMLDivElement>({
        isOpen,
        onDismiss: () => setIsOpen(false),
    });

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`relative ${className} min-w-[120px]`} ref={ref}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
                className={`w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedOption?.className || "text-gray-900 dark:text-white"}`}
            >
                <span>{selectedOption?.label || value}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div role="listbox" className="absolute right-0 z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                type="button"
                                role="option"
                                aria-selected={value === option.value}
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm cursor-pointer transition-colors flex items-center justify-between
                                    ${value === option.value
                                        ? "bg-blue-50 dark:bg-blue-900/30 font-medium " + (option.className || "text-blue-600 dark:text-blue-400")
                                        : "hover:bg-gray-100 dark:hover:bg-gray-700 " + (option.className || "text-gray-700 dark:text-gray-200")
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
