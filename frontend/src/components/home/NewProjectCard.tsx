import { Plus } from "lucide-react";

interface NewProjectCardProps {
    onClick: () => void;
}

export const NewProjectCard = ({ onClick }: NewProjectCardProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex min-h-[184px] w-full cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#bfb5ac] bg-[#faf7f3] p-6 text-center transition-colors hover:border-[#527b9d] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28679f] dark:border-white/14 dark:bg-white/[0.025] dark:hover:border-blue-400 dark:hover:bg-white/5"
        >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8eef3] text-[#245f92] dark:bg-blue-500/12 dark:text-blue-400">
                <Plus size={23} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold text-[#352c27] dark:text-[#f5ece6]">Create a new project</span>
            <span className="mt-1.5 max-w-[22ch] text-xs leading-5 text-[#8b756a] dark:text-[#9d9894]">Start with a clean, isolated API workspace.</span>
        </button>
    );
};
