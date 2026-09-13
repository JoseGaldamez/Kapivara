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
                className={`px-1.5 py-0.2 rounded-md border text-[11px] font-mono select-none inline-block transition-all duration-150 ${
                    exists
                        ? 'bg-blue-50 border-blue-200/70 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-300 cursor-pointer hover:bg-blue-100/80'
                        : 'bg-rose-50 border-rose-200/70 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400 cursor-pointer hover:bg-rose-100/80'
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
