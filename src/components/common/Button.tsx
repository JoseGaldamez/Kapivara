interface MethodOption {
    label: string;
    value: string;
    className?: string;
    activeClassName?: string;
}

interface MethodButtonProps {
    value: string;
    onChange: (value: string) => void;
    option: MethodOption;
}

export const MethodButton = ({ value, onChange, option }: MethodButtonProps) => {
    return (
        <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${value === option.value
                    ? `${option.activeClassName} ${option.className} ring-1`
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
        >
            {option.label}
        </button>
    );
};