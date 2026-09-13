import { SettingCard } from "../components/SettingCard";

interface ShortcutItem {
    keys: string[];
    action: string;
    description: string;
}

export const ShortcutsTab = () => {
    const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    const modKey = isMac ? "⌘" : "Ctrl";

    const requestShortcuts: ShortcutItem[] = [
        {
            keys: [modKey, "Enter"],
            action: "Send Request",
            description: "Execute the active request and display results in response panel.",
        },
        {
            keys: [modKey, "S"],
            action: "Save Request",
            description: "Persist current URL, headers, and body changes to collection in SQLite.",
        },
        {
            keys: [modKey, "F"],
            action: "Filter Requests",
            description: "Quickly focus the search bar in the collections sidebar.",
        },
    ];

    const navigationShortcuts: ShortcutItem[] = [
        {
            keys: ["Enter"],
            action: "Edit Request Title",
            description: "When the request header title is focused, press Enter to edit inline.",
        },
        {
            keys: ["Escape"],
            action: "Close / Dismiss",
            description: "Close open dialogs, environment selectors, and contextual menus.",
        },
        {
            keys: ["Tab"],
            action: "Next Input Cell",
            description: "Advance to the next key or value cell in parameter/header tables.",
        },
    ];

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                    Keyboard Shortcuts
                </h2>
                <p className="text-xs text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                    Accelerate your API workflow with keyboard shortcuts.
                </p>
            </div>

            {/* Request Execution */}
            <SettingCard
                title="Request & Execution"
                description="Shortcuts for sending, persisting, and searching requests."
            >
                <div className="divide-y divide-[#ded7ce]/50 dark:divide-white/5">
                    {requestShortcuts.map((item) => (
                        <div
                            key={item.action}
                            className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                        >
                            <div>
                                <span className="text-xs font-semibold text-[#2c211c] dark:text-[#f8eee5] block">
                                    {item.action}
                                </span>
                                <span className="text-[11px] text-[#7e695d] dark:text-[#9e9791]">
                                    {item.description}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {item.keys.map((k) => (
                                    <kbd
                                        key={k}
                                        className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-[#ded7ce] bg-[#fbf8f3] px-2 py-1 font-mono text-[11px] font-semibold text-[#2c211c] shadow-2xs dark:border-white/10 dark:bg-[#121316] dark:text-[#ede8e3]"
                                    >
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SettingCard>

            {/* Navigation & Editing */}
            <SettingCard
                title="Navigation & Modals"
                description="Shortcuts for navigating forms, dismissing dialogs, and inline editing."
            >
                <div className="divide-y divide-[#ded7ce]/50 dark:divide-white/5">
                    {navigationShortcuts.map((item) => (
                        <div
                            key={item.action}
                            className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                        >
                            <div>
                                <span className="text-xs font-semibold text-[#2c211c] dark:text-[#f8eee5] block">
                                    {item.action}
                                </span>
                                <span className="text-[11px] text-[#7e695d] dark:text-[#9e9791]">
                                    {item.description}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {item.keys.map((k) => (
                                    <kbd
                                        key={k}
                                        className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-[#ded7ce] bg-[#fbf8f3] px-2 py-1 font-mono text-[11px] font-semibold text-[#2c211c] shadow-2xs dark:border-white/10 dark:bg-[#121316] dark:text-[#ede8e3]"
                                    >
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SettingCard>
        </div>
    );
};
