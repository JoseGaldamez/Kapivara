import { METHODS_COLORS } from '@/utils/methods.constants';
import { Play, Save } from 'lucide-react'

interface FormRequestSectionProps {
    method: string;
    url: string;
    isLoading: boolean;
    handleSend: () => void;
    handleSave: () => void;
    handleMethodChange: (method: string) => void;
    handleUrlChange: (url: string) => void;
}

const METHODS = Object.keys(METHODS_COLORS);

export const FormRequestSection = ({ method, url, isLoading, handleSend, handleSave, handleMethodChange, handleUrlChange }: FormRequestSectionProps) => {


    const getMethodColor = (m: string) => {
        return METHODS_COLORS[m as keyof typeof METHODS_COLORS];
    };

    return (
        <div className="p-4 border-b border-gray-200 flex gap-2">
            <div className="flex-1 flex items-center bg-gray-100 rounded-lg p-1 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                <select
                    value={method}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    className={`bg-transparent font-bold text-sm px-3 py-1.5 focus:outline-none cursor-pointer ${getMethodColor(method)}`}
                >
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="Enter request URL"
                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                />
            </div>
            <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-[#0E61B1] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#0E61B1]/90 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Play size={16} fill="currentColor" /> {isLoading ? "Sending..." : "Send"}
            </button>
            <button
                onClick={handleSave}
                className="text-gray-500 p-2 hover:bg-gray-100 rounded-lg hover:text-[#0E61B1] transition-colors"
                title="Save Request"
            >
                <Save size={20} />
            </button>
        </div>
    )
}
