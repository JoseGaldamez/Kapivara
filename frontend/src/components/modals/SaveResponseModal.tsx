import { X } from "lucide-react";
import { useState } from "react";

interface SaveResponseModalProps {
    isOpen: boolean;
    defaultName: string;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export const SaveResponseModal = ({ isOpen, defaultName, onClose, onConfirm }: SaveResponseModalProps) => {
    const [name, setName] = useState(defaultName);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onConfirm(name.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">Save Response</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-900 dark:text-white mb-4"
                        placeholder="Response name"
                        autoFocus
                        onFocus={(e) => e.target.select()}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={!name.trim()} className="px-4 py-2 bg-[#0E61B1] text-white rounded-xl text-sm hover:bg-[#0E61B1]/90 disabled:opacity-50 cursor-pointer">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
