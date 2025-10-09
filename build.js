import fs from "fs";
import path from "path";

const SRC_DIR = "./articlesText";
const OUT_DIR = "./articles";
const BASE_HTML = "./templates/base.html";

// タグ辞書（ID → 日本語名）
const tagMap = {
  music: "音楽",
  chiptune: "チップチューン",
  composition: "作曲",
  game: "ゲーム",
  creation: "制作",
  ai: "AI",
  programming: "プログラミング",
  windows: "Windows",
  adobe: "Adobe",
  professional: "専門的",
  problem: "悩み",
  trifling: "たわいのないこと",
  life: "日常",
  notes: "雑記",
  memory: "おもひで",
  true: "実話",
  advance: "進捗・記録",
  backstory: "裏話",
  advertisement: "宣伝",
  news: "おしらせ",
  test: "テスト",
  memo: "メモ",
  other: "その他",
  underground: "アンダーグラウンドインターネット",
  VDA: "閲覧注意"
};

// ベースHTMLを読み込み
const baseTemplate = fs.readFileSync(BASE_HTML, "utf8");

// 出力フォルダがなければ作る
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// 記事一覧を取得
const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith(".txt"));

files.forEach(file => {
  const raw = fs.readFileSync(path.join(SRC_DIR, file), "utf8");

  // メタ情報と本文を分離
  const [metaPart, ...bodyPart] = raw.split("\n\n");
  const body = bodyPart.join("\n\n");

  // メタ情報を解析
  const metaLines = metaPart.split("\n");
  const title = metaLines.find(line => line.startsWith("title:"))?.replace("title:", "").trim() || "無題";
  const date = metaLines.find(line => line.startsWith("date:"))?.replace("date:", "").trim() || "";
  const tagLine = metaLines.find(line => line.startsWith("tags:"))?.replace("tags:", "").trim() || "";
  const tags = tagLine.split(",").map(tag => tag.trim()).filter(Boolean);

  // タグHTML生成
  const tagListHTML = tags.map(tagID => {
    const tagName = tagMap[tagID] || tagID;
    return `<li tag="${tagID}">${tagName}</li>`;
  }).join("\n");

  // HTML生成
  const html = baseTemplate
    .replace(/{{title}}/g, title)
    .replace(/{{date}}/g, date)
    .replace("{{tags}}", tagListHTML)
    .replace("{{content}}", body);

  // 出力先パス
  const outputFile = file.replace(".txt", ".html");
  const outputPath = path.join(OUT_DIR, outputFile);

  // 書き出し
  fs.writeFileSync(outputPath, html, "utf8");
  console.log(`✅ ${outputFile} を生成しました`);
});
