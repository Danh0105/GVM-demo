import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "zmp-ui";
import { getMeetings } from "@/services/meetingRoom";
import {
    EmptyState,
    MeetingCard,
    MeetingLayout,
    SearchFilter,
} from "@/components/MeetingRoom";
import { Meeting, MeetingStatus } from "./types";
import { isWithinFilter } from "./utils";

type TimeFilter = "all" | "day" | "week" | "month";
type StatusFilter = "all" | MeetingStatus;

const timeFilters: Array<{ label: string; value: TimeFilter }> = [
    { label: "Tất cả", value: "all" },
    { label: "Ngày", value: "day" },
    { label: "Tuần", value: "week" },
    { label: "Tháng", value: "month" },
];

const statusFilters: Array<{ label: string; value: StatusFilter }> = [
    { label: "Tất cả trạng thái", value: "all" },
    { label: "Sắp diễn ra", value: "upcoming" },
    { label: "Đang diễn ra", value: "ongoing" },
    { label: "Đã kết thúc", value: "completed" },
];

const MeetingSchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [search, setSearch] = useState("");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    useEffect(() => {
        getMeetings().then(setMeetings);
    }, []);

    const filteredMeetings = useMemo(
        () =>
            meetings.filter(meeting => {
                const keyword = search.trim().toLowerCase();
                const matchesSearch =
                    !keyword ||
                    meeting.title.toLowerCase().includes(keyword) ||
                    meeting.location.toLowerCase().includes(keyword) ||
                    meeting.host.toLowerCase().includes(keyword);
                const matchesTime = isWithinFilter(
                    meeting.startAt,
                    timeFilter,
                );
                const matchesStatus =
                    statusFilter === "all" || meeting.status === statusFilter;

                return matchesSearch && matchesTime && matchesStatus;
            }),
        [meetings, search, statusFilter, timeFilter],
    );

    return (
        <MeetingLayout
            title="Lịch họp"
            description="Tra cứu lịch họp và trạng thái tham dự"
            backTo="/meeting-rooms"
        >
            <SearchFilter<TimeFilter>
                search={search}
                placeholder="Tìm tên cuộc họp, địa điểm, chủ trì..."
                filters={timeFilters}
                activeFilter={timeFilter}
                onSearchChange={setSearch}
                onFilterChange={setTimeFilter}
            />
            <SearchFilter<StatusFilter>
                search=""
                placeholder=""
                filters={statusFilters}
                activeFilter={statusFilter}
                onSearchChange={() => undefined}
                onFilterChange={setStatusFilter}
            />
            {filteredMeetings.length > 0 ? (
                filteredMeetings.map(meeting => (
                    <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onClick={() => navigate(`/meeting-rooms/${meeting.id}`)}
                    />
                ))
            ) : (
                <EmptyState message="Không có cuộc họp phù hợp." />
            )}
        </MeetingLayout>
    );
};

export default MeetingSchedulePage;
