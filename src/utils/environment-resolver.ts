export const resolveTemplateString = (value: string, variables: Record<string, string>): string => {
    if (!value) return value;
    return value.replace(/{{\s*([A-Za-z0-9_.-]+)\s*}}/g, (_, variableName: string) => {
        return variables[variableName] ?? `{{${variableName}}}`;
    });
};

export const resolveVariablesInUnknown = <T>(input: T, variables: Record<string, string>): T => {
    if (typeof input === 'string') {
        return resolveTemplateString(input, variables) as T;
    }

    if (Array.isArray(input)) {
        return input.map((item) => resolveVariablesInUnknown(item, variables)) as T;
    }

    if (input && typeof input === 'object') {
        const output: Record<string, unknown> = {};
        Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
            output[key] = resolveVariablesInUnknown(value, variables);
        });
        return output as T;
    }

    return input;
};

