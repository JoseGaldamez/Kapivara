import LogoKapivaraLight from "@/assets/logo-kapivara.png"
import LogoKapivaraDark from "@/assets/logo-kapivara-dark.png"
import { Settings, X } from "lucide-react"

interface TopBarProps {
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
    onOpenSettings: () => void;
}

export const TopBar = ({ searchTerm = "", onSearchChange, onOpenSettings }: TopBarProps) => {
    return (
        <div className="w-full h-16 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={LogoKapivaraLight} alt="Logo Kapivara" className="w-52 dark:hidden" />
                    <img src={LogoKapivaraDark} alt="Logo Kapivara" className="w-52 hidden dark:block" />
                    
                    <div className="px-4 relative">
                        <input
                            type="text"
                            placeholder="Search project"
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-3xl pl-4 pr-10 py-2 w-96 outline-none focus:border-blue-500 dark:text-white transition-colors"
                            value={searchTerm}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange?.("")}
                                className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={16} className="cursor-pointer" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onOpenSettings} className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Settings size={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}
