import React from "react";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface ProjectPageHeaderProps {
    title: string;
    description: string;
    projectName: string;
    icon: LucideIcon;
    iconColor?: string;
    onNavigateToRequests: () => void;
    actions?: React.ReactNode;
}

export const ProjectPageHeader = ({
    title,
    description,
    projectName,
    icon: Icon,
    iconColor,
    onNavigateToRequests,
    actions,
}: ProjectPageHeaderProps) => {
    return (
        <header className="mb-6">
            <button
                type="button"
                onClick={onNavigateToRequests}
                className="mb-3.5 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#7e695d] transition-colors hover:text-[#2c211c] dark:text-[#9c958f] dark:hover:text-[#f8eee5]"
            >
                <ArrowLeft size={15} /> Back to Requests
            </button>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                        style={{ backgroundColor: iconColor || "#245f92" }}
                    >
                        <Icon size={22} />
                    </span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#2c211c] dark:text-[#f8eee5]">
                            {title}
                        </h1>
                        <p className="text-xs text-[#7e695d] dark:text-[#9e9791]">
                            {description}{" "}
                            <span className="font-semibold text-[#3d2a21] dark:text-[#e4dad3]">
                                {projectName}
                            </span>
                        </p>
                    </div>
                </div>

                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </header>
    );
};
