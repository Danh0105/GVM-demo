import { ScheduleAppointment } from "@dts";
import { StateCreator } from "zustand";
import {
    CreateWorkScheduleParams,
    createWorkSchedule,
    getWorkSchedule,
} from "@/services/services.mock";
import { OrganizationSlice } from "./organizationSlice";
import { AuthSlice } from "./authSlice";

export interface ScheduleSlice {
    gettingSchedule?: boolean;
    creatingSchedule?: boolean;
    schedule?: ScheduleAppointment;
    getSchedule: () => Promise<void>;
    createSchedule: (
        params: Omit<CreateWorkScheduleParams, "organizationId">,
    ) => void;
}

const scheduleSlice: StateCreator<
    ScheduleSlice & OrganizationSlice & AuthSlice,
    [],
    [],
    ScheduleSlice
> = (set, get) => ({
    gettingSchedule: false,
    creatingSchedule: false,
    getSchedule: async () => {
        try {
            const organizationId = get().organization?.id;

            set(state => ({
                ...state,
                gettingSchedule: true,
            }));
            const schedule = await getWorkSchedule({
                organizationId: organizationId || "",
            });

            set(state => ({
                ...state,
                schedule: schedule || undefined,
            }));
        } catch (err) {
            set(state => ({
                ...state,
                schedule: undefined,
            }));
        } finally {
            set(state => ({
                ...state,
                gettingSchedule: false,
            }));
        }
    },
    createSchedule: async (
        params: Omit<CreateWorkScheduleParams, "organizationId">,
    ) => {
        try {
            await get().getAccessToken();

            if (!get().token) {
                throw new Error("Không thể xác thực bằng Zalo.");
            }

            const organizationId = get().organization?.id;

            set(state => ({
                ...state,

                creatingSchedule: true,
            }));

            const data = await createWorkSchedule({
                ...params,
                organizationId: organizationId || "",
            });

            set(state => ({ ...state, schedule: data || undefined }));
        } catch (err) {
            set(state => ({
                ...state,
                error: {
                    message: "Đã có lỗi xảy ra, vui lòng thử lại sau!",
                },
            }));
        } finally {
            set(state => ({
                ...state,
                creatingSchedule: false,
            }));
        }
    },
});

export default scheduleSlice;
