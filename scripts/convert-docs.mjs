import fs from "node:fs";
import path from "node:path";
import mammoth from "mammoth";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pdfParseMod = require("pdf-parse");
const pdfParse = pdfParseMod.default || pdfParseMod;

const DOCS = path.resolve(process.cwd(), "docs");
const OUT = path.join(DOCS, "_converted");
fs.mkdirSync(OUT, { recursive: true });

const list = fs.readdirSync(DOCS).filter(f => /\.(pdf|docx)$/i.test(f));

function slugify(name) {
  // basic slug: lower-case, replace non alnum with hyphen, collapse dups
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "document";
}

async function convertDocx(file) {
  const input = path.join(DOCS, file);
  const { value: html } = await mammoth.convertToHtml({ path: input });
  const text = html
    .replace(/<\/(p|h\d)>/g, "\n\n")
    .replace(/<li>/g, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  const title = `# ${file}`;
  return `${title}\n\nИсточник: ${file}\n\n${text}\n`;
}

async function convertPdf(file) {
  const input = path.join(DOCS, file);
  const title = `# ${file}`;
  try {
    const data = await pdfParse(fs.readFileSync(input));
    const text = (data && data.text ? data.text : "").trim();
    if (text) return `${title}\n\nИсточник: ${file}\n\n${text}\n`;
  } catch {
    // Fallback stub when parser unavailable
  }
  return `${title}\n\nИсточник: ${file}\n\n[Требуется конвертация PDF → Markdown сторонним инструментом]`;
}

const results = [];
for (const f of list) {
  try {
    let base = slugify(f);
    let out = path.join(OUT, `${base}.md`);
    let idx = 2;
    while (fs.existsSync(out)) {
      out = path.join(OUT, `${base}-${idx}.md`);
      idx += 1;
    }
    let md = "";
    if (/\.docx$/i.test(f)) md = await convertDocx(f);
    else md = await convertPdf(f);
    fs.writeFileSync(out, md, { encoding: "utf8" });
    results.push({ f, out });
    console.log(`Converted: ${f} -> ${path.relative(DOCS, out)}`);
  } catch (e) {
    console.error(`Failed: ${f}`, e.message);
  }
}

if (results.length === 0) console.log("No PDF/DOCX found to convert.");
