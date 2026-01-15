import { Monitor, Sun, Moon, Globe, Type } from "lucide-react";
import { settingsController } from "@/controllers/settings.controller";
import { AppTheme } from "@/types/settings";
import { Select } from "@/components/common/Select";
import { toast } from "react-toastify";

interface AppearanceSettingsProps {
    theme: AppTheme;
    language: string;
    editorFontSize: number;
}

export const AppearanceSettings = ({ theme, language, editorFontSize }: AppearanceSettingsProps) => {

    const languageOptions = [
        { label: "English", value: "en" },
        { label: "Español", value: "es" }
    ];

    return (
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Monitor size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance {theme}</h2>
            </div>

            <div className="p-6 space-y-6">
                {/* Theme */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200 block">Theme</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Select your preferred application theme</span>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {(['light', 'auto', 'dark'] as AppTheme[]).map((newTheme) => (
                            <button
                                key={newTheme}
                                onClick={() => {
                                    settingsController.updateSetting('theme', newTheme)
                                    toast.success(`Theme changed to ${newTheme}`)
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${theme === newTheme
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <span className="flex items-center gap-2 capitalize">
                                    {newTheme === 'light' && <Sun size={14} />}
                                    {newTheme === 'dark' && <Moon size={14} />}
                                    {newTheme === 'auto' && <Monitor size={14} />}
                                    {newTheme}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex items-center gap-3">
                        <Globe size={18} className="text-gray-400" />
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200 block">Language</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Application interface language</span>
                        </div>
                    </div>
                    <Select
                        value={language}
                        onChange={(val) => {
                            settingsController.updateSetting('language', val as any)
                            toast.info(`Language not implemented yet`)
                        }}
                        options={languageOptions}
                        className="w-40"
                    />
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex items-center gap-3">
                        <Type size={18} className="text-gray-400" />
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200 block">Editor Font Size</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Font size for code editors (px)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="10"
                            max="24"
                            step="1"
                            value={editorFontSize}
                            onChange={(e) => {
                                settingsController.updateSetting('editor_font_size', parseInt(e.target.value))
                                toast.info(`Font size not implemented yet`)
                            }}
                            className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-semibold w-8 text-center text-gray-900 dark:text-white">{editorFontSize}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
