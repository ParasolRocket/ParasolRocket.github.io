import os
import time
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- 設定 ---
BASE_DIR = Path(__file__).resolve().parent
TXT_DIR = BASE_DIR / "articlesText"
OUTPUT_DIR = BASE_DIR / "articles"
TEMPLATE_DIR = BASE_DIR / "templates"
TEMPLATE_FILE = "base.html"

# --- タグ変換辞書 ---
TAG_MAP = {
    "music": "音楽", "chiptune": "チップチューン", "composition": "作曲",
    "game": "ゲーム", "creation": "制作", "ai": "AI", "tD": "3D",
    "programming": "プログラミング", "windows": "Windows", "adobe": "Adobe",
    "professional": "専門的", "problem": "悩み", "trifling": "たわいのないこと",
    "life": "日常", "notes": "雑記", "memory": "おもひで", "true": "実話",
    "advance": "進捗・記録", "backstory": "裏話", "advertisement": "宣伝",
    "news": "おしらせ", "test": "テスト", "memo": "メモ", "other": "その他",
    "underground": "アンダーグラウンドインターネット", "VDA": "閲覧注意"
}

env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))

def format_tags(raw_tags_str):
    """ カンマ区切りのタグを <li> 形式に変換するよ！ """
    if not raw_tags_str:
        return ""
    
    # カンマで区切って、前後の空白を取る
    tag_ids = [t.strip() for t in raw_tags_str.split(",") if t.strip()]
    
    tag_html_list = []
    for tag_id in tag_ids:
        # 辞書にあれば日本語、なければそのままIDを使うよ
        tag_name = TAG_MAP.get(tag_id, tag_id)
        # 指定されたフォーマット <li tag="ID">名前</li>
        tag_html_list.append(f'<li tag="{tag_id}">{tag_name}</li>')
    
    # 全部つなげて1つの文字列にする
    return "\n".join(tag_html_list)

def parse_post(txt_path):
    try:
        with open(txt_path, 'r', encoding='utf-8') as f:
            raw_text = f.read()

        if '------' not in raw_text:
            return None

        header, content = raw_text.split('------', 1)
        metadata = {}
        for line in header.strip().splitlines():
            if ':' in line:
                key, value = line.split(':', 1)
                metadata[key.strip().lower()] = value.strip()

        # ここでタグを整形しちゃう！
        formatted_tags = format_tags(metadata.get("tags", ""))

        return {
            "title": metadata.get("title", "無題"),
            "date": metadata.get("date", ""),
            "tags": formatted_tags, # 整形済みのHTMLが入るよ
            "content": content.strip()
        }
    except Exception as e:
        print(f"❌ ファイル読み込みエラー ({txt_path}): {e}")
        return None

def build_html(txt_path):
    txt_path = Path(txt_path)
    data = parse_post(txt_path)
    if not data: return

    try:
        template = env.get_template(TEMPLATE_FILE)
        # tagsには <li>...</li> が並んだ文字列が入る
        html_output = template.render(
            title=data["title"],
            date=data["date"],
            tags=data["tags"],
            content=data["content"]
        )
        
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        out_path = OUTPUT_DIR / (txt_path.stem + ".html")
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html_output)
        print(f"✨ タグもバッチリ！生成完了: {out_path.name}")
    except Exception as e:
        print(f"❌ HTML作成失敗: {e}")

# --- (build_all, MyHandlerなどは前回と同じだよ！) ---

def build_all():
    print("🔄 全記事を再構築中...")
    if not TXT_DIR.exists(): return
    for txt_file in TXT_DIR.glob("*.txt"):
        build_html(txt_file)

class MyHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory: return
        filepath = Path(event.src_path)
        if filepath.name == TEMPLATE_FILE:
            build_all()
        elif filepath.suffix == ".txt" and TXT_DIR in filepath.parents:
            build_html(filepath)

    def on_created(self, event):
        filepath = Path(event.src_path)
        if filepath.suffix == ".txt" and TXT_DIR in filepath.parents:
            build_html(filepath)

if __name__ == "__main__":
    build_all()
    observer = Observer()
    observer.schedule(MyHandler(), path=str(BASE_DIR), recursive=True)
    observer.start()
    print(f"👀 監視中... タグ変換準備OK！")
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()