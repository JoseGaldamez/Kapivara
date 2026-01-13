import { useState } from "react";
import { JsonEditor } from "./JsonEditor";

interface JsonTypeProps {
    value: string;
    onChange: (value: string) => void;
}

export const JsonType = ({ value, onChange }: JsonTypeProps) => {

    const [isValidJson, setIsValidJson] = useState(true);

    const checkJson = (bodyContent: string) => {
        try {
            JSON.parse(bodyContent);
            setIsValidJson(true);
        } catch (error) {
            setIsValidJson(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 h-64">
                <JsonEditor isValidJson={isValidJson} value={value} onChange={(bodyContent) => {
                    onChange(bodyContent);
                    checkJson(bodyContent)
                }} />
            </div>
        </div>
    );
};


/*

{
    "id": 2,
    "name": "Jose Galdamez",
    "address": {
        "country": "Honduras",
        "city": "El Progreso"
    }
}

*/