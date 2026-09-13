import { useEffect, useRef } from "react";

interface UseDismissibleLayerOptions {
    isOpen: boolean;
    onDismiss: () => void;
    closeOnEscape?: boolean;
}

/** Centralizes dismissal behavior for menus, popovers and other transient layers. */
export const useDismissibleLayer = <T extends HTMLElement>({
    isOpen,
    onDismiss,
    closeOnEscape = true,
}: UseDismissibleLayerOptions) => {
    const layerRef = useRef<T>(null);
    const onDismissRef = useRef(onDismiss);

    useEffect(() => {
        onDismissRef.current = onDismiss;
    }, [onDismiss]);

    useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (event: MouseEvent) => {
            if (!layerRef.current?.contains(event.target as Node)) {
                onDismissRef.current();
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (closeOnEscape && event.key === "Escape") {
                onDismissRef.current();
            }
        };

        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeOnEscape, isOpen]);

    return layerRef;
};
