import { NoneType } from "./RequestBodyTypes/NoneType";
import { JsonType } from "./RequestBodyTypes/JsonType/JsonType";
import { FormDataType } from "./RequestBodyTypes/FormDataType";
import { UrlEncodedType } from "./RequestBodyTypes/UrlEncodedType";
import { RawType } from "./RequestBodyTypes/RawType";

interface BodyTabProps {
    body: string;
    setBody: (body: string) => void;
    bodyType: string;
    setBodyType: (type: any) => void;
}

type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

const BODY_TYPES: { id: BodyType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'json', label: 'JSON' },
    { id: 'form-data', label: 'Form Data' },
    { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
    { id: 'raw', label: 'Raw' },
];

export const BodyTab = ({ body, setBody, bodyType, setBodyType }: BodyTabProps) => {

    return (
        <div className="flex flex-col h-full">
            {/* Body Type Selector */}
            <div className="flex items-center gap-4 mb-4 text-xs">
                {BODY_TYPES.map((type) => (
                    <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="bodyType"
                            checked={bodyType === type.id}
                            onChange={() => setBodyType(type.id)}
                            className="text-[#0E61B1] focus:ring-[#0E61B1]"
                        />
                        <span className={`${bodyType === type.id ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                            {type.label}
                        </span>
                    </label>
                ))}
            </div>

            {/* Body Editor Content */}
            <div className="flex-1">
                {bodyType === 'none' && <NoneType />}
                {bodyType === 'json' && <JsonType value={body} onChange={setBody} />}
                {bodyType === 'form-data' && <FormDataType />}
                {bodyType === 'x-www-form-urlencoded' && <UrlEncodedType />}
                {bodyType === 'raw' && <RawType />}
            </div>
        </div>
    );
};
