import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
    CalendarClock,
    FileText,
    MapPin,
    UserRoundCheck,
    Users,
} from "lucide-react";
import {
    getMeetingById,
    getMeetingDocuments,
    getMeetingMinutes,
    submitMeetingParticipation,
} from "@/services/meetingRoom";
import {
    DocumentCard,
    EmptyState,
    MeetingLayout,
    MetaLine,
    MinuteCard,
    SectionCard,
    SmallMuted,
    StatusPill,
} from "@/components/MeetingRoom";
import {
    Meeting,
    MeetingActionPayload,
    MeetingDocument,
    MeetingMinute,
    ParticipationStatus,
} from "./types";
import {
    formatDateTime,
    getMeetingStatusText,
    getParticipationText,
} from "./utils";

type ActionType = "accepted" | "declined" | "delegated";

const MeetingDetailPage: React.FC = () => {
    const { id } = useParams();
    const [meeting, setMeeting] = useState<Meeting>();
    const [documents, setDocuments] = useState<MeetingDocument[]>([]);
    const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
    const [participation, setParticipation] =
        useState<ParticipationStatus>("pending");
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }

        Promise.all([
            getMeetingById(id),
            getMeetingDocuments(),
            getMeetingMinutes(),
        ]).then(([nextMeeting, nextDocuments, nextMinutes]) => {
            if (nextMeeting) {
                setMeeting(nextMeeting);
                setParticipation(nextMeeting.participationStatus);
            }
            setDocuments(nextDocuments);
            setMinutes(nextMinutes);
        });
    }, [id]);

    const attachedDocuments = useMemo(
        () =>
            meeting
                ? documents.filter(document =>
                      meeting.documentIds.includes(document.id),
                  )
                : [],
        [documents, meeting],
    );

    const currentMinutes = useMemo(
        () =>
            meeting?.minutesId
                ? minutes.filter(item => item.id === meeting.minutesId)
                : [],
        [meeting, minutes],
    );

    const handleSubmit = (payload: MeetingActionPayload) => {
        if (!meeting) {
            return;
        }

        submitMeetingParticipation(meeting.id, payload).then(nextStatus => {
            setParticipation(nextStatus);
            setIsSheetOpen(false);
        });
    };

    if (!meeting) {
        return (
            <MeetingLayout title="Chi tiết cuộc họp" backTo="/meeting-rooms">
                <EmptyState message="Không tìm thấy cuộc họp." />
            </MeetingLayout>
        );
    }

    return (
        <MeetingLayout
            title="Chi tiết cuộc họp"
            description={meeting.title}
            backTo="/meeting-rooms/schedule"
        >
            <HeroDetail>
                <StatusPill $status={meeting.status}>
                    {getMeetingStatusText(meeting.status)}
                </StatusPill>
                <HeroTitle>{meeting.title}</HeroTitle>
                <SmallMuted>{getParticipationText(participation)}</SmallMuted>
                <PrimaryButton
                    type="button"
                    onClick={() => setIsSheetOpen(true)}
                >
                    <UserRoundCheck size={20} />
                    Tham gia cuộc họp
                </PrimaryButton>
            </HeroDetail>

            <SectionCard title="Thông tin cuộc họp">
                <InfoStack>
                    <MetaLine>
                        <CalendarClock size={17} />
                        {formatDateTime(meeting.startAt)}
                    </MetaLine>
                    <MetaLine>
                        <MapPin size={17} />
                        {meeting.location}
                    </MetaLine>
                    <MetaLine>
                        <Users size={17} />
                        Chủ trì: {meeting.host}
                    </MetaLine>
                    <Agenda>{meeting.agenda}</Agenda>
                </InfoStack>
            </SectionCard>

            <SectionCard title="Thành phần tham dự">
                <InfoStack>
                    {meeting.participants.map(participant => (
                        <ParticipantItem key={participant.id}>
                            <Users size={18} />
                            <span>
                                <strong>{participant.name}</strong>
                                {participant.position} ·{" "}
                                {participant.department}
                            </span>
                        </ParticipantItem>
                    ))}
                </InfoStack>
            </SectionCard>

            <SectionCard title="Tài liệu đính kèm">
                <InfoStack>
                    {attachedDocuments.map(document => (
                        <DocumentCard key={document.id} document={document} />
                    ))}
                </InfoStack>
            </SectionCard>

            <SectionCard title="Biên bản">
                {currentMinutes.length > 0 ? (
                    <InfoStack>
                        {currentMinutes.map(minute => (
                            <MinuteCard key={minute.id} minute={minute} />
                        ))}
                    </InfoStack>
                ) : (
                    <EmptyState message="Chưa có biên bản cho cuộc họp này." />
                )}
            </SectionCard>

            {isSheetOpen && (
                <JoinMeetingSheet
                    onClose={() => setIsSheetOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </MeetingLayout>
    );
};

export default MeetingDetailPage;

type JoinMeetingSheetProps = {
    onClose: () => void;
    onSubmit: (payload: MeetingActionPayload) => void;
};

const JoinMeetingSheet: React.FC<JoinMeetingSheetProps> = ({
    onClose,
    onSubmit,
}) => {
    const [action, setAction] = useState<ActionType>("accepted");
    const [reason, setReason] = useState("");
    const [delegate, setDelegate] = useState({
        fullName: "",
        position: "",
        department: "",
        phone: "",
    });

    const handleConfirm = (event: FormEvent) => {
        event.preventDefault();

        if (action === "declined") {
            if (!reason.trim()) {
                return;
            }
            onSubmit({ type: "declined", reason });
            return;
        }

        if (action === "delegated") {
            if (
                !delegate.fullName.trim() ||
                !delegate.position.trim() ||
                !delegate.department.trim() ||
                !delegate.phone.trim()
            ) {
                return;
            }
            onSubmit({ type: "delegated", delegate });
            return;
        }

        onSubmit({ type: "accepted" });
    };

    return (
        <SheetLayer>
            <SheetBackdrop onClick={onClose} />
            <SheetPanel>
                <SheetHandle />
                <SheetTitle>Phản hồi tham dự</SheetTitle>
                <SheetForm onSubmit={handleConfirm}>
                    <OptionGrid>
                        <OptionButton
                            type="button"
                            $active={action === "accepted"}
                            onClick={() => setAction("accepted")}
                        >
                            Đồng ý tham gia
                        </OptionButton>
                        <OptionButton
                            type="button"
                            $active={action === "declined"}
                            onClick={() => setAction("declined")}
                        >
                            Không đồng ý
                        </OptionButton>
                        <OptionButton
                            type="button"
                            $active={action === "delegated"}
                            onClick={() => setAction("delegated")}
                        >
                            Chuyển người tham gia
                        </OptionButton>
                    </OptionGrid>

                    {action === "declined" && (
                        <TextArea
                            required
                            value={reason}
                            placeholder="Nhập lý do không tham gia"
                            onChange={event => setReason(event.target.value)}
                        />
                    )}

                    {action === "delegated" && (
                        <FieldGrid>
                            <Input
                                required
                                value={delegate.fullName}
                                placeholder="Họ tên"
                                onChange={event =>
                                    setDelegate(current => ({
                                        ...current,
                                        fullName: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                required
                                value={delegate.position}
                                placeholder="Chức vụ"
                                onChange={event =>
                                    setDelegate(current => ({
                                        ...current,
                                        position: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                required
                                value={delegate.department}
                                placeholder="Phòng ban"
                                onChange={event =>
                                    setDelegate(current => ({
                                        ...current,
                                        department: event.target.value,
                                    }))
                                }
                            />
                            <Input
                                required
                                value={delegate.phone}
                                placeholder="Số điện thoại"
                                onChange={event =>
                                    setDelegate(current => ({
                                        ...current,
                                        phone: event.target.value,
                                    }))
                                }
                            />
                        </FieldGrid>
                    )}

                    <SheetActions>
                        <SecondaryButton type="button" onClick={onClose}>
                            Hủy
                        </SecondaryButton>
                        <SubmitButton type="submit">
                            <FileText size={18} />
                            Xác nhận
                        </SubmitButton>
                    </SheetActions>
                </SheetForm>
            </SheetPanel>
        </SheetLayer>
    );
};

const HeroDetail = styled.section`
    border-radius: 24px;
    padding: 18px;
    display: grid;
    gap: 12px;
    color: #ffffff;
    background: linear-gradient(135deg, #00325f 0%, #0067ad 100%);
    box-shadow: 0 18px 36px rgba(0, 75, 134, 0.2);

    p {
        color: rgba(255, 255, 255, 0.84);
    }
`;

const HeroTitle = styled.h2`
    margin: 0;
    font-size: calc(23px * var(--app-font-scale));
    line-height: 1.18;
    font-weight: 950;
`;

const PrimaryButton = styled.button`
    height: 48px;
    border: 0;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #005f99;
    background: #e7f5ff;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 900;
`;

const InfoStack = styled.div`
    display: grid;
    gap: 10px;
`;

const Agenda = styled.p`
    margin: 0;
    color: #4f5d70;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 650;
`;

const ParticipantItem = styled.div`
    border-radius: 16px;
    padding: 12px;
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 10px;
    color: #0067a8;
    background: #f5fbff;

    span {
        display: grid;
        gap: 3px;
        color: #667085;
        font-size: calc(12px * var(--app-font-scale));
        line-height: 1.35;
        font-weight: 650;
    }

    strong {
        color: #172033;
        font-size: calc(14px * var(--app-font-scale));
    }
`;

const SheetLayer = styled.div`
    position: fixed;
    inset: 0;
    z-index: 60;
`;

const SheetBackdrop = styled.button`
    position: absolute;
    inset: 0;
    width: 100%;
    border: 0;
    background: rgba(15, 23, 42, 0.42);
`;

const SheetPanel = styled.div`
    position: absolute;
    right: 0;
    bottom: 0;
    left: 50%;
    width: min(100vw, 430px);
    transform: translateX(-50%);
    border-radius: 26px 26px 0 0;
    padding: 10px 16px calc(18px + var(--zaui-safe-area-inset-bottom, 0px));
    background: #ffffff;
    box-shadow: 0 -18px 40px rgba(15, 23, 42, 0.18);
`;

const SheetHandle = styled.div`
    width: 42px;
    height: 5px;
    border-radius: 999px;
    margin: 0 auto 14px;
    background: #d0d5dd;
`;

const SheetTitle = styled.h3`
    margin: 0 0 14px;
    color: #172033;
    font-size: calc(19px * var(--app-font-scale));
    font-weight: 950;
`;

const SheetForm = styled.form`
    display: grid;
    gap: 12px;
`;

const OptionGrid = styled.div`
    display: grid;
    gap: 8px;
`;

const OptionButton = styled.button<{ $active?: boolean }>`
    min-height: 44px;
    border: 1px solid
        ${({ $active }) =>
            $active ? "rgba(0, 103, 168, 0.34)" : "rgba(30, 35, 50, 0.08)"};
    border-radius: 15px;
    color: ${({ $active }) => ($active ? "#005f99" : "#344054")};
    background: ${({ $active }) => ($active ? "#e7f5ff" : "#ffffff")};
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
`;

const FieldGrid = styled.div`
    display: grid;
    gap: 9px;
`;

const Input = styled.input`
    width: 100%;
    min-height: 46px;
    border: 1px solid rgba(30, 35, 50, 0.09);
    border-radius: 14px;
    padding: 0 13px;
    box-sizing: border-box;
    outline: none;
    color: #172033;
    background: #f8fbff;
    font-size: calc(14px * var(--app-font-scale));
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 92px;
    border: 1px solid rgba(30, 35, 50, 0.09);
    border-radius: 14px;
    padding: 12px 13px;
    box-sizing: border-box;
    outline: none;
    resize: vertical;
    color: #172033;
    background: #f8fbff;
    font-size: calc(14px * var(--app-font-scale));
`;

const SheetActions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 10px;
`;

const SecondaryButton = styled.button`
    height: 46px;
    border: 0;
    border-radius: 15px;
    color: #475467;
    background: #f2f4f7;
    font-weight: 850;
`;

const SubmitButton = styled.button`
    height: 46px;
    border: 0;
    border-radius: 15px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #ffffff;
    background: linear-gradient(135deg, #005f99, #008bd2);
    font-weight: 900;
`;
