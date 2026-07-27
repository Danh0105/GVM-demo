import React, { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { Icon } from "zmp-ui";

export type FilterBarValue = {
    keyword?: string;
    status?: string;
    month?: number;
    year?: number;
};

type StatusOption = { value: string; label: string };

type FilterBarProps = {
    value: FilterBarValue;
    onChange: (value: FilterBarValue) => void;
    statusOptions?: StatusOption[];
};

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) => currentYear - index);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

const Wrapper = styled.div`
    display: grid;
    gap: 8px;
    padding: 0 0 12px;
`;

const SearchBox = styled.div`
    position: relative;

    input {
        width: 100%;
        height: 44px;
        padding: 0 14px 0 40px;
        border: 1px solid #d0d5dd;
        border-radius: 14px;
        color: #172033;
        font-size: calc(14px * var(--app-font-scale));
        font-weight: 600;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: #008bd2;
        }
    }

    svg {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #98a2b3;
    }
`;

const SelectRow = styled.div`
    display: flex;
    gap: 8px;
    overflow-x: auto;

    select {
        min-height: 38px;
        padding: 0 10px;
        border: 1px solid #d0d5dd;
        border-radius: 12px;
        color: #344054;
        background: #ffffff;
        font-size: calc(13px * var(--app-font-scale));
        font-weight: 700;
        flex: 0 0 auto;
    }
`;

const FilterBar: FC<FilterBarProps> = ({ value, onChange, statusOptions }) => {
    const [keyword, setKeyword] = useState(value.keyword || "");

    useEffect(() => {
        setKeyword(value.keyword || "");
    }, [value.keyword]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (keyword !== (value.keyword || "")) {
                onChange({ ...value, keyword });
            }
        }, 350);

        return () => window.clearTimeout(timer);
    }, [keyword]);

    return (
        <Wrapper>
            <SearchBox>
                <Icon icon="zi-search" size={18} />
                <input
                    value={keyword}
                    onChange={event => setKeyword(event.target.value)}
                    placeholder="Tìm kiếm..."
                />
            </SearchBox>

            <SelectRow>
                {statusOptions && (
                    <select
                        value={value.status || ""}
                        onChange={event =>
                            onChange({ ...value, status: event.target.value || undefined })
                        }
                    >
                        <option value="">Tất cả trạng thái</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    value={value.month ?? ""}
                    onChange={event =>
                        onChange({
                            ...value,
                            month: event.target.value
                                ? Number(event.target.value)
                                : undefined,
                        })
                    }
                >
                    <option value="">Tháng</option>
                    {MONTH_OPTIONS.map(month => (
                        <option key={month} value={month}>
                            Tháng {month}
                        </option>
                    ))}
                </select>

                <select
                    value={value.year ?? ""}
                    onChange={event =>
                        onChange({
                            ...value,
                            year: event.target.value
                                ? Number(event.target.value)
                                : undefined,
                        })
                    }
                >
                    <option value="">Năm</option>
                    {YEAR_OPTIONS.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </SelectRow>
        </Wrapper>
    );
};

export default FilterBar;
