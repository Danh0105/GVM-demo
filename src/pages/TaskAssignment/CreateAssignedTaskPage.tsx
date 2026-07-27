import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "zmp-ui";
import { useStore } from "@store";
import MeetingLayout from "@/components/MeetingRoom/Layout";
import RequireRole from "@/components/common/RequireRole";
import { SYSTEM_ROLES } from "@/utils/permissions";
import { getFriendlyErrorMessage, isForbiddenError } from "@/utils/apiError";
import {
    createAssignedTask,
    getTaskAssignmentOptions,
    NeighborhoodHeadOption,
} from "@/services/taskAssignments";

const Form = styled.form`
    display: grid;
    gap: 14px;
`;

const Field = styled.label`
    display: grid;
    gap: 6px;

    span {
        color: #344054;
        font-size: calc(13px * var(--app-font-scale));
        font-weight: 800;
    }

    input,
    textarea,
    select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #d0d5dd;
        border-radius: 14px;
        padding: 12px 14px;
        color: #172033;
        font-size: calc(14px * var(--app-font-scale));
        font-weight: 600;

        &:focus {
            outline: none;
            border-color: #008bd2;
        }
    }
`;

const FileList = styled.div`
    display: grid;
    gap: 6px;
    margin-top: 6px;
    color: #667085;
    font-size: calc(12.5px * var(--app-font-scale));
    font-weight: 650;
`;

const SubmitButton = styled.button`
    min-height: 48px;
    border: 0;
    border-radius: 14px;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;

    &:disabled {
        opacity: 0.6;
    }
`;

const CreateAssignedTaskContent: React.FC = () => {
    const navigate = useNavigate();
    const setError = useStore(state => state.setError);
    const [neighborhoodHeads, setNeighborhoodHeads] = useState<
        NeighborhoodHeadOption[]
    >([]);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [points, setPoints] = useState(0);
    const [deadline, setDeadline] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const handleError = (error: unknown) => {
        setError({ message: getFriendlyErrorMessage(error) });

        if (isForbiddenError(error)) {
            navigate("/", { replace: true });
        }
    };

    useEffect(() => {
        getTaskAssignmentOptions()
            .then(options => setNeighborhoodHeads(options.neighborhoodHeads))
            .catch(handleError);
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!title.trim() || !assigneeId || !deadline) {
            setError({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc." });
            return;
        }

        setSubmitting(true);
        createAssignedTask({
            title,
            content,
            points,
            deadline: new Date(deadline).toISOString(),
            assigneeId,
            files,
        })
            .then(task => {
                navigate(`/ward-tasks/${task.id}`, { replace: true });
            })
            .catch(handleError)
            .finally(() => setSubmitting(false));
    };

    return (
        <MeetingLayout title="Giao việc mới" backTo="/task-assignments">
            <Form onSubmit={handleSubmit}>
                <Field>
                    <span>Tiêu đề *</span>
                    <input
                        value={title}
                        onChange={event => setTitle(event.target.value)}
                        placeholder="Tiêu đề công việc"
                        required
                    />
                </Field>

                <Field>
                    <span>Nội dung</span>
                    <textarea
                        rows={4}
                        value={content}
                        onChange={event => setContent(event.target.value)}
                        placeholder="Mô tả chi tiết công việc"
                    />
                </Field>

                <Field>
                    <span>Điểm công việc *</span>
                    <input
                        type="number"
                        min={0}
                        value={points}
                        onChange={event => setPoints(Number(event.target.value))}
                        required
                    />
                </Field>

                <Field>
                    <span>Hạn hoàn thành *</span>
                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={event => setDeadline(event.target.value)}
                        required
                    />
                </Field>

                <Field>
                    <span>Trưởng khu phố nhận việc *</span>
                    <select
                        value={assigneeId}
                        onChange={event => setAssigneeId(event.target.value)}
                        required
                    >
                        <option value="">Chọn trưởng khu phố</option>
                        {neighborhoodHeads.map(head => (
                            <option key={head.id} value={head.id}>
                                {head.fullName}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field>
                    <span>Tệp đính kèm</span>
                    <input
                        type="file"
                        multiple
                        onChange={event =>
                            setFiles(Array.from(event.target.files || []))
                        }
                    />
                    {files.length > 0 && (
                        <FileList>
                            {files.map(file => (
                                <span key={file.name}>{file.name}</span>
                            ))}
                        </FileList>
                    )}
                </Field>

                <SubmitButton type="submit" disabled={submitting}>
                    {submitting ? "Đang giao việc..." : "Giao việc"}
                </SubmitButton>
            </Form>
        </MeetingLayout>
    );
};

const CreateAssignedTaskPage: React.FC = () => (
    <RequireRole roles={[SYSTEM_ROLES.WARD_CHAIRMAN]}>
        <CreateAssignedTaskContent />
    </RequireRole>
);

export default CreateAssignedTaskPage;
