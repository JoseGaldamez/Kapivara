import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

interface UseVerticalPanelResizeOptions {
    initialHeight: number;
    minHeight: number;
    reservedHeight: number;
    fallbackMaxHeight: number;
}

export const useVerticalPanelResize = <T extends HTMLElement>({
    initialHeight,
    minHeight,
    reservedHeight,
    fallbackMaxHeight,
}: UseVerticalPanelResizeOptions) => {
    const [height, setHeight] = useState(initialHeight);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<T>(null);
    const dragStartRef = useRef({ startY: 0, startHeight: initialHeight });

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (event: MouseEvent) => {
            const deltaY = dragStartRef.current.startY - event.clientY;
            const maxHeight = containerRef.current
                ? containerRef.current.clientHeight - reservedHeight
                : fallbackMaxHeight;
            setHeight(Math.max(minHeight, Math.min(maxHeight, dragStartRef.current.startHeight + deltaY)));
        };
        const handleMouseUp = () => setIsDragging(false);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "none";
        document.body.style.cursor = "row-resize";
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [fallbackMaxHeight, isDragging, minHeight, reservedHeight]);

    const startResizing = useCallback((event: ReactMouseEvent) => {
        event.preventDefault();
        window.getSelection()?.removeAllRanges();
        dragStartRef.current = { startY: event.clientY, startHeight: height };
        setIsDragging(true);
    }, [height]);

    return { containerRef, height, isDragging, startResizing };
};
