import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const EXTREMELY_IMPORTANT_MARKER = "<EXTREMELY_IMPORTANT>";
const BOOTSTRAP_MARKER = "superpowers-pi:using-superpowers bootstrap";
const extensionDir = dirname(fileURLToPath(import.meta.url));
const resourceRoot = findResourceRoot(extensionDir);
const skillsDir = resolve(resourceRoot, "skills");
const bootstrapSkillPath = resolve(skillsDir, "using-superpowers", "SKILL.md");

let cachedBootstrap: string | null | undefined;

export default function superpowersPiExtension(pi: ExtensionAPI) {
  let injectBootstrap = true;

  pi.on("resources_discover", async () => ({
    skillPaths: existsSync(skillsDir) ? [skillsDir] : [],
  }));

  pi.on("session_start", async () => {
    injectBootstrap = true;
  });

  pi.on("session_compact", async () => {
    injectBootstrap = true;
  });

  pi.on("agent_end", async () => {
    injectBootstrap = false;
  });

  pi.on("context", async (event) => {
    if (!injectBootstrap) return;
    if (event.messages.some(messageContainsBootstrap)) return;

    const bootstrap = getBootstrapContent();
    if (!bootstrap) return;

    const bootstrapMessage = {
      role: "user" as const,
      content: [{ type: "text" as const, text: bootstrap }],
      timestamp: Date.now(),
    };

    const insertAt = firstNonCompactionSummaryIndex(event.messages);
    return {
      messages: [
        ...event.messages.slice(0, insertAt),
        bootstrapMessage,
        ...event.messages.slice(insertAt),
      ],
    };
  });
}

function findResourceRoot(startDir: string): string {
  const candidates = [resolve(startDir, "../.."), resolve(startDir, "..")];
  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, "skills", "using-superpowers", "SKILL.md"))) {
      return candidate;
    }
  }
  return candidates[0] as string;
}

function getBootstrapContent(): string | null {
  if (cachedBootstrap !== undefined) return cachedBootstrap;
  try {
    const skillContent = readFileSync(bootstrapSkillPath, "utf8");
    const body = stripFrontmatter(skillContent);
    cachedBootstrap = `${EXTREMELY_IMPORTANT_MARKER}
${BOOTSTRAP_MARKER}

You have Superpowers for Pi.

The using-superpowers skill content is included below and is already loaded for this Pi session. Follow it now. Do not try to load using-superpowers again.

${body}

${piToolMapping()}
</EXTREMELY_IMPORTANT>`;
    return cachedBootstrap;
  } catch {
    cachedBootstrap = null;
    return null;
  }
}

function stripFrontmatter(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return (match ? match[1] : content).trim();
}

function piToolMapping(): string {
  return `## Pi tool mapping
Pi has native skills but does not expose Claude Code's \`Skill\` tool. When a Superpowers instruction says to invoke a skill, use Pi's native skill system: load the relevant skill by name, read its \`SKILL.md\` when needed, or let a human invoke \`/skill:name\` explicitly.
Use \`@tintinweb/pi-tasks\` for task tracking when available. If it is unavailable, use generic Pi task tools such as \`TaskCreate\`, \`TaskList\`, \`TaskGet\`, and \`TaskUpdate\`. If no task tool exists, track work in the plan/checklist Markdown.
Use \`@tintinweb/pi-subagents\` for Superpowers subagent workflows when available. If it is unavailable but Pi's \`Agent\` tool is available, use \`Agent\` with self-contained prompts. Use \`SubagentWorkflow\` only when the user explicitly asks for workflow orchestration.
Pi's built-in coding tools are lowercase: \`read\`, \`write\`, \`edit\`, and \`bash\`, plus optional search/list tools. Use those for file and shell operations.
Pi has no \`EnterPlanMode\`/\`ExitPlanMode\` equivalent for these workflows; stay in the normal session.`;
}

function messageContainsBootstrap(message: unknown): boolean {
  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") return content.includes(BOOTSTRAP_MARKER);
  if (!Array.isArray(content)) return false;
  return content.some((part) => {
    return (
      part &&
      typeof part === "object" &&
      (part as { type?: unknown }).type === "text" &&
      typeof (part as { text?: unknown }).text === "string" &&
      (part as { text: string }).text.includes(BOOTSTRAP_MARKER)
    );
  });
}

function firstNonCompactionSummaryIndex(messages: unknown[]): number {
  let index = 0;
  while ((messages[index] as { role?: unknown } | undefined)?.role === "compactionSummary") {
    index += 1;
  }
  return index;
}
