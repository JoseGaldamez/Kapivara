import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings.store";
import { ArrowUpRight, X } from "lucide-react";
import { settingsController } from "@/controllers/settings.controller";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { INFORMATION } from "@/utils/information.constant";

import githubIcon from "@/assets/github.png"

interface SettingsProps {
    onClose: () => void;
}

export const Settings = ({ onClose }: SettingsProps) => {
    const settings = useSettingsStore(state => state.settings);

    useEffect(() => {
        getSettings();
    }, []);

    const getSettings = () => {
        settingsController.loadSettings();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[95%] h-[95%] relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 will-change-transform transform-gpu">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your application preferences</p>
                    </div>
                    <button
                        onClick={() => onClose()}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-black/20 overscroll-contain">
                    <div className="max-w-4xl mx-auto p-8 space-y-8">
                        <AppearanceSettings theme={settings.theme} language={settings.language} editorFontSize={settings.editor_font_size} />
                        {/* <NetworkSettings sslVerification={settings.ssl_verification} requestTimeout={settings.request_timeout} followRedirects={settings.follow_redirects} /> */}
                        {/* <SystemSettings telemetry={true} /> */}

                        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 pb-8">
                            <div>
                                👨‍💻 Made with ❤️ by <a href="https://josegaldamez.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold">José Galdámez <ArrowUpRight size={16} className="inline" /></a>
                            </div>
                            <a href="https://github.com/josegaldamez/kapivara" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer hover:underline">
                                <img src={githubIcon} alt="Github" className="w-6 h-6" />  {INFORMATION.name} v{INFORMATION.version}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
