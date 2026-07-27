import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { User, SystemRole } from "@dts";
import { useStore } from "@store";
import MeetingLayout from "@/components/MeetingRoom/Layout";
import RequireRole from "@/components/common/RequireRole";
import { SYSTEM_ROLES } from "@/utils/permissions";
import { getFriendlyErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@utils/date-time";
import {
    createUser,
    getUsers,
    updateUser,
    USER_ROLE_OPTIONS,
    UserPayload,
} from "@/services/users";

const ROLE_FILTER_OPTIONS = [
    { value: "", label: "Tất cả role" },
    ...USER_ROLE_OPTIONS,
];

const emptyForm: UserPayload = {
    fullName: "",
    username: "",
    zalo_id: "",
    avatar: "",
    email: "",
    phone: "",
    title: "",
    position: "",
    role: "USER",
    businessRole: "",
    department: "",
    status: "ACTIVE",
};

const Toolbar = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;

    select {
        min-height: 42px;
        min-width: 0;
        border: 1px solid #d0d5dd;
        border-radius: 12px;
        padding: 0 10px;
        background: #ffffff;
        color: #344054;
        font-size: calc(13px * var(--app-font-scale));
        font-weight: 750;
    }
`;

const PrimaryButton = styled.button`
    min-height: 42px;
    border: 0;
    border-radius: 12px;
    padding: 0 14px;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 850;

    &:disabled {
        opacity: 0.6;
    }
`;

const SecondaryButton = styled(PrimaryButton)`
    color: #005b9f;
    background: #e7f5ff;
`;

const UserCard = styled.article`
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 10px 22px rgba(30, 35, 50, 0.06);
`;

const UserHeader = styled.div`
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
`;

const Avatar = styled.img`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    object-fit: cover;
    background: #e7f5ff;
`;

const AvatarFallback = styled.div`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #005b9f;
    background: #e7f5ff;
    font-weight: 900;
`;

const UserName = styled.div`
    color: #172033;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 900;
    overflow-wrap: anywhere;
`;

const UserSub = styled.div`
    margin-top: 2px;
    color: #667085;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 650;
    overflow-wrap: anywhere;
`;

const RolePill = styled.span`
    max-width: 126px;
    padding: 6px 8px;
    border-radius: 999px;
    color: #005b9f;
    background: #e7f5ff;
    font-size: calc(10.5px * var(--app-font-scale));
    font-weight: 900;
    text-align: center;
    overflow-wrap: anywhere;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
`;

const InfoItem = styled.div`
    min-width: 0;
    padding: 8px;
    border-radius: 12px;
    background: #f8fbff;
`;

const InfoLabel = styled.div`
    color: #98a2b3;
    font-size: calc(10.5px * var(--app-font-scale));
    font-weight: 750;
`;

const InfoValue = styled.div`
    margin-top: 2px;
    color: #344054;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 750;
    overflow-wrap: anywhere;
`;

const Form = styled.form`
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid #d0d5dd;
    border-radius: 16px;
    background: #f8fbff;
`;

const FieldGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
`;

const Field = styled.label`
    display: grid;
    gap: 5px;

    span {
        color: #344054;
        font-size: calc(12px * var(--app-font-scale));
        font-weight: 850;
    }

    input,
    select {
        width: 100%;
        min-height: 40px;
        box-sizing: border-box;
        border: 1px solid #d0d5dd;
        border-radius: 12px;
        padding: 0 10px;
        color: #172033;
        background: #ffffff;
        font-size: calc(13px * var(--app-font-scale));
        font-weight: 650;
    }
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 8px;
`;

const EmptyText = styled.div`
    padding: 20px;
    text-align: center;
    color: #98a2b3;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 650;
`;

const getUserDisplayName = (user: User) =>
    user.fullName || user.name || user.username || "Người dùng";

const getDepartment = (user: User) =>
    typeof user.department === "string"
        ? user.department
        : user.departmentName || user.department?.name || user.department?.title || "";

const compactPayload = (payload: UserPayload): UserPayload => {
    const next = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== ""),
    );

    return next as UserPayload;
};

