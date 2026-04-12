import fs from "fs";
import path from "path";
import crypto from "crypto";

const projectRoot = path.resolve(process.cwd());
const postsDir = path.join(projectRoot, "astro-site", "src", "content", "posts");
const publicImagesDir = path.join(projectRoot, "astro-site", "public", "images");

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

function getExtFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    return path.extname(pathname) || ".jpg";
  } catch {
    return ".jpg";
  }
}

function buildLocalPathFromUrl(url) {
  const u = new URL(url);
  const pathname = u.pathname;

  // 兼容 /file/2022/05/xxx.png
  let match = pathname.match(/\/file\/(\d{4})\/(\d{2})\/([^/]+)$/i);
  if (match) {
    const [, year, month, filename] = match;
    return {
      relativePath: `/images/${year}/${month}/${sanitizeFileName(filename)}`,
      fullPath: path.join(publicImagesDir, year, month, sanitizeFileName(filename)),
    };
  }

  // 兼容 /wp-content/uploads/2022/05/xxx.png
  match = pathname.match(/\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^/]+)$/i);
  if (match) {
    const [, year, month, filename] = match;
    return {
      relativePath: `/images/${year}/${month}/${sanitizeFileName(filename)}`,
      fullPath: path.join(publicImagesDir, year, month, sanitizeFileName(filename)),
    };
  }

  // 兼容 /2022/05/xxx.png
  match = pathname.match(/\/(\d{4})\/(\d{2})\/([^/]+)$/i);
  if (match) {
    const [, year, month, filename] = match;
    return {
      relativePath: `/images/${year}/${month}/${sanitizeFileName(filename)}`,
      fullPath: path.join(publicImagesDir, year, month, sanitizeFileName(filename)),
    };
  }

  // 兜底：按 hash 存
  const ext = getExtFromUrl(url);
  const hash = crypto.createHash("md5").update(url).digest("hex").slice(0, 12);
  const fileName = `${hash}${ext}`;
  return {
    relativePath: `/images/misc/${fileName}`,
    fullPath: path.join(publicImagesDir, "misc", fileName),
  };
}

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath)) {
    return { skipped: true };
  }

  ensureDir(path.dirname(destPath));

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(`下载失败: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
  return { skipped: false };
}

function extractImageUrls(markdown) {
  const urls = new Set();

  // Markdown 图片：![alt](url)
  const mdImageRegex = /!\[[^\]]*?\]\((https?:\/\/[^)\s]+)\)/gi;
  for (const match of markdown.matchAll(mdImageRegex)) {
    urls.add(match[1]);
  }

  // HTML img
  const htmlImgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  for (const match of markdown.matchAll(htmlImgRegex)) {
    urls.add(match[1]);
  }

  return [...urls];
}

function replaceUrlsInMarkdown(markdown, replacements) {
  let result = markdown;
  for (const [oldUrl, newUrl] of replacements.entries()) {
    result = result.split(oldUrl).join(newUrl);
  }
  return result;
}

async function main() {
  const mdFiles = walkDir(postsDir);

  let totalFilesChanged = 0;
  let totalImagesFound = 0;
  let totalImagesDownloaded = 0;
  let totalImagesSkipped = 0;
  let totalErrors = 0;

  for (const filePath of mdFiles) {
    const original = fs.readFileSync(filePath, "utf8");
    const imageUrls = extractImageUrls(original);

    if (imageUrls.length === 0) continue;

    console.log(`\n处理文件: ${path.relative(projectRoot, filePath)}`);

    const replacements = new Map();
    let fileChanged = false;

    for (const url of imageUrls) {
      totalImagesFound++;

      try {
        const { relativePath, fullPath } = buildLocalPathFromUrl(url);
        const result = await downloadFile(url, fullPath);

        if (result.skipped) {
          totalImagesSkipped++;
          console.log(`  已存在，跳过: ${relativePath}`);
        } else {
          totalImagesDownloaded++;
          console.log(`  已下载: ${url} -> ${relativePath}`);
        }

        replacements.set(url, relativePath);
        fileChanged = true;
      } catch (error) {
        totalErrors++;
        console.error(`  失败: ${url}`);
        console.error(`       ${error.message}`);
      }
    }

    if (fileChanged && replacements.size > 0) {
      const updated = replaceUrlsInMarkdown(original, replacements);
      if (updated !== original) {
        fs.writeFileSync(filePath, updated, "utf8");
        totalFilesChanged++;
        console.log(`  已更新 Markdown`);
      }
    }
  }

  console.log("\n处理完成：");
  console.log(`- 修改的 Markdown 文件数: ${totalFilesChanged}`);
  console.log(`- 发现的图片链接数: ${totalImagesFound}`);
  console.log(`- 实际下载数: ${totalImagesDownloaded}`);
  console.log(`- 已存在跳过数: ${totalImagesSkipped}`);
  console.log(`- 失败数: ${totalErrors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
