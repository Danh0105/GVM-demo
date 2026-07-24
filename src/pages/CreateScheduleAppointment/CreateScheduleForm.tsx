import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { CalendarCheck, CalendarDays, ChevronDown } from "lucide-react";
import { useSnackbar } from "zmp-ui";
import { isValidPhoneNumber } from "@utils/string";
import { useStore } from "@store";

const DESKS = ["Quầy 1", "Quầy 2", "Quầy 3", "Quầy 4", "Quầy 5"];

const SERVICES = [
    "Chứng thực giấy tờ",
    "Hộ tịch",
    "Đất đai - xây dựng",
    "Lao động - thương binh xã hội",
    "Tiếp công dân",
];

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

export const CreateScheduleForm = () => {
    const { openSnackbar } = useSnackbar();
    const [creatingSchedule, createSchedule, user] = useStore(state => [
        state.creatingSchedule,
        state.createSchedule,
        state.user,
    ]);
    const [desk, setDesk] = useState("Quầy 5");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [fullName, setFullName] = useState(
        user?.fullName || user?.name || "",
    );
    const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
    const [service, setService] = useState("");
    const [note, setNote] = useState("");

    const canSubmit = useMemo(
        () =>
            Boolean(
                desk &&
                    date &&
                    timeSlot &&
                    fullName.trim() &&
                    isValidPhoneNumber(phoneNumber.trim()) &&
                    service,
            ),
        [date, desk, fullName, phoneNumber, service, timeSlot],
    );

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
                `Quầy tiếp dân: ${desk}`,
                `Khung giờ: ${timeSlot}`,
                `Dịch vụ: ${service}`,
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
                            value={desk}
                            onChange={event => setDesk(event.target.value)}
                        >
                            {DESKS.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </Select>
                        <ChevronDown size={20} />
                    </SelectWrap>
                    <HelpText>
                        Nhận lịch trước tối đa 1 ngày, đặt trước tối thiểu 1 giờ.
                    </HelpText>
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
                    <Label>
                        Dịch vụ cần thực hiện <Required>*</Required>
                    </Label>
                    <SelectWrap>
                        <Select
                            value={service}
                            onChange={event => setService(event.target.value)}
                        >
                            <option value="">Chọn dịch vụ</option>
                            {SERVICES.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </Select>
                        <ChevronDown size={20} />
                    </SelectWrap>
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
                    {creatingSchedule ? "Đang gửi..." : "Gửi lịch hẹn"}
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
