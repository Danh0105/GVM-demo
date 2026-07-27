import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { CalendarCheck, CalendarDays, ChevronDown } from "lucide-react";
import { useSnackbar } from "zmp-ui";
import { isValidPhoneNumber } from "@utils/string";
import { useStore } from "@store";
import { getRemoteQueueDesks } from "@/services/remoteQueue";
import type { RemoteQueueDesk } from "@/services/remoteQueue";

type CreateScheduleFormProps = {
    authReady: boolean;
};

const TIME_SLOTS = [
    "07:30 - 08:30",
    "08:30 - 09:30",
    "09:30 - 10:30",
    "13:30 - 14:30",
    "14:30 - 15:30",
    "15:30 - 16:30",
];

const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getTodayInputDate = () => toInputDate(new Date());

const getTomorrowInputDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    return toInputDate(date);
};

const parseInputDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const getDeskFetchErrorMessage = (error: unknown) => {
    const message =
        error instanceof Error ? error.message : "Không thể tải danh sách quầy.";

    return message === "Failed to fetch"
        ? "Không thể kết nối tới hệ thống quầy. Vui lòng thử lại sau."
        : message;
};

const deskStatusLabel: Record<RemoteQueueDesk["status"], string> = {
    active: "Đang hoạt động",
    paused: "Tạm ngưng",
    unassigned: "Chưa có người phụ trách",
    offline: "Tạm ngưng",
};

const getAssigneeDescription = (desk: RemoteQueueDesk) => {
    if (desk.assignees.length > 0) {
        return desk.assignees
            .map(assignee =>
                [
                    assignee.fullName || assignee.name,
                    assignee.position || assignee.departmentName,
                ]
                    .filter(Boolean)
                    .join(" - "),
            )
            .join(", ");
    }

    return desk.assignedUserName
        ? [desk.assignedUserName, desk.assignedUserTitle]
              .filter(Boolean)
              .join(" - ")
        : "Chưa có người phụ trách";
};

