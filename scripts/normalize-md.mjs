import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "docs");

function listMarkdown(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(p));
    else if (entry.isFile() && p.toLowerCase().endsWith(".md")) out.push(p);
  }
  return out;
}

function normalizeEol(text) {
  return text.replace(/\r\n?/g, "\n");
}

function stripBom(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.subarray(3);
  }
  return buffer;
}

const files = fs.existsSync(root) ? listMarkdown(root) : [];
if (files.length === 0) {
  console.log("No Markdown files found in docs/");
  process.exit(0);
}

let changed = 0;
for (const file of files) {
  const raw = fs.readFileSync(file);
  const noBom = stripBom(raw);
  const text = noBom.toString("utf8");
  const normalized = normalizeEol(text);
  if (normalized !== text || noBom !== raw) {
    fs.writeFileSync(file, normalized, { encoding: "utf8" }); // writes without BOM
    changed++;
    console.log(`Normalized: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`Done. Normalized ${changed} file(s).`);
