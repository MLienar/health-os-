#!/usr/bin/env node
// Repo-local issue tracker. Zero dependencies. Issues are markdown files with YAML-ish frontmatter
// in tracker/issues/, milestones in tracker/milestones/. Readiness is computed, never stored.
//
//   node scripts/tracker.mjs check                 validate frontmatter, deps, cycles
//   node scripts/tracker.mjs list [M0]             all issues, optionally one milestone
//   node scripts/tracker.mjs ready [M0]            todo issues whose blockers are all done
//   node scripts/tracker.mjs next [M0]             lowest-id ready issue owned by the agent (exit 1 if none)
//   node scripts/tracker.mjs humans                open issues owned by the human
//   node scripts/tracker.mjs show <id>             print one issue
//   node scripts/tracker.mjs start <id> [branch]   status -> in-progress, record branch
//   node scripts/tracker.mjs done <id> [commit]    status -> done, record merge commit
//   node scripts/tracker.mjs reopen <id>           status -> todo
//   node scripts/tracker.mjs board                 regenerate tracker/BOARD.md

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ISSUES_DIR = join(ROOT, "tracker", "issues");
const MILESTONES_DIR = join(ROOT, "tracker", "milestones");
const BOARD = join(ROOT, "tracker", "BOARD.md");

const STATUSES = ["todo", "in-progress", "done"];
const OWNERS = ["agent", "human"];
const SIZES = ["S", "M", "L"];

// ---------- parsing ----------

function parseScalar(raw) {
  const v = raw.trim();
  if (v === "") return "";
  if (/^"(.*)"$/.test(v)) return v.slice(1, -1);
  if (/^-?\d+$/.test(v)) return Number(v);
  return v;
}

function parseValue(raw) {
  const v = raw.trim();
  if (v.startsWith("[")) {
    const inner = v.replace(/^\[|\]$/g, "").trim();
    return inner === "" ? [] : inner.split(",").map(parseScalar);
  }
  return parseScalar(v);
}

function parseIssue(file) {
  const text = readFileSync(join(ISSUES_DIR, file), "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const fm = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx < 0) throw new Error(`${file}: bad frontmatter line "${line}"`);
    fm[line.slice(0, idx).trim()] = parseValue(line.slice(idx + 1));
  }
  return { file, fm, body: m[2], rawFrontmatter: m[1] };
}

function loadIssues() {
  if (!existsSync(ISSUES_DIR)) return [];
  return readdirSync(ISSUES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseIssue)
    .sort((a, b) => a.fm.id - b.fm.id);
}

