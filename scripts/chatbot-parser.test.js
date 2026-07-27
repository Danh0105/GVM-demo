const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { mkdirSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const outDir = join(process.cwd(), ".tmp-chatbot-parser-test");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
    "npx",
    [
        "tsc",
        "src/services/chatbotSse.ts",
        "src/services/chatbotResponse.ts",
        "--target",
        "es2020",
        "--module",
        "commonjs",
        "--outDir",
        outDir,
        "--skipLibCheck",
    ],
    { stdio: "inherit", shell: process.platform === "win32" },
);

const { createSseEventParser, parseSseEvent } = require(join(
    outDir,
    "chatbotSse.js",
));
const {
    DEFAULT_CHATBOT_FALLBACK,
    normalizeAssistantResponse,
} = require(join(outDir, "chatbotResponse.js"));

assert.deepEqual(parseSseEvent('event: delta\ndata: {"text":"Xin chào"}'), {
    event: "delta",
    data: '{"text":"Xin chào"}',
});

assert.deepEqual(
    normalizeAssistantResponse({
        message: "Thành công",
        data: { answer: "Chào anh/chị, tôi có thể hỗ trợ thủ tục hành chính." },
        source: "GPT",
    }),
    {
        content: "Chào anh/chị, tôi có thể hỗ trợ thủ tục hành chính.",
        source: "ai",
        metadata: {
            source: "GPT",
            cached: null,
            knowledgeId: null,
            model: null,
        },
    },
);

assert.equal(
    normalizeAssistantResponse({
        data: { content: "**Hồ sơ cần chuẩn bị**\n- CCCD\n- Đơn đề nghị" },
        cached: true,
    }).source,
    "saved",
);

assert.equal(
    normalizeAssistantResponse({
        data: { message: { content: "Nội dung từ message.content" } },
    }).content,
    "Nội dung từ message.content",
);

assert.equal(
    normalizeAssistantResponse({
        answer: "Câu trả lời cấp root",
        data: { answer: "Câu trả lời ưu tiên trong data" },
    }).content,
    "Câu trả lời ưu tiên trong data",
);

assert.equal(
    normalizeAssistantResponse('{"data":{"answer":"JSON string hợp lệ"}}').content,
    "JSON string hợp lệ",
);

assert.equal(
    normalizeAssistantResponse({ status: 200, message: "Thành công" }).content,
    DEFAULT_CHATBOT_FALLBACK,
);

assert.equal(normalizeAssistantResponse(null).content, DEFAULT_CHATBOT_FALLBACK);

assert.equal(normalizeAssistantResponse('{"data":').content, '{"data":');

{
    const events = [];
    const parser = createSseEventParser(event => events.push(event));

    parser.push('event: delta\ndata: {"text":"Thủ');
    parser.push(' tục"}\n\n');

    assert.equal(events.length, 1);
    assert.equal(JSON.parse(events[0].data).text, "Thủ tục");
}

{
    const events = [];
    const parser = createSseEventParser(event => events.push(event));

    parser.push(
        'event: delta\ndata: {"text":"A"}\n\nevent: delta\ndata: {"text":"B"}\n\n',
    );

    assert.equal(events.length, 2);
    assert.equal(events.map(event => JSON.parse(event.data).text).join(""), "AB");
}

{
    const events = [];
    const parser = createSseEventParser(event => events.push(event));
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");
    const bytes = encoder.encode(
        'event: delta\ndata: {"text":"Tiếng Việt không lỗi"}\n\n',
    );

    parser.push(decoder.decode(bytes.slice(0, 25), { stream: true }));
    parser.push(decoder.decode(bytes.slice(25), { stream: true }));

    assert.equal(JSON.parse(events[0].data).text, "Tiếng Việt không lỗi");
}

{
    const events = [];
    const parser = createSseEventParser(event => {
        events.push(event);
        return event.event === "done";
    });

    const stopped = parser.push(
        'event: done\ndata: {"source":"GPT"}\n\nevent: delta\ndata: {"text":"late"}\n\n',
    );

    assert.equal(stopped, true);
    assert.equal(events.length, 1);
    assert.equal(events[0].event, "done");
}

rmSync(outDir, { recursive: true, force: true });
console.log("chatbot parser tests passed");
