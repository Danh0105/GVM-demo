import { AppError } from "@dts";
import debounce from "lodash.debounce";
import { StateCreator } from "zustand";

export interface AppSlice {
    error?: AppError;
    rateLimitUntil?: number;
    setError: (error?: AppError) => void;
    setRateLimit: (retryAfterSeconds: number) => void;
}

const appSlice: StateCreator<AppSlice, [], [], AppSlice> = (set, get) => ({
    rateLimitUntil: undefined,
    setRateLimit: retryAfterSeconds => {
        set(state => ({
            ...state,
            rateLimitUntil: Date.now() + retryAfterSeconds * 1000,
        }));
    },
    setError: (error?: AppError) => {
        set(state => ({ ...state, error }));
        debounce(() => {
            if (get().error) {
                set(state => ({ ...state, error: undefined }));
            }
        }, 5000)();
    },
});

export default appSlice;
