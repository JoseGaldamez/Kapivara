import React from "react";

interface SettingRowProps {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const SettingRow = ({ label, description, icon, children, className = "" }: SettingRowProps) => {
    return (
        <div className={`flex items-center justify-between gap-4 py-1 ${className}`}>
            <div className="flex items-start gap-3 min-w-0 flex-1">
                {icon && <div className="mt-0.5 shrink-0 text-[#7e695d] dark:text-[#9e9791]">{icon}</div>}
                <div className="min-w-0">
                    <label className="text-xs font-semibold text-[#2c211c] dark:text-[#f8eee5] block">
                        {label}
                    </label>
                    {description && (
                        <p className="text-[11px] leading-relaxed text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="shrink-0 flex items-center">{children}</div>
        </div>
    );
};
