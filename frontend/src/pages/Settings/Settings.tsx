import { useState, useEffect } from "react";
import { User, Sliders, Palette, Database, Keyboard, Info, X } from "lucide-react";
import { settingsController } from "@/controllers/settings.controller";
import { AccountTab } from "./tabs/AccountTab";
import { GeneralTab } from "./tabs/GeneralTab";
import { ThemeTab } from "./tabs/ThemeTab";
import { DataTab } from "./tabs/DataTab";
import { ShortcutsTab } from "./tabs/ShortcutsTab";
import { AboutTab } from "./tabs/AboutTab";
import { INFORMATION } from "@/utils/information.constant";

export type SettingsCategory = "account" | "general" | "theme" | "data" | "shortcuts" | "about";

interface SettingsProps {
    onClose: () => void;
    initialCategory?: SettingsCategory;
}

interface CategoryNav {
    id: SettingsCategory;
    label: string;
    icon: typeof User;
}

const CATEGORIES: CategoryNav[] = [
    { id: "account", label: "Account", icon: User },
    { id: "general", label: "General", icon: Sliders },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "data", label: "Data", icon: Database },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
    { id: "about", label: "About", icon: Info },
];

export const Settings = ({ onClose, initialCategory = "account" }: SettingsProps) => {
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory);

    useEffect(() => {
        settingsController.loadSettings();
    }, []);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative flex h-[715px] max-h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border border-[#ded7ce] bg-[#fffdf9] shadow-2xl dark:border-white/10 dark:bg-[#18191e] animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#ded7ce] bg-[#fffdf9] px-6 dark:border-white/8 dark:bg-[#18191e]">
                    <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold tracking-tight text-[#2c211c] dark:text-[#f8eee5]">
                            Settings
                        </span>
                        <span className="text-xs text-[#7e695d] dark:text-[#9e9791]">
                            / Preferences
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#7e695d] transition-colors hover:bg-black/5 hover:text-[#2c211c] dark:text-[#9e9791] dark:hover:bg-white/10 dark:hover:text-[#f8eee5] cursor-pointer"
                        aria-label="Close Settings"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 2-Panel Body Layout */}
                <div className="flex flex-1 min-h-0">
                    {/* Left Sidebar: Categories Navigation */}
                    <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-[#ded7ce] bg-[#fbf8f3] p-3 dark:border-white/8 dark:bg-[#141519]">
                        <nav className="space-y-1">
                            {CATEGORIES.map((category) => {
                                const Icon = category.icon;
                                const isActive = activeCategory === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] transition-all cursor-pointer ${
                                            isActive
                                                ? "bg-[#f0e8dc] font-semibold text-[#2c211c] shadow-2xs dark:bg-white/10 dark:text-[#f8eee5]"
                                                : "font-medium text-[#7e695d] hover:bg-black/5 hover:text-[#2c211c] dark:text-[#9e9791] dark:hover:bg-white/5 dark:hover:text-[#ede8e3]"
                                        }`}
                                    >
                                        <Icon
                                            size={16}
                                            className={
                                                isActive
                                                    ? "text-[#245f92] dark:text-[#79b8ff]"
                                                    : "text-[#7e695d] dark:text-[#9e9791]"
                                            }
                                        />
                                        <span>{category.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Sidebar Footer Stamp */}
                        <div className="border-t border-[#ded7ce]/60 px-3 pt-2.5 text-[11px] font-mono text-[#7e695d]/80 dark:border-white/5 dark:text-[#9e9791]/80">
                            {INFORMATION.name} v{INFORMATION.version}
                        </div>
                    </aside>

                    {/* Right Panel: Category Content */}
                    <main className="flex-1 overflow-y-auto bg-[#fffdf9] p-8 dark:bg-[#18191e]">
                        {activeCategory === "account" && <AccountTab />}
                        {activeCategory === "general" && <GeneralTab />}
                        {activeCategory === "theme" && <ThemeTab />}
                        {activeCategory === "data" && <DataTab />}
                        {activeCategory === "shortcuts" && <ShortcutsTab />}
                        {activeCategory === "about" && <AboutTab />}
                    </main>
                </div>
            </div>
        </div>
    );
};
