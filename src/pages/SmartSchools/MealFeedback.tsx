import React, { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import {
    Star,
    MessageSquare,
    Smile,
    AlertCircle,
    Send,
    CheckCheck,
    X,
} from "lucide-react";
import { School, number } from "./data";
import { boardingDishes, gradesFor, meals } from "./boardingMenu";
import {
    feedbackKey,
    feedbackRoles,
    FeedbackRole,
    MealReview,
    readReviews,
    saveReviews,
} from "./mealFeedbackStore";
import "./feedback.css";

export default function MealFeedback({ school }: { school: School }) {
    const [reviews, setReviews] = useState<MealReview[]>([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [role, setRole] = useState<FeedbackRole | "Ban giám hiệu">(
        "Phụ huynh",
    );
    const [audience, setAudience] = useState("");
    const [mealFilter, setMealFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [author, setAuthor] = useState("");
    const [date, setDate] = useState("2026-10-14");
    const [meal, setMeal] = useState(1);
    const [grade, setGrade] = useState(gradesFor(school)[0]);
    const [dishIndex, setDishIndex] = useState(0);
    const [stars, setStars] = useState(0);
    const [message, setMessage] = useState("");
    const grades = gradesFor(school);
    const parsedDate = parseISO(date);
    const dishes = isValid(parsedDate)
        ? boardingDishes(school, parsedDate, meal, grades.indexOf(grade))
        : [];
    const selectedDish = dishes[dishIndex] || dishes[0] || "";
    useEffect(() => {
        const refresh = () => {
            try {
                setReviews(readReviews(school));
                setError("");
            } catch {
                setError(
                    "Không đọc được phản hồi trên thiết bị. Vui lòng kiểm tra dữ liệu hoặc quyền lưu trữ của trình duyệt.",
                );
            }
        };
        refresh();
        const sync = (event: StorageEvent) => {
            if (event.key === feedbackKey(school.id) || event.key === null)
                refresh();
        };
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, [school]);
    const filtered = useMemo(
        () =>
            reviews
                .filter(
                    r =>
                        (!audience || r.role === audience) &&
                        (mealFilter === "" || r.meal === Number(mealFilter)) &&
                        (!statusFilter ||
                            (statusFilter === "resolved"
                                ? Boolean(r.resolvedAt)
                                : !r.resolvedAt)),
                )
                .sort(
                    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
                ),
        [reviews, audience, mealFilter, statusFilter],
    );
    const average = filtered.length
        ? filtered.reduce((sum, r) => sum + r.stars, 0) / filtered.length
        : 0;
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setNotice("");
        if (role === "Ban giám hiệu") return;
        if (!author.trim() || !message.trim() || !stars || !selectedDish) {
            setError(
                "Vui lòng nhập họ tên, chọn món, đánh giá sao và nội dung phản hồi.",
            );
            return;
        }
        const review: MealReview = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            author: author.trim(),
            role,
            date,
            meal,
            grade,
            dish: selectedDish,
            stars,
            message: message.trim(),
            createdAt: new Date().toISOString(),
        };
        try {
            setReviews(saveReviews(school, current => [review, ...current]));
            setError("");
            setNotice("Đã gửi phản hồi bữa ăn.");
            setStars(0);
            setMessage("");
        } catch {
            setError(
                "Không lưu được phản hồi. Nội dung chưa được gửi; hãy kiểm tra quyền lưu trữ và thử lại.",
            );
        }
    };
    const resolve = (id: string) => {
        if (role !== "Ban giám hiệu") return;
        try {
            setReviews(
                saveReviews(school, current =>
                    current.map(r =>
                        r.id === id && !r.resolvedAt
                            ? { ...r, resolvedAt: new Date().toISOString() }
                            : r,
                    ),
                ),
            );
            setError("");
            setNotice("Đã đánh dấu phản hồi được xử lý.");
        } catch {
            setError("Không lưu được trạng thái xử lý. Vui lòng thử lại.");
        }
    };
    return (
        <section className="meal-feedback" aria-label="Phản hồi bữa ăn">
            <div className="feedback-heading">
                <div>
                    <h2>Phản hồi bữa ăn</h2>
                    <p className="school-muted">
                        {school.name} · Dữ liệu lưu trên thiết bị này
                    </p>
                </div>
                <label>
                    Vai trò demo
                    <select
                        aria-label="Vai trò demo"
                        value={role}
                        onChange={event => {
                            setRole(event.target.value as typeof role);
                            setNotice("");
                        }}
                    >
                        {[...feedbackRoles, "Ban giám hiệu"].map(r => (
                            <option key={r}>{r}</option>
                        ))}
                    </select>
                </label>
            </div>
            <section
                className="school-stats feedback-stats"
                aria-label="Thống kê phản hồi"
            >
                {[
                    {
                        label: "Điểm trung bình",
                        value: filtered.length
                            ? `${average.toLocaleString("vi-VN", {
                                  maximumFractionDigits: 1,
                              })}/5`
                            : "—",
                        note: "Theo bộ lọc",
                        icon: Star,
                        color: "amber",
                    },
                    {
                        label: "Phản hồi",
                        value: number(filtered.length),
                        note: "Theo bộ lọc",
                        icon: MessageSquare,
                        color: "blue",
                    },
                    {
                        label: "Hài lòng",
                        value: number(
                            filtered.filter(r => r.stars >= 4).length,
                        ),
                        note: "Đánh giá 4–5 sao",
                        icon: Smile,
                        color: "teal",
                    },
                    {
                        label: "Cần lưu ý",
                        value: number(
                            filtered.filter(r => r.stars <= 2 && !r.resolvedAt)
                                .length,
                        ),
                        note: "1–2 sao, chưa xử lý",
                        icon: AlertCircle,
                        color: "violet",
                    },
                ].map(stat => (
                    <article
                        className={`school-stat ${stat.color}`}
                        key={stat.label}
                    >
                        <div className="school-stat-label">
                            <span>{stat.label}</span>
                            <stat.icon size={18} />
                        </div>
                        <strong>{stat.value}</strong>
                        <small>{stat.note}</small>
                    </article>
                ))}
            </section>
            {notice && (
                <p className="feedback-notice" role="status">
                    {notice}
                </p>
            )}
            {error && (
                <p className="feedback-error" role="alert">
                    {error}
                </p>
            )}
            {role !== "Ban giám hiệu" && (
                <form className="feedback-form" onSubmit={submit}>
                    <h3>Đánh giá bữa ăn</h3>
                    <div className="feedback-form-grid">
                        <label>
                            Họ tên
                            <input
                                aria-label="Họ tên"
                                required
                                maxLength={80}
                                value={author}
                                onChange={event =>
                                    setAuthor(event.target.value)
                                }
                                autoComplete="name"
                            />
                        </label>
                        <label>
                            Ngày ăn
                            <input
                                aria-label="Ngày ăn"
                                type="date"
                                required
                                value={date}
                                onChange={event => {
                                    setDate(event.target.value);
                                    setDishIndex(0);
                                }}
                            />
                        </label>
                        <label>
                            Khối lớp
                            <select
                                aria-label="Khối lớp phản hồi"
                                value={grade}
                                onChange={event => {
                                    setGrade(event.target.value);
                                    setDishIndex(0);
                                }}
                            >
                                {grades.map(g => (
                                    <option key={g}>{g}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Bữa ăn
                            <select
                                aria-label="Bữa ăn đánh giá"
                                value={meal}
                                onChange={event => {
                                    setMeal(Number(event.target.value));
                                    setDishIndex(0);
                                }}
                            >
                                {meals.map((m, i) => (
                                    <option key={m.name} value={i}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="feedback-wide">
                            Món ăn
                            <select
                                aria-label="Món ăn"
                                required
                                value={
                                    selectedDish
                                        ? String(
                                              Math.min(
                                                  dishIndex,
                                                  dishes.length - 1,
                                              ),
                                          )
                                        : ""
                                }
                                disabled={!dishes.length}
                                onChange={event =>
                                    setDishIndex(Number(event.target.value))
                                }
                            >
                                {!dishes.length && (
                                    <option value="">
                                        Không có thực đơn trong ngày này
                                    </option>
                                )}
                                {dishes.map((dish, i) => (
                                    <option key={dish} value={i}>
                                        {dish}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {!dishes.length && (
                        <p className="school-muted">
                            Chọn ngày phục vụ từ thứ 2 đến thứ 6.
                        </p>
                    )}
                    <fieldset className="feedback-rating">
                        <legend>Đánh giá của bạn</legend>
                        <div>
                            {[1, 2, 3, 4, 5].map(value => (
                                <label key={value} title={`${value} sao`}>
                                    <input
                                        type="radio"
                                        name="meal-rating"
                                        required
                                        checked={stars === value}
                                        value={value}
                                        onChange={() => setStars(value)}
                                        aria-label={`${value} sao`}
                                    />
                                    <Star
                                        size={28}
                                        fill={
                                            value <= stars ? "#dba339" : "none"
                                        }
                                        color={
                                            value <= stars
                                                ? "#dba339"
                                                : "#a9b7bb"
                                        }
                                    />
                                </label>
                            ))}
                            <span>
                                {stars ? `${stars}/5` : "Chưa đánh giá"}
                            </span>
                        </div>
                    </fieldset>
                    <label>
                        Nội dung phản hồi
                        <textarea
                            aria-label="Nội dung phản hồi"
                            required
                            maxLength={1000}
                            rows={3}
                            value={message}
                            onChange={event => setMessage(event.target.value)}
                        />
                    </label>
                    <button
                        className="school-command"
                        type="submit"
                        disabled={!dishes.length}
                    >
                        <Send size={16} />
                        Gửi phản hồi
                    </button>
                </form>
            )}
            <div className="feedback-filters">
                <label>
                    Đối tượng
                    <select
                        aria-label="Lọc đối tượng"
                        value={audience}
                        onChange={event => setAudience(event.target.value)}
                    >
                        <option value="">Tất cả</option>
                        {feedbackRoles.map(r => (
                            <option key={r}>{r}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Bữa ăn
                    <select
                        aria-label="Lọc bữa ăn"
                        value={mealFilter}
                        onChange={event => setMealFilter(event.target.value)}
                    >
                        <option value="">Tất cả</option>
                        {meals.map((m, i) => (
                            <option key={m.name} value={i}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Trạng thái
                    <select
                        aria-label="Lọc trạng thái"
                        value={statusFilter}
                        onChange={event => setStatusFilter(event.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="pending">Chưa xử lý</option>
                        <option value="resolved">Đã xử lý</option>
                    </select>
                </label>
            </div>
            <p className="feedback-result-count" aria-live="polite">
                {filtered.length} / {reviews.length} phản hồi
            </p>
            <div className="feedback-list">
                {filtered.map(review => (
                    <article className="feedback-item" key={review.id}>
                        <div className="feedback-item-heading">
                            <div>
                                <strong>{review.author}</strong>
                                <span>
                                    {review.role} · {review.grade}
                                </span>
                            </div>
                            <div
                                className="feedback-stars"
                                aria-label={`${review.stars} trên 5 sao`}
                            >
                                {[1, 2, 3, 4, 5].map(value => (
                                    <Star
                                        key={value}
                                        size={14}
                                        fill={
                                            value <= review.stars
                                                ? "#dba339"
                                                : "none"
                                        }
                                        color={
                                            value <= review.stars
                                                ? "#dba339"
                                                : "#b5c0c3"
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="feedback-meal-info">
                            {format(parseISO(review.date), "dd/MM/yyyy")} ·{" "}
                            {meals[review.meal].name} · {review.dish}
                        </p>
                        <p className="feedback-message">{review.message}</p>
                        <div className="feedback-item-bottom">
                            <span
                                className={`school-status ${
                                    review.resolvedAt ? "" : "warning"
                                }`}
                            >
                                {review.resolvedAt ? "Đã xử lý" : "Chưa xử lý"}
                            </span>
                            {review.resolvedAt ? (
                                <small>
                                    Ban giám hiệu demo ·{" "}
                                    {format(
                                        parseISO(review.resolvedAt),
                                        "dd/MM/yyyy HH:mm",
                                    )}
                                </small>
                            ) : (
                                role === "Ban giám hiệu" && (
                                    <button
                                        className="feedback-resolve"
                                        onClick={() => resolve(review.id)}
                                    >
                                        <CheckCheck size={16} />
                                        Đánh dấu đã xử lý
                                    </button>
                                )
                            )}
                        </div>
                    </article>
                ))}
            </div>
            {!filtered.length && (
                <div className="school-empty">
                    <MessageSquare size={28} />
                    <h3>Chưa có phản hồi phù hợp</h3>
                    {(audience || mealFilter || statusFilter) && (
                        <button
                            className="school-command"
                            onClick={() => {
                                setAudience("");
                                setMealFilter("");
                                setStatusFilter("");
                            }}
                        >
                            <X size={16} />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
