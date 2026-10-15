import React, { useMemo, useState } from "react";
import {
    addDays,
    eachWeekOfInterval,
    endOfMonth,
    format,
    getDay,
    startOfWeek,
} from "date-fns";
import {
    CalendarDays,
    ChefHat,
    Clock3,
    Users,
    Utensils,
    Wallet,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import MealPhoto from "@/assets/school-meal.jpg";
import { number, School } from "./data";
import { boardingDishes, gradesFor, meals } from "./boardingMenu";
import MealFeedback from "./MealFeedback";
import "./boarding.css";

const weekdays = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
];

export default function BoardingDetails({ school }: { school: School }) {
    const [view, setView] = useState("menu");
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(10);
    const [weekKey, setWeekKey] = useState("2026-10-12");
    const [grade, setGrade] = useState("all");
    const [mode, setMode] = useState("week");
    const [dayIndex, setDayIndex] = useState(2);
    const grades = gradesFor(school);
    const weeks = useMemo(
        () =>
            eachWeekOfInterval(
                {
                    start: new Date(year, month - 1, 1),
                    end: endOfMonth(new Date(year, month - 1, 1)),
                },
                { weekStartsOn: 1 },
            ),
        [year, month],
    );
    const week =
        weeks.find(date => format(date, "yyyy-MM-dd") === weekKey) || weeks[0];
    const dates = Array.from({ length: 7 }, (_, i) => addDays(week, i));
    const selectedDates = mode === "day" ? [dates[dayIndex]] : dates;
    const gradeIndex = grades.indexOf(grade);
    const totalRegistered = Math.round(
        school.students * (school.level === "Mầm non" ? 0.88 : 0.62),
    );
    const base = Math.floor(totalRegistered / grades.length);
    const registered =
        grade === "all"
            ? totalRegistered
            : base + (gradeIndex < totalRegistered % grades.length ? 1 : 0);
    const foodFor = (date: Date, meal: number) =>
        boardingDishes(school, date, meal, gradeIndex);
    const scheduled =
        selectedDates.filter(date => getDay(date) !== 0 && getDay(date) !== 6)
            .length * meals.length;
    const operatingDays = Array.from(
        { length: endOfMonth(new Date(year, month - 1, 1)).getDate() },
        (_, i) => new Date(year, month - 1, i + 1),
    ).filter(date => ![0, 6].includes(getDay(date))).length;
    const dailyFee = meals.reduce((sum, meal) => sum + meal.price, 0);
    const changePeriod = (nextYear: number, nextMonth: number) => {
        setYear(nextYear);
        setMonth(nextMonth);
        setWeekKey(
            format(
                startOfWeek(new Date(nextYear, nextMonth - 1, 1), {
                    weekStartsOn: 1,
                }),
                "yyyy-MM-dd",
            ),
        );
        setDayIndex(0);
    };
    const weekIndex = weeks.findIndex(
        date => date.getTime() === week.getTime(),
    );
    const moveWeek = (direction: number) => {
        const next = weeks[weekIndex + direction];
        if (next) setWeekKey(format(next, "yyyy-MM-dd"));
    };
    const renderMeal = (date: Date, mealIndex: number) => {
        if ([0, 6].includes(getDay(date)))
            return <span className="boarding-no-meal">Không phục vụ</span>;
        return (
            <div className="boarding-options">
                {foodFor(date, mealIndex).map((food, index) => (
                    <article className="boarding-dish" key={food}>
                        <img
                            src={MealPhoto}
                            alt="Ảnh minh họa bữa ăn"
                            loading="lazy"
                        />
                        <div>
                            <small>LỰA CHỌN {index + 1}</small>
                            <strong>{food}</strong>
                        </div>
                    </article>
                ))}
            </div>
        );
    };
    return (
        <>
            <div className="boarding-title">
                <div>
                    <p className="school-eyebrow">DỊCH VỤ BÁN TRÚ</p>
                    <h2>Thông tin bán trú</h2>
                    <p className="school-muted">
                        Năm học 2026–2027 ·{" "}
                        {grade === "all" ? "Tất cả khối lớp" : grade}
                    </p>
                </div>
                <span className="school-status">Đang phục vụ</span>
            </div>
            <section
                className="school-stats boarding-stats"
                aria-label="Thống kê bán trú"
            >
                {[
                    {
                        label: "Học sinh đăng ký",
                        value: number(registered),
                        note: grade === "all" ? "Toàn trường" : grade,
                        icon: Users,
                        color: "teal",
                    },
                    {
                        label: "Số bữa mỗi ngày",
                        value: "3",
                        note: "Sáng · Trưa · Xế",
                        icon: Utensils,
                        color: "blue",
                    },
                    {
                        label: "Tiền ăn / ngày",
                        value: `${number(dailyFee)} đ`,
                        note: "Theo một học sinh",
                        icon: Wallet,
                        color: "amber",
                    },
                    {
                        label: "Ngày phục vụ / tháng",
                        value: number(operatingDays),
                        note: `Tháng ${month}/${year} · Theo lịch mẫu`,
                        icon: CalendarDays,
                        color: "violet",
                    },
                ].map(item => (
                    <article
                        className={`school-stat ${item.color}`}
                        key={item.label}
                    >
                        <div className="school-stat-label">
                            <span>{item.label}</span>
                            <item.icon size={18} />
                        </div>
                        <strong>{item.value}</strong>
                        <small>{item.note}</small>
                    </article>
                ))}
            </section>
            <div className="school-tabs" role="tablist" aria-label="Căn tin số">
                {[
                    { id: "menu", label: "Thực đơn" },
                    { id: "feedback", label: "Phản hồi bữa ăn" },
                ].map(item => (
                    <button
                        key={item.id}
                        id={`canteen-tab-${item.id}`}
                        role="tab"
                        aria-selected={view === item.id}
                        aria-controls={`canteen-panel-${item.id}`}
                        tabIndex={view === item.id ? 0 : -1}
                        className={view === item.id ? "selected" : ""}
                        onClick={() => setView(item.id)}
                        onKeyDown={event => {
                            if (
                                [
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Home",
                                    "End",
                                ].includes(event.key)
                            ) {
                                event.preventDefault();
                                const next =
                                    event.key === "Home"
                                        ? "menu"
                                        : event.key === "End"
                                        ? "feedback"
                                        : view === "menu"
                                        ? "feedback"
                                        : "menu";
                                setView(next);
                                document
                                    .getElementById(`canteen-tab-${next}`)
                                    ?.focus();
                            }
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div
                id="canteen-panel-menu"
                role="tabpanel"
                aria-labelledby="canteen-tab-menu"
                hidden={view !== "menu"}
            >
                <section
                    className="boarding-schedule"
                    aria-label="Thực đơn bán trú"
                >
                    <div className="boarding-section-heading">
                        <div>
                            <h2>
                                <ChefHat size={20} />
                                Lịch thực đơn
                            </h2>
                            <p className="school-muted">
                                {format(week, "dd/MM/yyyy")} –{" "}
                                {format(addDays(week, 6), "dd/MM/yyyy")}
                            </p>
                        </div>
                        <div
                            className="boarding-modes"
                            role="group"
                            aria-label="Chế độ lịch"
                        >
                            <button
                                aria-pressed={mode === "day"}
                                onClick={() => setMode("day")}
                            >
                                Ngày
                            </button>
                            <button
                                aria-pressed={mode === "week"}
                                onClick={() => setMode("week")}
                            >
                                Tuần
                            </button>
                        </div>
                    </div>
                    <div className="boarding-filters">
                        <label>
                            Khối lớp
                            <select
                                aria-label="Khối lớp"
                                value={grade}
                                onChange={event => setGrade(event.target.value)}
                            >
                                <option value="all">Tất cả khối lớp</option>
                                {grades.map(g => (
                                    <option key={g}>{g}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Năm
                            <select
                                aria-label="Năm"
                                value={year}
                                onChange={event =>
                                    changePeriod(
                                        Number(event.target.value),
                                        month,
                                    )
                                }
                            >
                                {[2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>
                                        Năm {y}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Tháng
                            <select
                                aria-label="Tháng"
                                value={month}
                                onChange={event =>
                                    changePeriod(
                                        year,
                                        Number(event.target.value),
                                    )
                                }
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i + 1}>
                                        Tháng {i + 1}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="boarding-week-filter">
                            Tuần áp dụng
                            <select
                                aria-label="Tuần áp dụng"
                                value={format(week, "yyyy-MM-dd")}
                                onChange={event =>
                                    setWeekKey(event.target.value)
                                }
                            >
                                {weeks.map(w => (
                                    <option
                                        key={w.toISOString()}
                                        value={format(w, "yyyy-MM-dd")}
                                    >
                                        {format(w, "dd/MM")} –{" "}
                                        {format(addDays(w, 6), "dd/MM/yyyy")}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="boarding-calendar-toolbar">
                        <span>
                            {scheduled} bữa có thực đơn /{" "}
                            {selectedDates.length * 3} ô lịch
                        </span>
                        <div>
                            <button
                                className="school-icon"
                                aria-label="Tuần trước"
                                title="Tuần trước"
                                disabled={weekIndex === 0}
                                onClick={() => moveWeek(-1)}
                            >
                                <ChevronLeft size={17} />
                            </button>
                            <button
                                className="school-icon"
                                aria-label="Tuần sau"
                                title="Tuần sau"
                                disabled={weekIndex === weeks.length - 1}
                                onClick={() => moveWeek(1)}
                            >
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                    {mode === "day" && (
                        <label className="boarding-day-filter">
                            Ngày xem
                            <select
                                aria-label="Ngày xem"
                                value={dayIndex}
                                onChange={event =>
                                    setDayIndex(Number(event.target.value))
                                }
                            >
                                {dates.map((date, index) => (
                                    <option key={index} value={index}>
                                        {weekdays[index]} ·{" "}
                                        {format(date, "dd/MM/yyyy")}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    {mode === "week" && (
                        <div className="boarding-week-table">
                            <table>
                                <caption className="boarding-sr-only">
                                    Thực đơn theo bữa và ngày trong tuần
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Bữa ăn</th>
                                        {dates.map((date, i) => (
                                            <th
                                                scope="col"
                                                className={`boarding-day-color day-${i}`}
                                                key={date.toISOString()}
                                            >
                                                {weekdays[i]}
                                                <small>
                                                    {format(date, "dd/MM")}
                                                </small>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {meals.map((meal, mealIndex) => (
                                        <tr key={meal.name}>
                                            <th scope="row">
                                                <Utensils size={18} />
                                                <strong>{meal.name}</strong>
                                                <small>{meal.time}</small>
                                                <span>
                                                    {number(meal.price)} đ
                                                </span>
                                            </th>
                                            {dates.map(date => (
                                                <td key={date.toISOString()}>
                                                    {renderMeal(
                                                        date,
                                                        mealIndex,
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div
                        className={`boarding-day-list ${
                            mode === "day" ? "daily" : "weekly"
                        }`}
                    >
                        {selectedDates.map(date => (
                            <section
                                className="boarding-day"
                                key={date.toISOString()}
                            >
                                <h3
                                    className={`boarding-day-color day-${
                                        (getDay(date) + 6) % 7
                                    }`}
                                >
                                    {weekdays[(getDay(date) + 6) % 7]}
                                    <span>{format(date, "dd/MM/yyyy")}</span>
                                </h3>
                                {[0, 6].includes(getDay(date)) ? (
                                    <p className="boarding-weekend">
                                        Không phục vụ bán trú
                                    </p>
                                ) : (
                                    meals.map((meal, index) => (
                                        <div
                                            className="boarding-daily-meal"
                                            key={meal.name}
                                        >
                                            <div className="boarding-meal-label">
                                                <strong>
                                                    <Utensils size={15} />
                                                    {meal.name}
                                                </strong>
                                                <span>
                                                    <Clock3 size={13} />
                                                    {meal.time} ·{" "}
                                                    {number(meal.price)} đ
                                                </span>
                                            </div>
                                            {renderMeal(date, index)}
                                        </div>
                                    ))
                                )}
                            </section>
                        ))}
                    </div>
                </section>
                <section className="boarding-info">
                    <div>
                        <h2>Chi phí bán trú</h2>
                        <dl className="school-info">
                            <div>
                                <dt>Tiền ăn mỗi ngày</dt>
                                <dd>{number(dailyFee)} đ / học sinh</dd>
                            </div>
                            <div>
                                <dt>Phí quản lý mỗi tháng</dt>
                                <dd>80.000 đ / học sinh</dd>
                            </div>
                            <div>
                                <dt>
                                    Dự kiến tháng {month}/{year}
                                </dt>
                                <dd>
                                    {number(dailyFee * operatingDays + 80000)} đ
                                    / học sinh
                                </dd>
                            </div>
                            <div>
                                <dt>Số ngày tính tiền ăn</dt>
                                <dd>{operatingDays} ngày theo lịch mẫu</dd>
                            </div>
                        </dl>
                    </div>
                    <div>
                        <h2>Thông tin phục vụ</h2>
                        <dl className="school-info">
                            <div>
                                <dt>Đơn vị phụ trách</dt>
                                <dd>Bộ phận bán trú · {school.name}</dd>
                            </div>
                            <div>
                                <dt>Giờ nghỉ trưa</dt>
                                <dd>12:00 – 14:00</dd>
                            </div>
                            <div>
                                <dt>Email liên hệ (mẫu)</dt>
                                <dd>bantru@{school.id}.example</dd>
                            </div>
                            <div>
                                <dt>Lịch phục vụ</dt>
                                <dd>Thứ 2 – Thứ 6</dd>
                            </div>
                        </dl>
                    </div>
                </section>
            </div>
            <div
                id="canteen-panel-feedback"
                role="tabpanel"
                aria-labelledby="canteen-tab-feedback"
                hidden={view !== "feedback"}
            >
                <MealFeedback school={school} />
            </div>
            <footer className="school-footer">
                Dữ liệu bán trú, chi phí và thực đơn mẫu · Ảnh bữa ăn chỉ mang
                tính minh họa.
            </footer>
        </>
    );
}
