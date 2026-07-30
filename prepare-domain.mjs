import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const input = process.argv[2];

if (!input) {
  console.error("Укажите домен: npm run prepare:domain -- https://ваш-домен.ru");
  process.exit(1);
}

let siteUrl;
try {
  const url = new URL(input.includes("://") ? input : `https://${input}`);
  if (url.protocol !== "https:" || !url.hostname || url.pathname !== "/" || url.search || url.hash) {
    throw new Error();
  }
  siteUrl = url.origin;
} catch {
  console.error("Укажите домен в формате https://ваш-домен.ru без пути после домена.");
  process.exit(1);
}

const output = path.join(root, "deploy");
const sourceBaseUrl = "https://sharkeey777.github.io/husky";
const copyTargets = ["assets", "styles", "js"];
const requiredFiles = ["index.html", "privacy.html", "terms.html", "cookies.html", "robots.txt", "sitemap.xml"];

function copyDirectory(source, target) {
  mkdirSync(target, { recursive: true });

  for (const entry of readdirSync(source)) {
    const sourcePath = path.join(source, entry);
    const targetPath = path.join(target, entry);

    if (statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

for (const file of requiredFiles) {
  if (!existsSync(path.join(root, file))) {
    throw new Error(`Не найден обязательный файл: ${file}`);
  }
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const target of copyTargets) {
  copyDirectory(path.join(root, target), path.join(output, target));
}

const replaceSiteUrl = (contents) => contents.split(sourceBaseUrl).join(siteUrl);
const index = replaceSiteUrl(readFileSync(path.join(root, "index.html"), "utf8"));
const privacy = replaceSiteUrl(readFileSync(path.join(root, "privacy.html"), "utf8"));
const terms = replaceSiteUrl(readFileSync(path.join(root, "terms.html"), "utf8"));
const cookies = replaceSiteUrl(readFileSync(path.join(root, "cookies.html"), "utf8"));
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
const sitemap = replaceSiteUrl(readFileSync(path.join(root, "sitemap.xml"), "utf8"));

writeFileSync(path.join(output, "index.html"), index);
writeFileSync(path.join(output, "privacy.html"), privacy);
writeFileSync(path.join(output, "terms.html"), terms);
writeFileSync(path.join(output, "cookies.html"), cookies);
writeFileSync(path.join(output, "robots.txt"), robots);
writeFileSync(path.join(output, "sitemap.xml"), sitemap);

console.log(`Готово: ${output}`);
console.log(`Домен в canonical, Open Graph, robots.txt и sitemap.xml: ${siteUrl}`);
console.log("Загрузите содержимое папки deploy в корневую папку сайта на Timeweb.");
