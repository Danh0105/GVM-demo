import React, { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Page, useNavigate } from "zmp-ui";
import {
    ArrowLeft,
    Building2,
    GraduationCap,
    Users,
    ClipboardCheck,
    Search,
    X,
    SlidersHorizontal,
    Download,
    MapPin,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import BoardingDetails from "./BoardingDetails";
import {
    School,
    schools,
    levels,
    areas,
    number,
    percent,
    normalize,
    status,
} from "./data";
import "./schools.css";

function SchoolHeader({ onBack }: { onBack?: () => void }) {
    const navigate = useNavigate();
    return (
        <header className="school-header">
            <div className="school-header-inner">
                <button
                    className="school-icon"
                    title="Quay lại"
                    aria-label="Quay lại"
                    onClick={onBack || (() => navigate("/"))}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="school-brand">
                    <GraduationCap size={25} />
                    <span>
                        Trường học thông minh
                        <small>TÂY NINH · NĂM HỌC 2026–2027</small>
                    </span>
                </div>
                <span className="school-demo">Dữ liệu mẫu</span>
            </div>
        </header>
    );
}

function Stats({
    items,
    detail = false,
}: {
    items: School[];
    detail?: boolean;
}) {
    const students = items.reduce((sum, s) => sum + s.students, 0);
    const attendance = students
        ? items.reduce((sum, s) => sum + s.attendance * s.students, 0) /
          students
        : 0;
    const metrics = [
        {
            label: detail ? "Lớp học" : "Trường học",
            value: number(
                detail
                    ? items.reduce((sum, s) => sum + s.classes, 0)
                    : items.length,
            ),
            icon: Building2,
            color: "teal",
            note: detail ? "Năm học 2026–2027" : "Trong danh sách đang lọc",
        },
        {
            label: "Học sinh",
            value: number(students),
            icon: GraduationCap,
            color: "blue",
            note: `${number(
                items.reduce((sum, s) => sum + s.classes, 0),
            )} lớp học`,
        },
        {
            label: "Giáo viên",
            value: number(items.reduce((sum, s) => sum + s.teachers, 0)),
            icon: Users,
            color: "violet",
            note: "Đang công tác",
        },
        {
            label: "Chuyên cần",
            value: students ? percent(attendance) : "—",
            icon: ClipboardCheck,
            color: "amber",
            note: "Bình quân theo số học sinh",
        },
    ];
    return (
        <section className="school-stats" aria-label="Số liệu tổng quan">
            {metrics.map(m => (
                <article className={`school-stat ${m.color}`} key={m.label}>
                    <div className="school-stat-label">
                        <span>{m.label}</span>
                        <m.icon size={19} />
                    </div>
                    <strong>{m.value}</strong>
                    <small>{m.note}</small>
                </article>
            ))}
        </section>
    );
}

function SchoolPhoto({ school }: { school: School }) {
    const [failed, setFailed] = useState(false);
    return (
        <div className="school-photo">
            {failed ? (
                <Building2 size={30} />
            ) : (
                <img
                    src={school.photo}
                    alt="Ảnh minh họa trường học"
                    onError={() => setFailed(true)}
                    loading="lazy"
                />
            )}
        </div>
    );
}

function DigitalMeter({ value }: { value: number }) {
    return (
        <div className="school-digital">
            <span>
                Số hóa <b>{value}%</b>
            </span>
            <progress
                max={100}
                value={value}
                aria-label={`Mức độ số hóa ${value}%`}
            />
        </div>
    );
}

export default function SmartSchoolsPage() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const query = params.get("q") || "";
    const keys = ["level", "area", "ownership", "status"];
    const activeFilters = keys.filter(key => params.get(key));
    const update = (key: string, value: string) =>
        setParams(
            current => {
                const next = new URLSearchParams(current);
                value ? next.set(key, value) : next.delete(key);
                return next;
            },
            { replace: true },
        );
    const filtered = useMemo(() => {
        const terms = normalize(query).split(/\s+/).filter(Boolean);
        const result = schools.filter(
            s =>
                terms.every(term =>
                    normalize(
                        `${s.name} ${s.code} ${s.address} ${s.principal}`,
                    ).includes(term),
                ) &&
                (!params.get("level") || s.level === params.get("level")) &&
                (!params.get("area") || s.area === params.get("area")) &&
                (!params.get("ownership") ||
                    s.ownership === params.get("ownership")) &&
                (!params.get("status") || status(s) === params.get("status")),
        );
        const sort = params.get("sort") || "name";
        return result.sort((a, b) =>
            sort === "students"
                ? b.students - a.students
                : sort === "attendance"
                ? b.attendance - a.attendance
                : sort === "digital"
                ? b.digital - a.digital
                : a.name.localeCompare(b.name, "vi"),
        );
    }, [params, query]);
    const exportCsv = () => {
        const rows = [
            [
                "Mã trường",
                "Tên trường",
                "Cấp học",
                "Khu vực",
                "Loại hình",
                "Địa chỉ",
                "Hiệu trưởng",
                "Học sinh",
                "Giáo viên",
                "Lớp",
                "Chuyên cần (%)",
                "Số hóa (%)",
                "Trạng thái",
            ],
            ...filtered.map(s => [
                s.code,
                s.name,
                s.level,
                s.area,
                s.ownership,
                s.address,
                s.principal,
                s.students,
                s.teachers,
                s.classes,
                s.attendance,
                s.digital,
                status(s),
            ]),
        ];
        const blob = new Blob(
            [
                "\uFEFF",
                rows
                    .map(row =>
                        row
                            .map(
                                cell => `"${String(cell).replace(/"/g, '""')}"`,
                            )
                            .join(","),
                    )
                    .join("\r\n"),
            ],
            { type: "text/csv;charset=utf-8;" },
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "truong-hoc-du-lieu-mau.csv";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    return (
        <Page className="school-page">
            <SchoolHeader />
            <main className="school-content">
                <div className="school-title-row">
                    <div>
                        <p className="school-eyebrow">QUẢN LÝ GIÁO DỤC</p>
                        <h1>Tổng quan trường học</h1>
                        <p className="school-muted">
                            Số liệu mẫu đến ngày 14/10/2026
                        </p>
                    </div>
                    <button
                        className="school-icon school-export"
                        title="Xuất danh sách CSV"
                        aria-label="Xuất danh sách CSV"
                        disabled={!filtered.length}
                        onClick={exportCsv}
                    >
                        <Download size={20} />
                    </button>
                </div>
                <Stats items={filtered} />
                <section
                    className="school-insights"
                    aria-label="Phân bổ và số hóa"
                >
                    <div>
                        <h2>Phân bổ cấp học</h2>
                        <div className="school-distribution">
                            {levels.map((level, i) => {
                                const count = filtered.filter(
                                    s => s.level === level,
                                ).length;
                                return (
                                    <div
                                        className="school-distribution-row"
                                        key={level}
                                    >
                                        <span>{level}</span>
                                        <div>
                                            <i
                                                style={{
                                                    width: `${
                                                        filtered.length
                                                            ? (count /
                                                                  filtered.length) *
                                                              100
                                                            : 0
                                                    }%`,
                                                    background: [
                                                        "#168575",
                                                        "#357bd0",
                                                        "#9b70b3",
                                                        "#da9e38",
                                                    ][i],
                                                }}
                                            />
                                        </div>
                                        <b>{count}</b>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="school-insight-summary">
                        <h2>Vận hành số</h2>
                        <strong>
                            {filtered.length
                                ? percent(
                                      filtered.reduce(
                                          (sum, s) => sum + s.digital,
                                          0,
                                      ) / filtered.length,
                                  )
                                : "—"}
                        </strong>
                        <p>Mức độ số hóa bình quân</p>
                        <div>
                            <CheckCircle2 size={16} />
                            <span>
                                {filtered.filter(s => s.digital >= 85).length}{" "}
                                trường vận hành tốt
                            </span>
                        </div>
                        <div className="school-warning">
                            <AlertCircle size={16} />
                            <span>
                                {number(
                                    filtered.reduce(
                                        (sum, s) => sum + s.pending,
                                        0,
                                    ),
                                )}{" "}
                                yêu cầu chờ xử lý
                            </span>
                        </div>
                    </div>
                </section>
                <section
                    className="school-directory"
                    aria-label="Danh sách trường học"
                >
                    <div className="school-section-title">
                        <h2>
                            Danh sách trường <span>{filtered.length}</span>
                        </h2>
                    </div>
                    <div className="school-toolbar">
                        <div className="school-search">
                            <Search size={18} />
                            <input
                                aria-label="Tìm kiếm trường học"
                                placeholder="Tìm tên trường, mã trường, địa chỉ..."
                                value={query}
                                onChange={e => update("q", e.target.value)}
                            />
                            {query && (
                                <button
                                    aria-label="Xóa tìm kiếm"
                                    title="Xóa tìm kiếm"
                                    onClick={() => update("q", "")}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            className={`school-filter-toggle ${
                                activeFilters.length ? "active" : ""
                            }`}
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            aria-expanded={filtersOpen}
                        >
                            <SlidersHorizontal size={18} />
                            Bộ lọc
                            {activeFilters.length > 0 && (
                                <b>{activeFilters.length}</b>
                            )}
                        </button>
                    </div>
                    <div
                        className={`school-filters ${
                            filtersOpen ? "open" : ""
                        }`}
                    >
                        {[
                            { key: "level", label: "Cấp học", options: levels },
                            { key: "area", label: "Khu vực", options: areas },
                            {
                                key: "ownership",
                                label: "Loại hình",
                                options: ["Công lập", "Tư thục"],
                            },
                            {
                                key: "status",
                                label: "Trạng thái",
                                options: ["Vận hành tốt", "Cần cải thiện"],
                            },
                        ].map(f => (
                            <label key={f.key}>
                                {f.label}
                                <select
                                    aria-label={f.label}
                                    value={params.get(f.key) || ""}
                                    onChange={e =>
                                        update(f.key, e.target.value)
                                    }
                                >
                                    <option value="">Tất cả</option>
                                    {f.options.map(option => (
                                        <option key={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                    {(activeFilters.length > 0 || query) && (
                        <div className="school-filter-chips">
                            {activeFilters.map(key => (
                                <button
                                    key={key}
                                    onClick={() => update(key, "")}
                                >
                                    {params.get(key)}
                                    <X size={14} aria-hidden="true" />
                                </button>
                            ))}
                            <button
                                onClick={() => setParams({}, { replace: true })}
                            >
                                Xóa bộ lọc và tìm kiếm
                            </button>
                        </div>
                    )}
                    <div className="school-results">
                        <span aria-live="polite">
                            {filtered.length} / {schools.length} trường
                        </span>
                        <label>
                            Sắp xếp{" "}
                            <select
                                aria-label="Sắp xếp trường học"
                                value={params.get("sort") || "name"}
                                onChange={e => update("sort", e.target.value)}
                            >
                                <option value="name">Tên A–Z</option>
                                <option value="students">
                                    Học sinh nhiều nhất
                                </option>
                                <option value="attendance">
                                    Chuyên cần cao nhất
                                </option>
                                <option value="digital">Số hóa cao nhất</option>
                            </select>
                        </label>
                    </div>
                    <div className="school-list">
                        {filtered.map(s => (
                            <button
                                className="school-row"
                                key={s.id}
                                onClick={() =>
                                    navigate(
                                        `/smart-schools/${
                                            s.id
                                        }?${params.toString()}`,
                                    )
                                }
                                aria-label={`Xem thông tin ${s.name}`}
                            >
                                <SchoolPhoto school={s} />
                                <div className="school-row-main">
                                    <div className="school-row-tags">
                                        <span>{s.level}</span>
                                        <span>{s.ownership}</span>
                                    </div>
                                    <h3>{s.name}</h3>
                                    <p>
                                        <MapPin size={13} />
                                        {s.area} · {s.code}
                                    </p>
                                    <div className="school-row-metrics">
                                        <span>
                                            <b>{number(s.students)}</b> học sinh
                                        </span>
                                        <span>
                                            <b>{s.teachers}</b> giáo viên
                                        </span>
                                        <span>
                                            <b>{percent(s.attendance)}</b>{" "}
                                            chuyên cần
                                        </span>
                                    </div>
                                </div>
                                <div className="school-row-status">
                                    <span
                                        className={`school-status ${
                                            s.digital < 85 ? "warning" : ""
                                        }`}
                                    >
                                        {status(s)}
                                    </span>
                                    <DigitalMeter value={s.digital} />
                                </div>
                                <ChevronRight
                                    className="school-row-arrow"
                                    size={18}
                                />
                            </button>
                        ))}
                    </div>
                    {!filtered.length && (
                        <div className="school-empty">
                            <Search size={32} />
                            <h3>Không tìm thấy trường</h3>
                            <p>
                                Không có trường phù hợp với điều kiện đã chọn.
                            </p>
                            <button
                                className="school-command"
                                onClick={() => setParams({}, { replace: true })}
                            >
                                <X size={16} />
                                Xóa bộ lọc và tìm kiếm
                            </button>
                        </div>
                    )}
                </section>
                <footer className="school-footer">
                    Dữ liệu, thông tin liên hệ và ảnh minh họa phục vụ demo.
                </footer>
            </main>
        </Page>
    );
}

export function SchoolDetailPage() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const returnToList = () => navigate(`/smart-schools?${params.toString()}`);
    const school = schools.find(s => s.id === id);
    return (
        <Page className="school-page">
            <SchoolHeader onBack={returnToList} />
            <main className="school-content">
                <button className="school-breadcrumb" onClick={returnToList}>
                    <ArrowLeft size={15} />
                    Danh sách trường
                </button>
                {school ? (
                    <>
                        <section className="school-detail-heading">
                            <SchoolPhoto school={school} />
                            <div>
                                <div className="school-row-tags">
                                    <span>{school.level}</span>
                                    <span>Bán trú</span>
                                </div>
                                <h1>{school.name}</h1>
                                <p className="school-muted">
                                    {school.code} · {school.area}
                                </p>
                            </div>
                        </section>
                        <BoardingDetails key={school.id} school={school} />
                    </>
                ) : (
                    <div className="school-empty">
                        <Building2 size={36} />
                        <h1>Không tìm thấy trường</h1>
                        <button
                            className="school-command"
                            onClick={returnToList}
                        >
                            <ArrowLeft size={16} />
                            Danh sách trường
                        </button>
                    </div>
                )}
            </main>
        </Page>
    );
}
