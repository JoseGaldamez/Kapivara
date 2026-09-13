import { Sun, Moon, Monitor, Type, WrapText } from "lucide-react";
import { SettingCard } from "../components/SettingCard";
import { SettingRow } from "../components/SettingRow";
import { SettingToggle } from "../components/SettingToggle";
import { useSettingsStore } from "@/stores/settings.store";
import { settingsController } from "@/controllers/settings.controller";
import { AppTheme } from "@/types/settings";
import { toast } from "react-toastify";

export const ThemeTab = () => {
    const settings = useSettingsStore((state) => state.settings);

    const themeOptions: { id: AppTheme; label: string; subtitle: string; icon: typeof Sun }[] = [
        { id: "light", label: "Light", subtitle: "Warm daylight palette", icon: Sun },
        { id: "dark", label: "Dark", subtitle: "High contrast dark mode", icon: Moon },
        { id: "auto", label: "System", subtitle: "Match OS preference", icon: Monitor },
    ];

    const handleThemeChange = (newTheme: AppTheme) => {
        settingsController.updateSetting("theme", newTheme);
        toast.success(`Theme switched to ${newTheme}`);
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                    Theme & Editor
                </h2>
                <p className="text-xs text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                    Customize visual color themes and code editor ergonomics.
                </p>
            </div>

            {/* Color Scheme Picker */}
            <SettingCard
                title="Color Scheme"
                description="Select how Kapivara renders window chrome, surfaces, and text."
            >
                <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = settings.theme === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleThemeChange(opt.id)}
                                className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                                    isSelected
                                        ? "border-[#245f92] bg-[#f0f6fc] dark:border-[#388bfd] dark:bg-[#16202c] shadow-xs"
                                        : "border-[#ded7ce] bg-white hover:border-[#b8afa3] hover:bg-[#faf7f2] dark:border-white/10 dark:bg-[#121316] dark:hover:border-white/20 dark:hover:bg-white/5"
                                }`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                            isSelected
                                                ? "bg-[#245f92] text-white"
                                                : "bg-[#ede7de] text-[#7e695d] dark:bg-white/10 dark:text-[#9e9791]"
                                        }`}
                                    >
                                        <Icon size={16} />
                                    </div>
                                    {isSelected && (
                                        <span className="h-2 w-2 rounded-full bg-[#245f92] dark:bg-[#388bfd]" />
                                    )}
                                </div>
                                <span className="mt-3 text-xs font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                                    {opt.label}
                                </span>
                                <span className="text-[11px] text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                                    {opt.subtitle}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </SettingCard>

            {/* Editor Preferences */}
            <SettingCard
                title="Code Editor"
                description="Typography, sizing, and line management for JSON and raw editor tabs."
            >
                <SettingRow
                    icon={<Type size={16} />}
                    label="Editor Font Size"
                    description="Adjust the text scale in request bodies, headers, and response panes."
                >
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="11"
                            max="20"
                            step="1"
                            value={settings.editor_font_size}
                            onChange={(e) => {
                                const size = parseInt(e.target.value, 10);
                                settingsController.updateSetting("editor_font_size", size);
                            }}
                            className="h-1.5 w-28 cursor-pointer appearance-none rounded-lg bg-[#ded7ce] dark:bg-white/20 accent-[#245f92]"
                        />
                        <span className="w-8 text-center font-mono text-xs font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                            {settings.editor_font_size}px
                        </span>
                    </div>
                </SettingRow>

                {/* Live Font Preview */}
                <div className="rounded-lg border border-[#ded7ce]/80 bg-[#f6f2ec] p-3 dark:border-white/8 dark:bg-[#121316]">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#7e695d] dark:text-[#9e9791]">
                        Live Code Preview
                    </div>
                    <pre
                        className="font-mono text-[#2c211c] dark:text-[#f8eee5] overflow-hidden leading-relaxed"
                        style={{ fontSize: `${settings.editor_font_size}px` }}
                    >
                        {`{\n  "app": "Kapivara",\n  "fontSize": ${settings.editor_font_size},\n  "status": "connected"\n}`}
                    </pre>
                </div>

                <SettingRow
                    icon={<WrapText size={16} />}
                    label="Word Wrap"
                    description="Wrap long lines horizontally inside editor canvases to eliminate horizontal scrolling."
                >
                    <SettingToggle
                        checked={settings.word_wrap}
                        onChange={(checked) => {
                            settingsController.updateSetting("word_wrap", checked);
                            toast.success(checked ? "Word wrap enabled" : "Word wrap disabled");
                        }}
                        label="Word Wrap"
                    />
                </SettingRow>
            </SettingCard>
        </div>
    );
};
