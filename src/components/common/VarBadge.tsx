import { useState } from 'react';
import { createPortal } from 'react-dom';

interface VarBadgeProps {
    name: string;
    exists: boolean;
    resolvedValue?: string;
    onClickMissing?: () => void;
    onClickExists?: () => void;
}

export const VarBadge = ({ name, exists, resolvedValue, onClickMissing, onClickExists }: VarBadgeProps) => {
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: rect.left, y: rect.bottom + 6 });
    };

    const handleMouseLeave = () => setTooltipPos(null);

    return (
        <>
            <span
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={exists ? onClickExists : onClickMissing}
                title={exists ? 'Click to edit this variable' : 'Click to add this variable'}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono select-none inline-block transition-all duration-200 ${
                    exists
                        ? 'bg-violet-50/80 backdrop-blur-md border-violet-200/60 text-violet-700 dark:bg-violet-950/35 dark:border-violet-800/40 dark:text-violet-300 cursor-pointer hover:bg-violet-100/90 dark:hover:bg-violet-900/40 hover:shadow-[0_0_10px_rgba(167,139,250,0.35)]'
                        : 'bg-rose-50/80 backdrop-blur-md border-rose-200/60 text-rose-600 dark:bg-rose-950/35 dark:border-rose-900/30 dark:text-rose-400 cursor-pointer hover:bg-rose-100/90 dark:hover:bg-rose-900/40 hover:shadow-[0_0_10px_rgba(251,113,133,0.35)]'
                }`}
                style={{ pointerEvents: 'auto' }}
            >
                {name}
            </span>

            {tooltipPos &&
                createPortal(
                    <div
                        style={{ position: 'fixed', top: tooltipPos.y, left: tooltipPos.x, zIndex: 9999 }}
                        className="min-w-40 max-w-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg pointer-events-none"
                    >
                        {exists ? (
                            <div className="p-2 text-xs text-gray-700 dark:text-gray-200 font-mono break-all">
                                <span className="block text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1 font-sans">
                                    Resolved value
                                </span>
                                {resolvedValue !== undefined && resolvedValue !== ''
                                    ? resolvedValue
                                    : <em className="text-gray-400 dark:text-gray-500">empty</em>}
                            </div>
                        ) : (
                            <div className="p-2">
                                <span className="block text-xs text-red-500 dark:text-red-400 mb-0.5">
                                    Variable not found
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Click the badge to add it
                                </span>
                            </div>
                        )}
                    </div>,
                    document.body
                )}
        </>
    );
};

