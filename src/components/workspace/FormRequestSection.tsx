import { METHODS_COLORS } from '@/utils/methods.constants';
import { Play, Save } from 'lucide-react'
import { Select } from '@/components/common/Select';

interface FormRequestSectionProps {
    method: string;
    url: string;
    isLoading: boolean;
    handleSend: () => void;
    handleSave: () => void;
    handleMethodChange: (method: string) => void;
    handleUrlChange: (url: string) => void;
    isDirty?: boolean;
}

const METHODS = Object.keys(METHODS_COLORS);
const METHOD_OPTIONS = METHODS.map(m => ({
    label: m,
    value: m,
    className: METHODS_COLORS[m as keyof typeof METHODS_COLORS]
}));

export const FormRequestSection = ({ method, url, isLoading, handleSend, handleSave, handleMethodChange, handleUrlChange, isDirty }: FormRequestSectionProps) => {


    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex gap-2">
            <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all">
                <Select
                    value={method}
                    onChange={handleMethodChange}
                    options={METHOD_OPTIONS}
                    className="w-28 font-bold text-sm"
                />
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSend();
                        }
                    }}
                    placeholder="Enter request URL"
                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
            </div>
            <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-[#0E61B1] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#0E61B1]/90 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <Play size={16} fill="currentColor" /> {isLoading ? "Sending..." : "Send"}
            </button>
            <button
                onClick={handleSave}
                className={`p-2 rounded-lg transition-colors cursor-pointer relative ${isDirty ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0E61B1] dark:hover:text-[#0E61B1]'}`}
                title="Save Request"
            >
                <Save size={20} />
                {isDirty && <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>}
            </button>
        </div>
    )
}
