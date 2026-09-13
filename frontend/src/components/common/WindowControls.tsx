import { Copy, Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Quit,
    WindowIsMaximised,
    WindowMinimise,
    WindowToggleMaximise,
} from "../../../wailsjs/runtime/runtime";

const hasWailsRuntime = () => typeof window !== "undefined" && "runtime" in window;

export const WindowControls = () => {
    const [isMaximised, setIsMaximised] = useState(false);

    useEffect(() => {
        if (!hasWailsRuntime()) return;

        const syncWindowState = () => {
            void WindowIsMaximised()
                .then(setIsMaximised)
                .catch(() => undefined);
        };

        syncWindowState();
        window.addEventListener("resize", syncWindowState);
        return () => window.removeEventListener("resize", syncWindowState);
    }, []);

    const minimise = () => {
        if (hasWailsRuntime()) WindowMinimise();
    };

    const toggleMaximise = () => {
        if (!hasWailsRuntime()) return;
        WindowToggleMaximise();
        setIsMaximised((current) => !current);
    };

    const close = () => {
        if (hasWailsRuntime()) Quit();
    };

    return (
        <div className="window-controls ml-1 flex h-full items-stretch" aria-label="Window controls">
            <button type="button" onClick={minimise} aria-label="Minimize window" title="Minimize" className="window-control-button">
                <Minus size={16} strokeWidth={1.5} />
            </button>
            <button type="button" onClick={toggleMaximise} aria-label={isMaximised ? "Restore window" : "Maximize window"} title={isMaximised ? "Restore" : "Maximize"} className="window-control-button">
                {isMaximised ? <Copy size={13} strokeWidth={1.5} /> : <Square size={13} strokeWidth={1.5} />}
            </button>
            <button type="button" onClick={close} aria-label="Close application" title="Close" className="window-control-button window-control-close">
                <X size={17} strokeWidth={1.5} />
            </button>
        </div>
    );
};
