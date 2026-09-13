import { ToastContainer, Slide, type IconProps, type CloseButtonProps } from "react-toastify";
import { Check, AlertCircle, AlertTriangle, Info, Loader2, X } from "lucide-react";

interface AppToastContainerProps {
    theme: "light" | "dark";
}

const ToastCustomIcon = ({ type, isLoading }: IconProps) => {
    if (isLoading) {
        return (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#ede7de] text-[#7e695d] dark:bg-white/10 dark:text-[#9e9791]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </div>
        );
    }

    switch (type) {
        case "success":
            return (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
            );
        case "error":
            return (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 stroke-[2.2]" />
                </div>
            );
        case "warning":
            return (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 stroke-[2.2]" />
                </div>
            );
        case "info":
        default:
            return (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                    <Info className="h-3.5 w-3.5 stroke-[2.2]" />
                </div>
            );
    }
};

const ToastCloseButton = ({ closeToast }: CloseButtonProps) => {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                closeToast(e);
            }}
            className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#8c827a] opacity-60 transition-all hover:bg-black/5 hover:opacity-100 dark:text-[#9e968d] dark:hover:bg-white/10"
            aria-label="Cerrar notificación"
        >
            <X className="h-3.5 w-3.5" />
        </button>
    );
};

export const AppToastContainer = ({ theme }: AppToastContainerProps) => {
    return (
        <ToastContainer
            position="bottom-right"
            theme={theme}
            transition={Slide}
            autoClose={1600}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover={false}
            pauseOnFocusLoss={false}
            draggable={false}
            limit={4}
            icon={ToastCustomIcon}
            closeButton={ToastCloseButton}
        />
    );
};
