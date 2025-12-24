import os
import json
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
CONFIG_DIR = BASE_DIR / "config"
TEMPLATE_FILE = "base.html"
TAG_CONFIG_FILE = CONFIG_DIR / "tags.json"
CAT_CONFIG_FILE = CONFIG_DIR / "category.json"

env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))

with open(TAG_CONFIG_FILE, 'r', encoding='utf-8') as f:
    TAG_CONFIG = json.load(f)
with open(CAT_CONFIG_FILE, 'r', encoding='utf-8') as f:
    CAT_CONFIG = json.load(f)

def format_tags(raw_tags_str):
    """ タグのHTMLを生成（色情報もインラインで入れるよ！） """
    if not raw_tags_str:
        return ""
    
    tag_ids = [t.strip() for t in raw_tags_str.split(",") if t.strip()]
    tag_html_list = []
    
    for tag_id in tag_ids:
        # 辞書からデータを取得（なければデフォルト値）
        tag_info = TAG_CONFIG.get(tag_id, {"name": tag_id, "category": "UNDEFINED"})
        name = tag_info["name"]
        category = tag_info["category"]
        color = CAT_CONFIG.get(category, "#666666")
        tagStyle = f'background-color: {color};'
        
        if color == "#000000":
            tagStyle += ' color: #FFFFFF; border: 1px solid #FFFFFF;'
            
        tag_html_list.append(
            f'<li tag="{tag_id}" style="{tagStyle}">'
            f'{name}'
            f'</li>'
        )        
    
    return "\n".join(tag_html_list)

# --- (以下、parse_post や build_html, build_all は前回とほぼ同じでOK！) ---

def parse_post(txt_path):
    try:
        with open(txt_path, 'r', encoding='utf-8') as f:
            raw_text = f.read()
        if '------' not in raw_text: return None
        header, content = raw_text.split('------', 1)
        metadata = {line.split(':', 1)[0].strip().lower(): line.split(':', 1)[1].strip() 
                    for line in header.strip().splitlines() if ':' in line}
        
        return {
            "title": metadata.get("title", "無題"),
            "date": metadata.get("date", ""),
            "tags": format_tags(metadata.get("tags", "")),
            "content": content.strip()
        }
    except Exception as e:
        print(f"❌ Error: {e}"); return None

def build_html(txt_path):
    txt_path = Path(txt_path)
    data = parse_post(txt_path)
    if not data: return
    try:
        template = env.get_template(TEMPLATE_FILE)
        html_output = template.render(**data)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_DIR / (txt_path.stem + ".html"), 'w', encoding='utf-8') as f:
            f.write(html_output)
        print(f"✨ 完璧！: {txt_path.name}")
    except Exception as e: print(f"❌ Build Error: {e}")

def build_all():
    print("🔄 全記事を再構築中...")
    if not TXT_DIR.exists(): return
    for txt_file in TXT_DIR.glob("*.txt"): build_html(txt_file)

class MyHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory: return
        p = Path(event.src_path)
        if p.name == TEMPLATE_FILE: build_all()
        elif p.suffix == ".txt" and TXT_DIR in p.parents: build_html(p)
    def on_created(self, event):
        p = Path(event.src_path)
        if p.suffix == ".txt" and TXT_DIR in p.parents: build_html(p)

if __name__ == "__main__":
    build_all()
    observer = Observer()
    observer.schedule(MyHandler(), path=str(BASE_DIR), recursive=True)
    observer.start()
    print("👀 監視中...")
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()