export const highlight = (code: string) => {
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


export const getBorderColor = (isValidJson: boolean) => {
    return isValidJson ? 'border-gray-300 dark:border-gray-700' : 'border-red-500';
};