function loadMilestones() {
  if (!existsSync(MILESTONES_DIR)) return [];
  return readdirSync(MILESTONES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const text = readFileSync(join(MILESTONES_DIR, f), "utf8");
      const id = f.match(/^(M\d+)/)?.[1];
      const title = text.match(/^#\s+(.*)$/m)?.[1] ?? f;
      return { id, file: f, title };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

// ---------- derived state ----------

function byId(issues) {
  return new Map(issues.map((i) => [i.fm.id, i]));
}

function isReady(issue, map) {
  if (issue.fm.status !== "todo") return false;
  return (issue.fm.blocked_by ?? []).every((id) => map.get(id)?.fm.status === "done");
}

function blockers(issue, map) {
  return (issue.fm.blocked_by ?? []).filter((id) => map.get(id)?.fm.status !== "done");
}

// ---------- validation ----------

function check(issues, milestones) {
  const errors = [];
  const map = byId(issues);
  const msIds = new Set(milestones.map((m) => m.id));
  const seen = new Set();
  for (const i of issues) {
    const f = i.fm;
    const where = i.file;
    if (typeof f.id !== "number") errors.push(`${where}: id must be a number`);
    if (seen.has(f.id)) errors.push(`${where}: duplicate id ${f.id}`);
    seen.add(f.id);
    if (!f.title) errors.push(`${where}: missing title`);
    if (!msIds.has(f.milestone)) errors.push(`${where}: unknown milestone ${f.milestone}`);
    if (!STATUSES.includes(f.status)) errors.push(`${where}: bad status ${f.status}`);
    if (!OWNERS.includes(f.owner)) errors.push(`${where}: bad owner ${f.owner}`);
    if (!SIZES.includes(f.size)) errors.push(`${where}: bad size ${f.size}`);
    if (!Array.isArray(f.area) || f.area.length === 0) errors.push(`${where}: area must be a non-empty list`);
    if (!Array.isArray(f.blocked_by)) errors.push(`${where}: blocked_by must be a list`);
    for (const dep of f.blocked_by ?? []) {
      if (!map.has(dep)) errors.push(`${where}: blocked_by unknown id ${dep}`);
      if (dep === f.id) errors.push(`${where}: blocks itself`);
    }
    if (!/^##\s+Acceptance criteria/m.test(i.body)) errors.push(`${where}: missing "## Acceptance criteria" section`);
  }
  // cycle detection
  const state = new Map();
  const visit = (id, path) => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "active") {
      errors.push(`dependency cycle: ${[...path, id].join(" -> ")}`);
      return;
    }
    state.set(id, "active");
    for (const dep of map.get(id)?.fm.blocked_by ?? []) if (map.has(dep)) visit(dep, [...path, id]);
    state.set(id, "done");
  };
  for (const i of issues) visit(i.fm.id, []);
  return errors;
}

// ---------- mutation ----------

function setFields(issue, fields) {
  let fm = issue.rawFrontmatter;
  for (const [k, v] of Object.entries(fields)) {
    const line = `${k}: ${typeof v === "string" && v === "" ? '""' : v}`;
    if (new RegExp(`^${k}:.*$`, "m").test(fm)) fm = fm.replace(new RegExp(`^${k}:.*$`, "m"), line);
    else fm += `\n${line}`;
  }
  writeFileSync(join(ISSUES_DIR, issue.file), `---\n${fm}\n---\n${issue.body}`);
}

// ---------- output ----------

const pad = (n) => String(n).padStart(3, "0");

function fmtRow(i, map) {
  const f = i.fm;
  const b = blockers(i, map);
  const state = f.status === "todo" ? (b.length ? `blocked by ${b.map(pad).join(",")}` : "ready") : f.status;
  return `${pad(f.id)}  ${f.milestone}  ${f.owner.padEnd(5)}  ${f.size}  ${state.padEnd(22)}  ${f.title}`;
}

function board(issues, milestones) {
  const map = byId(issues);
  const lines = ["# Board", "", `_Generated by \`node scripts/tracker.mjs board\`. Do not edit by hand._`, ""];
  for (const ms of milestones) {
    const mine = issues.filter((i) => i.fm.milestone === ms.id);
    const done = mine.filter((i) => i.fm.status === "done").length;
    lines.push(`## ${ms.id} — ${ms.title}  (${done}/${mine.length} done)`, "");
    if (mine.length === 0) {
      lines.push("_No issues yet. Planned slices are listed in the milestone file._", "");
      continue;
    }
    lines.push("| # | Issue | Owner | Size | Area | State |", "|---|---|---|---|---|---|");
    for (const i of mine) {
      const f = i.fm;
      const b = blockers(i, map);
      let state;
      if (f.status === "done") state = `✅ done${f.merged ? ` (${f.merged})` : ""}`;
      else if (f.status === "in-progress") state = `🔧 in progress${f.branch ? ` (\`${f.branch}\`)` : ""}`;
      else if (b.length) state = `⏳ blocked by ${b.map((x) => `#${pad(x)}`).join(", ")}`;
      else state = f.owner === "human" ? "🙋 needs you" : "🟢 ready";
      lines.push(`| [${pad(f.id)}](issues/${i.file}) | ${f.title} | ${f.owner} | ${f.size} | ${f.area.join(", ")} | ${state} |`);
    }
    lines.push("");
  }
  writeFileSync(BOARD, lines.join("\n"));
}

// ---------- main ----------

const [cmd, ...args] = process.argv.slice(2);
const issues = loadIssues();
const milestones = loadMilestones();
const map = byId(issues);
const inMilestone = (ms) => (i) => !ms || i.fm.milestone === ms;
const find = (id) => {
  const i = map.get(Number(id));
  if (!i) {
    console.error(`no issue with id ${id}`);
    process.exit(1);
  }
  return i;
};

switch (cmd) {
  case "check": {
    const errors = check(issues, milestones);
    if (errors.length) {
      for (const e of errors) console.error(`✗ ${e}`);
      process.exit(1);
    }
    console.log(`✓ ${issues.length} issues, ${milestones.length} milestones, no errors`);
    break;
  }
  case "list":
    for (const i of issues.filter(inMilestone(args[0]))) console.log(fmtRow(i, map));
    break;
  case "ready":
    for (const i of issues.filter(inMilestone(args[0])).filter((i) => isReady(i, map))) console.log(fmtRow(i, map));
    break;
  case "humans":
    for (const i of issues.filter((i) => i.fm.owner === "human" && i.fm.status !== "done")) console.log(fmtRow(i, map));
    break;
  case "next": {
    const inProgress = issues.filter((i) => i.fm.status === "in-progress" && i.fm.owner === "agent");
    if (inProgress.length) {
      console.log(`in progress:\n${inProgress.map((i) => fmtRow(i, map)).join("\n")}`);
    }
    const next = issues.filter(inMilestone(args[0])).find((i) => i.fm.owner === "agent" && isReady(i, map));
    if (!next) {
      const waiting = issues.filter(inMilestone(args[0])).filter((i) => i.fm.owner === "human" && i.fm.status !== "done");
      console.log(waiting.length ? `nothing ready for the agent; waiting on human:\n${waiting.map((i) => fmtRow(i, map)).join("\n")}` : "nothing ready");
      process.exit(1);
    }
    console.log(`next: ${fmtRow(next, map)}\n\n${readFileSync(join(ISSUES_DIR, next.file), "utf8")}`);
    break;
  }
  case "show":
    console.log(readFileSync(join(ISSUES_DIR, find(args[0]).file), "utf8"));
    break;
  case "start": {
    const i = find(args[0]);
    if (!isReady(i, map)) {
      console.error(`issue ${pad(i.fm.id)} is not ready (status ${i.fm.status}, blocked by ${blockers(i, map).map(pad).join(",") || "none"})`);
      process.exit(1);
    }
    const branch = args[1] ?? `feat/${pad(i.fm.id)}-${i.fm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40)}`;
    setFields(i, { status: "in-progress", branch });
    console.log(`started ${pad(i.fm.id)} on ${branch}`);
    break;
  }
  case "done": {
    const i = find(args[0]);
    setFields(i, { status: "done", merged: args[1] ?? "" });
    console.log(`done ${pad(i.fm.id)}`);
    break;
  }
  case "reopen": {
    const i = find(args[0]);
    setFields(i, { status: "todo", branch: "", merged: "" });
    console.log(`reopened ${pad(i.fm.id)}`);
    break;
  }
  case "board":
    board(issues, milestones);
    console.log(`wrote ${BOARD}`);
    break;
  default:
    console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 15).join("\n"));
    process.exit(cmd ? 1 : 0);
}

// Keep the board fresh after any mutation.
if (["start", "done", "reopen"].includes(cmd)) board(loadIssues(), milestones);
