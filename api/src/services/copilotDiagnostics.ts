import { access, chmod, copyFile, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

export type CopilotDiagnosticsResponse = {
  environment: {
    hasGitHubToken: boolean;
    mode: string;
    model: string;
    runtimePath?: string;
    websiteSiteName?: string;
  };
  checks: Array<{
    name: string;
    ok: boolean;
    detail?: string;
  }>;
};

export async function getCopilotDiagnostics(): Promise<CopilotDiagnosticsResponse> {
  const runtimePath = process.env.COPILOT_RUNTIME_PATH ?? process.env.COPILOT_CLI_PATH ?? resolveAzureCopilotCliPath() ?? resolveBundledCopilotCliPath();
  const checks: CopilotDiagnosticsResponse["checks"] = [];

  checks.push(await checkImport("@github/copilot-sdk"));
  checks.push(await checkImport("@github/copilot"));

  if (runtimePath) {
    checks.push(await checkFile("runtimePath exists", runtimePath));
    checks.push(await checkExecutable("runtimePath executable", runtimePath));
    const preparedPath = await prepareRuntimePath(runtimePath);
    if (preparedPath !== runtimePath) checks.push(await checkExecutable("prepared runtime executable", preparedPath));
    checks.push(await checkCommandVersion(preparedPath));
  } else {
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

async function prepareRuntimePath(runtimePath: string): Promise<string> {
  try {
    await access(runtimePath, constants.X_OK);
    return runtimePath;
  } catch {
    if (!process.env.WEBSITE_SITE_NAME) return runtimePath;
    const targetDir = path.join(os.tmpdir(), "safe-prompt-copilot-runtime");
    const targetPath = path.join(targetDir, "copilot");
    await mkdir(targetDir, { recursive: true });
    await copyFile(runtimePath, targetPath);
    await chmod(targetPath, 0o755);
    return targetPath;
  }
}

async function checkImport(packageName: string) {
  try {
    createRequire(__filename).resolve(packageName);
    return { name: `resolve ${packageName}`, ok: true };
  } catch (error) {
    return { name: `resolve ${packageName}`, ok: false, detail: safeErrorMessage(error) };
  }
}

async function checkFile(name: string, filePath: string) {
  try {
    await access(filePath, constants.F_OK);
    return { name, ok: true, detail: filePath };
  } catch (error) {
    return { name, ok: false, detail: `${filePath}: ${safeErrorMessage(error)}` };
  }
}

async function checkExecutable(name: string, filePath: string) {
  try {
    await access(filePath, constants.X_OK);
    return { name, ok: true, detail: filePath };
  } catch (error) {
    return { name, ok: false, detail: `${filePath}: ${safeErrorMessage(error)}` };
  }
}

function checkCommandVersion(runtimePath: string): Promise<{ name: string; ok: boolean; detail?: string }> {
  return new Promise((resolve) => {
    const child = spawn(runtimePath, ["--version"], { env: process.env, stdio: ["ignore", "pipe", "pipe"] });
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

function resolveBundledCopilotCliPath(): string | undefined {
  try {
    return createRequire(__filename).resolve("@github/copilot/npm-loader.js");
  } catch {
    return undefined;
  }
}

function resolveAzureCopilotCliPath(): string | undefined {
  const azurePath = "/home/site/wwwroot/node_modules/@github/copilot-linux-x64/copilot";
  return process.env.WEBSITE_SITE_NAME ? azurePath : undefined;
}

function safeErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  return rawMessage
    .replace(/gh[pousr]_[A-Za-z0-9_]+/gu, "[REDACTED_GITHUB_TOKEN]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gu, "Bearer [REDACTED]")
    .slice(0, 500);
}
