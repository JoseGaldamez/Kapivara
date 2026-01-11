import { useState, useEffect } from "react";
import { useRequestStore } from "@/stores/request.store";
import { FolderPlus, FilePlus, Search } from "lucide-react";

import { RequestInfo } from "@/types";

// Utils
import { METHODS_COLORS } from "@/utils/methods.constants";

// Controllers
import { requestController } from "@/controllers/request.controller";

// Modals
import { CreateRequestModal } from "../modals/CreateRequestModal";

interface SidebarProps {
    projectId: string;
    activeRequestId: string | null;
    onSelectRequest: (request: RequestInfo) => void;
}

const EMPTY_ARRAY: RequestInfo[] = [];

export const Sidebar = ({ projectId, onSelectRequest, activeRequestId }: SidebarProps) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const requests = useRequestStore((state) => state.requestsByProject[projectId] ?? EMPTY_ARRAY);


    useEffect(() => {
        loadData();
    }, [projectId]);


    // TODO: Get requests, environment variables, etc
    const loadData = async () => {
        if (projectId) {
            await requestController.getRequests(projectId);
        }
    };


    const handleCreateRequest = async (name: string, method: string) => {
        try {
            const newReq = await requestController.createRequest(projectId, name, method);
            onSelectRequest(newReq);
        } catch (error) {
            console.error("Error creating request", error);
        }
    };


    const getMethodColor = (method: string) => {
        return METHODS_COLORS[method as keyof typeof METHODS_COLORS];
    };

    const getRequestSelected = (request: RequestInfo) => {
        if (!activeRequestId || !request.id || request.id !== activeRequestId) return "";
        return "bg-blue-100 text-gray-700 font-bold";
    };

    return (
        <div className="w-64 flex flex-col h-full bg-gray-50 border-r border-gray-200">

            <div className="p-3 border-b border-gray-200">
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#0E61B1] text-white py-1.5 rounded-lg text-xs font-medium hover:bg-[#0E61B1]/90"
                    >
                        <FilePlus size={14} /> New Request
                    </button>
                    <button className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg" title="New Folder">
                        <FolderPlus size={16} />
                    </button>
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0E61B1]"
                    />
                </div>
            </div>


            {/* TODO: Tree View when folders are implemented */}
            <div className="flex-1 overflow-y-auto p-2">
                {requests.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center mt-4">
                        No requests yet. <br /> Create one to get started!
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {requests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => onSelectRequest(req)}
                                className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 cursor-pointer text-sm text-gray-700 ${getRequestSelected(req)}`}
                            >
                                <span className={`text-[10px] font-bold w-8 ${getMethodColor(req.method)}`}>{req.method}</span>
                                <span className="truncate">{req.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateRequest}
            />
        </div>
    );
};
