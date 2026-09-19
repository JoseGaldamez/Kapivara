import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import type { RequestResponse } from "@/types";
import { JsonViewer } from "./JsonViewer";
import { isMediaResponse, MediaResponseViewer } from "./MediaResponseViewer";
import { SafeHtmlPreview } from "./SafeHtmlPreview";

interface ExpandedResponseModalProps {
    response: RequestResponse;
    requestName: string;
    initialView: 'response' | 'preview';
    onClose: () => void;
}

export const ExpandedResponseModal = ({ response, requestName, initialView, onClose }: ExpandedResponseModalProps) => {
    const [view, setView] = useState(initialView);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLElement>(null);
    const isMedia = isMediaResponse(response);
    const contentType = response.content_type || Object.entries(response.headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1] || 'text/plain';

    useEffect(() => {
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            } else if (event.key === 'Tab') {
                const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])');
                if (!focusable?.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, [onClose]);

    return createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#16120f]/60 p-3 backdrop-blur-[2px] md:p-6"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="expanded-response-title"
                className="flex h-full min-h-0 w-full max-w-[1600px] flex-col overflow-hidden rounded-xl border border-[#d9d1c8] bg-[#fffdf9] shadow-2xl dark:border-white/10 dark:bg-[#1b1c22]"
            >
                <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e5ded6] px-4 py-3 dark:border-white/8 md:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#edf4ff] text-[#075fc7] dark:bg-blue-500/15 dark:text-blue-300">
                            <Maximize2 size={17} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                            <h2 id="expanded-response-title" className="truncate text-sm font-semibold text-[#1a1714] dark:text-[#f4eadf]">{requestName || 'Response'}</h2>
                            <p className="mt-0.5 truncate font-mono text-[11px] text-[#746a61] dark:text-[#a89f91]">
                                {response.status === 0 ? 'Error' : `${response.status} ${response.status_text}`} · {contentType}
                            </p>
                        </div>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close expanded response"
                        title="Close (Esc)"
                        className="shrink-0 rounded-md p-2 text-[#746a61] transition-colors hover:bg-black/5 hover:text-[#1a1714] focus-visible:outline-2 focus-visible:outline-[#0969da] dark:text-[#a89f91] dark:hover:bg-white/8 dark:hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </header>

                {!isMedia && (
                    <nav className="flex shrink-0 gap-1 border-b border-[#e5ded6] px-4 py-2 dark:border-white/8 md:px-6" aria-label="Response display">
                        {(['response', 'preview'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setView(tab)}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${view === tab ? 'bg-[#eaf3fe] text-[#075fc7] dark:bg-blue-500/15 dark:text-blue-300' : 'text-[#746a61] hover:bg-black/5 dark:text-[#a89f91] dark:hover:bg-white/8'}`}
                            >
                                {tab === 'response' ? 'Response' : 'Preview'}
                            </button>
                        ))}
                    </nav>
                )}

                <div className="min-h-0 flex-1 p-3 md:p-5">
                    {isMedia ? (
                        <MediaResponseViewer response={response} />
                    ) : view === 'preview' ? (
                        <div className="h-full overflow-hidden rounded-lg border border-[#ded7ce] bg-white dark:border-white/8">
                            <SafeHtmlPreview response={response} title="Expanded response preview" />
                        </div>
                    ) : (
                        <div className="h-full overflow-auto rounded-lg border border-[#ded7ce] bg-[#f6f2ec] dark:border-white/8 dark:bg-[#121316]">
                            <JsonViewer data={response.body} expanded />
                        </div>
                    )}
                </div>
            </section>
        </div>,
        document.body,
    );
};
