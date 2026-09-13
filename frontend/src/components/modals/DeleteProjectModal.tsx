import { X, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    projectName: string;
}

export const DeleteProjectModal = ({ isOpen, onClose, onConfirm, projectName }: DeleteProjectModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error("Error deleting project:", error);
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201b18]/55 p-5 dark:bg-black/70">
            <div className="w-full max-w-md rounded-[10px] border border-[#d9d2cb] bg-[#fffdf9] p-7 shadow-[0_22px_60px_rgba(38,29,23,0.22)] dark:border-white/10 dark:bg-[#1d1e23]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-3 text-xl font-semibold tracking-[-0.025em] text-[#342b26] dark:text-[#fff3e9]">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"><AlertTriangle size={20} /></span>
                        Delete project
                    </h2>
                    <button type="button" aria-label="Close delete project dialog" onClick={onClose} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[11px] text-[#8e776b] transition-colors hover:bg-[#f1e5db] hover:text-[#382219] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E61B1] dark:text-[#98938f] dark:hover:bg-white/7 dark:hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <p className="mb-4 text-sm leading-6 text-[#725e54] dark:text-[#b3aca7]">
                    Are you sure you want to delete all the APIs in the project <span className="font-bold text-gray-800 dark:text-white">"{projectName}"</span>?
                </p>
                <p className="mb-6 rounded-[12px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                    This removes the local workspace and cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-2 border-t border-[#eadfd6] pt-5 dark:border-white/8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 cursor-pointer rounded-[11px] px-4 text-sm font-bold text-[#725b50] transition-colors hover:bg-[#f0e4da] dark:text-[#c2b9b3] dark:hover:bg-white/7"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-red-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        {isLoading ? "Deleting..." : "Delete Project"}
                    </button>
                </div>
            </div>
        </div>
    );
};
