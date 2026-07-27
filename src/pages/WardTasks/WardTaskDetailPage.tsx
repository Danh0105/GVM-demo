import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams, useSnackbar } from "zmp-ui";
import { useStore } from "@store";
import MeetingLayout from "@/components/MeetingRoom/Layout";
import RequireRole from "@/components/common/RequireRole";
import { FileAttachmentList, StatusBadge } from "@/components/TaskAssignment";
import { getSystemRole, getUserRole, SYSTEM_ROLES } from "@/utils/permissions";
import { getFriendlyErrorMessage, isForbiddenError } from "@/utils/apiError";
import { formatDateTime } from "@utils/date-time";
import {
    completeWardTask,
    evaluateWardTask,
    getWardTaskById,
    rejectWardTask,
    WardTaskDetail,
} from "@/services/taskAssignments";

const InfoCard = styled.section`
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 18px;
    padding: 16px;
    background: #ffffff;
    box-shadow: 0 12px 24px rgba(30, 35, 50, 0.07);
    display: grid;
    gap: 10px;
`;

const TopRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
`;

const TaskTitle = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(19px * var(--app-font-scale));
    font-weight: 900;
`;

const Content = styled.p`
    margin: 0;
    color: #344054;
    font-size: calc(13.5px * var(--app-font-scale));
    line-height: 1.55;
    font-weight: 600;
    white-space: pre-wrap;
`;

const MetaGrid = styled.div`
    display: grid;
    gap: 6px;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 650;
`;

const Points = styled.span`
    color: #b76e00;
    font-weight: 850;
`;

const NoteBox = styled.div`
    border-radius: 14px;
    padding: 12px 14px;
    background: #fef2f1;
    color: #b42318;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 650;
`;

const SectionTitle = styled.h3`
    margin: 4px 0 0;
    color: #172033;
    font-size: calc(14.5px * var(--app-font-scale));
    font-weight: 850;
`;

const ActionCard = styled.section`
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid #d0d5dd;
    border-radius: 16px;
    background: #f8fbff;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 10px;
`;

const PrimaryButton = styled.button`
    flex: 1;
    min-height: 46px;
    border: 0;
    border-radius: 14px;
    color: #ffffff;
    background: linear-gradient(135deg, #12805c, #1caf83);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;

    &:disabled {
        opacity: 0.6;
    }
`;

const DangerButton = styled(PrimaryButton)`
    background: linear-gradient(135deg, #b42318, #e04438);
`;

const SecondaryButton = styled(PrimaryButton)`
    color: #344054;
    background: #eef2f6;
`;

const TextArea = styled.textarea`
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #d0d5dd;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 600;
`;

const ModalBackdrop = styled.div`
    position: fixed;
    inset: 0 auto 0 50%;
    z-index: 50;
    width: min(100vw, 430px);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 16px;
    transform: translateX(-50%);
    background: rgba(13, 36, 54, 0.46);
`;

const ModalCard = styled.section`
    width: 100%;
    display: grid;
    gap: 12px;
    padding: 16px;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 24px 60px rgba(8, 48, 77, 0.28);
`;

const ModalTitle = styled.h3`
    margin: 0;
    color: #172033;
    font-size: calc(17px * var(--app-font-scale));
    font-weight: 900;
`;

const canEvaluateTask = (user: Parameters<typeof getSystemRole>[0], task?: WardTaskDetail) =>
    getSystemRole(user) === SYSTEM_ROLES.WARD_CHAIRMAN &&
    task?.status === "SUBMITTED";

