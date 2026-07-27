export type JsonRecord = Record<string, unknown>;

export const asRecord = (value: unknown): JsonRecord =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as JsonRecord)
        : {};

export const asArray = (value: unknown): unknown[] =>
    Array.isArray(value) ? value : [];

export const firstString = (record: JsonRecord, ...keys: string[]) => {
    const value = keys
        .map(key => record[key])
        .find(
            candidate =>
                (typeof candidate === "string" && Boolean(candidate.trim())) ||
                typeof candidate === "number",
        );

    return value === undefined ? "" : String(value);
};

export const firstNumber = (record: JsonRecord, ...keys: string[]) => {
    const value = keys
        .map(key => record[key])
        .find(candidate => typeof candidate === "number" && !Number.isNaN(candidate));

    return typeof value === "number" ? value : 0;
};

export const firstBoolean = (record: JsonRecord, ...keys: string[]) =>
    keys.some(key => Boolean(record[key]));

export const nestedString = (
    record: JsonRecord,
    objectKey: string,
    ...keys: string[]
) => firstString(asRecord(record[objectKey]), ...keys);

export const unwrap = (value: unknown): unknown => {
    const record = asRecord(value);

    if (Object.prototype.hasOwnProperty.call(record, "data")) {
        return record.data;
    }

    return value;
};

export const unwrapList = (value: unknown, ...keys: string[]): unknown[] => {
    const unwrapped = unwrap(value);

    if (Array.isArray(unwrapped)) {
        return unwrapped;
    }

    const record = asRecord(unwrapped);

    const list = [...keys, "items", "results", "data"]
        .map(key => record[key])
        .find(Array.isArray);

    return list || [];
};

export type Page<T> = {
    items: T[];
    total: number;
    page: number;
    size: number;
};

export const unwrapPage = <T>(
    value: unknown,
    mapItem: (item: unknown) => T,
    ...listKeys: string[]
): Page<T> => {
    const unwrapped = unwrap(value);
    const items = unwrapList(unwrapped, ...listKeys).map(mapItem);
    const record = asRecord(unwrapped);
    const pagination = asRecord(record.pagination || record.meta);
    const total = firstNumber(
        { ...record, ...pagination },
        "total",
        "totalItems",
    );
    const page = firstNumber({ ...record, ...pagination }, "page", "currentPage");
    const size = firstNumber({ ...record, ...pagination }, "size", "pageSize");

    return {
        items,
        total: total || items.length,
        page,
        size: size || items.length,
    };
};
