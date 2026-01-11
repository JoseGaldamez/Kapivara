import { X } from "lucide-react";
import { useState } from "react";

interface CreateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, method: string) => Promise<void>;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

export const CreateRequestModal = ({ isOpen, onClose, onCreate }: CreateRequestModalProps) => {
    const [name, setName] = useState("");
    const [method, setMethod] = useState("GET");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            await onCreate(name, method);
            onClose();
            setName("");
            setMethod("GET");
        } catch (error) {
            console.error("Error creating request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Create New Request</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="req-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Request Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="req-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Get User Profile"
                            autoFocus
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Method
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {HTTP_METHODS.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMethod(m)}
                                    className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition-all ${method === m
                                            ? "bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="px-4 py-2 bg-[#0E61B1] text-white rounded-xl font-medium hover:bg-[#0E61B1]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating..." : "Create Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
