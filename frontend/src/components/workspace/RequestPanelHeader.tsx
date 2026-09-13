import { requestController } from "@/controllers/request.controller";
import type { RequestInfo } from "@/types";
import { getRequestDisplayName } from "@/utils/request-name.util";
import { Edit2, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface RequestPanelHeaderProps {
    request: RequestInfo;
    method: string;
    url: string;
    projectName: string;
    folderPath: string[];
    onSave: () => Promise<void>;
}

export const RequestPanelHeader = ({ request, method, url, projectName, folderPath, onSave }: RequestPanelHeaderProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(request.name || "");
    const inputRef = useRef<HTMLInputElement>(null);
    const saveInFlightRef = useRef(false);
    const skipBlurSaveRef = useRef(false);
    const displayName = getRequestDisplayName({ name: request.name, method, url });

    useEffect(() => {
        if (!isEditing) setTitle(request.name || "");
    }, [isEditing, request.name]);

    useEffect(() => {
        if (!isEditing) return;
        inputRef.current?.focus();
        inputRef.current?.select();
    }, [isEditing]);

    const saveTitle = async () => {
        if (skipBlurSaveRef.current) {
            skipBlurSaveRef.current = false;
            return;
        }
        if (saveInFlightRef.current) return;
        saveInFlightRef.current = true;
        const trimmed = title.trim();
        try {
            if (trimmed !== (request.name || "")) {
                await requestController.updateRequest(request.id, request.project_id, { name: trimmed });
                toast.success(trimmed ? "Request renamed" : "Request name reset to default");
            }
        } catch {
            toast.error("Request could not be renamed");
            setTitle(request.name || "");
        } finally {
            saveInFlightRef.current = false;
            setIsEditing(false);
        }
    };

    return (
        <div className="flex min-h-10 items-center justify-between border-b border-[#ded7ce]/60 bg-[#fbf8f4]/80 px-4 py-2.5 dark:border-white/8 dark:bg-[#17181d]/80">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-[#5f554e] dark:text-[#a89f91]">
                <span className="shrink-0 font-medium text-[#7a695d] dark:text-[#918a84]" title={`Project: ${projectName}`}>{projectName}</span>
                {folderPath.map((folderName, index) => (
                    <span key={`${index}-${folderName}`} className="flex min-w-0 shrink items-center gap-1.5">
                        <span className="shrink-0 text-[#a89c92] dark:text-[#5f5b57]">/</span>
                        <span className="max-w-[150px] truncate font-medium text-[#5f554e] dark:text-[#a89f91]" title={`Folder: ${folderName}`}>{folderName}</span>
                    </span>
                ))}
                <span className="shrink-0 text-[#a89c92] dark:text-[#5f5b57]">/</span>

                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        onBlur={() => void saveTitle()}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") void saveTitle();
                            if (event.key === "Escape") {
                                skipBlurSaveRef.current = true;
                                setTitle(request.name || "");
                                event.currentTarget.blur();
                                setIsEditing(false);
                            }
                        }}
                        placeholder={displayName}
                        aria-label="Request name"
                        className="w-full max-w-sm rounded border border-[#0066ff] bg-white px-2 py-0.5 text-xs font-semibold text-[#1a1714] shadow-2xs focus:outline-none dark:bg-[#202126] dark:text-[#f4eadf]"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => { setTitle(request.name || displayName); setIsEditing(true); }}
                        className="group -mx-1.5 flex min-w-0 cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-black/5 dark:hover:bg-white/8"
                        title="Rename request"
                    >
                        <span className="truncate font-semibold text-[#1a1714] dark:text-[#f4eadf]">{displayName}</span>
                        <Edit2 size={11} className="shrink-0 text-[#8a7e72] opacity-0 transition-opacity group-hover:opacity-100" />
                        {request.is_dirty ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" title="Draft / Unsaved changes" /> : null}
                    </button>
                )}
            </div>

            <button
                type="button"
                onClick={() => void onSave()}
                title="Save Request (Ctrl+S)"
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95 ${request.is_dirty
                    ? "border-[#0066ff]/40 bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff]/20 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-[#ded7ce] bg-white text-[#5f554e] hover:bg-[#f6f2ec] hover:text-[#1a1714] dark:border-white/10 dark:bg-[#20222a] dark:text-[#a89f91] dark:hover:bg-[#262833] dark:hover:text-[#f4eadf]"}`}
            >
                <Save size={13} />
                <span>Save</span>
                {request.is_dirty ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" /> : null}
            </button>
        </div>
    );
};
