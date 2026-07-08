import { padWithLeadingZeros } from "./string";

export const formatDate = (date: Date, format = "mm/dd/yyyy"): string => {
    if (!date) {
        return "";
    }

    const day: number = date.getDate();
    const month: number = date.getMonth() + 1;
    const year = date.getFullYear();

    const tokens = {
        yyyy: year,
        yy: String(year).substring(2),
        mm: padWithLeadingZeros(Number(month), 2),
        m: month,

        dd: padWithLeadingZeros(Number(day), 2),
        d: day,
    };

    const regexp = new RegExp(
        Object.keys(tokens)
            .map(t => `(${t})`)
            .join("|"),
        "g",
    );

    return format.replace(regexp, token => {
        if (token in tokens) return tokens[token];
        return token;
    });
};

export function formatDateTime(value?: string | Date | null) {
    if (!value) {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hour}:${minute}`;
}