const WardTaskDetailContent: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const [user, setError] = useStore(state => [state.user, state.setError]);
    const role = getUserRole(user);

    const [task, setTask] = useState<WardTaskDetail>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showIncompleteForm, setShowIncompleteForm] = useState(false);
    const [incompleteNote, setIncompleteNote] = useState("");

    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [completionFiles, setCompletionFiles] = useState<File[]>([]);

    const handleError = (error: unknown) => {
        setError({ message: getFriendlyErrorMessage(error) });

        if (isForbiddenError(error)) {
            navigate("/", { replace: true });
        }
    };

    const notifyAssignedTasksChanged = () => {
        window.dispatchEvent(new Event("assigned-tasks:refresh"));
    };

    const loadTask = async () => {
        if (!id) {
            return;
        }

        setLoading(true);
        try {
            const result = await getWardTaskById(id);

            setTask(result);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTask().catch(() => undefined);
    }, [id]);

    const backTo =
        role === SYSTEM_ROLES.NEIGHBORHOOD_HEAD ? "/received-tasks" : "/task-assignments";

    const handleEvaluateCompleted = async () => {
        if (!id) {
            return;
        }

        setSubmitting(true);
        try {
            await evaluateWardTask(id, { status: "COMPLETED" });
            await loadTask();
            notifyAssignedTasksChanged();
            openSnackbar({
                type: "success",
                text: "Đã đánh giá công việc hoàn thành.",
            });
        } catch (error) {
            handleError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEvaluateIncomplete = async () => {
        if (!id || !incompleteNote.trim()) {
            setError({ message: "Vui lòng nhập ghi chú chưa hoàn thành." });
            return;
        }

        setSubmitting(true);
        try {
            await evaluateWardTask(id, {
                status: "INCOMPLETE",
                note: incompleteNote.trim(),
            });
            await loadTask();
            notifyAssignedTasksChanged();
            setShowIncompleteForm(false);
            setIncompleteNote("");
            openSnackbar({
                type: "success",
                text: "Đã đánh giá công việc chưa hoàn thành.",
            });
        } catch (error) {
            handleError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = () => {
        if (!id) {
            return;
        }

        setSubmitting(true);
        completeWardTask(id, completionFiles)
            .then(setTask)
            .catch(handleError)
            .finally(() => setSubmitting(false));
    };

    const handleReject = () => {
        if (!id || !rejectReason.trim()) {
            setError({ message: "Vui lÃ²ng nháº­p lÃ½ do tá»« chá»‘i." });
            return;
        }

        setSubmitting(true);
        rejectWardTask(id, rejectReason)
            .then(result => {
                setTask(result);
                setShowRejectForm(false);
            })
            .catch(handleError)
            .finally(() => setSubmitting(false));
    };

    if (loading || !task) {
        return (
            <MeetingLayout title="Chi tiáº¿t cÃ´ng viá»‡c" backTo={backTo}>
                <div />
            </MeetingLayout>
        );
    }

    const canEvaluate = canEvaluateTask(user, task);
    const canRespond =
        role === SYSTEM_ROLES.NEIGHBORHOOD_HEAD && task.status === "ASSIGNED";

    return (
        <MeetingLayout title={task.title} backTo={backTo}>
            <InfoCard>
                <TopRow>
                    <TaskTitle>{task.title}</TaskTitle>
                    <StatusBadge status={task.status} />
                </TopRow>

                {task.content && <Content>{task.content}</Content>}

                <MetaGrid>
                    <div>
                        Điểm: <Points>{task.points}</Points>
                    </div>
                    {task.deadline && (
                        <div>Hạn hoàn thành: {formatDateTime(task.deadline)}</div>
                    )}
                    {task.assigneeName && (
                        <div>Người nhận: {task.assigneeName}</div>
                    )}
                </MetaGrid>

                {task.status === "INCOMPLETE" && task.note && (
                    <NoteBox>Lý do chưa hoàn thành: {task.note}</NoteBox>
                )}

                {task.status === "REJECTED" && task.note && (
                    <NoteBox>Lý do từ chối: {task.note}</NoteBox>
                )}
            </InfoCard>

            {task.files.length > 0 && (
                <div>
                    <SectionTitle>Tệp đính kèm của Chủ tịch</SectionTitle>
                    <FileAttachmentList files={task.files} />
                </div>
            )}

            {task.completionFiles.length > 0 && (
                <div>
                    <SectionTitle>Tệp báo cáo hoàn thành</SectionTitle>
                    <FileAttachmentList files={task.completionFiles} />
                </div>
            )}

            {canEvaluate && (
                <ActionCard>
                    <SectionTitle>Đánh giá công việc</SectionTitle>

                    <ButtonRow>
                        <PrimaryButton
                            type="button"
                            disabled={submitting}
                            onClick={handleEvaluateCompleted}
                        >
                            {submitting ? "Đang xử lý..." : "Hoàn thành"}
                        </PrimaryButton>
                        <DangerButton
                            type="button"
                            disabled={submitting}
                            onClick={() => setShowIncompleteForm(true)}
                        >
                            Chưa hoàn thành
                        </DangerButton>
                    </ButtonRow>
                </ActionCard>
            )}

            {showIncompleteForm && (
                <ModalBackdrop>
                    <ModalCard>
                        <ModalTitle>Ghi chú chưa hoàn thành</ModalTitle>
                        <TextArea
                            rows={4}
                            placeholder="Nhập lý do/ghi chú chưa hoàn thành"
                            value={incompleteNote}
                            onChange={event => setIncompleteNote(event.target.value)}
                        />
                        <ButtonRow>
                            <SecondaryButton
                                type="button"
                                disabled={submitting}
                                onClick={() => setShowIncompleteForm(false)}
                            >
                                Hủy
                            </SecondaryButton>
                            <DangerButton
                                type="button"
                                disabled={submitting}
                                onClick={handleEvaluateIncomplete}
                            >
                                {submitting
                                    ? "Đang xử lý..."
                                    : "Xác nhận chưa hoàn thành"}
                            </DangerButton>
                        </ButtonRow>
                    </ModalCard>
                </ModalBackdrop>
            )}

            {canRespond && (
                <ActionCard>
                    <SectionTitle>Phản hồi công việc</SectionTitle>

                    {!showRejectForm ? (
                        <>
                            <input
                                type="file"
                                multiple
                                onChange={event =>
                                    setCompletionFiles(
                                        Array.from(event.target.files || []),
                                    )
                                }
                            />
                            <ButtonRow>
                                <PrimaryButton
                                    type="button"
                                    disabled={submitting}
                                    onClick={handleComplete}
                                >
                                    Hoàn thành công việc
                                </PrimaryButton>
                                <DangerButton
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => setShowRejectForm(true)}
                                >
                                    Từ chối
                                </DangerButton>
                            </ButtonRow>
                        </>
                    ) : (
                        <>
                            <TextArea
                                rows={3}
                                placeholder="Lý do từ chối"
                                value={rejectReason}
                                onChange={event => setRejectReason(event.target.value)}
                            />
                            <ButtonRow>
                                <DangerButton
                                    type="button"
                                    disabled={submitting}
                                    onClick={handleReject}
                                >
                                    Xác nhận từ chối
                                </DangerButton>
                            </ButtonRow>
                        </>
                    )}
                </ActionCard>
            )}
        </MeetingLayout>
    );
};

const WardTaskDetailPage: React.FC = () => (
    <RequireRole
        roles={[SYSTEM_ROLES.WARD_CHAIRMAN, SYSTEM_ROLES.NEIGHBORHOOD_HEAD]}
    >
        <WardTaskDetailContent />
    </RequireRole>
);

export default WardTaskDetailPage;
