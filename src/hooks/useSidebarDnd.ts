import { useState } from "react";
import {
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import { RequestInfo } from "@/types";
import { requestController } from "@/controllers/request.controller";
import { toast } from "react-toastify";

interface UseSidebarDndOptions {
    requests: RequestInfo[];
    projectId: string;
}

export function useSidebarDnd({ requests, projectId }: UseSidebarDndOptions) {
    const [draggingItem, setDraggingItem] = useState<RequestInfo | null>(null);
    const [isOverRoot, setIsOverRoot] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const requestId = event.active.id.toString().replace("request-", "");
        const request = requests.find((r) => r.id === requestId);
        setDraggingItem(request || null);
        setIsOverRoot(false);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        // When hovering over empty space (undefined) or the explicit root zone,
        // highlight the root drop area if the dragging item was in a collection
        const hovering = over?.id;
        const inEmptySpace = !hovering;
        const inExplicitRoot = hovering === "explicit-root";
        setIsOverRoot((inEmptySpace || inExplicitRoot));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        const currentDraggingItem = draggingItem;
        setDraggingItem(null);
        setIsOverRoot(false);

        const requestId = active.id.toString().replace("request-", "");
        const request = requests.find((r) => r.id === requestId);
        if (!request) return;

        let targetCollectionId: string | null = null;

        if (!over) {
            // No droppable hit — treat as move to root only if item was in a collection
            if (currentDraggingItem?.collection_id) {
                targetCollectionId = null;
            } else {
                return;
            }
        } else if (over.id === "explicit-root") {
            targetCollectionId = null;
        } else if (over.id.toString().startsWith("drop-request-")) {
            const targetRequestId = over.id.toString().replace("drop-request-", "");
            const targetReq = requests.find((r) => r.id === targetRequestId);
            targetCollectionId = targetReq?.collection_id || null;
        } else {
            targetCollectionId = over.id.toString().replace("folder-", "");
        }

        if (
            request.collection_id === targetCollectionId ||
            (request.collection_id == null && targetCollectionId == null)
        ) {
            return;
        }

        try {
            await requestController.updateRequest(requestId, projectId, {
                collection_id: targetCollectionId,
            });
            toast.success("Request moved successfully");
        } catch (error) {
            console.error("Error moving request:", error);
            toast.error("Failed to move request");
        }
    };

    return { sensors, draggingItem, isOverRoot, handleDragStart, handleDragOver, handleDragEnd };
}
