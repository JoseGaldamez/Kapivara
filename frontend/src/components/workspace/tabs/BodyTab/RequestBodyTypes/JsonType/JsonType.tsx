import { useMemo } from "react";
import { JsonEditor } from "./JsonEditor";

interface JsonTypeProps {
    value: string;
    onChange: (value: string) => void;
}

export const JsonType = ({ value, onChange }: JsonTypeProps) => {
    const isValidJson = useMemo(() => {
        if (!value || !value.trim()) return true;
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    }, [value]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 h-64">
                <JsonEditor
                    isValidJson={isValidJson}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};
