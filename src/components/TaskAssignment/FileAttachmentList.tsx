import React, { FC } from "react";
import styled from "styled-components";
import { Icon } from "zmp-ui";
import { TaskFile } from "@/services/taskAssignments";

const List = styled.div`
    display: grid;
    gap: 8px;
`;

const FileRow = styled.a`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #e4e7ec;
    border-radius: 12px;
    color: #0063a7;
    background: #f8fbff;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 700;
    overflow-wrap: anywhere;
`;

const FileAttachmentList: FC<{ files: TaskFile[] }> = ({ files }) => {
    if (!files.length) {
        return null;
    }

    return (
        <List>
            {files.map(file => (
                <FileRow
                    key={file.id || file.url}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Icon icon="zi-file" size={18} />
                    <span>{file.name}</span>
                </FileRow>
            ))}
        </List>
    );
};

export default FileAttachmentList;
