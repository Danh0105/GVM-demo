import { getDay } from "date-fns";
import { School } from "./data";

export const meals = [
    { name: "Ăn sáng", time: "07:00 – 07:30", price: 12000 },
    { name: "Ăn trưa", time: "11:00 – 11:45", price: 25000 },
    { name: "Ăn xế", time: "14:30 – 15:00", price: 8000 },
];
const menus = [
    [
        ["Cháo thịt bằm", "Bánh mì trứng"],
        ["Phở gà", "Bún thịt nạc"],
        ["Nui thịt bằm", "Cháo gà"],
        ["Bánh cuốn", "Bún bò"],
        ["Cơm trứng", "Phở bò"],
    ],
    [
        ["Cơm gà, canh rau ngót", "Cơm cá kho, canh bí"],
        ["Cơm thịt kho, canh cải", "Cơm bò xào, canh rau"],
        ["Cơm cá sốt cà, canh bí", "Cơm gà luộc, canh cải"],
        ["Cơm thịt viên, canh rau", "Cơm tôm, canh mướp"],
        ["Cơm bò hầm, canh bí", "Cơm gà, canh nấm"],
    ],
    [
        ["Sữa chua và chuối"],
        ["Bánh flan và sữa"],
        ["Bánh bao và sữa"],
        ["Sữa chua và đu đủ"],
        ["Bánh bông lan và sữa"],
    ],
];

export function gradesFor(school: School) {
    if (school.level === "Mầm non")
        return ["Nhà trẻ", "Mẫu giáo bé", "Mẫu giáo nhỡ", "Mẫu giáo lớn"];
    const range =
        school.level === "Tiểu học"
            ? [1, 5]
            : school.level === "THCS"
            ? [6, 9]
            : [10, 12];
    return Array.from(
        { length: range[1] - range[0] + 1 },
        (_, i) => `Khối ${range[0] + i}`,
    );
}

export function boardingDishes(
    school: School,
    date: Date,
    meal: number,
    gradeIndex = 0,
): string[] {
    if ([0, 6].includes(getDay(date))) return [];
    const offset = school.code
        .split("")
        .reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return menus[meal][
        (getDay(date) -
            1 +
            Math.max(0, gradeIndex) +
            offset +
            Math.floor(date.getDate() / 7)) %
            5
    ];
}