export const CreateScheduleForm = ({ authReady }: CreateScheduleFormProps) => {
    const { openSnackbar } = useSnackbar();
    const openSnackbarRef = useRef(openSnackbar);
    const [creatingSchedule, createSchedule, user] = useStore(state => [
        state.creatingSchedule,
        state.createSchedule,
        state.user,
    ]);
    const [desks, setDesks] = useState<RemoteQueueDesk[]>([]);
    const [deskId, setDeskId] = useState("");
    const [desksLoading, setDesksLoading] = useState(true);
    const [desksError, setDesksError] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [fullName, setFullName] = useState(
        user?.fullName || user?.name || "",
    );
    const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
    const [note, setNote] = useState("");
    const selectedDesk = useMemo(
        () => desks.find(item => item.id === deskId),
        [deskId, desks],
    );
    const deskLabel = selectedDesk
        ? [selectedDesk.name, selectedDesk.code].filter(Boolean).join(" - ")
        : "";

    const canSubmit = useMemo(
        () =>
            Boolean(
                selectedDesk &&
                    date &&
                    timeSlot &&
                    fullName.trim() &&
                    isValidPhoneNumber(phoneNumber.trim()),
            ),
        [date, fullName, phoneNumber, selectedDesk, timeSlot],
    );

    useEffect(() => {
        openSnackbarRef.current = openSnackbar;
    }, [openSnackbar]);

    useEffect(() => {
        let mounted = true;

        if (!authReady) {
            setDesks([]);
            setDeskId("");
            setDesksError("");
            setDesksLoading(true);

            return () => {
                mounted = false;
            };
        }

        setDesksLoading(true);
        setDesksError("");

        getRemoteQueueDesks()
            .then(result => {
                if (!mounted) {
                    return;
                }

                setDesks(result);
                setDeskId(current => current || result[0]?.id || "");
            })
            .catch(error => {
                if (!mounted) {
                    return;
                }

                const message = getDeskFetchErrorMessage(error);

                setDesks([]);
                setDeskId("");
                setDesksError(message);
                openSnackbarRef.current({ type: "error", text: message });
            })
            .finally(() => {
                if (mounted) {
                    setDesksLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [authReady]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!date) {
            openSnackbar({ type: "error", text: "Vui lòng chọn ngày hẹn." });
            return;
        }

        if (!isValidPhoneNumber(phoneNumber.trim())) {
            openSnackbar({
                type: "error",
                text: "Số điện thoại không hợp lệ.",
            });
            return;
        }

        if (!canSubmit || creatingSchedule) {
            return;
        }

        createSchedule({
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            date: parseInputDate(date),
            content: [
                `Quầy tiếp dân: ${deskLabel}`,
                `Khung giờ: ${timeSlot}`,
                note.trim() ? `Ghi chú: ${note.trim()}` : "",
            ]
                .filter(Boolean)
                .join("\n"),
        });
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FormCard>
                <FieldGroup>
                    <Label>
                        Quầy tiếp dân <Required>*</Required>
                    </Label>
                    <SelectWrap>
                        <Select
                            value={deskId}
                            disabled={desksLoading || desks.length === 0}
                            onChange={event => setDeskId(event.target.value)}
                        >
                            <option value="">
                                {!authReady
                                    ? "Đang xác thực tài khoản Zalo..."
                                    : desksLoading
                                      ? "Đang tải danh sách quầy..."
                                      : "Chọn quầy tiếp dân"}
                            </option>
                            {desks.map(item => (
                                <option key={item.id} value={item.id}>
                                    {[item.name, item.code]
                                        .filter(Boolean)
                                        .join(" - ")}
                                </option>
                            ))}
                        </Select>
                        <ChevronDown size={20} />
                    </SelectWrap>
                    {desksError ? (
                        <ErrorText>{desksError}</ErrorText>
                    ) : (
                        <HelpText>
                            {selectedDesk?.services ||
                                "Nhận lịch trước tối đa 1 ngày, đặt trước tối thiểu 1 giờ."}
                        </HelpText>
                    )}
                    {selectedDesk && (
                        <DeskInfoPanel>
                            <DeskInfoTitle>Thông tin quầy</DeskInfoTitle>
                            <DeskInfoGrid>
                                <DeskInfoItem>
                                    <span>Tên quầy</span>
                                    <strong>{selectedDesk.name}</strong>
                                </DeskInfoItem>
                                <DeskInfoItem>
                                    <span>Mã quầy</span>
                                    <strong>{selectedDesk.code || "-"}</strong>
                                </DeskInfoItem>
                                <DeskInfoItem>
                                    <span>Lĩnh vực</span>
                                    <strong>{selectedDesk.category || "-"}</strong>
                                </DeskInfoItem>
                                <DeskInfoItem>
                                    <span>Trạng thái</span>
                                    <strong>
                                        {deskStatusLabel[selectedDesk.status]}
                                    </strong>
                                </DeskInfoItem>
                                <DeskInfoItem $wide>
                                    <span>Dịch vụ</span>
                                    <strong>{selectedDesk.services || "-"}</strong>
                                </DeskInfoItem>
                                <DeskInfoItem $wide>
                                    <span>Người phụ trách</span>
                                    <strong>
                                        {getAssigneeDescription(selectedDesk)}
                                    </strong>
                                </DeskInfoItem>
                                <DeskInfoItem>
                                    <span>Đang phục vụ</span>
                                    <strong>
                                        {selectedDesk.currentServingNumber || "-"}
                                    </strong>
                                </DeskInfoItem>
                                <DeskInfoItem>
                                    <span>Đang chờ</span>
                                    <strong>{selectedDesk.waiting}</strong>
                                </DeskInfoItem>
                            </DeskInfoGrid>
                        </DeskInfoPanel>
                    )}
                </FieldGroup>

                <FieldGroup>
                    <Label>
                        Ngày hẹn <Required>*</Required>
                    </Label>
                    <InputShell>
                        <DateInput
                            type="date"
                            value={date}
                            min={getTodayInputDate()}
                            max={getTomorrowInputDate()}
                            onChange={event => {
                                setDate(event.target.value);
                                setTimeSlot("");
                            }}
                        />
                        <CalendarDays size={22} />
                    </InputShell>
                </FieldGroup>

                <FieldGroup>
                    <Label>
                        Khung giờ <Required>*</Required>
                    </Label>
                    <SelectWrap $disabled={!date}>
                        <Select
                            value={timeSlot}
                            disabled={!date}
                            onChange={event => setTimeSlot(event.target.value)}
                        >
                            <option value="">
                                {date ? "Chọn khung giờ" : "Chọn ngày hẹn trước"}
                            </option>
                            {TIME_SLOTS.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </Select>
                        <ChevronDown size={20} />
                    </SelectWrap>
                </FieldGroup>

                <FieldGroup>
                    <Label>
                        Họ và tên <Required>*</Required>
                    </Label>
                    <TextInput
                        value={fullName}
                        placeholder="Nhập họ và tên"
                        onChange={event => setFullName(event.target.value)}
                    />
                </FieldGroup>

                <FieldGroup>
                    <Label>
                        Số điện thoại <Required>*</Required>
                    </Label>
                    <TextInput
                        value={phoneNumber}
                        inputMode="tel"
                        placeholder="Nhập số điện thoại"
                        onChange={event => setPhoneNumber(event.target.value)}
                    />
                </FieldGroup>

                <FieldGroup>
                    <Label>Ghi chú</Label>
                    <TextArea
                        value={note}
                        rows={4}
                        placeholder="Thông tin cần chuẩn bị hoặc yêu cầu thêm"
                        onChange={event => setNote(event.target.value)}
                    />
                </FieldGroup>
            </FormCard>

            <SubmitBar>
                <SubmitButton
                    type="submit"
                    disabled={!canSubmit || creatingSchedule}
                >
                    <CalendarCheck size={22} />
                    {creatingSchedule ? "Đang gửi..." : "Gửi yêu cầu hẹn"}
                </SubmitButton>
            </SubmitBar>
        </Form>
    );
};

const Form = styled.form`
    padding: 0 16px;
`;

const FormCard = styled.section`
    padding: 20px 16px 24px;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 14px 34px rgba(31, 58, 84, 0.08);
`;

const FieldGroup = styled.div`
    & + & {
        margin-top: 22px;
    }
`;

const Label = styled.label`
    display: block;
    margin-bottom: 10px;
    color: #172033;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const Required = styled.span`
    color: #e5484d;
`;

const HelpText = styled.p`
    margin: 10px 0 0;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;
`;

const ErrorText = styled(HelpText)`
    color: #c83232;
`;

const DeskInfoPanel = styled.div`
    margin-top: 12px;
    padding: 13px;
    border: 1px solid #dceaf4;
    border-radius: 16px;
    background: #f7fbff;
`;

const DeskInfoTitle = styled.div`
    margin-bottom: 10px;
    color: #0068ad;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const DeskInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
`;

const DeskInfoItem = styled.div<{ $wide?: boolean }>`
    grid-column: ${({ $wide }) => ($wide ? "1 / -1" : "auto")};
    min-width: 0;
    padding: 10px;
    border-radius: 12px;
    background: #ffffff;

    span {
        display: block;
        margin-bottom: 4px;
        color: #667085;
        font-size: calc(12px * var(--app-font-scale));
        line-height: 1.25;
        font-weight: 750;
    }

    strong {
        display: block;
        color: #172033;
        font-size: calc(13px * var(--app-font-scale));
        line-height: 1.35;
        font-weight: 900;
        overflow-wrap: anywhere;
    }
`;

const fieldBase = `
    width: 100%;
    min-height: 54px;
    box-sizing: border-box;
    border: 1px solid #dce6ee;
    border-radius: 16px;
    color: #172033;
    background: #ffffff;
    box-shadow: 0 6px 14px rgba(31, 58, 84, 0.06);
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 700;
    outline: none;
`;

const TextInput = styled.input`
    ${fieldBase}
    padding: 0 14px;

    &::placeholder {
        color: #98a2b3;
    }

    &:focus {
        border-color: #0077c8;
        box-shadow: 0 0 0 3px rgba(0, 119, 200, 0.12);
    }
`;

const TextArea = styled.textarea`
    ${fieldBase}
    min-height: 112px;
    resize: none;
    padding: 14px;
    line-height: 1.45;

    &::placeholder {
        color: #98a2b3;
    }
`;

const InputShell = styled.div`
    position: relative;

    svg {
        position: absolute;
        top: 50%;
        right: 14px;
        transform: translateY(-50%);
        color: #172033;
        pointer-events: none;
    }
`;

const DateInput = styled.input`
    ${fieldBase}
    padding: 0 46px 0 14px;
    color-scheme: light;
`;

const SelectWrap = styled.div<{ $disabled?: boolean }>`
    position: relative;
    opacity: ${({ $disabled }) => ($disabled ? 0.74 : 1)};

    svg {
        position: absolute;
        top: 50%;
        right: 14px;
        transform: translateY(-50%);
        color: #526071;
        pointer-events: none;
    }
`;

const Select = styled.select`
    ${fieldBase}
    appearance: none;
    padding: 0 46px 0 14px;

    &:invalid {
        color: #98a2b3;
    }

    &:disabled {
        color: #98a2b3;
        background: #ffffff;
    }
`;

const SubmitBar = styled.div`
    position: fixed;
    left: 50%;
    bottom: calc(12px + var(--zaui-safe-area-inset-bottom, 0px));
    z-index: 35;
    width: min(100vw, 430px);
    transform: translateX(-50%);
    padding: 10px 16px 12px;
    box-sizing: border-box;
    background: linear-gradient(180deg, rgba(245, 247, 251, 0), #ffffff 28%);
`;

const SubmitButton = styled.button`
    width: 100%;
    min-height: 56px;
    border: 0;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #ffffff;
    background: linear-gradient(180deg, #0077c8 0%, #005f9f 100%);
    box-shadow: 0 12px 24px rgba(0, 104, 173, 0.24);
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 950;

    &:disabled {
        opacity: 0.56;
    }
`;
