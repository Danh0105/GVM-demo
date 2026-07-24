const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { mkdirSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const Module = require("node:module");

const outDir = join(process.cwd(), ".tmp-remote-queue-test");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
    "npx",
    [
        "esbuild",
        "src/services/remoteQueue.ts",
        "--bundle",
        "--platform=node",
        "--format=cjs",
        "--external:./request",
        "--external:./api-client",
        `--outfile=${join(outDir, "remoteQueue.js")}`,
    ],
    { stdio: "inherit", shell: process.platform === "win32" },
);

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "./request" || request === "./api-client") {
        return { request: async () => undefined, ApiError: class ApiError {} };
    }

    return originalLoad.call(this, request, parent, isMain);
};

const { normalizeDesk } = require(join(outDir, "remoteQueue.js"));

Module._load = originalLoad;

{
    const desk = normalizeDesk({
        id: "desk-1",
        code: "Q01",
        name: "Quầy số 01",
        active: true,
        currentServingNumber: "A012",
        assignees: [
            {
                id: "user-1",
                name: "Nguyễn Văn An",
                avatar: "https://example.com/avatar.jpg",
                position: "Chuyên viên tiếp nhận hồ sơ",
            },
        ],
    });

    assert.equal(desk.status, "active");
    assert.equal(desk.assignees.length, 1);
    assert.equal(desk.assignee.fullName, "Nguyễn Văn An");
    assert.equal(desk.assignee.avatarUrl, "https://example.com/avatar.jpg");
    assert.equal(desk.currentServingNumber, "A012");
}

{
    const desk = normalizeDesk({
        id: "desk-2",
        code: "Q02",
        name: "Quầy số 02",
        active: true,
        assignees: [],
    });

    assert.equal(desk.status, "unassigned");
    assert.equal(desk.assignee, null);
    assert.deepEqual(desk.assignees, []);
    assert.equal(desk.assignedUserName, null);
}

{
    const desk = normalizeDesk({
        id: "desk-3",
        code: "Q03",
        active: true,
        assignments: [
            {
                endedAt: "2026-07-22T08:00:00.000Z",
                user: { fullName: "Cán bộ cũ" },
            },
        ],
    });

    assert.equal(desk.status, "unassigned");
    assert.equal(desk.assignee, null);
}

{
    const desk = normalizeDesk({
        id: "desk-4",
        code: "Q04",
        active: true,
        assignees: [
            {
                id: "user-2",
                name: "Trần Thị Bình",
                avatar: null,
                departmentName: "Bộ phận Một cửa",
            },
            {
                id: "user-3",
                name: "Lê Văn Cường",
                avatar: null,
            },
        ],
    });

    assert.equal(desk.status, "active");
    assert.equal(desk.assignees.length, 2);
    assert.equal(desk.assignee.avatarUrl, null);
    assert.equal(desk.assignedUserTitle, "Bộ phận Một cửa");
    assert.equal(desk.assignees[1].name, "Lê Văn Cường");
}

rmSync(outDir, { recursive: true, force: true });
console.log("remote queue desk normalize tests passed");
