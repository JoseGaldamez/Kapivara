import LogoKapivara from "@/assets/logo-kapivara.png"
import { Settings, User, X } from "lucide-react"
import { toast } from "react-toastify"

interface TopBarProps {
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

export const TopBar = ({ searchTerm = "", onSearchChange }: TopBarProps) => {

    const handleSettings = (action: string) => {
        // TODO: Implement settings logic
        toast.info(`${action} not implemented yet`);
    }

    return (
        <div className="w-full h-16 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={LogoKapivara} alt="Logo Kapivara" className="w-52" />
                    <div className="px-4 relative">
                        <input
                            type="text"
                            placeholder="Search project"
                            className="border border-gray-300 bg-white rounded-3xl pl-4 pr-10 py-2 w-96 outline-none focus:border-blue-500 transition-colors"
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
                    <button onClick={() => { handleSettings("Settings") }} className="bg-gray-50 text-gray-600 p-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                        <Settings size={24} />
                    </button>
                    <button onClick={() => { handleSettings("User") }} className="bg-gray-50 text-gray-600 p-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                        <User size={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}
