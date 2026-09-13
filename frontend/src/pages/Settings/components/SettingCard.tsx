import React from "react";

interface SettingCardProps {
    title?: string;
    description?: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const SettingCard = ({ title, description, badge, children, className = "" }: SettingCardProps) => {
    return (
        <div className={`rounded-xl border border-[#ded7ce] bg-[#fffdf9] p-5 dark:border-white/8 dark:bg-[#18191e] shadow-2xs ${className}`}>
            {(title || description || badge) && (
                <div className="mb-4 flex items-start justify-between gap-3 pb-3 border-b border-[#ded7ce]/60 dark:border-white/5">
                    <div>
                        {title && (
                            <h3 className="text-sm font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="mt-0.5 text-xs text-[#7e695d] dark:text-[#9e9791]">
                                {description}
                            </p>
                        )}
                    </div>
                    {badge && <div className="shrink-0">{badge}</div>}
                </div>
            )}
            <div className="space-y-4">{children}</div>
        </div>
    );
};
