const { getCopilotDiagnostics } = require("../build/api/src/services/copilotDiagnostics");
const { sendJson } = require("../shared/classicHttp");

module.exports = async function copilotDiagnostics(context) {
  try {
    sendJson(context, 200, await getCopilotDiagnostics());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(context, 500, { error: "Copilot diagnostics failed.", detail: message.slice(0, 500) });
  }
};
