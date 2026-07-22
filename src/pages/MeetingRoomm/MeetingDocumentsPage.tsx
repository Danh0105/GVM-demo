import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
    downloadMeetingDocument,
    getMeetingDocumentsByMeetingId,
    getMeetings,
    previewMeetingDocument,
} from "@/services/meetingRoom";
import {
    DocumentCard,
    EmptyState,
    MeetingCard,
    MeetingLayout,
    SectionCard,
    SearchFilter,
} from "@/components/MeetingRoom";
import { DocumentType, Meeting, MeetingDocument } from "./types";

type DocumentFilter = "all" | DocumentType;

const documentFilters: Array<{ label: string; value: DocumentFilter }> = [
    { label: "Tất cả", value: "all" },
    { label: "PDF", value: "PDF" },
    { label: "DOCX", value: "DOCX" },
    { label: "XLSX", value: "XLSX" },
    { label: "PPTX", value: "PPTX" },
];

const MeetingDocumentsPage: React.FC = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting>();
    const [documents, setDocuments] = useState<MeetingDocument[]>([]);
    const [meetingSearch, setMeetingSearch] = useState("");
    const [documentSearch, setDocumentSearch] = useState("");
    const [documentFilter, setDocumentFilter] = useState<DocumentFilter>("all");

    useEffect(() => {
        getMeetings().then(setMeetings);
    }, []);

    useEffect(() => {
        if (!selectedMeeting) {
            setDocuments([]);
            return;
        }

        getMeetingDocumentsByMeetingId(selectedMeeting.id).then(setDocuments);
    }, [selectedMeeting]);

    const filteredMeetings = useMemo(
        () =>
            meetings.filter(meeting => {
                const keyword = meetingSearch.trim().toLowerCase();

                return (
                    !keyword ||
                    meeting.title.toLowerCase().includes(keyword) ||
                    meeting.location.toLowerCase().includes(keyword) ||
                    meeting.host.toLowerCase().includes(keyword)
                );
            }),
        [meetingSearch, meetings],
    );

    const filteredDocuments = useMemo(
        () =>
            documents.filter(document => {
                const keyword = documentSearch.trim().toLowerCase();
                const matchesSearch =
                    !keyword ||
                    document.title.toLowerCase().includes(keyword) ||
                    document.uploadedBy.toLowerCase().includes(keyword);
                const matchesFilter =
                    documentFilter === "all" ||
                    document.fileType === documentFilter;

                return matchesSearch && matchesFilter;
            }),
        [documentFilter, documentSearch, documents],
    );

    const selectMeeting = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setDocumentSearch("");
        setDocumentFilter("all");
    };

    return (
        <MeetingLayout
            title="Tài liệu"
            description={
                selectedMeeting
                    ? selectedMeeting.title
                    : "Chọn cuộc họp để xem tài liệu"
            }
            backTo="/meeting-rooms"
        >
            {!selectedMeeting ? (
                <>
                    <SearchFilter<"all">
                        search={meetingSearch}
                        placeholder="Tìm cuộc họp, địa điểm, chủ trì..."
                        filters={[{ label: "Tất cả", value: "all" }]}
                        activeFilter="all"
                        onSearchChange={setMeetingSearch}
                        onFilterChange={() => undefined}
                    />
                    <SectionCard title="Danh sách cuộc họp">
                        <Stack>
                            {filteredMeetings.length > 0 ? (
                                filteredMeetings.map(meeting => (
                                    <MeetingCard
                                        key={meeting.id}
                                        meeting={meeting}
                                        onClick={() => selectMeeting(meeting)}
                                    />
                                ))
                            ) : (
                                <EmptyState message="Không có cuộc họp phù hợp." />
                            )}
                        </Stack>
                    </SectionCard>
                </>
            ) : (
                <>
                    <SectionCard
                        title="Cuộc họp đã chọn"
                        actionLabel="Chọn cuộc họp khác"
                        onAction={() => setSelectedMeeting(undefined)}
                    >
                        <MeetingCard meeting={selectedMeeting} />
                    </SectionCard>

                    <SearchFilter<DocumentFilter>
                        search={documentSearch}
                        placeholder="Tìm tài liệu, người tải lên..."
                        filters={documentFilters}
                        activeFilter={documentFilter}
                        onSearchChange={setDocumentSearch}
                        onFilterChange={setDocumentFilter}
                    />

                    {filteredDocuments.length > 0 ? (
                        filteredDocuments.map(document => (
                            <DocumentCard
                                key={document.id}
                                document={document}
                                onPreview={() =>
                                    previewMeetingDocument(document.id)
                                }
                                onDownload={() =>
                                    downloadMeetingDocument(
                                        document.id,
                                        `${
                                            document.title
                                        }.${document.fileType.toLowerCase()}`,
                                    )
                                }
                            />
                        ))
                    ) : (
                        <EmptyState message="Không có tài liệu phù hợp cho cuộc họp này." />
                    )}
                </>
            )}
        </MeetingLayout>
    );
};

export default MeetingDocumentsPage;

const Stack = styled.div`
    display: grid;
    gap: 10px;
`;
