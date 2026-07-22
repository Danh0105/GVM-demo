import React, { useEffect, useMemo, useState } from "react";
import { getMeetingMinutes, getMeetings } from "@/services/meetingRoom";
import {
    EmptyState,
    MeetingLayout,
    MinuteCard,
    SearchFilter,
} from "@/components/MeetingRoom";
import { Meeting, MeetingMinute } from "./types";
import { isWithinFilter } from "./utils";

type TimeFilter = "all" | "week" | "month";

const timeFilters: Array<{ label: string; value: TimeFilter }> = [
    { label: "Tất cả", value: "all" },
    { label: "Trong tuần", value: "week" },
    { label: "Trong tháng", value: "month" },
];

const MeetingMinutesPage: React.FC = () => {
    const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [search, setSearch] = useState("");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
    const [meetingFilter, setMeetingFilter] = useState("all");

    useEffect(() => {
        Promise.all([getMeetingMinutes(), getMeetings()]).then(
            ([nextMinutes, nextMeetings]) => {
                setMinutes(nextMinutes);
                setMeetings(nextMeetings);
            },
        );
    }, []);

    const meetingFilters = useMemo(
        () => [
            { label: "Tất cả cuộc họp", value: "all" },
            ...meetings.map(meeting => ({
                label: meeting.title,
                value: meeting.id,
            })),
        ],
        [meetings],
    );

    const filteredMinutes = useMemo(
        () =>
            minutes.filter(minute => {
                const keyword = search.trim().toLowerCase();
                const matchesSearch =
                    !keyword ||
                    minute.title.toLowerCase().includes(keyword) ||
                    minute.meetingTitle.toLowerCase().includes(keyword);
                const matchesTime = isWithinFilter(
                    minute.createdAt,
                    timeFilter,
                );
                const matchesMeeting =
                    meetingFilter === "all" ||
                    minute.meetingId === meetingFilter;

                return matchesSearch && matchesTime && matchesMeeting;
            }),
        [meetingFilter, minutes, search, timeFilter],
    );

    return (
        <MeetingLayout
            title="Biên bản"
            description="Tra cứu và xem file PDF biên bản cuộc họp"
            backTo="/meeting-rooms"
        >
            <SearchFilter<TimeFilter>
                search={search}
                placeholder="Tìm biên bản, cuộc họp..."
                filters={timeFilters}
                activeFilter={timeFilter}
                onSearchChange={setSearch}
                onFilterChange={setTimeFilter}
            />
            <SearchFilter<string>
                search=""
                placeholder=""
                filters={meetingFilters}
                activeFilter={meetingFilter}
                onSearchChange={() => undefined}
                onFilterChange={setMeetingFilter}
            />
            {filteredMinutes.length > 0 ? (
                filteredMinutes.map(minute => (
                    <MinuteCard key={minute.id} minute={minute} />
                ))
            ) : (
                <EmptyState message="Không có biên bản phù hợp." />
            )}
        </MeetingLayout>
    );
};

export default MeetingMinutesPage;
