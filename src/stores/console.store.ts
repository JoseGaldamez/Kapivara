import { create } from 'zustand';

export interface ConsoleEntry {
    id: string;
    requestName: string;
    method: string;
    url: string;
    timestamp: number;
    status: number;
    statusText: string;
    time_ms: number;
    responseBody: string;
    responseHeaders: Record<string, string>;
    isHtml: boolean;
}

interface ConsoleState {
    entries: ConsoleEntry[];
    isOpen: boolean;
    push: (entry: Omit<ConsoleEntry, 'id'>) => void;
    clear: () => void;
    toggle: () => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
    entries: [],
    isOpen: false,

    push: (entry) =>
        set((state) => ({
            entries: [{ ...entry, id: crypto.randomUUID() }, ...state.entries].slice(0, 200),
        })),

    clear: () => set({ entries: [] }),

    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));


