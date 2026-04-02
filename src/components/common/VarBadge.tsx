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
                className={`px-1.5 py-0.5 rounded border text-xs font-mono select-none inline-block ${
                    exists
                        ? 'bg-violet-50 dark:bg-violet-900/25 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/40'
                        : 'bg-red-50 dark:bg-red-900/25 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40'
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

