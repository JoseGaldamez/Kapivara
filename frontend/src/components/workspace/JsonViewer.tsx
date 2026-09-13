import React, { useMemo } from "react";

interface JsonViewerProps {
    data: string;
}

const highlightValue = (val: string): React.ReactNode => {
    const trimmed = val.trim();
    const hasTrailingComma = trimmed.endsWith(",");
    const core = hasTrailingComma ? trimmed.slice(0, -1) : trimmed;

    let coloredNode: React.ReactNode = core;
    if (core.startsWith('"') && core.endsWith('"')) {
        coloredNode = <span className="text-[#0284c7] dark:text-[#38bdf8]">{core}</span>;
    } else if (core === "true" || core === "false") {
        coloredNode = <span className="text-[#2563eb] dark:text-[#60a5fa] font-semibold">{core}</span>;
    } else if (core === "null") {
        coloredNode = <span className="text-[#8a7e72] dark:text-[#a89f91] italic">{core}</span>;
    } else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(core)) {
        coloredNode = <span className="text-[#7c3aed] dark:text-[#a78bfa]">{core}</span>;
    } else {
        coloredNode = <span className="text-[#5f554e] dark:text-[#a89f91]">{core}</span>;
    }

    return (
        <>
            {coloredNode}
            {hasTrailingComma && <span className="text-[#5f554e] dark:text-[#a89f91]">,</span>}
        </>
    );
};

const highlightJsonLine = (line: string): React.ReactNode => {
    // Check if line contains a key: "key": value
    const keyMatch = line.match(/^(\s*)(".*?")\s*:\s*(.*)$/);
    if (keyMatch) {
        const [, indent, key, rest] = keyMatch;
        return (
            <>
                <span>{indent}</span>
                <span className="text-[#ea580c] dark:text-[#fb923c] font-medium">{key}</span>
                <span className="text-[#5f554e] dark:text-[#a89f91]">: </span>
                {highlightValue(rest)}
            </>
        );
    }

    // No key: e.g. bracket or scalar line
    const indentMatch = line.match(/^(\s*)(.*)$/);
    const indent = indentMatch ? indentMatch[1] : "";
    const content = indentMatch ? indentMatch[2] : line;

    return (
        <>
            <span>{indent}</span>
            {highlightValue(content)}
        </>
    );
};

export const JsonViewer = ({ data }: JsonViewerProps) => {
    const formattedLines = useMemo(() => {
        if (!data) return [""];
        try {
            const parsed = JSON.parse(data);
            const pretty = JSON.stringify(parsed, null, 2);
            return pretty.split("\n");
        } catch {
            // Raw text fallback split by lines
            return data.split("\n");
        }
    }, [data]);

    return (
        <div className="py-3 font-mono text-xs select-text min-h-full">
            {formattedLines.map((line, index) => (
                <div
                    key={index}
                    className="flex hover:bg-black/[0.025] dark:hover:bg-white/[0.035] py-0.5 leading-5 transition-colors"
                >
                    <span className="w-11 shrink-0 text-right pr-3.5 text-[#8a7e72]/60 dark:text-[#6e665d] select-none text-[11px] tabular-nums border-r border-[#ded7ce]/40 dark:border-white/5 bg-black/[0.015] dark:bg-white/[0.015]">
                        {index + 1}
                    </span>
                    <span className="flex-1 whitespace-pre break-all pl-3.5 pr-4 text-[#2c211c] dark:text-[#f3eeea]">
                        {highlightJsonLine(line)}
                    </span>
                </div>
            ))}
        </div>
    );
};
