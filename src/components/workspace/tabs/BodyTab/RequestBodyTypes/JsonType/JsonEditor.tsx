import { useRef } from "react";
import { getBorderColor, highlight } from "./UtilsFunctionJsonEditor";

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

            if (start !== end) {
                // Multi-line selection indentation
                // Find the start of the line where the selection begins
                const firstLineStart = value.lastIndexOf('\n', start - 1) + 1;
                // Find the end of the line where the selection ends
                let lastLineEnd = value.indexOf('\n', end);
                if (lastLineEnd === -1) lastLineEnd = value.length;

                // Extract the block of lines
                const linesBlock = value.substring(firstLineStart, lastLineEnd);
                const lines = linesBlock.split('\n');

                // Add indentation to each line
                const indentedLines = lines.map(line => "    " + line);
                const indentedBlock = indentedLines.join('\n');

                const newValue = value.substring(0, firstLineStart) + indentedBlock + value.substring(lastLineEnd);

                onChange(newValue);

                // Restore selection covering the entire indented block
                setTimeout(() => {
                    target.selectionStart = firstLineStart;
                    target.selectionEnd = firstLineStart + indentedBlock.length;
                    // If the user selected specifically, try to maintain relative selection? 
                    // Usually block indent selects the whole line. Let's stick to selecting the whole affected block for clarity.
                }, 0);
            } else {
                // Single cursor indentation
                const newValue = value.substring(0, start) + "    " + value.substring(end);
                onChange(newValue);

                setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 4;
                }, 0);
            }
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

            // Smart Enter: if between {} or []
            const charBefore = value[start - 1];
            const charAfter = value[end];
            const isSmartEnter = (charBefore === '{' && charAfter === '}') || (charBefore === '[' && charAfter === ']');

            if (isSmartEnter) {
                const extraIndent = "    ";
                // Insert: \n + indent + extraIndent (cursor here) + \n + indent (closing brace)
                const newValue = value.substring(0, start) + "\n" + indent + extraIndent + "\n" + indent + value.substring(end);

                onChange(newValue);

                setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 1 + indent.length + extraIndent.length;
                }, 0);
            } else {
                // Normal Enter: preserve indentation
                const newValue = value.substring(0, start) + "\n" + indent + value.substring(end);

                onChange(newValue);

                setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 1 + indent.length;
                }, 0);
            }
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





    return (
        <div className={`relative w-full h-full font-mono text-sm border ${getBorderColor(isValidJson)} rounded overflow-hidden bg-gray-50 dark:bg-gray-900`}>
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
