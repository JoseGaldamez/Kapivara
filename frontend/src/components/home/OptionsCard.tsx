import { Project } from "@/types"
import { Download, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface OptionsCardProps {
    project: Project
    setIsOpen: (isOpen: boolean) => void;
    deleteThisProject: (project: Project) => void;
}

export const OptionsCard = ({ project, setIsOpen, deleteThisProject }: OptionsCardProps) => {


    const handleExport = () => {
        toast.success(`Export not implemented yet`);
    }

    return (
        <>
            <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                }}
            />
            <div className="absolute right-0 top-11 z-30 flex w-40 flex-col overflow-hidden rounded-lg border border-[#d8d1ca] bg-white p-1 shadow-[0_10px_26px_rgba(45,34,27,0.13)] dark:border-white/10 dark:bg-[#222329]">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleExport();
                        setIsOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-[9px] px-3 py-2 text-left text-sm text-[#6f594e] transition-colors hover:bg-[#edf5fd] hover:text-[#0E61B1] dark:text-[#d5cec9] dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
                <div className="mx-2 h-px bg-[#eee3da] dark:bg-white/7" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteThisProject(project);
                        setIsOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-[9px] px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </>
    )
}
