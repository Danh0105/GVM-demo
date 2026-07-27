import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { getMeetingAttendance } from "@/services/meetingRoom";
import {
    AttendanceCard,
    EmptyState,
    MeetingLayout,
    SectionCard,
    SearchFilter,
} from "@/components/MeetingRoom";
import { Attendance, AttendanceStatus } from "./types";
import { formatDateTime, getAttendanceText } from "./utils";

type AttendanceFilter = "all" | AttendanceStatus;

const attendanceFilters: Array<{ label: string; value: AttendanceFilter }> = [
    { label: "Tất cả", value: "all" },
    { label: "Đã điểm danh", value: "checked-in" },
    { label: "Vắng mặt", value: "absent" },
    { label: "Vắng có lý do", value: "excused" },
];

const MeetingAttendancePage: React.FC = () => {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<AttendanceFilter>("all");
    const [selected, setSelected] = useState<Attendance>();

    useEffect(() => {
        getMeetingAttendance().then(setAttendance);
    }, []);

    const filteredAttendance = useMemo(
        () =>
            attendance.filter(item => {
                const keyword = search.trim().toLowerCase();
                const matchesSearch =
                    !keyword ||
                    item.meetingTitle.toLowerCase().includes(keyword) ||
                    item.location.toLowerCase().includes(keyword);
                const matchesFilter =
                    filter === "all" || item.status === filter;

                return matchesSearch && matchesFilter;
            }),
        [attendance, filter, search],
    );

    return (
        <MeetingLayout
            title="Điểm danh"
            description="Lịch sử điểm danh của người dùng"
            backTo="/meeting-rooms"
        >
            <SearchFilter<AttendanceFilter>
                search={search}
                placeholder="Tìm cuộc họp, địa điểm..."
                filters={attendanceFilters}
                activeFilter={filter}
                onSearchChange={setSearch}
                onFilterChange={setFilter}
            />
            {filteredAttendance.length > 0 ? (
                filteredAttendance.map(item => (
                    <AttendanceCard
                        key={item.id}
                        attendance={item}
                        onClick={() => setSelected(item)}
                    />
                ))
            ) : (
                <EmptyState message="Không có lịch sử điểm danh phù hợp." />
            )}

            {selected && (
                <SectionCard
                    title="Chi tiết điểm danh"
                    actionLabel="Đóng"
                    onAction={() => setSelected(undefined)}
                >
                    <DetailGrid>
                        <strong>{selected.meetingTitle}</strong>
                        <span>{formatDateTime(selected.time)}</span>
                        <span>{selected.location}</span>
                        <StatusText>{getAttendanceText(selected.status)}</StatusText>
                        <p>{selected.note}</p>
                    </DetailGrid>
                </SectionCard>
            )}
        </MeetingLayout>
    );
};

export default MeetingAttendancePage;

const DetailGrid = styled.div`
    display: grid;
    gap: 8px;
    color: #667085;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.4;
    font-weight: 650;

    strong {
        color: #172033;
        font-size: calc(16px * var(--app-font-scale));
        font-weight: 930;
    }

    p {
        margin: 0;
    }
`;

const StatusText = styled.span`
    width: fit-content;
    border-radius: 999px;
    padding: 6px 10px;
    color: #005f99;
    background: #e7f5ff;
    font-weight: 850;
`;
