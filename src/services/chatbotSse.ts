export type SseEvent = {
    event: string;
    data: string;
};

export const parseSseEvent = (rawEvent: string): SseEvent => {
    let eventName = "message";
    const dataLines: string[] = [];

    rawEvent
        .replace(/\r\n/g, "\n")
        .split("\n")
        .forEach(line => {
            if (line.startsWith("event:")) {
                eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).trimStart());
            }
        });

    return { event: eventName, data: dataLines.join("\n") };
};

export const createSseEventParser = (
    onEvent: (event: SseEvent) => boolean | void,
) => {
    let buffer = "";

    const push = (chunk: string) => {
        buffer += chunk;
        let separatorMatch = /\r?\n\r?\n/.exec(buffer);
        let shouldStop = false;

        while (separatorMatch && !shouldStop) {
            const rawEvent = buffer.slice(0, separatorMatch.index);
            buffer = buffer.slice(
                separatorMatch.index + separatorMatch[0].length,
            );

            shouldStop = onEvent(parseSseEvent(rawEvent)) === true;
            separatorMatch = /\r?\n\r?\n/.exec(buffer);
        }

        return shouldStop;
    };

    const flush = () => {
        const pending = buffer.trim();
        buffer = "";

        if (pending) {
            return onEvent(parseSseEvent(pending)) === true;
        }

        return false;
    };

    return { push, flush };
};
