import { School } from "./data";
import { isValid, parseISO } from "date-fns";
import { boardingDishes } from "./boardingMenu";

export const feedbackRoles = ["Phụ huynh", "Giáo viên", "Cán bộ"] as const;
export type FeedbackRole = typeof feedbackRoles[number];
export type MealReview = {
    id: string;
    author: string;
    role: FeedbackRole;
    date: string;
    meal: number;
    grade: string;
    dish: string;
    stars: number;
    message: string;
    createdAt: string;
    resolvedAt?: string;
};
export const feedbackKey = (schoolId: string) =>
    `smart-school:meal-feedback:v1:${schoolId}`;

export function sampleReviews(school: School): MealReview[] {
    return [
        {
            role: "Phụ huynh" as const,
            author: "Nguyễn Minh Anh",
            stars: 5,
            meal: 1,
            date: "2026-10-14",
            message: "Bữa trưa vừa khẩu phần, con ăn ngon và thích món canh.",
        },
        {
            role: "Giáo viên" as const,
            author: "Trần Thu Hà",
            stars: 4,
            meal: 0,
            date: "2026-10-13",
            message: "Món ăn được phục vụ đúng giờ, trình bày sạch sẽ.",
        },
        {
            role: "Cán bộ" as const,
            author: "Lê Văn Nam",
            stars: 2,
            meal: 2,
            date: "2026-10-12",
            message: "Cần kiểm tra lại nhiệt độ bữa xế khi chuyển đến lớp.",
        },
    ].map((entry, index) => ({
        ...entry,
        id: `sample-${index}`,
        grade: "Toàn trường",
        dish: boardingDishes(
            school,
            new Date(`${entry.date}T12:00:00`),
            entry.meal,
        )[0],
        createdAt: `${entry.date}T15:00:00.000Z`,
    }));
}

function isReview(value: unknown): value is MealReview {
    if (!value || typeof value !== "object") return false;
    const item = value as MealReview;
    const validDate =
        typeof item.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
        isValid(parseISO(item.date));
    return (
        typeof item.id === "string" &&
        typeof item.author === "string" &&
        feedbackRoles.includes(item.role) &&
        validDate &&
        Number.isInteger(item.meal) &&
        item.meal >= 0 &&
        item.meal <= 2 &&
        typeof item.grade === "string" &&
        typeof item.dish === "string" &&
        Number.isInteger(item.stars) &&
        item.stars >= 1 &&
        item.stars <= 5 &&
        typeof item.message === "string" &&
        typeof item.createdAt === "string" &&
        isValid(parseISO(item.createdAt)) &&
        (item.resolvedAt === undefined ||
            (typeof item.resolvedAt === "string" &&
                isValid(parseISO(item.resolvedAt))))
    );
}

export function readReviews(school: School): MealReview[] {
    const raw = localStorage.getItem(feedbackKey(school.id));
    if (raw === null) return sampleReviews(school);
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every(isReview))
        throw new Error("Invalid feedback data");
    return data;
}

export function saveReviews(
    school: School,
    update: (current: MealReview[]) => MealReview[],
): MealReview[] {
    const next = update(readReviews(school));
    localStorage.setItem(feedbackKey(school.id), JSON.stringify(next));
    return next;
}
