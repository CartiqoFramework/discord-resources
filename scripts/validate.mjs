// Checks resources.json against the rules in CONTRIBUTING.md.
//
//   node scripts/validate.mjs
//
// No dependencies, so it runs anywhere Node 20 or newer does.

import { readFileSync } from "node:fs";

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

let data;
try {
  data = JSON.parse(readFileSync(new URL("../resources.json", import.meta.url), "utf8"));
} catch (err) {
  console.error(`resources.json could not be read as JSON: ${err.message}`);
  process.exit(1);
}

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const extraKeys = (obj, allowed) => Object.keys(obj).filter((k) => !allowed.includes(k));
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ADMINISTRATOR = 8n;

if (!isObject(data)) {
  fail("resources.json", "must be an object");
} else {
  for (const k of extraKeys(data, ["$schema", "sections"])) fail("resources.json", `unexpected key "${k}"`);
  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    fail("resources.json", 'needs a non-empty "sections" array');
  }
}

const sections = Array.isArray(data?.sections) ? data.sections : [];
const ids = new Set();
const urls = new Map();

for (const [i, section] of sections.entries()) {
  const where = `sections[${i}]`;
  if (!isObject(section)) {
    fail(where, "must be an object");
    continue;
  }
  for (const k of extraKeys(section, ["id", "name", "note", "entries"])) fail(where, `unexpected key "${k}"`);

  const label = typeof section.id === "string" ? section.id : where;
  if (typeof section.id !== "string" || !ID.test(section.id)) {
    fail(where, "id must be lowercase words joined by hyphens");
  } else if (ids.has(section.id)) {
    fail(label, "id is used by another section");
  } else {
    ids.add(section.id);
  }
  if (typeof section.name !== "string" || !section.name.trim()) fail(label, "needs a name");
  if ("note" in section && (typeof section.note !== "string" || !section.note.trim())) {
    fail(label, "note must be text when it is present");
  }
  if (!Array.isArray(section.entries) || section.entries.length === 0) {
    fail(label, "needs at least one entry");
    continue;
  }

  const names = new Set();
  for (const [j, entry] of section.entries.entries()) {
    const at = `${label} → ${typeof entry?.name === "string" ? entry.name : `entries[${j}]`}`;
    if (!isObject(entry)) {
      fail(at, "must be an object");
      continue;
    }
    for (const k of extraKeys(entry, ["name", "url", "description"])) fail(at, `unexpected key "${k}"`);

    const { name, url, description } = entry;

    if (typeof name !== "string" || !name.trim() || name.length > 80) {
      fail(at, "name must be 1 to 80 characters");
    } else if (names.has(name.toLowerCase())) {
      fail(at, "is listed twice in this section");
    } else {
      names.add(name.toLowerCase());
    }

    let parsed = null;
    try {
      parsed = new URL(url);
    } catch {
      fail(at, "url is not a valid URL");
    }
    if (parsed) {
      if (parsed.protocol !== "https:") fail(at, "url must start with https://");
      const key = `${parsed.host.toLowerCase()}${parsed.pathname.replace(/\/+$/, "")}${parsed.search}`;
      if (urls.has(key)) fail(at, `url is already listed as ${urls.get(key)}`);
      else urls.set(key, at);

      const permissions = parsed.searchParams.get("permissions");
      if (permissions && /^\d+$/.test(permissions) && (BigInt(permissions) & ADMINISTRATOR) === ADMINISTRATOR) {
        fail(at, "the bot invite asks for Administrator; ask for the permissions the bot needs");
      }
    }

    if (typeof description !== "string" || description.length < 10 || description.length > 400) {
      fail(at, "description must be 10 to 400 characters");
    } else {
      if (description !== description.trim() || /\s{2,}/.test(description)) fail(at, "description has stray spaces");
      if (!/^[A-Z0-9"'‘“(/]/.test(description)) fail(at, "description should start with a capital letter");
      if (!/[.!?]$/.test(description)) fail(at, "description should end with a full stop");
    }
  }
}

if (errors.length) {
  console.error(`resources.json has ${errors.length} problem${errors.length === 1 ? "" : "s"}:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const total = sections.reduce((n, s) => n + s.entries.length, 0);
console.log(`resources.json is valid: ${total} entries in ${sections.length} sections.`);
