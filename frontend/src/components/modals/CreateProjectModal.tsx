import { projectController } from "@/controllers/project.controller";
import { FolderPlus, X } from "lucide-react";
import { useState } from "react";
import { Project } from "@/types";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (project: Project) => void;
}

export const CreateProjectModal = ({ isOpen, onClose, onCreated }: CreateProjectModalProps) => {
    const [name, setName] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            // Generating a random color for now, could be a picker later
            const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            const project = await projectController.createNewProject(name, description, randomColor, baseUrl.trim());
            onCreated?.(project);
            onClose();
            setName("");
            setBaseUrl("");
            setDescription("");
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201b18]/55 p-5 dark:bg-black/70">
            <div className="w-full max-w-md rounded-[10px] border border-[#d9d2cb] bg-[#fffdf9] p-7 shadow-[0_22px_60px_rgba(38,29,23,0.22)] dark:border-white/10 dark:bg-[#1d1e23]"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efe8e1] text-[#875937] dark:bg-[#d99557]/10 dark:text-[#d99a67]">
                            <FolderPlus size={21} strokeWidth={1.8} />
                        </span>
                        <div>
                            <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#342b26] dark:text-[#fff3e9]">Create a project</h2>
                            <p className="mt-0.5 text-xs text-[#8b756a] dark:text-[#96918d]">A fresh, isolated API workspace.</p>
                        </div>
                    </div>
                    <button type="button" aria-label="Close create project dialog" onClick={onClose} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[11px] text-[#8e776b] transition-colors hover:bg-[#f1e5db] hover:text-[#382219] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E61B1] dark:text-[#98938f] dark:hover:bg-white/7 dark:hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="mb-1.5 block text-xs font-extrabold text-[#594137] dark:text-[#d8cec8]">
                            Project name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 w-full rounded-lg border border-[#d9d2cb] bg-white px-4 text-sm text-[#392f29] outline-none transition-[border-color,box-shadow] placeholder:text-[#9b8f86] focus:border-[#6e96b8] focus:shadow-[0_0_0_3px_rgba(40,103,159,0.09)] dark:border-white/12 dark:bg-black/15 dark:text-white dark:focus:border-blue-500/70"
                            placeholder="Payments API"
                            autoFocus
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="base-url" className="mb-1.5 block text-xs font-extrabold text-[#594137] dark:text-[#d8cec8]">
                            Base URL <span className="text-xs font-normal text-[#8b756a] dark:text-[#96918d]">(optional)</span>
                        </label>
                        <input
                            type="text"
                            id="base-url"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="h-11 w-full rounded-lg border border-[#d9d2cb] bg-white px-4 text-sm text-[#392f29] outline-none transition-[border-color,box-shadow] placeholder:text-[#9b8f86] focus:border-[#6e96b8] focus:shadow-[0_0_0_3px_rgba(40,103,159,0.09)] dark:border-white/12 dark:bg-black/15 dark:text-white dark:focus:border-blue-500/70"
                            placeholder="http://localhost:3000"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="mb-1.5 block text-xs font-extrabold text-[#594137] dark:text-[#d8cec8]">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-24 w-full resize-none rounded-lg border border-[#d9d2cb] bg-white px-4 py-3 text-sm text-[#392f29] outline-none transition-[border-color,box-shadow] placeholder:text-[#9b8f86] focus:border-[#6e96b8] focus:shadow-[0_0_0_3px_rgba(40,103,159,0.09)] dark:border-white/12 dark:bg-black/15 dark:text-white dark:focus:border-blue-500/70"
                            placeholder="What will live in this workspace?"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-[#eadfd6] pt-5 dark:border-white/8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 cursor-pointer rounded-[11px] px-4 text-sm font-bold text-[#725b50] transition-colors hover:bg-[#f0e4da] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E61B1] dark:text-[#c2b9b3] dark:hover:bg-white/7"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="h-10 cursor-pointer rounded-lg bg-[#245f92] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1d527f] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {isLoading ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
