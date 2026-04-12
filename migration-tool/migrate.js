const path = require("path");
const fs = require("fs-extra");
const xml2js = require("xml2js");
const TurndownService = require("turndown");

const ROOT = path.resolve(__dirname, "..");
const XML_PATH = path.join(ROOT, "wordpress", "export.xml");
const OUTPUT_DIR = path.join(ROOT, "astro-site", "src", "content", "posts");

const SITE_URLS = [
  "https://wkdrive.top",
  "http://wkdrive.top",
  "https://www.wkdrive.top",
  "http://www.wkdrive.top",
  "https://walker-king.cloud",
  "http://walker-king.cloud",
];

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

turndownService.keep(["table"]);

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getText(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && "_" in value) return String(value._).trim();
  return String(value).trim();
}

function yamlEscape(str) {
  return String(str ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "")
    .replace(/\n/g, " ");
}

function normalizeDate(dateStr) {
  if (!dateStr) return "";
  return String(dateStr).slice(0, 10);
}

function decodeWpSlug(slug) {
  if (!slug) return "";
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function sanitizeSlugPart(str) {
  return String(str ?? "")
    .replace(/[\/\\?%*:|"<>#\[\]{}]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function makeReadableSlug(rawSlug, title, postId) {
  const decodedSlug = sanitizeSlugPart(decodeWpSlug(rawSlug));
  const decodedTitle = sanitizeSlugPart(title);

  let finalSlug = decodedSlug || decodedTitle || `post-${postId}`;

  if (finalSlug.length > 80) {
    finalSlug = finalSlug.slice(0, 80).replace(/-+$/g, "");
  }

  if (!finalSlug) {
    finalSlug = `post-${postId}`;
  }

  return finalSlug;
}

function replaceImageUrls(content) {
  let result = content;
  for (const base of SITE_URLS) {
    result = result.replaceAll(`${base}/wp-content/uploads/`, `/images/`);
  }
  return result;
}

function cleanMarkdown(md) {
  return md
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/^\s+$/gm, "")
    .trim();
}

function extractCategories(item) {
  const categories = [];
  const tags = [];

  for (const cat of ensureArray(item.category)) {
    const domain = cat?.$?.domain || "";
    const name = getText(cat);

    if (!name) continue;

    if (domain === "category") {
      categories.push(name);
    } else if (domain === "post_tag") {
      tags.push(name);
    }
  }

  return {
    categories: [...new Set(categories)],
    tags: [...new Set(tags)],
  };
}

function buildFrontmatter({ title, date, slug, categories, tags, description, postId }) {
  const lines = [
    "---",
    `title: "${yamlEscape(title)}"`,
    `date: ${date || "1970-01-01"}`,
    `slug: "${yamlEscape(slug)}"`,
    `categories: [${categories.map((c) => `"${yamlEscape(c)}"`).join(", ")}]`,
    `tags: [${tags.map((t) => `"${yamlEscape(t)}"`).join(", ")}]`,
    `description: "${yamlEscape(description || "")}"`,
    `wordpressId: ${postId || 0}`,
    "---",
    "",
  ];

  return lines.join("\n");
}

async function main() {
  if (!(await fs.pathExists(XML_PATH))) {
    throw new Error(`找不到 export.xml: ${XML_PATH}`);
  }

  await fs.ensureDir(OUTPUT_DIR);

  const xml = await fs.readFile(XML_PATH, "utf8");
  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: false,
  });
  const parsed = await parser.parseStringPromise(xml);

  const channel = parsed?.rss?.channel;
  if (!channel) {
    throw new Error("XML 结构异常：未找到 rss.channel");
  }

  const items = ensureArray(channel.item);
  const posts = items.filter((item) => getText(item["wp:post_type"]) === "post");
  const pages = items.filter((item) => getText(item["wp:post_type"]) === "page");

  console.log(`总项目数: ${items.length}`);
  console.log(`文章数(post): ${posts.length}`);
  console.log(`页面数(page): ${pages.length}`);

  let written = 0;
  const usedSlugs = new Set();

  for (const item of posts) {
    const title = getText(item.title) || "untitled";
    const postId = getText(item["wp:post_id"]) || "0";
    const slugRaw = getText(item["wp:post_name"]);
    const date = normalizeDate(getText(item["wp:post_date"]));
    const excerpt = getText(item["excerpt:encoded"]);
    const htmlContent = getText(item["content:encoded"]);
    const status = getText(item["wp:status"]);

    if (status && status !== "publish") {
      continue;
    }

    const { categories, tags } = extractCategories(item);

    let slug = makeReadableSlug(slugRaw, title, postId);

    if (usedSlugs.has(slug)) {
      slug = `${slug}-${postId}`;
    }
    usedSlugs.add(slug);

    let markdown = turndownService.turndown(replaceImageUrls(htmlContent));
    markdown = cleanMarkdown(markdown);

    const frontmatter = buildFrontmatter({
      title,
      date,
      slug,
      categories,
      tags,
      description: excerpt,
      postId,
    });

    const finalContent = `${frontmatter}${markdown}\n`;
    const filePath = path.join(OUTPUT_DIR, `post-${postId}.md`);

    await fs.writeFile(filePath, finalContent, "utf8");
    written += 1;
    console.log(`已生成: ${path.relative(ROOT, filePath)} -> slug: ${slug}`);
  }

  console.log(`\n完成，共生成 ${written} 篇文章。`);
  console.log(`输出目录: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("迁移失败：", err);
  process.exit(1);
});
