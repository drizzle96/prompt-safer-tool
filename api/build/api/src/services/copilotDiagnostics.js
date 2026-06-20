"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCopilotDiagnostics = getCopilotDiagnostics;
const promises_1 = require("node:fs/promises");
const node_fs_1 = require("node:fs");
const node_child_process_1 = require("node:child_process");
const node_module_1 = require("node:module");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
async function getCopilotDiagnostics() {
    const runtimePath = process.env.COPILOT_RUNTIME_PATH ?? process.env.COPILOT_CLI_PATH ?? resolveAzureCopilotCliPath() ?? resolveBundledCopilotCliPath();
    const checks = [];
    checks.push(await checkImport("@github/copilot-sdk"));
    checks.push(await checkImport("@github/copilot"));
    if (runtimePath) {
        checks.push(await checkFile("runtimePath exists", runtimePath));
        checks.push(await checkExecutable("runtimePath executable", runtimePath));
        const preparedPath = await prepareRuntimePath(runtimePath);
        if (preparedPath !== runtimePath)
            checks.push(await checkExecutable("prepared runtime executable", preparedPath));
        checks.push(await checkCommandVersion(preparedPath));
    }
    else {
        checks.push({ name: "runtimePath configured", ok: false, detail: "No Copilot runtime path could be resolved." });
    }
    return {
        environment: {
            hasGitHubToken: Boolean(process.env.COPILOT_GITHUB_TOKEN || process.env.GITHUB_TOKEN),
            mode: process.env.COPILOT_RULE_GENERATION_MODE ?? "auto",
            model: process.env.COPILOT_RULE_MODEL ?? "gpt-5.4-mini",
            runtimePath,
            websiteSiteName: process.env.WEBSITE_SITE_NAME
        },
        checks
    };
}
async function prepareRuntimePath(runtimePath) {
    try {
        await (0, promises_1.access)(runtimePath, node_fs_1.constants.X_OK);
        return runtimePath;
    }
    catch {
        if (!process.env.WEBSITE_SITE_NAME)
            return runtimePath;
        const targetDir = node_path_1.default.join(node_os_1.default.tmpdir(), "safe-prompt-copilot-runtime");
        const targetPath = node_path_1.default.join(targetDir, "copilot");
        await (0, promises_1.mkdir)(targetDir, { recursive: true });
        await (0, promises_1.copyFile)(runtimePath, targetPath);
        await (0, promises_1.chmod)(targetPath, 0o755);
        return targetPath;
    }
}
async function checkImport(packageName) {
    try {
        (0, node_module_1.createRequire)(__filename).resolve(packageName);
        return { name: `resolve ${packageName}`, ok: true };
    }
    catch (error) {
        return { name: `resolve ${packageName}`, ok: false, detail: safeErrorMessage(error) };
    }
}
async function checkFile(name, filePath) {
    try {
        await (0, promises_1.access)(filePath, node_fs_1.constants.F_OK);
        return { name, ok: true, detail: filePath };
    }
    catch (error) {
        return { name, ok: false, detail: `${filePath}: ${safeErrorMessage(error)}` };
    }
}
async function checkExecutable(name, filePath) {
    try {
        await (0, promises_1.access)(filePath, node_fs_1.constants.X_OK);
        return { name, ok: true, detail: filePath };
    }
    catch (error) {
        return { name, ok: false, detail: `${filePath}: ${safeErrorMessage(error)}` };
    }
}
function checkCommandVersion(runtimePath) {
    return new Promise((resolve) => {
        const child = (0, node_child_process_1.spawn)(runtimePath, ["--version"], { env: process.env, stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        const timeout = setTimeout(() => {
            child.kill("SIGTERM");
            resolve({ name: "runtime --version", ok: false, detail: "Timed out." });
        }, 10000);
        child.stdout.on("data", (chunk) => {
            stdout += String(chunk);
        });
        child.stderr.on("data", (chunk) => {
            stderr += String(chunk);
        });
        child.on("error", (error) => {
            clearTimeout(timeout);
            resolve({ name: "runtime --version", ok: false, detail: safeErrorMessage(error) });
        });
        child.on("close", (code) => {
            clearTimeout(timeout);
            resolve({ name: "runtime --version", ok: code === 0, detail: `${stdout}${stderr}`.slice(0, 500) });
        });
    });
}
function resolveBundledCopilotCliPath() {
    try {
        return (0, node_module_1.createRequire)(__filename).resolve("@github/copilot/npm-loader.js");
    }
    catch {
        return undefined;
    }
}
function resolveAzureCopilotCliPath() {
    const azurePath = "/home/site/wwwroot/node_modules/@github/copilot-linux-x64/copilot";
    return process.env.WEBSITE_SITE_NAME ? azurePath : undefined;
}
function safeErrorMessage(error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    return rawMessage
        .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
        .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
        .slice(0, 500);
}