const UserManagementContent: React.FC = () => {
    const setError = useStore(state => state.setError);
    const [roleFilter, setRoleFilter] = useState<SystemRole | "">("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingUser, setEditingUser] = useState<User>();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<UserPayload>(emptyForm);

    const formTitle = useMemo(
        () => (editingUser ? "Sửa người dùng" : "Tạo người dùng"),
        [editingUser],
    );

    const loadUsers = () => {
        setLoading(true);
        getUsers({ role: roleFilter, page: 0, size: 100 })
            .then(result => setUsers(result.items))
            .catch(error => setError({ message: getFriendlyErrorMessage(error) }))
            .finally(() => setLoading(false));
    };

    useEffect(loadUsers, [roleFilter]);

    const openCreateForm = () => {
        setEditingUser(undefined);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEditForm = (user: User) => {
        setEditingUser(user);
        setForm({
            fullName: user.fullName || user.name || "",
            username: user.username || "",
            zalo_id: user.zalo_id || user.zaloId || user.idByOA || "",
            avatar: user.avatar || "",
            email: user.email || "",
            phone: user.phone || "",
            title: user.title || "",
            position: user.position || "",
            role: user.systemRole || user.role || "USER",
            businessRole: user.businessRole || "",
            department: getDepartment(user),
            status: user.status || "",
        });
        setShowForm(true);
    };

    const updateField = (key: keyof UserPayload, value: string) => {
        setForm(current => ({ ...current, [key]: value }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.role) {
            setError({ message: "Vui lòng chọn role cho người dùng." });
            return;
        }

        setSaving(true);
        const payload = compactPayload(form);
        const request = editingUser
            ? updateUser(editingUser.id, payload)
            : createUser(payload);

        request
            .then(() => {
                setShowForm(false);
                setEditingUser(undefined);
                setForm(emptyForm);
                loadUsers();
            })
            .catch(error => setError({ message: getFriendlyErrorMessage(error) }))
            .finally(() => setSaving(false));
    };

    return (
        <MeetingLayout
            title="Quản lý người dùng"
            description="Phân quyền tài khoản mini app"
        >
            <Toolbar>
                <select
                    value={roleFilter}
                    onChange={event =>
                        setRoleFilter(event.target.value as SystemRole | "")
                    }
                >
                    {ROLE_FILTER_OPTIONS.map(option => (
                        <option key={option.value || "all"} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <PrimaryButton type="button" onClick={openCreateForm}>
                    + Tạo user
                </PrimaryButton>
            </Toolbar>

            {showForm && (
                <Form onSubmit={handleSubmit}>
                    <UserName>{formTitle}</UserName>
                    <FieldGrid>
                        <Field>
                            <span>Họ tên</span>
                            <input
                                value={form.fullName || ""}
                                onChange={event =>
                                    updateField("fullName", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Username</span>
                            <input
                                value={form.username || ""}
                                onChange={event =>
                                    updateField("username", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Zalo ID</span>
                            <input
                                value={form.zalo_id || ""}
                                onChange={event =>
                                    updateField("zalo_id", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Avatar URL</span>
                            <input
                                value={form.avatar || ""}
                                onChange={event =>
                                    updateField("avatar", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Email</span>
                            <input
                                type="email"
                                value={form.email || ""}
                                onChange={event =>
                                    updateField("email", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Phone</span>
                            <input
                                value={form.phone || ""}
                                onChange={event =>
                                    updateField("phone", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Title</span>
                            <input
                                value={form.title || ""}
                                onChange={event =>
                                    updateField("title", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Position</span>
                            <input
                                value={form.position || ""}
                                onChange={event =>
                                    updateField("position", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Role</span>
                            <select
                                value={form.role}
                                onChange={event =>
                                    updateField("role", event.target.value)
                                }
                            >
                                {USER_ROLE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field>
                            <span>Business role</span>
                            <input
                                value={form.businessRole || ""}
                                onChange={event =>
                                    updateField("businessRole", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Phòng ban</span>
                            <input
                                value={form.department || ""}
                                onChange={event =>
                                    updateField("department", event.target.value)
                                }
                            />
                        </Field>
                        <Field>
                            <span>Trạng thái</span>
                            <input
                                value={form.status || ""}
                                onChange={event =>
                                    updateField("status", event.target.value)
                                }
                            />
                        </Field>
                    </FieldGrid>
                    <ButtonRow>
                        <PrimaryButton type="submit" disabled={saving}>
                            {saving ? "Đang lưu..." : "Lưu"}
                        </PrimaryButton>
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowForm(false)}
                            disabled={saving}
                        >
                            Hủy
                        </SecondaryButton>
                    </ButtonRow>
                </Form>
            )}

            {!loading && users.length === 0 && (
                <EmptyText>Chưa có người dùng phù hợp bộ lọc.</EmptyText>
            )}

            {users.map(user => (
                <UserCard key={user.id}>
                    <UserHeader>
                        {user.avatar ? (
                            <Avatar src={user.avatar} alt="" />
                        ) : (
                            <AvatarFallback>
                                {getUserDisplayName(user).charAt(0).toUpperCase()}
                            </AvatarFallback>
                        )}
                        <div>
                            <UserName>{getUserDisplayName(user)}</UserName>
                            <UserSub>{user.username || user.email || user.id}</UserSub>
                        </div>
                        <RolePill>{user.systemRole || user.role || "USER"}</RolePill>
                    </UserHeader>

                    <InfoGrid>
                        <InfoItem>
                            <InfoLabel>Zalo ID</InfoLabel>
                            <InfoValue>
                                {user.zalo_id || user.zaloId || user.idByOA || "-"}
                            </InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Email</InfoLabel>
                            <InfoValue>{user.email || "-"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Phone</InfoLabel>
                            <InfoValue>{user.phone || "-"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Title/position</InfoLabel>
                            <InfoValue>
                                {[user.title, user.position].filter(Boolean).join(" / ") ||
                                    "-"}
                            </InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Business role</InfoLabel>
                            <InfoValue>{user.businessRole || "-"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Phòng ban</InfoLabel>
                            <InfoValue>{getDepartment(user) || "-"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Trạng thái</InfoLabel>
                            <InfoValue>{user.status || "-"}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Last login</InfoLabel>
                            <InfoValue>
                                {user.lastLoginAt
                                    ? formatDateTime(user.lastLoginAt)
                                    : "-"}
                            </InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Created at</InfoLabel>
                            <InfoValue>
                                {user.createdAt ? formatDateTime(user.createdAt) : "-"}
                            </InfoValue>
                        </InfoItem>
                    </InfoGrid>

                    <SecondaryButton type="button" onClick={() => openEditForm(user)}>
                        Sửa thông tin / role
                    </SecondaryButton>
                </UserCard>
            ))}
        </MeetingLayout>
    );
};

const UserManagementPage: React.FC = () => (
    <RequireRole roles={[SYSTEM_ROLES.ADMIN]}>
        <UserManagementContent />
    </RequireRole>
);

export default UserManagementPage;
