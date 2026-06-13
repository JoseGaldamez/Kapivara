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
            <div className="absolute right-0 top-12 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-[#0E61B1]/10 z-20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleExport();
                        setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-200 hover:bg-[#0E61B1]/5 hover:text-[#0E61B1] transition-colors text-left cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
                <div className="h-px bg-gray-100 mx-2" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteThisProject(project);
                        setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-colors text-left cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </>
    )
}
