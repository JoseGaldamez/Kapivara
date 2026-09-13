import { useEffect, useRef, useState } from "react";
import { Braces, X } from "lucide-react";

interface ImportCurlModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (command: string) => Promise<void>;
}

export const ImportCurlModal = ({ isOpen, onClose, onImport }: ImportCurlModalProps) => {
    const [command, setCommand] = useState("");
    const [error, setError] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setError("");
        const timer = window.setTimeout(() => textareaRef.current?.focus(), 60);
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isImporting) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isImporting, onClose]);

    if (!isOpen) return null;

    const close = () => {
        if (isImporting) return;
        setCommand("");
        setError("");
        onClose();
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!command.trim()) {
            setError("Paste a cURL command to continue.");
            return;
        }
        setError("");
        setIsImporting(true);
        try {
            await onImport(command);
            setCommand("");
            onClose();
        } catch (importError) {
            setError(importError instanceof Error ? importError.message : "The cURL command could not be imported.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#16120f]/35 p-5 backdrop-blur-[2px]"
            onMouseDown={(event) => event.target === event.currentTarget && close()}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="import-curl-title"
                className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d9d1c8] bg-[#fffdf9] shadow-2xl dark:border-white/10 dark:bg-[#1b1c22]"
            >
                <div className="flex items-start justify-between border-b border-[#e5ded6] px-5 py-4 dark:border-white/8">
                    <div className="flex gap-3">
                        <span className="mt-0.5 grid size-8 place-items-center rounded-lg bg-[#edf4ff] text-[#075fc7] dark:bg-blue-500/15 dark:text-blue-300">
                            <Braces size={16} strokeWidth={1.8} />
                        </span>
                        <div>
                            <h2 id="import-curl-title" className="text-sm font-semibold text-[#1a1714] dark:text-[#f4eadf]">Import from cURL</h2>
                            <p className="mt-0.5 text-xs text-[#746a61] dark:text-[#a89f91]">Create an editable request from a command copied from your browser or documentation.</p>
                        </div>
                    </div>
                    <button onClick={close} className="rounded-md p-1.5 text-[#746a61] transition-colors hover:bg-black/5 hover:text-[#1a1714] dark:text-[#a89f91] dark:hover:bg-white/8 dark:hover:text-white" aria-label="Close">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5">
                    <label htmlFor="curl-command" className="mb-2 block text-xs font-semibold text-[#3f3934] dark:text-[#ded4ca]">cURL command</label>
                    <textarea
                        ref={textareaRef}
                        id="curl-command"
                        value={command}
                        onChange={(event) => { setCommand(event.target.value); if (error) setError(""); }}
                        placeholder="curl --request POST 'https://api.example.com/items' ..."
                        spellCheck={false}
                        className="min-h-56 w-full resize-y rounded-xl border border-[#d9d1c8] bg-[#fbf8f4] px-3.5 py-3 font-mono text-xs leading-5 text-[#231f1b] outline-none transition focus:border-[#1670d2] focus:ring-2 focus:ring-[#1670d2]/12 dark:border-white/10 dark:bg-[#121316] dark:text-[#eee5dc]"
                    />
                    <div className="mt-2 min-h-5">
                        {error ? <p role="alert" className="text-xs text-[#b42318] dark:text-red-300">{error}</p> : <p className="text-[11px] text-[#81766c] dark:text-[#8f877e]">Parsed locally. Credentials and request data never leave your device during import.</p>}
                    </div>
                    <div className="mt-4 flex justify-end gap-2 border-t border-[#ebe5de] pt-4 dark:border-white/8">
                        <button type="button" onClick={close} disabled={isImporting} className="rounded-lg border border-[#d9d1c8] px-3.5 py-2 text-xs font-semibold text-[#4f4740] transition hover:bg-[#f4efe9] disabled:opacity-50 dark:border-white/10 dark:text-[#cfc5bb] dark:hover:bg-white/6">Cancel</button>
                        <button type="submit" disabled={isImporting || !command.trim()} className="rounded-lg bg-[#0969da] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#075fca] disabled:cursor-not-allowed disabled:opacity-50">
                            {isImporting ? "Importing…" : "Import request"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};
