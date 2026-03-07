import { useState } from "react";
import { Folder } from "lucide-react";

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, parentId?: string) => void;
    parentId?: string; // Optional: To support nested folders
}

export const CreateFolderModal = ({ isOpen, onClose, onCreate, parentId }: CreateFolderModalProps) => {
    const [name, setName] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), parentId);
            setName("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <Folder className="text-[#0E61B1]" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Folder</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Default Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Authentication, Users API"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0E61B1]"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#0E61B1] hover:bg-[#0E61B1]/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Folder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
