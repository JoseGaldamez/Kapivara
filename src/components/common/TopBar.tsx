import LogoKapivaraLight from "@/assets/logotipo_light.png"
import LogoKapivaraDark from "@/assets/logotipo_dark.png"
import { Settings, User, X } from "lucide-react"
import { toast } from "react-toastify"
import { useSettingsStore } from "@/stores/settings.store"
import { useEffect, useState } from "react"

interface TopBarProps {
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
    onOpenSettings: () => void;
}

export const TopBar = ({ searchTerm = "", onSearchChange, onOpenSettings }: TopBarProps) => {

    const theme = useSettingsStore(state => state.settings.theme);

     const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");
    
      useEffect(() => {
        if (theme === 'auto') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
    
          const handleChange = (e: MediaQueryListEvent) => {
            setEffectiveTheme(e.matches ? 'dark' : 'light');
          };
    
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
          setEffectiveTheme(theme as "light" | "dark");
        }
      }, [theme]);

    const handleUser = () => {
        toast.info(`User not implemented yet`);
    }

    return (
        <div className="w-full h-16 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={effectiveTheme === "light" ? LogoKapivaraLight : LogoKapivaraDark} alt="Logo Kapivara" className="w-52" />
                    
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
                    <button onClick={handleUser} className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <User size={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}
