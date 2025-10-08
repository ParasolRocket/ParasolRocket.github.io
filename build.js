import fs from "fs";
import path from "path";

const articlesDir = "./articlesText";
const outputDir = "./articles";
const templatePath = "./templates/base.html";

fs.mkdirSync(outputDir, { recursive: true });

// base.html の更新時刻
const templateMtime = fs.statSync(templatePath).mtimeMs;

// テンプレート読み込み
const baseTemplate = fs.readFileSync(templatePath, "utf8");

// 全記事を走査
for (const file of fs.readdirSync(articlesDir)) {
  if (!file.endsWith(".txt")) continue;

  const srcPath = path.join(articlesDir, file);
  const distPath = path.join(outputDir, file.replace(".txt", ".html"));

  const srcTime = fs.statSync(srcPath).mtimeMs;
  const distTime = fs.existsSync(distPath) ? fs.statSync(distPath).mtimeMs : 0;

  // base.htmlまたは記事が新しければ再生成
  if (srcTime > distTime || templateMtime > distTime) {
    const raw = fs.readFileSync(srcPath, "utf8");
    const [metaPart, bodyPart] = raw.split("---", 2);

    // メタ情報解析
    const meta = {};
    let currentKey = null;
    metaPart.split("\n").forEach(line => {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        currentKey = match[1];
        meta[currentKey] = match[2];
      } else if (currentKey && line.match(/^\s*-\s*(.+)$/)) {
        // tagsの複数行リスト対応
        if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
        meta[currentKey].push(line.replace(/^\s*-\s*/, ""));
      }
    });

    // タグ解析
    const tagLines = Array.isArray(meta.tags)
      ? meta.tags
      : (meta.tags || "").split(",").filter(Boolean);
    const tagHtml = tagLines.map(t => {
      const [id, name] = t.split(":");
      return `<li tag="${id.trim()}">${name.trim()}</li>`;
    }).join("");

    // HTML生成
    const html = baseTemplate
      .replaceAll("{{title}}", meta.title || "無題")
      .replaceAll("{{date}}", meta.date || "")
      .replaceAll("{{tags}}", tagHtml)
      .replaceAll("{{content}}", bodyPart || "");

    fs.writeFileSync(distPath, html);
    console.log(`✅ built: ${distPath}`);
  }
}
