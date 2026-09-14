// Checks that the links in resources.json load.
//
//   node scripts/check-links.mjs                   every link
//   node scripts/check-links.mjs --base old.json   only links old.json does not have
//
// A link fails when it does not load at all, or answers 404, 410 or another
// error. 401, 403, 429 and 503 are reported as warnings instead: plenty of
// sites turn away requests that do not come from a browser, and a pull request
// should not fail because of that.
//
// No dependencies, so it runs anywhere Node 20 or newer does.

import { readFileSync } from "node:fs";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const entriesOf = (data) =>
  data.sections.flatMap((s) => s.entries.map((e) => ({ section: s.id, ...e })));

let entries = entriesOf(read(new URL("../resources.json", import.meta.url)));

const baseAt = process.argv.indexOf("--base");
if (baseAt !== -1) {
  const known = new Set(entriesOf(read(process.argv[baseAt + 1])).map((e) => e.url));
  entries = entries.filter((e) => !known.has(e.url));
}

if (entries.length === 0) {
  console.log("No new links to check.");
  process.exit(0);
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const TURNED_AWAY = new Set([401, 403, 429, 503]);

async function load(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,*/*" },
      });
      await res.body?.cancel();
      return { status: res.status };
    } catch (err) {
      if (attempt === 2) return { status: 0, error: err?.cause?.code ?? err?.name ?? String(err) };
    }
  }
}

const results = [];
const queue = [...entries];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      results.push({ ...entry, ...(await load(entry.url)) });
    }
  }),
);

let warned = 0;
let failed = 0;
for (const r of results) {
  if (r.status >= 200 && r.status < 400) continue;
  if (TURNED_AWAY.has(r.status)) {
    warned++;
    console.log(`warning  ${r.status}  ${r.section} → ${r.name}  ${r.url}`);
  } else {
    failed++;
    console.log(`failed   ${r.status || r.error}  ${r.section} → ${r.name}  ${r.url}`);
  }
}

const loaded = results.length - warned - failed;
console.log(
  `\nChecked ${results.length} link${results.length === 1 ? "" : "s"}: ${loaded} loaded, ${warned} turned the check away, ${failed} failed.`,
);
// exitCode rather than process.exit(): on Windows, exiting while fetch's
// connections are still closing trips an assertion in libuv and crashes Node
// after every result has already printed.
process.exitCode = failed ? 1 : 0;
