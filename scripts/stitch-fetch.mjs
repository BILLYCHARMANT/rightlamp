import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mcpPath = join(root, "..", ".cursor", "mcp.json");

function loadApiKey() {
  const raw = readFileSync(mcpPath, "utf8");
  const config = JSON.parse(raw);
  return config.mcpServers?.stitch?.headers?.["X-Goog-Api-Key"];
}

async function stitchCall(name, args = {}) {
  const apiKey = loadApiKey();
  if (!apiKey) throw new Error("Missing X-Goog-Api-Key in .cursor/mcp.json");

  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name, arguments: args },
  };

  const res = await fetch("https://stitch.googleapis.com/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    const dataLine = text
      .split("\n")
      .find((line) => line.startsWith("data: "));
    if (dataLine) return JSON.parse(dataLine.slice(6));
    throw new Error(`Unexpected response: ${text.slice(0, 500)}`);
  }
}

function parseToolResult(result) {
  if (result?.error) throw new Error(JSON.stringify(result.error));
  const content = result?.result?.content ?? result?.content;
  if (Array.isArray(content)) {
    const text = content.find((c) => c.type === "text")?.text;
    if (text) {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  }
  return result?.result ?? result;
}

const outDir = join(root, "stitch-live");
mkdirSync(outDir, { recursive: true });

const projectId = process.argv[2] || "3654913102318098977";
const action = process.argv[3] || "list";

async function main() {
  if (action === "list") {
    const projects = parseToolResult(await stitchCall("list_projects", {}));
    writeFileSync(join(outDir, "projects.json"), JSON.stringify(projects, null, 2));
    console.log("projects saved");

    const screens = parseToolResult(
      await stitchCall("list_screens", { projectId }),
    );
    writeFileSync(join(outDir, "screens.json"), JSON.stringify(screens, null, 2));
    console.log("screens saved");
    return;
  }

  const screenId = process.argv[4];
  if (!screenId) throw new Error("screenId required for fetch");

  if (action === "code") {
    const code = parseToolResult(
      await stitchCall("fetch_screen_code", { projectId, screenId }),
    );
    writeFileSync(join(outDir, `${screenId}.html`), typeof code === "string" ? code : JSON.stringify(code, null, 2));
    console.log(`code saved for ${screenId}`);
    return;
  }

  if (action === "download") {
    const screens = parseToolResult(
      await stitchCall("list_screens", { projectId }),
    );
    const list = screens?.screens ?? screens ?? [];
    const match = list.find((s) => s.name?.includes(screenId) || s.title?.toLowerCase().includes(screenId.toLowerCase()));
    if (!match?.htmlCode?.downloadUrl) throw new Error(`No HTML for ${screenId}`);
    const html = await fetch(match.htmlCode.downloadUrl).then((r) => r.text());
    const safeName = (match.title || screenId).replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase();
    writeFileSync(join(outDir, `${safeName}.html`), html);
    console.log(`downloaded ${match.title}`);
    return;
  }

  if (action === "screen") {
    const screen = parseToolResult(
      await stitchCall("get_screen", { projectId, screenId }),
    );
    writeFileSync(join(outDir, `${screenId}.json`), JSON.stringify(screen, null, 2));
    console.log(`metadata saved for ${screenId}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
