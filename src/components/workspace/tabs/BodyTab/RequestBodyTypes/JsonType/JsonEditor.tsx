import { useRef } from "react";

interface JsonEditorProps {
    value: string;
    isValidJson: boolean;
    onChange: (value: string) => void;

}

export const JsonEditor = ({ value, onChange, isValidJson }: JsonEditorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);

    };

    const handleScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const target = e.currentTarget;
            const newValue = value.substring(0, start) + "    " + value.substring(end);

            onChange(newValue);

            // We need to set selection after render
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 4;
            }, 0);
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const target = e.currentTarget;

            // Find start of current line
            const lastNewLine = value.lastIndexOf('\n', start - 1);
            const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
            const currentLine = value.substring(lineStart, start);

            // Extract leading whitespace
            const indent = currentLine.match(/^\s*/)?.[0] || '';
            const newValue = value.substring(0, start) + "\n" + indent + value.substring(end);

            onChange(newValue);

            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 1 + indent.length;
            }, 0);
        }

        if (e.key === '{' || e.key === '[' || e.key === '"') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const target = e.currentTarget;
            const closing = e.key === '{' ? '}' : e.key === '[' ? ']' : '"';
            // Check if the closing bracket is already the next character
            const nextChar = value[end];
            const alreadyClosed = nextChar === closing;

            const insertion = alreadyClosed ? e.key : (e.key + closing);
            const newValue = value.substring(0, start) + insertion + value.substring(end);

            onChange(newValue);

            // Set cursor after the opening bracket
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 1;
            }, 0);
        }
    };

    const highlight = (code: string) => {
        if (!code) return "";
        return code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                let cls = 'text-blue-600 dark:text-blue-400'; // number
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'text-purple-600 dark:text-purple-400 font-semibold'; // key
                    } else {
                        cls = 'text-green-600 dark:text-green-400'; // string
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'text-orange-600 dark:text-orange-400 font-bold'; // boolean
                } else if (/null/.test(match)) {
                    cls = 'text-gray-500 dark:text-gray-400 italic'; // null
                }
                return `<span class="${cls}">${match}</span>`;
            });
    };

    const getBorderColor = () => {
        return isValidJson ? 'border-gray-300 dark:border-gray-700' : 'border-red-500';
    };

    return (
        <div className={`relative w-full h-full font-mono text-sm border ${getBorderColor()} rounded overflow-hidden bg-gray-50 dark:bg-gray-900`}>
            <pre
                ref={preRef}
                className="absolute top-0 left-0 w-full h-full p-2 m-0 pointer-events-none select-none overflow-hidden whitespace-pre text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: highlight(value) + '<br>' }}
                style={{ fontFamily: 'monospace' }}
            />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                className="absolute top-0 left-0 w-full h-full p-2 m-0 text-transparent caret-black dark:caret-white outline-none resize-none whitespace-pre overflow-auto"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                style={{ fontFamily: 'monospace' }}
            />
        </div>
    );
};
